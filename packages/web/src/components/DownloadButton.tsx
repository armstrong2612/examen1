import React from "react";
import { Panel, useReactFlow, getNodesBounds, getViewportForBounds } from "reactflow";
import { toPng } from "html-to-image";

function downloadImage(dataUrl: string) {
  const a = document.createElement("a");
  a.setAttribute("download", `diagrama-${Date.now()}.png`);
  a.setAttribute("href", dataUrl);
  a.click();
}

const imageWidth = 2048;
const imageHeight = 1536;

export default function DownloadButton() {
  const { getNodes } = useReactFlow();

  const onClick = () => {
    // Obtener el viewport del ReactFlow
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
      0.1
    );

    // Seleccionar el elemento del diagrama
    const diagramElement = document.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement;

    if (!diagramElement) {
      console.error("No se encontró el viewport de ReactFlow");
      return;
    }

    toPng(diagramElement, {
      backgroundColor: "#1b2838",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then(downloadImage);
  };

  return (
    <Panel position="top-right" style={{ marginTop: "60px" }}>
      <button
        onClick={onClick}
        style={{
          padding: "8px 15px",
          backgroundColor: "#171a21",
          color: "#c7d5e0",
          border: "1px solid #2c3a48",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 600,
          boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#2c3a48";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.45)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#171a21";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.35)";
        }}
      >
        Descargar PNG
      </button>
    </Panel>
  );
}
