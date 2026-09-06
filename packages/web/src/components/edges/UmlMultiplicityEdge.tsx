import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from "reactflow";

/**
 * Edge personalizado para mostrar multiplicidades UML 2.5 en los extremos
 */
export default function UmlMultiplicityEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const sourceMultiplicity = data?.sourceMultiplicity ?? "";
  const targetMultiplicity = data?.targetMultiplicity ?? "";
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const offset = 16;
  const sourceDx = targetX - sourceX;
  const sourceDy = targetY - sourceY;
  const sourceLength = Math.sqrt(sourceDx * sourceDx + sourceDy * sourceDy);
  const sourceUnitX = sourceDx / sourceLength;
  const sourceUnitY = sourceDy / sourceLength;
  const sourceLabelX = sourceX + sourceUnitX * offset;
  const sourceLabelY = sourceY + sourceUnitY * offset;
  const targetDx = sourceX - targetX;
  const targetDy = sourceY - targetY;
  const targetLength = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
  const targetUnitX = targetDx / targetLength;
  const targetUnitY = targetDy / targetLength;
  const targetLabelX = targetX + targetUnitX * offset;
  const targetLabelY = targetY + targetUnitY * offset;
  const labelStyle: React.CSSProperties = {
    position: "absolute",
    fontSize: "13px",
    fontWeight: 600,
    backgroundColor: "#202a38",
    color: "#c7d5e0",
    padding: "2px 6px",
    borderRadius: "4px",
    pointerEvents: "none",
    transform: "translate(-50%, -50%)",
    userSelect: "none",
    whiteSpace: "nowrap",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.5)",
    border: "1px solid #2c3a48",
  };

  return (
    <>
      {/* Renderizar la línea base del edge */}
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />

      {/* Renderizar los labels de multiplicidad en los extremos */}
      <EdgeLabelRenderer>
        {/* Label cerca del source - solo si hay multiplicidad */}
        {sourceMultiplicity && (
          <div
            style={{
              ...labelStyle,
              left: sourceLabelX,
              top: sourceLabelY,
            }}
            className="nodrag nopan"
          >
            {sourceMultiplicity}
          </div>
        )}

        {/* Label cerca del target - solo si hay multiplicidad */}
        {targetMultiplicity && (
          <div
            style={{
              ...labelStyle,
              left: targetLabelX,
              top: targetLabelY,
            }}
            className="nodrag nopan"
          >
            {targetMultiplicity}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
