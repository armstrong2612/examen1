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
  socket?: any; // Socket para emitir eventos
  project?: any; // Proyecto actual
  readOnly?: boolean; // Si es true, el panel es solo lectura (viewer/invitado)
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
          background: "#171a21",
          color: "#8f98a0",
          padding: 20,
          borderLeft: "1px solid #2c3a48",
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
        <p style={{ margin: 0, fontSize: 14, color: "#b8c7d4" }}>Selecciona una tabla</p>
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
      relationType: undefined, // Inicializar relationType
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
        background: "#171a21",
        color: "#c7d5e0",
        padding: 16,
        width: 320,
        borderLeft: "1px solid #2c3a48",
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
        borderBottom: "2px solid #66c0f4"
      }}>
        <h3 style={{
          margin: "0 0 8px 0",
          fontSize: 16,
          color: "#e6edf3",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          Propiedades
        </h3>
        <p style={{
          margin: 0,
          fontSize: 11,
          color: "#8f98a0"
        }}>
          Edita los campos de la tabla seleccionada
        </p>
      </div>

      {/* Aviso de solo lectura */}
      {readOnly && (
        <div style={{
          marginBottom: 16,
          padding: "10px 12px",
          background: "rgba(102,192,244,0.12)",
          border: "1px solid rgba(102,192,244,0.35)",
          borderRadius: 8,
          fontSize: 11,
          color: "#9cc9f5",
          textAlign: "center"
        }}>
          Estás en modo solo lectura. Inicia sesión para editar.
        </div>
      )}

      {/* Nombre de la tabla */}
      <div style={{ marginBottom: 20 }}>
        <label style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          marginBottom: 6,
          color: "#8f98a0",
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
            e.target.style.borderColor = "#2c3a48";
            e.target.style.boxShadow = "none";
          }}
          onFocus={(e) => { e.target.style.borderColor = "#66c0f4"; e.target.style.boxShadow = "0 0 0 3px rgba(102,192,244,0.15)"; }}
          style={{
            width: "100%",
            background: "#1b2838",
            color: "#c7d5e0",
            border: "1px solid #2c3a48",
            padding: "10px 12px",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s"
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
            color: "#8f98a0",
            letterSpacing: "0.5px"
          }}>
            ATRIBUTOS ({table.fields.filter((f: Field) => !f.isMethod).length})
          </label>
          <button
            onClick={addField}
            disabled={readOnly}
            style={{
              background: "#66c0f4",
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
            onMouseEnter={(e) => e.currentTarget.style.background = "#4da6e0"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#66c0f4"}
          >
            Agregar Atributo
          </button>
        </div>

        {table.fields.filter((f: Field) => !f.isMethod).length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "24px 16px",
            background: "#12161c",
            borderRadius: 8,
            border: "1px dashed #2c3a48"
          }}>
            <p style={{ margin: 0, fontSize: 11, color: "#8f98a0" }}>
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
                background: "#12161c",
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
                border: "1px solid #2c3a48",
                transition: "border-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#42596e"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2c3a48"}
            >
              {/* Nombre del campo */}
              <div style={{ marginBottom: 8 }}>
                <label style={{
                  display: "block",
                  fontSize: 10,
                  marginBottom: 4,
                  color: "#8f98a0"
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
                    background: "#1b2838",
                    color: "#c7d5e0",
                    border: "1px solid #2c3a48",
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
                  color: "#8f98a0"
                }}>
                  Tipo de dato
                </label>
                <select
                  value={f.type}
                  onChange={(e) => updateField(i, "type", e.target.value)}
                  disabled={readOnly}
                  style={{
                    width: "100%",
                    background: "#1b2838",
                    color: "#c7d5e0",
                    border: "1px solid #2c3a48",
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
                borderTop: "1px solid #2c3a48"
              }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "#8f98a0",
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
                    style={{ cursor: readOnly ? "not-allowed" : "pointer", accentColor: "#d9a23c" }}
                  />
                  PK
                </label>

                <label
                  style={{
                    fontSize: 11,
                    color: "#8f98a0",
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
                    style={{ cursor: readOnly ? "not-allowed" : "pointer", accentColor: "#66c0f4" }}
                  />
                  FK
                </label>

                <label
                  style={{
                    fontSize: 11,
                    color: "#8f98a0",
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
                    style={{ cursor: (f.isPrimary || readOnly) ? "not-allowed" : "pointer", accentColor: "#6b7989" }}
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
                    color: "#8f98a0"
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

                      // PRIMERO: Mostrar modal para seleccionar tipo de relación
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

                      // Detectar el campo PK de la tabla referenciada
                      const targetPKField = targetNode.data.fields?.find((f: any) => f.isPrimary);
                      const targetPKName = targetPKField?.name || "id";

                      console.log(`🔗 [PropertiesPanel] Creating ${relationType} relation to ${targetTable}.${targetPKName}`);

                      // SEGUNDO: Actualizar el campo con references, referencesField Y relationType juntos
                      const newFields = [...table.fields];
                      newFields[i] = {
                        ...newFields[i],
                        references: targetTable,
                        referencesField: targetPKName, // Guardar campo PK específico
                        relationType: relationType
                      };
                      updateTable("fields", newFields);

                      // Esperar 100ms para asegurar que el nodo se guarde antes del edge
                      await new Promise(resolve => setTimeout(resolve, 100));

                      // Eliminar CUALQUIER edge FK previo asociado a ESTE campo,
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
                        // Guardar campos específicos en data del edge
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
                      background: "#1b2838",
                      color: "#c7d5e0",
                      border: "1px solid #2c3a48",
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

                  {/* Mostrar tipo de relación actual */}
                  {f.relationType && (
                    <div style={{
                      marginTop: 6,
                      fontSize: 10,
                      color: "#8f98a0",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}>
                      <span>Tipo:</span>
                      <span style={{
                        fontWeight: "bold",
                        color: f.relationType === "1-1" ? "#63c4f5" :
                          f.relationType === "1-N" ? "#5fd4e8" :
                            f.relationType === "N-N" ? "#f98a9e" : "#8f98a0"
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
                    background: "#1b2838",
                    border: "1px solid #2c3a48",
                    color: "#8f98a0",
                    padding: "6px",
                    borderRadius: 4,
                    cursor: readOnly ? "not-allowed" : "pointer",
                    fontSize: 10,
                    fontWeight: 600,
                    opacity: readOnly ? 0.5 : 1,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#2c3a48";
                    e.currentTarget.style.color = "#e6edf3";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#1b2838";
                    e.currentTarget.style.color = "#8f98a0";
                  }}
                  title="Duplicar campo"
                >
                  Duplicar
                </button>

                <button
                  onClick={() => removeField(i)}
                  disabled={readOnly}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "1px solid rgba(239,131,131,0.5)",
                    color: "#ef8383",
                    padding: "6px",
                    borderRadius: 4,
                    cursor: readOnly ? "not-allowed" : "pointer",
                    fontSize: 10,
                    fontWeight: 600,
                    opacity: readOnly ? 0.5 : 1,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#dc4b4b";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#ef8383";
                  }}
                >
                  Eliminar
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
            color: "#8f98a0",
            letterSpacing: "0.5px"
          }}>
            MÉTODOS ({table.fields.filter((f: Field) => f.isMethod).length})
          </label>
          <button
            onClick={addMethod}
            disabled={readOnly}
            style={{
              background: "#d9a23c",
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
            onMouseEnter={(e) => e.currentTarget.style.background = "#c08a2f"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#d9a23c"}
          >
            Agregar Método
          </button>
        </div>

        {table.fields.filter((f: Field) => f.isMethod).length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "24px 16px",
            background: "#12161c",
            borderRadius: 8,
            border: "1px dashed #2c3a48"
          }}>
            <p style={{ margin: 0, fontSize: 11, color: "#8f98a0" }}>
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
                background: "rgba(217,162,60,0.12)",
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
                border: "1px solid rgba(217,162,60,0.45)",
                transition: "border-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#d9a23c"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(217,162,60,0.45)"}
            >
              {/* Nombre del método */}
              <div style={{ marginBottom: 8 }}>
                <label style={{
                  display: "block",
                  fontSize: 10,
                  marginBottom: 4,
                  color: "#f0b24c"
                }}>
                  Método
                </label>
                <input
                  value={f.name}
                  onChange={(e) => updateField(i, "name", e.target.value)}
                  placeholder="nuevoMetodo()"
                  style={{
                    width: "100%",
                    background: "#1b2838",
                    color: "#f0b24c",
                    border: "1px solid rgba(217,162,60,0.4)",
                    padding: "8px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontFamily: "monospace",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#d9a23c"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(217,162,60,0.4)"}
                />
              </div>

              {/* Botón eliminar */}
              <button
                onClick={() => removeField(i)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid rgba(239,131,131,0.5)",
                  color: "#ef8383",
                  padding: "6px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 10,
                  fontWeight: 600,
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#dc4b4b";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#ef8383";
                }}
              >
                Eliminar Método
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}