import Swal from "sweetalert2";

export interface RelationConfig {
  type: string;
  multiplicity?: "1-1" | "1-N" | "N-N";
}

export async function askRelationType(): Promise<RelationConfig | null> {
  // Paso 1: Seleccionar tipo de relación con CARDS
  const { value: type } = await Swal.fire({
    title: "Selecciona el tipo de relación",
    html: `
      <style>
        .relation-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          padding: 10px;
          max-height: 500px;
          overflow-y: auto;
        }
        .relation-category {
          margin-bottom: 8px;
        }
        .category-title {
          font-size: 13px;
          font-weight: 600;
          color: #9cc9f5;
          margin-bottom: 8px;
          padding: 8px 12px;
          background: rgba(59, 130, 246, 0.12);
          border-radius: 6px;
          text-align: left;
        }
        .category-title.uml {
          color: #a8c8ea;
          background: rgba(139, 92, 246, 0.12);
        }
        .relation-card {
          background: #12161c;
          border: 1px solid #2c3a48;
          border-radius: 8px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .relation-card:hover {
          border-color: #66c0f4;
          background: #1b2838;
          transform: translateY(-2px);
        }
        .relation-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #e6edf3;
          margin-bottom: 4px;
        }
        .relation-card-desc {
          font-size: 12px;
          color: #8f98a0;
        }
      </style>
      <div class="relation-grid">
        <div class="relation-category">
          <div class="category-title">BASE DE DATOS (Crow's Foot)</div>
          <div class="relation-card" data-value="1-1">
            <div class="relation-card-title">1:1 - Uno a uno</div>
            <div class="relation-card-desc">Ej: Usuario &harr; Perfil</div>
          </div>
          <div class="relation-card" data-value="1-N">
            <div class="relation-card-title">1:N - Uno a muchos</div>
            <div class="relation-card-desc">Ej: Departamento &rarr; Empleados</div>
          </div>
          <div class="relation-card" data-value="N-N">
            <div class="relation-card-title">N:N - Muchos a muchos</div>
            <div class="relation-card-desc">Ej: Estudiantes &harr; Cursos</div>
          </div>
        </div>
        
        <div class="relation-category">
          <div class="category-title uml">UML 2.5 (Diseno Orientado a Objetos)</div>
          <div class="relation-card" data-value="ASSOCIATION">
            <div class="relation-card-title">- Asociacion</div>
            <div class="relation-card-desc">Relacion de conocimiento mutuo (pide cardinalidad)</div>
          </div>
          <div class="relation-card" data-value="AGGREGATION">
            <div class="relation-card-title">Aggregacion</div>
            <div class="relation-card-desc">Relacion "tiene-un" debil</div>
          </div>
          <div class="relation-card" data-value="COMPOSITION">
            <div class="relation-card-title">Composicion</div>
            <div class="relation-card-desc">Relacion "parte-de" fuerte</div>
          </div>
          <div class="relation-card" data-value="INHERITANCE">
            <div class="relation-card-title">Herencia</div>
            <div class="relation-card-desc">Generalizacion "es-un"</div>
          </div>
          <div class="relation-card" data-value="DEPENDENCY">
            <div class="relation-card-title">Dependencia</div>
            <div class="relation-card-desc">Una clase usa otra temporalmente</div>
          </div>
          <div class="relation-card" data-value="REALIZATION">
            <div class="relation-card-title">Realizacion</div>
            <div class="relation-card-desc">Implementa una interfaz</div>
          </div>
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    cancelButtonColor: "#42596e",
    background: "#171a21",
    color: "#c7d5e0",
    width: '500px',
    customClass: {
      popup: "swal-dark-popup",
      cancelButton: "swal-cancel-btn",
      htmlContainer: "swal-html-dark",
    },
    didOpen: () => {
      const cards = document.querySelectorAll('.relation-card');
      cards.forEach((card) => {
        card.addEventListener('click', () => {
          const value = (card as HTMLElement).getAttribute('data-value');
          Swal.clickConfirm();
          (Swal as any).selectedValue = value;
        });
      });
    },
    preConfirm: () => {
      return (Swal as any).selectedValue;
    }
  });

  if (!type) return null;

  // Paso 2: Si es ASSOCIATION, AGGREGATION o COMPOSITION, preguntar multiplicidad
  if (type === "ASSOCIATION" || type === "AGGREGATION" || type === "COMPOSITION") {
    const relationName = 
      type === "ASSOCIATION" ? "Asociacion" :
      type === "AGGREGATION" ? "Agregacion" :
      "Composicion";
    
    // AGGREGATION y COMPOSITION solo permiten 1-1 y 1-N (no N-N)
    const allowManyToMany = type === "ASSOCIATION";

    const { value: multiplicity } = await Swal.fire({
      title: `${relationName}: Multiplicidad`,
      html: `
        <style>
          .multiplicity-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 10px;
          }
          .multiplicity-card {
            background: #12161c;
            border: 1px solid #2c3a48;
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }
          .multiplicity-card:hover {
            border-color: #66c0f4;
            background: #1b2838;
            transform: translateY(-2px);
          }
          .multiplicity-card.selected {
            border-color: #66c0f4;
            background: rgba(59, 130, 246, 0.15);
          }
          .multiplicity-card-title {
            font-size: 16px;
            font-weight: 600;
            color: #e6edf3;
            margin-bottom: 8px;
          }
          .multiplicity-card-desc {
            font-size: 13px;
            color: #8f98a0;
            line-height: 1.5;
          }
          .multiplicity-card-example {
            font-size: 12px;
            color: #9cc9f5;
            margin-top: 8px;
            font-style: italic;
          }
        </style>
        <div class="multiplicity-grid">
          <div class="multiplicity-card" data-value="1-1">
            <div class="multiplicity-card-title">1 a 1 (uno a uno)</div>
            <div class="multiplicity-card-desc">
              Cada elemento del origen se relaciona con <strong>exactamente uno</strong> en el destino
            </div>
            <div class="multiplicity-card-example">Ejemplo: Persona [1] - [1] Pasaporte</div>
          </div>
          
          <div class="multiplicity-card selected" data-value="1-N">
            <div class="multiplicity-card-title">1 a Muchos (1:N)</div>
            <div class="multiplicity-card-desc">
              Cada elemento del origen puede tener <strong>varios</strong> en el destino
            </div>
            <div class="multiplicity-card-example">Ejemplo: Departamento [1] -[*] Empleados</div>
          </div>
          
          ${allowManyToMany ? `
          <div class="multiplicity-card" data-value="N-N">
            <div class="multiplicity-card-title">Muchos a Muchos (N:N)</div>
            <div class="multiplicity-card-desc">
              Ambos lados pueden tener <strong>multiples</strong> instancias. <strong>Se crea tabla intermedia automaticamente</strong>
            </div>
            <div class="multiplicity-card-example">Ejemplo: Estudiantes [*] &harr; [*] Cursos - Tabla: Estudiante_Curso</div>
          </div>
          ` : ''}
        </div>
      `,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Crear relación",
      cancelButtonText: "← Atrás",
      confirmButtonColor: "#66c0f4",
      cancelButtonColor: "#42596e",
      background: "#171a21",
      color: "#c7d5e0",
      width: '520px',
      customClass: {
        popup: "swal-dark-popup",
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
        htmlContainer: "swal-html-dark",
      },
      didOpen: () => {
        // Pre-seleccionar 1-N por defecto
        (Swal as any).selectedMultiplicity = "1-N";
        
        const cards = document.querySelectorAll('.multiplicity-card');
        cards.forEach((card) => {
          card.addEventListener('click', () => {
            // Remover selección previa
            cards.forEach(c => c.classList.remove('selected'));
            // Agregar selección a la actual
            card.classList.add('selected');
            
            const value = (card as HTMLElement).getAttribute('data-value');
            (Swal as any).selectedMultiplicity = value;
          });
        });
      },
      preConfirm: () => {
        return (Swal as any).selectedMultiplicity;
      }
    });

    if (!multiplicity) return null; // Usuario canceló

    return { type, multiplicity: multiplicity as "1-1" | "1-N" | "N-N" };
  }

  // Para otros tipos, no necesitan multiplicidad personalizada
  return { type };
}

/**
 * Pregunta al usuario qué hacer cuando ya existe una relación entre las mismas dos tablas.
 * Se muestra JUSTO al juntar los puntos, antes de elegir tipo/cardinalidad.
 * @returns "replace" para reemplazar la existente, "create" para crear otra aparte, null para cancelar
 */
export async function askExistingRelation(
  sourceName: string,
  targetName: string
): Promise<"replace" | "create" | null> {
  const { value } = await Swal.fire({
    title: "Ya existe una relación",
    html: `
      <style>
        .exists-msg {
          font-size: 14px;
          color: #8f98a0;
          margin-bottom: 16px;
          text-align: left;
          line-height: 1.5;
        }
        .exists-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .exists-card {
          background: #12161c;
          border: 1px solid #2c3a48;
          border-radius: 8px;
          padding: 14px 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .exists-card:hover {
          border-color: #66c0f4;
          background: #1b2838;
        }
        .exists-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #e6edf3;
          margin-bottom: 3px;
        }
        .exists-card-desc {
          font-size: 12px;
          color: #8f98a0;
        }
        .exists-card.replace .exists-card-title { color: #ef8383; }
        .exists-card.create .exists-card-title { color: #a5d96a; }
      </style>
      <div class="exists-msg">
        Entre <strong>"${sourceName}"</strong> y <strong>"${targetName}"</strong> ya existe una relación.
      </div>
      <div class="exists-cards">
        <div class="exists-card replace" data-value="replace">
          <div class="exists-card-title">Reemplazar la existente</div>
          <div class="exists-card-desc">Elimina la relación actual y crea la nueva en su lugar.</div>
        </div>
        <div class="exists-card create" data-value="create">
          <div class="exists-card-title">Crear otra relación aparte</div>
          <div class="exists-card-desc">Mantiene la actual y añade otra FK (varias relaciones entre las mismas tablas).</div>
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    cancelButtonColor: "#42596e",
    background: "#171a21",
    color: "#c7d5e0",
    width: '460px',
    customClass: {
      popup: "swal-dark-popup",
      cancelButton: "swal-cancel-btn",
      htmlContainer: "swal-html-dark",
    },
    didOpen: () => {
      const cards = document.querySelectorAll('.exists-card');
      cards.forEach((card) => {
        card.addEventListener('click', () => {
          const value = (card as HTMLElement).getAttribute('data-value');
          Swal.clickConfirm();
          (Swal as any).selectedValue = value;
        });
      });
    },
    preConfirm: () => (Swal as any).selectedValue
  });

  if (!value) return null;
  return value as "replace" | "create";
}