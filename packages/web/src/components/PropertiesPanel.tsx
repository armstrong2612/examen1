import React, { useState, useEffect } from "react";
import { Node, Edge } from "reactflow";
import { removeFKRelation, updateFKRelation } from "../utils/relationHandler";
import { askRelationType } from "../utils/relationPrompt";
import { getEdgeStyle } from "../utils/relationStyles";
import { getMultiplicitiesFromRelationType } from "../utils/multiplicityHelper";
import type { Field } from "@shared/types";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  availableTables: string[];
  edges?: Edge[];
  nodes?: Node[];
  setEdges?: React.Dispatch<React.SetStateAction<Edge[]>>;
  onUpdate: (nodeId: string, updatedData: any) => void;
  socket?: any; // 🆕 Socket para emitir eventos
  project?: any; // 🆕 Proyecto actual
  readOnly?: boolean; // 🆕 Si es true, el panel es solo lectura (viewer/invitado)
}

// Tipos de datos PostgreSQL comunes
const DATA_TYPES = [
  "VARCHAR(255)",
  "TEXT",
  "INT",
  "BIGINT",
  "SERIAL",
  "BIGSERIAL",
  "BOOLEAN",
  "DATE",
  "TIME",
  "TIMESTAMP",
  "TIMESTAMPTZ",
  "DECIMAL(10,2)",
  "NUMERIC",
  "JSON",
  "JSONB",
  "UUID"
];

