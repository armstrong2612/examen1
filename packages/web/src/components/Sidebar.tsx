import React from "react";
import { Node, Edge } from "reactflow";
import type { Field } from "@shared/types";
import { useViewMode } from "../store/ViewModeContext";

interface SidebarProps {
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;
  onAddNode: () => void;
  onExportSQL: () => void;
  onExportSpringBoot: () => void;
  onExportFlutter: () => void;
  onDeleteNode?: (nodeId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  nodes, 
  edges, 
  selectedNode, 
  onAddNode, 
  onExportSQL,
  onExportSpringBoot,
  onExportFlutter,
  onDeleteNode
}) => {
  const tableNodes = nodes.filter(n => n.type === 'table');
  const selectedNodeData = tableNodes.find(n => n.id === selectedNode);
  const { viewMode, toggleViewMode } = useViewMode();
  
  return (
    <div style={{
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 280,
      background: "#171a21",
      borderRight: "1px solid #2c3a48",
      display: "flex",
      flexDirection: "column",
      zIndex: 10,
      color: "#c7d5e0",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        padding: "16px",
        borderBottom: "1px solid #2c3a48",
        background: "#12161c"
      }}>
        <h3 style={{ 
          margin: "0 0 12px 0", 
          fontSize: "15px", 
          fontWeight: "600",
          color: "#e6edf3",
          letterSpacing: "0.3px"
        }}>
          Diagrama ER - UML 2.5
        </h3>
        
        {/* Botón Toggle Vista */}
        <button
          onClick={toggleViewMode}
          title={viewMode === "SQL" ? "Cambiar a vista UML 2.5 (oculta FKs y muestra tipos abstractos)" : "Cambiar a vista SQL (muestra FKs y tipos de BD)"}
          style={{
            width: "100%",
            background: viewMode === "UML" ? "#69983a" : "#66c0f4",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "background 0.2s ease"
          }}
        >
          Vista: {viewMode === "UML" ? "UML 2.5" : "SQL"}
        </button>
      </div>

      {/* Stats */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid #2c3a48",
        display: "flex",
        gap: 16,
        fontSize: "13px"
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#8f98a0", fontSize: "11px", marginBottom: 4 }}>Tablas</div>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#66c0f4" }}>
            {tableNodes.length}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#8f98a0", fontSize: "11px", marginBottom: 4 }}>Relaciones</div>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#8fb3d9" }}>
            {edges.length}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #2c3a48" }}>
        <button 
          onClick={onAddNode}
          style={{
            width: "100%",
            padding: "10px",
            background: "#66c0f4",
            border: "none",
            borderRadius: 6,
            color: "#fff",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "13px",
            marginBottom: 8,
            transition: "transform 0.1s, background 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#4da6e0"}
          onMouseOut={(e) => e.currentTarget.style.background = "#66c0f4"}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          Nueva Tabla
        </button>
        
        <button 
          onClick={onExportSQL}
          style={{
            width: "100%",
            padding: "10px",
            background: "#12161c",
            border: "1px solid #2c3a48",
            borderRadius: 6,
            color: "#b8c7d4",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "13px",
            marginBottom: 8,
            transition: "all 0.1s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#2c3a48";
            e.currentTarget.style.borderColor = "#42596e";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#12161c";
            e.currentTarget.style.borderColor = "#2c3a48";
          }}
        >
          Exportar SQL
        </button>

        <button 
          onClick={onExportSpringBoot}
          style={{
            width: "100%",
            padding: "10px",
            background: "#12161c",
            border: "1px solid #2c3a48",
            borderRadius: 6,
            color: "#b8c7d4",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "13px",
            marginBottom: 8,
            transition: "all 0.1s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#69983a";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "#69983a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#12161c";
            e.currentTarget.style.color = "#b8c7d4";
            e.currentTarget.style.borderColor = "#2c3a48";
          }}
        >
          Exportar Spring Boot
        </button>

        <button 
          onClick={onExportFlutter}
          style={{
            width: "100%",
            padding: "10px",
            background: "#12161c",
            border: "1px solid #2c3a48",
            borderRadius: 6,
            color: "#b8c7d4",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "13px",
            transition: "all 0.1s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#3aa5d8";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "#3aa5d8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#12161c";
            e.currentTarget.style.color = "#b8c7d4";
            e.currentTarget.style.borderColor = "#2c3a48";
          }}
        >
          Exportar Flutter
        </button>
      </div>

      {/* Lista de tablas */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "8px"
      }}>
        <div style={{
          fontSize: "11px",
          fontWeight: "600",
          color: "#8f98a0",
          padding: "8px 8px 4px",
          letterSpacing: "0.5px"
        }}>
          TABLAS ({tableNodes.length})
        </div>
        
        {tableNodes.length === 0 ? (
          <div style={{
            padding: "16px",
            textAlign: "center",
            color: "#8f98a0",
            fontSize: "12px"
          }}>
            No hay tablas aún.
            <br />
            Crea una para empezar.
          </div>
        ) : (
          tableNodes.map(node => {
            const data = node.data || {};
            const tableName = data.name || data.label || "Sin nombre";
            const fieldCount = (data.fields || []).length;
            const pkCount = (data.fields || []).filter((f: Field) => f.isPrimary).length;
            const fkCount = (data.fields || []).filter((f: Field) => f.isForeign).length;
            const isSelected = node.id === selectedNode;
            
            return (
              <div 
                key={node.id}
                style={{
                  margin: "4px 8px",
                  padding: "10px",
                  background: isSelected ? "rgba(102,192,244,0.12)" : "#12161c",
                  border: isSelected ? "1.5px solid #66c0f4" : "1px solid #2c3a48",
                  borderRadius: 6,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "#171a21";
                    e.currentTarget.style.borderColor = "#42596e";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "#12161c";
                    e.currentTarget.style.borderColor = "#2c3a48";
                  }
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontWeight: "600", color: isSelected ? "#9cc9f5" : "#c7d5e0", flex: 1 }}>
                    {tableName}
                  </div>
                  {onDeleteNode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const confirm = window.confirm(`¿Eliminar tabla "${tableName}"?`);
                        if (confirm) {
                          onDeleteNode(node.id);
                        }
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ef8383",
                        fontSize: "14px",
                        cursor: "pointer",
                        padding: "2px 6px",
                        borderRadius: 4,
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
                      title="Eliminar tabla"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div style={{ 
                  fontSize: "11px", 
                  color: "#8f98a0",
                  display: "flex",
                  gap: 10
                }}>
                  <span>{fieldCount} campos</span>
                  {pkCount > 0 && <span>PK {pkCount}</span>}
                  {fkCount > 0 && <span>FK {fkCount}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer info */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #2c3a48",
        fontSize: "11px",
        color: "#6b7989",
        textAlign: "center"
      }}>
        Diagrama ER - UML 2.5 Colaborativo
      </div>
    </div>
  );
};