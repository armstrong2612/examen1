import React from "react";
import { Handle, Position } from "reactflow";
import type { Field, TableData } from "@shared/types";
import { useViewMode } from "../store/ViewModeContext";
import { sqlToUmlType, isForeignKeyField } from "../utils/typeMapping";

interface TableNodeProps {
  id: string;
  data: TableData;
  selected?: boolean;
}

export default function TableNode({ id, data, selected }: TableNodeProps) {
  const tableName = data.name || data.label || "NuevaTabla";
  const fields = data.fields || [];
  const { viewMode } = useViewMode();

  // Separar atributos y métodos
  const attributes = fields.filter(f => !f.isMethod);
  const methods = fields.filter(f => f.isMethod);

  // Filtrar campos según el modo de vista
  const visibleAttributes = viewMode === "UML" 
    ? attributes.filter(f => !isForeignKeyField(f)) 
    : attributes;

  // Los métodos solo se muestran en vista UML
  const visibleMethods = viewMode === "UML" ? methods : [];

  // Obtener tipo a mostrar según el modo
  const getDisplayType = (field: Field): string => {
    if (viewMode === "UML") {
      return sqlToUmlType(field.type || "");
    }
    return field.type || "";
  };

  return (
    <div
      style={{
        background: "#171a21",
        color: "#c7d5e0",
        borderRadius: 8,
        border: selected ? "2px solid #66c0f4" : "1px solid #2c3a48",
        width: 240,
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxShadow: selected ? "0 0 0 3px rgba(102,192,244,0.18)" : "0 4px 12px rgba(0,0,0,0.35)",
        transition: "all 0.2s ease",
        cursor: "pointer"
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#7ab540", width: 10, height: 10 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: "#66c0f4", width: 10, height: 10 }} />

      <div style={{ background: selected ? "#4da6e0" : "#12161c", color: selected ? "#fff" : "#e6edf3", padding: "10px 12px", fontWeight: "bold", borderRadius: "7px 7px 0 0", fontSize: "14px", textAlign: "center", letterSpacing: "0.3px", borderBottom: "1px solid #2c3a48", transition: "background 0.2s" }}>
        {tableName}
      </div>

      <div style={{ padding: "10px 12px" }}>
        {/* Atributos */}
        {visibleAttributes.length === 0 ? (
          <div style={{ color: "#6b7989", fontSize: 11, textAlign: "center", fontStyle: "italic", padding: "8px 0" }}>
            (sin atributos)
          </div>
        ) : (
          visibleAttributes.map((f: Field) => (
            <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, margin: "4px 0", padding: "4px 6px", background: "#12161c", borderRadius: 4, borderLeft: f.isPrimary ? "3px solid #d9a23c" : f.isForeign ? "3px solid #66c0f4" : "3px solid transparent" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                {f.isPrimary && <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, background: "rgba(217,162,60,0.2)", color: "#f0b24c", borderRadius: 3, padding: "1px 4px" }}>PK</span>}
                {f.isForeign && <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, background: "rgba(102,192,244,0.18)", color: "#9cc9f5", borderRadius: 3, padding: "1px 4px" }}>FK</span>}
                <span style={{ fontWeight: f.isPrimary ? 700 : 400, color: "#c7d5e0" }}>{f.name}</span>
              </span>
              <span style={{ color: "#8f98a0", fontSize: 10, fontFamily: "monospace" }}>{getDisplayType(f)}</span>
            </div>
          ))
        )}

        {/* Línea divisoria si hay métodos */}
        {visibleMethods.length > 0 && (
          <div style={{ 
            height: "1px", 
            background: "#2c3a48", 
            margin: "12px 0", 
            borderRadius: "1px" 
          }} />
        )}

        {/* Métodos (solo en UML) */}
        {visibleMethods.length > 0 && (
          <>
            {visibleMethods.map((f: Field) => (
              <div key={f.id} style={{ 
                fontSize: 11, 
                margin: "4px 0", 
                padding: "4px 6px", 
                background: "rgba(217,162,60,0.14)", 
                borderRadius: 4, 
                borderLeft: "3px solid #d9a23c",
                color: "#f0b24c",
                fontFamily: "monospace"
              }}>
                {f.name}
              </div>
            ))}
          </>
        )}
      </div>

      {selected && (
        <div style={{ padding: "6px", background: "rgba(102,192,244,0.15)", color: "#9cc9f5", fontSize: 10, textAlign: "center", borderRadius: "0 0 8px 8px", fontWeight: 600, borderTop: "1px solid #2c3a48" }}>
          Edita en el panel derecho
        </div>
      )}
    </div>
  );
}