export default function PropertiesPanel({
  selectedNode,
  availableTables,
  edges = [],
  nodes = [],
  setEdges,
  onUpdate,
  socket,
  project,
  readOnly = false
}: PropertiesPanelProps) {
  const [table, setTable] = useState<any>(null);

  // Actualizar estado local cuando cambia el nodo seleccionado
  useEffect(() => {
    if (selectedNode?.data) {
      setTable({
        name: selectedNode.data.name || selectedNode.data.label || "NuevaTabla",
        fields: selectedNode.data.fields || []
      });
    } else {
      setTable(null);
    }
  }, [selectedNode]);

  if (!selectedNode || !table) {
    return (
      <div
        style={{
          background: "#1a1a1a",
          color: "#aaa",
          padding: 20,
          borderLeft: "1px solid #333",
          height: "100vh",
          width: 320,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          boxSizing: "border-box"
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📋</div>
        <p style={{ margin: 0, fontSize: 14 }}>Selecciona una tabla</p>
        <p style={{ margin: "8px 0 0", fontSize: 12, opacity: 0.7 }}>
          Haz clic en un nodo para editar sus propiedades
        </p>
      </div>
    );
  }

  const updateTable = (key: string, value: any) => {
    if (readOnly) return;
    const updated = { ...table, [key]: value };
    setTable(updated);
    onUpdate(selectedNode.id, updated);
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...table.fields];
    newFields[index] = { ...newFields[index], [key]: value };

    // Si se marca como PK, automáticamente hacer NOT NULL
    if (key === "isPrimary" && value === true) {
      newFields[index].nullable = false;
    }

    // Si se desmarca FK, limpiar referencias
    if (key === "isForeign" && value === false) {
      newFields[index].references = null;
    }

    updateTable("fields", newFields);
  };

  const addField = () => {
    const newField: Field = {
      id: Date.now(),
      name: "nuevo_campo",
      type: "VARCHAR(255)",
      isPrimary: false,
      isForeign: false,
      nullable: true,
      references: null,
      relationType: undefined, // 🆕 Inicializar relationType
      isMethod: false, // Es un atributo regular
    };
    updateTable("fields", [...table.fields, newField]);
  };

  const addMethod = () => {
    const newMethod: Field = {
      id: Date.now(),
      name: "nuevoMetodo()",
      isMethod: true, // Es un método
    };
    updateTable("fields", [...table.fields, newMethod]);
  };

  const removeField = (i: number) => {
    const fieldToRemove = table.fields[i];

    // Si el campo es FK, eliminar la relación visual
    if (fieldToRemove.isForeign && setEdges && selectedNode) {
      removeFKRelation(selectedNode.id, fieldToRemove.name, edges, setEdges);
    }

    updateTable("fields", table.fields.filter((_: any, idx: number) => idx !== i));
  };

  const duplicateField = (i: number) => {
    const field = { ...table.fields[i], id: Date.now(), name: `${table.fields[i].name}_copia` };
    const newFields = [...table.fields];
    newFields.splice(i + 1, 0, field);
    updateTable("fields", newFields);
  };

  return (
    <div
      style={{
        background: "#1a1a1a",
        color: "white",
        padding: 16,
        width: 320,
        borderLeft: "1px solid #333",
        height: "100vh",
        overflowY: "auto",
        flexShrink: 0,
        boxSizing: "border-box",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Header */}
      <div style={{
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: "2px solid #667eea"
      }}>
        <h3 style={{
          margin: "0 0 8px 0",
          fontSize: 16,
          color: "#667eea",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          ⚙️ Propiedades
        </h3>
        <p style={{
          margin: 0,
          fontSize: 11,
          opacity: 0.6
        }}>
          Edita los campos de la tabla seleccionada
        </p>
      </div>

      {/* 🆕 Aviso de solo lectura */}
      {readOnly && (
        <div style={{
          marginBottom: 16,
          padding: "10px 12px",
          background: "rgba(102, 126, 234, 0.12)",
          border: "1px solid rgba(102, 126, 234, 0.4)",
          borderRadius: 8,
          fontSize: 11,
          color: "#aab4ff",
          textAlign: "center"
        }}>
          👁️ Estás en modo solo lectura. Inicia sesión para editar.
        </div>
      )}

      {/* Nombre de la tabla */}
      <div style={{ marginBottom: 20 }}>
        <label style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          marginBottom: 6,
          opacity: 0.8,
          letterSpacing: "0.5px"
        }}>
          NOMBRE DE LA TABLA
        </label>
        <input
          value={table.name || ""}
          disabled={readOnly}
          placeholder="Nombre de tabla..."
          onChange={(e) => updateTable("name", e.target.value)}
          onBlur={(e) => {
            // Si lo deja vacío, solo conservar vacío (no autogenerar)
            if (!table.name || table.name.trim() === "") {
              updateTable("name", "");
            }
            // Restaurar borde
            e.target.style.borderColor = "#333";
          }}
          onFocus={(e) => e.target.style.borderColor = "#667eea"}
          style={{
            width: "100%",
            background: "#252525",
            color: "#fff",
            border: "2px solid #333",
            padding: "10px 12px",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            outline: "none",
            transition: "border-color 0.2s"
          }}
        />
      </div>

      {/* Sección de Atributos */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }}>
          <label style={{
            fontSize: 11,
            fontWeight: 600,
            opacity: 0.8,
            letterSpacing: "0.5px"
          }}>
            📦 ATRIBUTOS ({table.fields.filter((f: Field) => !f.isMethod).length})
          </label>
          <button
            onClick={addField}
            disabled={readOnly}
            style={{
              background: "#667eea",
              border: "none",
              color: "#fff",
              padding: "6px 12px",
              cursor: readOnly ? "not-allowed" : "pointer",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              opacity: readOnly ? 0.5 : 1,
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#7c8ef0"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#667eea"}
          >
            ➕ Agregar Atributo
          </button>
        </div>

        {table.fields.filter((f: Field) => !f.isMethod).length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "24px 16px",
            background: "#252525",
            borderRadius: 8,
            border: "2px dashed #333"
          }}>
            <div style={{ fontSize: 28, marginBottom: 6, opacity: 0.3 }}>📝</div>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>
              No hay atributos. Agrega uno para empezar.
            </p>
          </div>
        ) : (
          table.fields
            .map((f: Field, i: number) => ({ field: f, originalIndex: i }))
            .filter(({ field }: { field: Field }) => !field.isMethod)
            .map(({ field: f, originalIndex: i }: { field: Field, originalIndex: number }) => (
            <div
              key={f.id}
              style={{
                background: "#252525",
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
                border: "1px solid #333",
                transition: "border-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#444"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#333"}
            >
              {/* Nombre del campo */}
              <div style={{ marginBottom: 8 }}>
                <label style={{
                  display: "block",
                  fontSize: 10,
                  marginBottom: 4,
                  opacity: 0.6
                }}>
                  Nombre
                </label>
                <input
                  value={f.name}
                  onChange={(e) => updateField(i, "name", e.target.value)}
                  disabled={readOnly}
                  placeholder="nombre_campo"
                  style={{
                    width: "100%",
                    background: "#1f1f1f",
                    color: "#fff",
                    border: "1px solid #333",
                    padding: "8px 10px",
                    borderRadius: 4,
                    fontSize: 13,
                    outline: "none"
                  }}
                />
              </div>

              {/* Tipo de dato */}
              <div style={{ marginBottom: 8 }}>
                <label style={{
                  display: "block",
                  fontSize: 10,
                  marginBottom: 4,
                  opacity: 0.6
                }}>
                  Tipo de dato
                </label>
                <select
                  value={f.type}
                  onChange={(e) => updateField(i, "type", e.target.value)}
                  disabled={readOnly}
                  style={{
                    width: "100%",
                    background: "#1f1f1f",
                    color: "#fff",
                    border: "1px solid #333",
                    padding: "8px 10px",
                    borderRadius: 4,
                    fontSize: 12,
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  {DATA_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Checkboxes */}
              <div style={{
                display: "flex",
                gap: 12,
                marginBottom: 8,
                paddingTop: 8,
                borderTop: "1px solid #2a2a2a"
              }}>
                <label
                  style={{
                    fontSize: 11,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                    flex: 1
                  }}
                >
                  <input
                    type="checkbox"
                    checked={f.isPrimary || false}
                    onChange={(e) => updateField(i, "isPrimary", e.target.checked)}
                    disabled={readOnly}
                    style={{ cursor: readOnly ? "not-allowed" : "pointer" }}
                  />
                  🔑 PK
                </label>

                <label
                  style={{
                    fontSize: 11,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                    flex: 1
                  }}
                >
                  <input
                    type="checkbox"
                    checked={f.isForeign || false}
                    onChange={(e) => updateField(i, "isForeign", e.target.checked)}
                    disabled={readOnly}
                    style={{ cursor: readOnly ? "not-allowed" : "pointer" }}
                  />
                  🔗 FK
                </label>

                <label
                  style={{
                    fontSize: 11,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                    flex: 1
                  }}
                  title={f.nullable ? "Permite NULL" : "NOT NULL"}
                >
                  <input
                    type="checkbox"
                    checked={f.nullable !== false}
                    onChange={(e) => updateField(i, "nullable", e.target.checked)}
                    disabled={f.isPrimary || readOnly}
                    style={{ cursor: (f.isPrimary || readOnly) ? "not-allowed" : "pointer" }}
                  />
                  Null
                </label>
              </div>

              {/* Selector de tabla referenciada (solo si es FK) */}
              {f.isForeign && (
                <div style={{ marginBottom: 8 }}>
                  <label style={{
                    display: "block",
                    fontSize: 10,
                    marginBottom: 4,
                    opacity: 0.6
                  }}>
                    Tabla referenciada
                  </label>
                  <select
                    value={table.fields[i].references || ""}
                    disabled={readOnly}
                    onChange={async (e) => {
                      const oldReference = table.fields[i].references;
                      const targetTable = e.target.value || null;

                      if (!targetTable) {
                        // Si deseleccionó, eliminar relación
                        if (setEdges && selectedNode && oldReference) {
                          updateFKRelation(selectedNode.id, oldReference, null, edges, nodes, setEdges);
                        }
                        updateField(i, "references", null);
                        updateField(i, "referencesField", null);
                        updateField(i, "relationType", undefined);
                        return;
                      }

                      // 🎨 PRIMERO: Mostrar modal para seleccionar tipo de relación
                      const relationConfig = await askRelationType();
                      if (!relationConfig) {
                        // Usuario canceló - NO actualizar nada
                        console.log("⚠️ [PropertiesPanel] User cancelled relation type selection");
                        return;
                      }
                      const relationType = relationConfig.type;

                      // Encontrar el nodo destino y su campo PK
                      const targetNode = nodes.find(n =>
                        n.data.name === targetTable || n.data.label === targetTable
                      );

                      if (!targetNode || !selectedNode) {
                        console.warn("⚠️ [PropertiesPanel] Target node not found");
                        return;
                      }

                      // 🆕 Detectar el campo PK de la tabla referenciada
                      const targetPKField = targetNode.data.fields?.find((f: any) => f.isPrimary);
                      const targetPKName = targetPKField?.name || "id";

                      console.log(`🔗 [PropertiesPanel] Creating ${relationType} relation to ${targetTable}.${targetPKName}`);

                      // ✅ SEGUNDO: Actualizar el campo con references, referencesField Y relationType juntos
                      const newFields = [...table.fields];
                      newFields[i] = {
                        ...newFields[i],
                        references: targetTable,
                        referencesField: targetPKName, // 🆕 Guardar campo PK específico
                        relationType: relationType
                      };
                      updateTable("fields", newFields);

                      // Esperar 100ms para asegurar que el nodo se guarde antes del edge
                      await new Promise(resolve => setTimeout(resolve, 100));

                      // ✅ Eliminar CUALQUIER edge FK previo asociado a ESTE campo,
                      // para evitar doble renderizado (mismo campo, misma tabla, incluso si
                      // solo cambió el tipo de relación).
                      const fkFieldName = newFields[i].name;
                      if (setEdges) {
                        const edgesToRemove = edges.filter(e =>
                          e.target === selectedNode.id && e.data?.targetField === fkFieldName
                        );

                        if (edgesToRemove.length > 0) {
                          setEdges((prev: Edge[]) =>
                            prev.filter(e => !edgesToRemove.includes(e))
                          );

                          // Emitir eliminación de edges previos si hay socket
                          if (socket && project) {
                            edgesToRemove.forEach(oldEdge => {
                              socket.emit("diagram-change", {
                                projectId: project.id,
                                action: "DELETE_EDGE",
                                payload: { id: oldEdge.id },
                              });
                            });
                          }
                        }
                      }

                      // Obtener estilo unificado según tipo de relación
                      const edgeStyle = getEdgeStyle(relationType);
                      const multiplicities = getMultiplicitiesFromRelationType(relationType);

                      // Crear nuevo edge con el tipo seleccionado (consistente con los enlaces del lienzo)
                      const newEdge: Edge = {
                        id: `edge-fk-${Date.now()}`,
                        source: targetNode.id,   // Tabla referenciada (lado PK)
                        target: selectedNode.id, // Tabla con FK
                        type: "umlMultiplicity",
                        animated: edgeStyle.animated,
                        style: {
                          stroke: edgeStyle.stroke,
                          strokeWidth: edgeStyle.strokeWidth,
                          strokeDasharray: edgeStyle.strokeDasharray,
                          // Agregar markerEnd desde el style si existe (para UML markers personalizados)
                          ...(edgeStyle.style || {})
                        },
                        markerEnd: typeof edgeStyle.markerEnd === 'object' ? {
                          type: (edgeStyle.markerEnd as any).type,
                          color: (edgeStyle.markerEnd as any).color,
                          width: 20,
                          height: 20
                        } : undefined,
                        // 🆕 Guardar campos específicos en data del edge
                        data: {
                          sourceField: targetPKName,           // Campo PK de la tabla referenciada
                          targetField: newFields[i].name,      // Campo FK de esta tabla
                          relationType: relationType,
                          sourceMultiplicity: multiplicities.sourceMultiplicity,
                          targetMultiplicity: multiplicities.targetMultiplicity
                        }
                      };

                      console.log("✅ [PropertiesPanel] Edge created:", newEdge.id, "Fields:", targetPKName, "→", newFields[i].name);

                      // Actualizar estado local
                      if (setEdges) {
                        setEdges((prev: Edge[]) => [...prev, newEdge]);
                      }

                      // Emitir al servidor si hay socket
                      if (socket && project) {
                        socket.emit("diagram-change", {
                          projectId: project.id,
                          action: "ADD_EDGE",
                          payload: newEdge,
                        });
                      }
                    }}
                    style={{
                      width: "100%",
                      background: "#2a2a2a",
                      color: "#fff",
                      border: "1px solid #444",
                      padding: "8px 10px",
                      borderRadius: 4,
                      fontSize: 12,
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="">-- Selecciona tabla --</option>
                    {availableTables
                      .filter(t => t !== table.name)
                      .map(tableName => (
                        <option key={tableName} value={tableName}>
                          {tableName}
                        </option>
                      ))}
                  </select>

                  {/* 🆕 Mostrar tipo de relación actual */}
                  {f.relationType && (
                    <div style={{
                      marginTop: 6,
                      fontSize: 10,
                      opacity: 0.7,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}>
                      <span>Tipo:</span>
                      <span style={{
                        fontWeight: "bold",
                        color: f.relationType === "1-1" ? "#74b9ff" :
                          f.relationType === "1-N" ? "#00cec9" :
                            f.relationType === "N-N" ? "#ff7675" : "#aaa"
                      }}>
                        {f.relationType}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Botones de acción */}
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button
                  onClick={() => duplicateField(i)}
                  disabled={readOnly}
                  style={{
                    flex: 1,
                    background: "#333",
                    border: "none",
                    color: "#aaa",
                    padding: "6px",
                    borderRadius: 4,
                    cursor: readOnly ? "not-allowed" : "pointer",
                    fontSize: 10,
                    fontWeight: 600,
                    opacity: readOnly ? 0.5 : 1,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#444";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#333";
                    e.currentTarget.style.color = "#aaa";
                  }}
                  title="Duplicar campo"
                >
                  📋 Duplicar
                </button>

                <button
                  onClick={() => removeField(i)}
                  disabled={readOnly}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "1px solid #f66",
                    color: "#f66",
                    padding: "6px",
                    borderRadius: 4,
                    cursor: readOnly ? "not-allowed" : "pointer",
                    fontSize: 10,
                    fontWeight: 600,
                    opacity: readOnly ? 0.5 : 1,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f66";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#f66";
                  }}
                >
                  🗑 Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sección de Métodos */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }}>
          <label style={{
            fontSize: 11,
            fontWeight: 600,
            opacity: 0.8,
            letterSpacing: "0.5px"
          }}>
            ⚙️ MÉTODOS ({table.fields.filter((f: Field) => f.isMethod).length})
          </label>
          <button
            onClick={addMethod}
            disabled={readOnly}
            style={{
              background: "#f39c12",
              border: "none",
              color: "#fff",
              padding: "6px 12px",
              cursor: readOnly ? "not-allowed" : "pointer",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              opacity: readOnly ? 0.5 : 1,
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f1c40f"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#f39c12"}
          >
            ➕ Agregar Método
          </button>
        </div>

        {table.fields.filter((f: Field) => f.isMethod).length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "24px 16px",
            background: "#252525",
            borderRadius: 8,
            border: "2px dashed #333"
          }}>
            <div style={{ fontSize: 28, marginBottom: 6, opacity: 0.3 }}>⚙️</div>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>
              No hay métodos. (Solo visible en vista UML)
            </p>
          </div>
        ) : (
          table.fields
            .map((f: Field, i: number) => ({ field: f, originalIndex: i }))
            .filter(({ field }: { field: Field }) => field.isMethod)
            .map(({ field: f, originalIndex: i }: { field: Field, originalIndex: number }) => (
            <div
              key={f.id}
              style={{
                background: "#2d2416",
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
                border: "1px solid #f39c12",
                transition: "border-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#f1c40f"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#f39c12"}
            >
              {/* Nombre del método */}
              <div style={{ marginBottom: 8 }}>
                <label style={{
                  display: "block",
                  fontSize: 10,
                  marginBottom: 4,
                  opacity: 0.6
                }}>
                  Método
                </label>
                <input
                  value={f.name}
                  onChange={(e) => updateField(i, "name", e.target.value)}
                  placeholder="nuevoMetodo()"
                  style={{
                    width: "100%",
                    background: "#1f1f1f",
                    color: "#f1c40f",
                    border: "1px solid #f39c12",
                    padding: "8px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontFamily: "monospace",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#f1c40f"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#f39c12"}
                />
              </div>

              {/* Botón eliminar */}
              <button
                onClick={() => removeField(i)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid #e74c3c",
                  color: "#e74c3c",
                  padding: "6px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 10,
                  fontWeight: 600,
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e74c3c";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#e74c3c";
                }}
              >
                🗑 Eliminar Método
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
