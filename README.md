# Exam_2_sw - Diagramador Colaborativo Inteligente

Sistema web avanzado para diseño colaborativo de diagramas ER y generación automática de código backend/frontend.

**Stack Principal:** Express + TypeScript + Prisma + Socket.IO + PostgreSQL 15 + React + Vite  
**Deploy:** Docker Compose | AWS EC2 t2.micro  
**Objetivo:** Reducir 90% del tiempo de desarrollo inicial de aplicaciones CRUD

---

## 🎯 Sobre el Proyecto

### Propósito

Herramienta integral para acelerar el desarrollo de sistemas de gestión mediante:

- Diseño visual de diagramas ER colaborativos en tiempo real
- Generación automática de scripts SQL optimizados
- Generación de backend Spring Boot completo (Entity, Repository, Service, Controller, DTOs)
- Generación de frontend Flutter funcional con CRUD básico
- **Diseño asistido por IA:** Creación por prompts en lenguaje natural con GPT-4o-mini (voz e imágenes en desarrollo)

### Casos de Uso

- Equipos distribuidos diseñando arquitectura de base de datos en tiempo real
- Prototipado rápido de sistemas CRUD para validación con clientes
- Estudiantes aprendiendo modelado de datos con feedback visual inmediato
- Migración de diagramas legacy (escaneados o de otros software) mediante IA

### Características Clave

- **Colaboración Real:** Múltiples usuarios editando simultáneamente con roles (OWNER/EDITOR/VIEWER)
- **Sincronización Instantánea:** Cambios propagados en < 100ms vía WebSocket
- **Generación Inteligente:** Del diagrama a código funcional listo para producción
- **IA Integrada Completa:** ✅ Texto 📝 + Voz 🎤 + Imagen 📷 para crear diagramas en lenguaje natural
- **Ligero:** Optimizado para AWS t2.micro (1GB RAM, 1 vCPU)

---

## ✅ Requerimientos del Sistema

### ✔️ Implementado

- [x] **Diagramador Web Funcional**
  - Editor ER interactivo con ReactFlow
  - Tablas con campos, tipos de datos, PK/FK
  - Relaciones visuales (1-1, 1-N, N-N)
  - Sistema de nodos y edges editable
- [x] **Trabajo Colaborativo**
  - Sistema de autenticación simple (email/nombre)
  - Proyectos multi-usuario con roles (OWNER, EDITOR, VIEWER)
  - Invitaciones reutilizables por token
  - Control de acceso por rol
- [x] **Cambios en Tiempo Real**
  - WebSocket con Socket.IO
  - Sincronización bidireccional de nodos y edges
  - Sistema de presencia (usuarios activos visibles)
  - Broadcast selectivo (excepto emisor)
- [x] **Edición Funcional de Tablas y Relaciones**
  - Panel de propiedades lateral (nombre, campos, tipos)
  - CRUD completo de campos (agregar, editar, eliminar, duplicar)
  - Selector de tipos PostgreSQL predefinidos
  - Configuración de PK, FK, nullable
  - Drag & drop para reposicionar tablas
  - Conexión visual entre tablas con detección automática PK/FK
  - Creación automática de tablas intermedias para N-N
- [x] **Generación de Script PostgreSQL**
  - Exportación a `.sql` con CREATE TABLE optimizado
  - **Algoritmo de resolución de dependencias:** Ordenamiento topológico automático
    - Tablas base (sin FK) se crean primero
    - Tablas dependientes en orden correcto
    - Detección de dependencias circulares con advertencias
  - **Detección inteligente de tablas intermedias (N:M):**
    - **Join pura** (solo 2 FKs): Clave primaria compuesta `PRIMARY KEY (fk1, fk2)`
    - **Join extendida** (2 FKs + columnas extra): `id SERIAL PRIMARY KEY` normal
  - PRIMARY KEY y FOREIGN KEY constraints con `ON DELETE CASCADE`
  - Índices automáticos en tablas intermedias para optimizar búsquedas
  - Validación de integridad referencial
  - Scripts listos para ejecutar en PostgreSQL 12+
- [x] **Generación de Backend Spring Boot**
  - Generación automática de proyecto **Maven completo** en ZIP descargable
  - Estructura estándar profesional: `entity / repository / service / controller`
  - **Arquitectura generada:**
    - **Entities** con anotaciones JPA completas:
      - `@Entity`, `@Table`, `@Id`, `@GeneratedValue(strategy = IDENTITY)`
      - Relaciones: `@ManyToOne`, `@OneToMany`, `@ManyToMany` con `@JoinTable`
      - Lombok: `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor` para getters/setters
    - **Repositories** extendiendo `JpaRepository<T, ID>` con CRUD incorporado
    - **Services** con lógica de negocio completa:
      - `findAll()`, `findById()`, `save()`, `update()`, `delete()`
      - Validaciones básicas y manejo de errores
    - **Controllers REST** con endpoints funcionales:
      - `GET /{entidad}` - Listar todos
      - `GET /{entidad}/{id}` - Obtener por ID
      - `POST /{entidad}` - Crear
      - `PUT /{entidad}/{id}` - Actualizar
      - `DELETE /{entidad}/{id}` - Eliminar
      - CORS habilitado con `@CrossOrigin(origins = "*")`
  - **Detección inteligente de tablas intermedias:**
    - **Join pura** (solo 2 FKs): No genera entidad, usa `@ManyToMany` en entidades principales
    - **Join extendida** (2 FKs + campos): Genera entidad completa con CRUD
  - **Base de datos:** H2 en memoria (`jdbc:h2:mem:testdb`) con auto-creación de esquema
  - **Configuración incluida:**
    - `pom.xml` con Spring Boot 3.2, JPA, H2, Lombok
    - `application.properties` con puerto aleatorio (8180-9080)
    - `Dockerfile` multi-stage optimizado (Maven build + JRE Alpine runtime)
    - `docker-compose.yml` con healthcheck y restart policy
    - `.dockerignore` para builds eficientes
    - `README.md` con instrucciones completas
  - **Archivo principal nombrado correctamente:** `{ProjectName}Application.java`
  - **Mapeo automático de tipos:** SQL → Java (INT→Long, VARCHAR→String, TIMESTAMP→LocalDateTime)
  - **Conversión de nombres:** snake_case → PascalCase/camelCase
  - **Listo para ejecutar:**
    - Con Maven: `mvn spring-boot:run`
    - Con Docker: `docker compose up --build`
  - **Compatible con:** Java 17+, Maven 3.6+, Postman, H2 Console (`/h2-console`)
  - **Endpoints generados** según nombres reales de las entidades del diagrama
- [x] **Generación de Frontend Flutter**
  - Generación automática de proyecto **Flutter completo** en ZIP descargable
  - Estructura estándar profesional con **Material Design 3**
  - **Arquitectura generada:**
    - **Models** con null-safety completo:
      - IDs autogenerados: `int?` (nullable)
      - Foreign Keys: `int?` en ENTITY, `int` (required) en JOIN tables
      - Campos obligatorios: `required` keyword en constructores
      - Métodos: `fromJson()`, `toJson()`, `copyWith()`
      - **Composite keys** para JOIN_ENRICHED: método `getCompositeKey()`
    - **API Service** con modo dual:
      - **Modo local** (por defecto): Datos mock para testing inmediato
      - **Modo backend**: Conexión HTTP a Spring Boot
      - Configuración simple: flag `useBackend` en `api_service.dart`
      - Endpoints completos: GET, POST, PUT, DELETE por entidad
      - Manejo de composite keys para tablas intermedias enriquecidas
    - **Providers** con gestión de estado (Provider package):
      - CRUD completo: `fetchAll()`, `create()`, `update()`, `delete()`
      - Estados: `items`, `isLoading`, `error`
      - Lógica diferenciada: PK simple vs composite key
      - `ChangeNotifier` para reactividad automática
    - **Screens** con UI completa:
      - **ListScreen**: Listado con búsqueda, eliminación con confirmación
      - **FormScreen**: Formulario create/edit con validación
      - **Navigation Drawer**: Menú lateral en todas las screens con íconos
        - Entidades normales: ícono `table_chart`
        - Tablas intermedias enriquecidas: ícono `link`
      - Navegación automática entre entidades con rutas nombradas
  - **Clasificación inteligente de tablas (coherente con SQL/Spring Boot):**
    - **ENTITY** (tabla normal): Genera CRUD completo
    - **JOIN_PURE** (solo 2 FKs): **NO genera código** (relación manejada en backend)
    - **JOIN_ENRICHED** (2+ FKs + datos): Genera CRUD con composite key
    - Lógica centralizada en `relationUtils.ts` compartida entre generadores
  - **Configuración incluida:**
    - `pubspec.yaml` con dependencias: provider 6.1.0, http 1.2.0
    - `analysis_options.yaml` con Flutter lints
    - `.gitignore` completo para Flutter
    - `README.md` con instrucciones de:
      - Instalación (`flutter pub get`)
      - Ejecución (`flutter run`, `flutter run -d chrome`)
      - Configuración de backend (cambiar `useBackend` y `baseUrl`)
      - Estructura del proyecto generada
      - Lista de entidades con endpoints
  - **Mapeo automático de tipos:** SQL → Dart (INT→int, VARCHAR→String, TIMESTAMP→DateTime)
  - **Conversión de nombres:** snake_case → PascalCase (clases), camelCase (propiedades)
  - **Listo para ejecutar:**
    - Instalación: `flutter pub get`
    - Web: `flutter run -d chrome`
    - Android/iOS: `flutter run`
  - **Compatible con:** Flutter 3.0+, Dart 3.0+, Material Design 3
- [x] **Diseño Asistido por IA (Parcial)**
  - **Generación desde prompts de texto en lenguaje natural** ✅ IMPLEMENTADO
    - Integración con OpenAI GPT-4o-mini
    - Servicio backend (`aiService.ts`) con system prompt optimizado (180+ líneas)
    - Endpoint REST: `POST /api/ai/parse-intent` + health check
    - Componente frontend: `AIPromptBar` con UI glassmorphism morado
    - **Acciones soportadas:**
      - `CreateTable` - Crear tablas con campos inferidos automáticamente
      - `CreateRelation` - Relaciones 1-1, 1-N, N-N (con tabla intermedia automática)
      - `AddField` - Agregar campos a tablas existentes (con manejo diferido)
      - `RenameTable` - Renombrar tablas intermedias personalizadas
      - `DeleteTable` - Eliminar tablas completas
      - `DeleteRelation` - Eliminar relaciones específicas
    - **Características:**
      - Inferencia inteligente de tipos SQL desde texto natural
      - Detección automática de cardinalidades (1-1, 1-N, N-N)
      - Manejo especial de relaciones muchos-a-muchos:
        - Creación automática de tabla intermedia
        - Soporte para campos adicionales en tabla intermedia
        - Renombrado personalizado de tablas intermedias
      - Ejecución diferida de `AddField` para evitar pérdida de atributos
      - Sincronización en tiempo real vía Socket.IO
      - Solo OWNER/EDITOR pueden generar y aplicar cambios al diagrama
      - Validación de respuestas JSON con manejo de errores
      - Rate limit y gestión de API key inválida
    - **System Prompt:** 180+ líneas con ejemplos detallados y reglas de inferencia
    - **Variables de entorno:** `OPENAI_API_KEY` requerida
    - **Testing:** Guía completa en `TESTING_GUIDE.md` (600+ líneas)
  - **Chat compartido con moderador IA**
    - OWNER, EDITOR y VIEWER consultan al moderador desde el editor; visitantes requieren una invitación válida
    - Dictado por voz en español en el campo del chat, con controles de iniciar/detener y mensajes de compatibilidad/permisos del micrófono
    - Preguntas y respuestas se guardan por proyecto y se transmiten al equipo por Socket.IO
    - El moderador usa el diagrama guardado y hasta 20 mensajes recientes como contexto
    - El chat recomienda y explica; no modifica el diagrama
    - Historial persistido en los modelos Prisma `AiConversation` y `AiChatMessage`
  - **Ejemplos de uso:**
    - "Crea una tabla cliente con id, nombre, email, teléfono"
    - "Relación 1 a muchos entre cliente y pedido"
    - "Crea una relación muchos a muchos entre persona y perfil con campos fecha_creacion y activo"
    - "Agrega campo telefono VARCHAR(20) a tabla usuario"
- [x] **Análisis de Imágenes con IA** ✅ IMPLEMENTADO
  - **Reconocimiento visual de diagramas ER mediante GPT-4o-mini Vision**
  - Subida de imágenes (JPG/PNG) desde el editor
  - **Optimización automática:**
    - Redimensionamiento a 1200px máximo (manteniendo proporciones)
    - Compresión JPEG con calidad 0.8 (equilibrio legibilidad/costo)
    - Conversión a Base64 para envío
  - **Detección inteligente:**
    - Identificación de tablas/entidades
    - Extracción de campos con tipos de datos inferidos
    - Detección de relaciones (1-1, 1-N, N-N) según notación visual
  - **Integración frontend:**
    - Botón 📷 en `AIPromptBar` para subir imágenes
    - Función `resizeAndCompressImage()` con Canvas API
    - Spinner de carga durante procesamiento
    - Mensajes de error específicos
  - **Endpoint backend:** `POST /api/ai/parse-image`
    - Validación de tamaño (máx 5MB después de compresión)
    - System prompt especializado para análisis visual
    - Retorna acciones JSON compatibles con `applyAIActions()`
  - **Flujo unificado:** Texto 📝 + Voz 🎤 + Imagen 📷 usan el mismo sistema de acciones
  - **Testing recomendado:**
    - Screenshots de diagramas ER de otros software (Lucidchart, draw.io, MySQL Workbench)
    - Fotos de diagramas en pizarra o papel
    - Diagramas con notaciones Crow's Foot o Chen
  - **Compatibilidad:** Todos los navegadores modernos (Canvas API estándar)

### ⏳ Pendiente de Implementación

- [ ] **Diseño Asistido por IA (Mejoras futuras)**
  - Sugerencias inteligentes de relaciones basadas en contexto
  - Auto-completado de campos comunes (createdAt, updatedAt, etc.)

### 🎛️ Requisitos Técnicos

- **RAM:** < 512MB en ejecución (compatible con t2.micro)
- **Storage:** < 100MB imagen Docker comprimida
- **CPU:** Optimizado para 1 vCPU (sin procesamiento pesado en servidor)
- **Red:** WebSocket con reconexión automática para redes inestables

---

## 📁 Estructura del Proyecto

```
EXAM_2_SW/
│
├── packages/
│   ├── server/                      # Backend Node.js + Express
│   │   ├── prisma/
│   │   │   └── schema.prisma        # Modelos de base de datos
│   │   │
│   │   └── src/
│   │        ├── routes/             # API REST endpoints
│   │        │   ├── ai.ts           # 🧠 Endpoints de IA (parse-intent, health)
│   │        │   ├── changes.ts      # Auditoría de cambios
│   │        │   ├── diagrams.ts     # CRUD de diagramas
│   │        │   ├── invitations.ts  # Sistema de invitaciones
│   │        │   ├── locks.ts        # Bloqueos distribuidos
│   │        │   ├── projects.ts     # Gestión de proyectos
│   │        │   ├── sessions.ts     # Control de presencia
│   │        │   └── users.ts        # Autenticación
│   │        │
│   │        ├── services/
│   │        │   └── aiService.ts    # 🧠 Integración OpenAI GPT-4o-mini
│   │        │
│   │        ├── utils/
│   │        │   └── ensureUserExists.ts  # Helper de usuarios
│   │        │
│   │        └── index.ts            # Servidor principal (Express + Socket.IO)
│   │
│   ├── shared/                      # Tipos compartidos (TypeScript)
│   │   ├── types.ts                 # Interfaces, enums, DTOs ⭐
│   │   └── package.json
│   │
│   └── web/                         # Frontend React + Vite
│       └── src/
│           ├── components/          # Componentes React
│           │   ├── AIPromptBar.tsx  # 🧠 Barra de prompts IA (glassmorphism)
│   │           ├── AIChatPanel.tsx  # Chat compartido con el moderador IA
│           │   ├── ErrorBoundary.tsx # Manejo de errores
│           │   ├── PropertiesPanel.tsx # Editor de propiedades
│           │   ├── Sidebar.tsx      # Panel lateral
│           │   └── TableNode.tsx    # Nodo de tabla ER
│           │
│           ├── pages/               # Vistas principales
│           │   ├── AcceptInvite.tsx # Procesamiento de invitaciones
│           │   ├── Dashboard.tsx    # Panel de proyectos
│           │   ├── DiagramEditor.tsx # Editor principal ⭐
│           │   └── Login.tsx        # Autenticación con diseño glassmorphism
│           │
│           ├── store/               # Estado global (Zustand)
│           │   └── useAppStore.ts   # Usuario y proyecto actual
│           │
│           ├── utils/               # Utilidades
│           │   ├── relationHandler.ts # Lógica de relaciones
│           │   ├── relationPrompt.ts  # Modal de tipo de relación
│           │   ├── relationStyles.ts  # Estilos de edges
│           │   ├── relationUtils.ts   # Clasificación centralizada de tablas ⭐
│           │   ├── sqlGenerator.ts    # Generador SQL ⭐
│           │   ├── springBootGenerator.ts # Generador Spring Boot ⭐
│           │   └── flutterGenerator.ts    # Generador Flutter ⭐
│           │
│           ├── api.ts               # Cliente Axios con env vars
│           ├── App.tsx              # Componente raíz
│           ├── main.tsx             # Punto de entrada
│           ├── socketManager.ts     # Gestor de conexiones ⭐
│           ├── vite-env.d.ts        # Tipos para Vite
│           │
│           ├── index.html
│           ├── package.json
│           ├── tsconfig.json
│           ├── vite.config.ts
│           ├── .env.example        # Variables de entorno (template)
│           └── .env                # Variables de entorno (git-ignored)
│
├── scripts/
│   └── deploy.sh                    # Script de despliegue Docker
│
├── .env.example                     # Variables de entorno
├── .gitignore
├── docker-compose.yml               # Orquestación de servicios
├── Dockerfile                       # Build multi-stage
├── package.json                     # Monorepo workspaces
├── README.md                        # Este archivo
```

---

## � Índice del Proyecto

### 🗄️ Base de Datos (Prisma)

**`packages/server/prisma/schema.prisma`**

> **Tecnología:** Prisma ORM + PostgreSQL 15  
> **Propósito:** Define estructura de BD, genera cliente TypeScript, crea migraciones SQL

**Comandos:** `npx prisma generate` | `npx prisma migrate dev` | `npx prisma studio`

#### Diagrama ER del Sistema

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │────1:N──│ ProjectUser  │──N:1────│   Project   │
│             │         │              │         │             │
│ id (PK)     │         │ userId (FK)  │         │ id (PK)     │
│ email (UK)  │         │ projectId(FK)│         │ name        │
│ name        │         │ role (ENUM)  │         │ ownerId(FK) │
└─────┬───────┘         └──────────────┘         └──────┬──────┘
      │                                                   │
      │ 1:N                                           1:N │
      │                  ┌──────────────┐                │
      └──────────────────│   Diagram    │────────────────┘
      │                  │              │
      │                  │ id (PK)      │
      │                  │ projectId(FK)│
      │                  │ authorId (FK)│
      │                  │ data (JSON)  │◄── nodes/edges del canvas
      │                  │ version (INT)│
      │                  └───┬──────────┘
      │                      │
      │        ┌─────────────┼─────────────┬─────────────┐
      │        │             │             │             │
      │     1:N│          1:N│          1:N│          1:N│
      │        │             │             │             │
  ┌───▼────────▼───┐  ┌─────▼──────┐  ┌──▼────────────┐ │
  │    Session     │  │    Lock    │  │DiagramChange  │ │
  │                │  │            │  │               │ │
  │ userId (FK)    │  │ userId(FK) │  │ userId (FK)   │ │
  │ diagramId (FK) │  │ diagram(FK)│  │ diagram (FK)  │ │
  │ lastPing       │  │ resourceId │  │ action        │ │
  │ startedAt      │  │ expiresAt  │  │ payload(JSON) │ │
  └────────────────┘  └────────────┘  └───────────────┘ │
                                                         │
                      ┌──────────────┐                   │
                      │  Invitation  │──────────N:1──────┘
                      │              │
                      │ projectId(FK)│
                      │ token (UK)   │◄── Link reutilizable
                      │ role (ENUM)  │
                      └──────────────┘
```

#### Modelos y Funciones Principales

**User** - Usuarios del sistema con email único

- `findUnique({ where: { email } })` - Buscar por email en login usando `@prisma/client`
- `create({ data: { email, name } })` - Registrar usuario nuevo
- **Archivos:** `routes/users.ts`, `index.ts`

**Project** - Contenedor de diagramas con permisos

- `findMany({ where: { ownerId } })` - Listar proyectos usando `@prisma/client`
- `create({ data: { name, ownerId } })` - Crear proyecto
- **Archivos:** `routes/projects.ts`, `Dashboard.tsx`

**ProjectUser** - Roles de colaboradores (OWNER/EDITOR/VIEWER)

- `findFirst({ where: { userId, projectId } })` - Verificar permisos con `@prisma/client`
- `create({ data: { userId, projectId, role } })` - Asignar rol
- **Archivos:** `index.ts` (validación Socket.IO)

**Diagram** ⭐ - Almacena diagrama ER completo en JSON

- `update({ data: { data, version: { increment: 1 } } })` - Guardar cambios con `@prisma/client`
- `findFirst({ where: { projectId } })` - Cargar diagrama
- **Campo crítico:** `data` contiene `{ nodes: [...], edges: [...] }` del ReactFlow canvas
- **Archivos:** `routes/diagrams.ts`, `DiagramEditor.tsx`, `index.ts`

**Session** - Presencia en tiempo real (quién está activo)

- `upsert({ update: { lastPing } })` - Actualizar heartbeat cada 30s con `@prisma/client`
- `findMany({ where: { lastPing: { gte: hace60s } } })` - Obtener usuarios activos
- **Archivos:** `routes/sessions.ts`, `index.ts`

**Lock** - Bloqueos optimistas TTL 30s

- `create({ data: { diagramId, resourceId, expiresAt } })` - Adquirir lock con `@prisma/client`
- `delete({ where: { diagramId_resourceId } })` - Liberar
- **Archivos:** `routes/locks.ts`

**DiagramChange** - Auditoría de cambios

- `create({ data: { action, payload } })` - Registrar cambio usando `@prisma/client`
- `findMany({ take: 50, orderBy: { createdAt: 'desc' } })` - Últimos 50 cambios
- **Archivos:** `routes/changes.ts`, `index.ts`

**Invitation** - Tokens de invitación reutilizables

- `create({ data: { projectId, token, role } })` - Generar invitación con `@prisma/client`
- `findUnique({ where: { token } })` - Validar token
- **Archivos:** `routes/invitations.ts`, `AcceptInvite.tsx`

---

### 🛣️ Rutas del Backend (API REST)

**`packages/server/src/routes/`** - Endpoints HTTP para operaciones CRUD y servicios

#### `ai.ts` 🧠 - Integración con OpenAI para IA

**Qué hace:** Procesa prompts de texto y análisis de imágenes con GPT-4o-mini para generar diagramas

**Endpoints:**

- `POST /api/ai/parse-intent` - Convierte texto natural a acciones de diagrama
  - **Body:** `{ prompt: string, projectId?: string, userId?: string }`
  - **Ejemplo:** `"Crea tabla usuario con id, nombre, email"` → `[{type: "CreateTable", name: "usuario", fields: [...]}]`
  - **Límites:** 500 caracteres máximo, valida con `if (prompt.length > 500)`
  - **Cambiar límite:** Línea ~45 `if (prompt.length > 500)` → modificar número
- `POST /api/ai/parse-image` 📷 - Analiza imagen de diagrama ER
  - **Body:** `{ imageBase64: string, projectId?: string, userId?: string }`
  - **Límites:** 5MB máximo, valida con `(imageBase64.length * 0.75) / (1024 * 1024)`
  - **Cambiar límite:** Línea ~170 `if (sizeInMB > 5)` → modificar número
- `GET /api/ai/health` - Verifica configuración de OpenAI
  - **Response:** `{ status: "configured", apiKey: "sk-xxx...", model: "gpt-4o-mini" }`

**Dónde cambiar:**

- **Límite de caracteres:** Línea 45 variable `500`
- **Límite de imagen:** Línea 170 variable `5` (MB)
- **Modelo de IA:** En `aiService.ts` no aquí
- **Validaciones:** Bloque try-catch líneas 26-115

**Dependencias:** `express`, `aiService.ts` (parseUserIntent, parseImageIntent, validateActions)

---

#### `changes.ts` - Auditoría de cambios en diagramas

**Qué hace:** Registra historial completo de modificaciones para rollback y auditoría

**Endpoints:**

- `POST /api/changes/add` - Guardar cambio en historial
  - **Body:** `{ diagramId: string, userId: string, action: string, payload: any }`
  - **Ejemplo:** `action: "ADD_NODE"`, `payload: { id: "node-123", data: {...} }`
- `GET /api/changes/:diagramId` - Últimos 50 cambios
  - **Response:** Array ordenado por fecha DESC con datos de usuario
  - **Cambiar límite:** Línea 31 `take: 50` → modificar número

**Dónde cambiar:**

- **Cantidad de cambios retornados:** Línea 31 `take: 50`
- **Ordenamiento:** Línea 30 `orderBy: { createdAt: "desc" }` → cambiar a `"asc"`

**Dependencias:** `@prisma/client`, `ensureUserExists.ts`

---

#### `diagrams.ts` - CRUD de diagramas ER

**Qué hace:** Guarda y carga el estado completo del canvas (nodes + edges) en JSON

**Endpoints:**

- `POST /api/diagrams/:projectId` - Guardar/actualizar diagrama
  - **Body:** `{ data: { nodes: [], edges: [] }, userId: string }`
  - **Auto-incrementa versión:** `version: { increment: 1 }`
  - **Crea si no existe:** Nombre por defecto `"Auto Diagram"`
  - **Cambiar nombre default:** Línea 51 `name: "Auto Diagram"`
- `GET /api/diagrams/:projectId` - Cargar diagrama
  - **Response:** `{ id, projectId, data, version, createdAt, updatedAt }`
  - **Si no existe:** Retorna `{ data: { nodes: [], edges: [] } }`
- `GET /api/diagrams/single/:projectId` - Alias para compatibilidad

**Dónde cambiar:**

- **Nombre de diagrama nuevo:** Línea 51 `name: "Auto Diagram"`
- **Respuesta cuando no existe:** Línea 76 objeto `{ nodes: [], edges: [] }`
- **Auto-versionado:** Línea 43 `version: { increment: 1 }` → quitar si no quieres versión

**Dependencias:** `@prisma/client`

---

#### `invitations.ts` - Sistema de invitaciones reutilizables

**Qué hace:** Genera links de invitación compartibles para unirse a proyectos

**Endpoints:**

- `POST /api/invitations/create` - Crear token de invitación
  - **Body:** `{ projectId: string, role?: Role }`
  - **Genera token:** 16 bytes aleatorios con `crypto.randomBytes(16)`
  - **Rol por defecto:** `"EDITOR"` si no se especifica
  - **Cambiar rol default:** Línea 21 `role: role || "EDITOR"`
  - **URL generada:** `http://localhost:3001/invite/{token}`
  - **Cambiar URL base:** Línea 27 modificar dominio
- `GET /api/invitations/:token` - Validar token
  - **Response:** `{ id, projectId, role, token, project: {...} }`
- `POST /api/invitations/accept` - Aceptar invitación
  - **Body:** `{ token: string, userId: string }`
  - **Reutilizable:** NO marca `acceptedAt` para permitir múltiples usos

**Dónde cambiar:**

- **Rol por defecto:** Línea 21 `"EDITOR"` → `"VIEWER"` o `"OWNER"`
- **Longitud del token:** Línea 19 `randomBytes(16)` → modificar número
- **URL del frontend:** Línea 27 cambiar `localhost:3001`
- **Hacer token de un solo uso:** Descomentar actualización de `acceptedAt` después de línea 93

**Dependencias:** `@prisma/client`, `crypto` (Node.js built-in)

---

#### `locks.ts` - Bloqueos optimistas para edición

**Qué hace:** Previene conflictos cuando múltiples usuarios editan mismo elemento

**Endpoints:**

- `POST /api/locks/acquire` - Adquirir lock
  - **Body:** `{ diagramId: string, userId: string, resourceId: string }`
  - **TTL:** 30 segundos (`Date.now() + 30000`)
  - **Auto-renueva:** Si ya existe lock del mismo usuario lo actualiza
  - **Cambiar TTL:** Línea 12 `30000` milisegundos
- `POST /api/locks/release` - Liberar lock
  - **Body:** `{ lockId: string }`

**Dónde cambiar:**

- **Tiempo de expiración:** Línea 12 `30000` (30s) → `60000` (60s)
- **Comportamiento de renovación:** Línea 16-18 bloque `upsert`

**Dependencias:** `@prisma/client`, `ensureUserExists.ts`

---

#### `projects.ts` - Gestión de proyectos

**Qué hace:** CRUD de proyectos y verificación de roles de usuarios

**Endpoints:**

- `GET /api/projects/:userId` - Listar proyectos del usuario
  - **Incluye:** Proyectos donde es owner O colaborador
  - **Response:** Array con `users[]`, `diagrams[]` incluidos
- `POST /api/projects` - Crear proyecto
  - **Body:** `{ name: string, userId: string }`
  - **Auto-asigna:** Rol `OWNER` al creador
- `GET /api/projects/role/:projectId?userId=` - Verificar rol
  - **Query param:** `userId` requerido
  - **Response:** `{ role: "OWNER" | "EDITOR" | "VIEWER" | null }`

**Dónde cambiar:**

- **Rol inicial del creador:** Línea 41 `role: "OWNER"` → cambiar si quieres otro rol
- **Campos incluidos en listado:** Líneas 16-18 bloque `include`
- **Validación de campos requeridos:** Línea 36 condición `if (!name || !userId)`

**Dependencias:** `@prisma/client`

---

#### `sessions.ts` - Presencia en tiempo real

**Qué hace:** Rastrea quién está activo en cada diagrama (heartbeat)

**Endpoints:**

- `POST /api/sessions/open` - Abrir sesión
  - **Body:** `{ userId: string, diagramId: string }`
  - **Crea registro:** Con `startedAt` automático
- `POST /api/sessions/close` - Cerrar sesión
  - **Body:** `{ sessionId: string }`
  - **Marca:** `endedAt: new Date()`
- `GET /api/sessions/active/:diagramId` - Usuarios activos
  - **Filtros:** `endedAt: null` y `lastPing > hace 60s`
  - **Cambiar umbral:** Línea 42 `60000` milisegundos
  - **Response:** Array con datos de `user` incluidos

**Dónde cambiar:**

- **Tiempo de inactividad:** Línea 42 `60000` (60s) → `120000` (120s)
- **Filtros de usuarios activos:** Línea 39-41 bloque `where`

**Dependencias:** `@prisma/client`, `ensureUserExists.ts`

---

#### `users.ts` - Autenticación simple

**Qué hace:** Login/registro sin contraseña basado solo en email

**Endpoints:**

- `POST /api/users/login` - Login o crear usuario
  - **Body:** `{ email: string, name: string }`
  - **Auto-registro:** Si email no existe lo crea automáticamente
  - **Sin validación de email:** Acepta cualquier formato
  - **Response:** `{ id, email, name, createdAt }`

**Dónde cambiar:**

- **Agregar validación de email:** Después de línea 11 agregar regex
- **Requerir contraseña:** Modificar modelo `User` en Prisma y agregar campo
- **Validación de campos:** Línea 11 condición `if (!email || !name)`

**Dependencias:** `@prisma/client`

---

- **Response:** `{ actions: AIAction[] }` - Array de acciones estructuradas
- **Acciones soportadas:** CreateTable, CreateRelation, AddField, RenameTable, DeleteTable, DeleteRelation
- **Validaciones:**
  - Prompt no vacío
  - Longitud máxima 500 caracteres
  - JSON válido en respuesta
  - Schema de acciones correcto
- **Manejo de errores:**
  - 400: Prompt inválido o vacío
  - 401: API key de OpenAI inválida
  - 429: Rate limit excedido
  - 500: Error de parseo o respuesta inválida
- **Integración:** OpenAI GPT-4o-mini con system prompt de 180+ líneas
- **Características:**
  - Inferencia automática de tipos SQL
  - Detección de cardinalidades (1-1, 1-N, N-N)
  - Manejo especial de relaciones muchos-a-muchos
  - Validación de estructura JSON estricta
- `POST /api/ai/parse-image` - Analizar imagen de diagrama ER con IA Vision 📷
  - **Request body:** `{ imageBase64: string }` (imagen en Base64 puro, sin prefijo)
  - **Response:** `{ actions: AIAction[], metadata: { imageSizeMB, actionsCount } }`
  - **Validaciones:**
    - ImageBase64 no vacío
    - Tamaño máximo 5MB después de compresión
    - JSON válido en respuesta
    - Schema de acciones correcto
  - **Manejo de errores:**
    - 400: Imagen inválida, vacía o muy grande
    - 401: API key de OpenAI inválida
    - 429: Rate limit excedido
    - 500: Error de análisis visual o respuesta inválida
  - **Integración:** OpenAI GPT-4o-mini Vision con system prompt especializado
  - **Características:**
    - Detección de tablas/entidades desde imagen
    - Extracción de campos con tipos inferidos
    - Reconocimiento de relaciones visuales (Crow's Foot, Chen, etc.)
    - Inferencia automática de cardinalidades según notación
    - Tolerancia a imágenes borrosas o con ruido
  - **Optimización frontend:**
    - Redimensionamiento automático a 1200px
    - Compresión JPEG calidad 0.8
    - Conversión a Base64 con Canvas API
  - **Testing recomendado:**
    - Screenshots de Lucidchart, draw.io, MySQL Workbench
    - Fotos de diagramas en pizarra
    - Bocetos escaneados
- `GET /api/ai/health` - Health check del servicio de IA
  - **Response:** `{ status: "ok", hasApiKey: boolean, keyPreview: string }`
  - **Uso:** Verificar configuración de `OPENAI_API_KEY` en variables de entorno

**`diagrams.ts`**

> CRUD de diagramas y persistencia de datos visuales

- `POST /api/diagrams/:projectId` - Crear o actualizar diagrama (auto-incrementa versión)
- `GET /api/diagrams/:projectId` - Obtener diagrama de un proyecto
- `GET /api/diagrams/single/:projectId` - Alias para compatibilidad con frontend

**`invitations.ts`**

> Sistema de invitaciones reutilizables para compartir proyectos

- `POST /api/invitations/create` - Generar token de invitación con rol asignado
- `GET /api/invitations/:token` - Validar y obtener detalles de invitación
- `POST /api/invitations/accept` - Aceptar invitación y unirse al proyecto (reutilizable)

**`locks.ts`**

> Bloqueos distribuidos para evitar conflictos de edición simultánea

- `POST /api/locks/acquire` - Adquirir lock de recurso con TTL de 30s (auto-renovable)
- `POST /api/locks/release` - Liberar lock manualmente

**`projects.ts`**

> Gestión de proyectos y permisos de usuarios

- `GET /api/projects/:userId` - Listar proyectos donde el usuario es owner o colaborador
- `POST /api/projects` - Crear nuevo proyecto (auto-asigna rol OWNER)
- `GET /api/projects/role/:projectId?userId=` - Verificar rol del usuario en proyecto

**`sessions.ts`**

> Control de presencia en tiempo real (quién está editando)

- `POST /api/sessions/open` - Abrir sesión en diagrama (marca presencia)
- `POST /api/sessions/close` - Cerrar sesión manualmente
- `GET /api/sessions/active/:diagramId` - Listar usuarios activos (últimos 60s)

**`users.ts`**

> Autenticación simple basada en email (sin contraseña)

- `POST /api/users/login` - Login/registro automático (crea usuario si no existe)

---

### 🔧 Servicios del Backend

**`packages/server/src/services/aiService.ts`** 🧠 - Integración con OpenAI

**Qué hace:** Procesa prompts de texto e imágenes con GPT-4o-mini y convierte a acciones estructuradas JSON

**Funciones principales:**

**`parseUserIntent(prompt: string)`** - Analizar texto natural

- **Input:** Prompt en lenguaje natural (ej: "Crea tabla usuario con id, nombre, email")
- **Output:** `{ actions: AIAction[] }` con acciones CreateTable, CreateRelation, AddField, etc.
- **Ejemplo respuesta:**
  ```json
  {
    "actions": [
      {
        "type": "CreateTable",
        "name": "usuario",
        "fields": [
          { "name": "id", "type": "SERIAL", "isPrimary": true },
          { "name": "nombre", "type": "VARCHAR(100)" },
          { "name": "email", "type": "VARCHAR(100)" }
        ]
      }
    ]
  }
  ```

**`parseImageIntent(imageBase64: string)`** 📷 - Analizar imágenes de diagramas

- **Input:** Imagen en Base64 (sin prefijo `data:image/`)
- **Output:** Mismo formato que `parseUserIntent`
- **Detecta:** Tablas, campos, tipos, relaciones desde screenshots o fotos

**`validateActions(actions: AIAction[])`** - Validar estructura

- **Valida:** Campos requeridos, tipos correctos, cardinalidades válidas
- **Normaliza:** `MANY_TO_ONE` → `ONE_TO_MANY`, `TO_ONE` → `ONE_TO_ONE`
- **Output:** `{ valid: boolean, errors: string[] }`

**`cleanDuplicateFKs(actions: AIAction[])`** 🧹 - Limpiar duplicados

- **Elimina:** Campos con nombres idénticos en CreateTable
- **Normaliza:** FKs con tipo SERIAL → INT (solo PKs deben ser SERIAL)

**`normalizeIntermediateTables(actions: AIAction[])`** 🧹 - Limpiar tablas intermedias

- **Detecta:** Tablas N-N automáticas (con guion bajo)
- **Elimina:** FKs redundantes que el sistema crea automáticamente

**Configuración de IA:**

- **Modelo:** `gpt-4o-mini` (línea 236 en código)
- **Temperature:** `0.3` (línea 237 - creatividad baja para precisión)
- **Response format:** `json_object` (línea 238 - fuerza JSON válido)

**Dónde cambiar:**

- **Modelo de IA:** Línea 236 `model: "gpt-4o-mini"` → `"gpt-4o"` (más preciso pero caro)
- **Temperature:** Línea 237 `temperature: 0.3` → `0.7` (más creativo) o `0.0` (determinístico)
- **Timeout:** Agregar `timeout: 30000` después de línea 238
- **System prompt texto:** Líneas 55-212 (SYSTEM_PROMPT) - agregar/modificar reglas de inferencia
- **System prompt imagen:** Líneas 296-376 (IMAGE_SYSTEM_PROMPT) - cambiar instrucciones de visión
- **Mapeo de tipos SQL:** En system prompt líneas 130-140 (email→VARCHAR, edad→INT, etc.)
- **Validaciones custom:** Función `validateActions` líneas 403-473

**Tipos de acciones soportadas:**

1. **CreateTable** - Crear tabla con campos
2. **CreateRelation** - Relacionar dos tablas (ONE_TO_ONE, ONE_TO_MANY, MANY_TO_MANY)
3. **AddField** - Agregar campo(s) a tabla existente
4. **DeleteTable** - Eliminar tabla
5. **RenameTable** - Renombrar tabla (oldName → newName)
6. **DeleteRelation** - Eliminar relación entre tablas

**Variables de entorno:**

- `OPENAI_API_KEY` - API key de OpenAI (obligatoria)
- Obtener en: https://platform.openai.com/api-keys

**Manejo de errores:**

- `invalid_api_key` → "Invalid OpenAI API key" (código 401)
- `status 429` → "Rate limit exceeded" (demasiadas peticiones)
- JSON inválido → "Invalid response format"
- Validación fallida → Array de errores específicos

**Dependencias:** `openai` (SDK oficial 4.73.0+)

---

**`packages/server/src/utils/ensureUserExists.ts`** - Helper de usuarios

**Qué hace:** Garantiza que un userId existe antes de crear registros relacionados

**Función:** `ensureUserExists(userId: string)`

- **Busca:** Usuario en base de datos por ID
- **Si no existe:** Crea usuario placeholder con email `{userId}@auto.local`
- **Evita:** Errores de foreign key en Session, Lock, DiagramChange

**Dónde se usa:** `changes.ts`, `locks.ts`, `sessions.ts` (antes de crear registros)

**Dependencias:** `@prisma/client`

---

### ⚡ Servidor Principal

**`packages/server/src/index.ts`** - Express + Socket.IO + Prisma

**Qué hace:** Punto de entrada que integra API REST y WebSocket para colaboración en tiempo real

#### Configuración inicial

**Express:**

- Middleware: `cors()`, `helmet()`, `express.json({ limit: '10mb' })`
- Puerto: `process.env.PORT || 3001`

**Socket.IO:**

- CORS: `{ origin: "*" }` (todos los orígenes permitidos)
- Sistema de presencia: `io.presence` (Map en memoria)

**Prisma:**

- Cliente único compartido: `new PrismaClient()`

#### Endpoints REST

- `GET /health` - Health check simple `{ status: "ok" }`
- `GET /dbcheck` - Verifica conexión a BD y lista usuarios
- **Rutas montadas:**
  - `/api/sessions`, `/api/locks`, `/api/changes`
  - `/api/users`, `/api/projects`, `/api/invitations`
  - `/api/diagrams`, `/api/ai` 🧠
- **Frontend estático:** Sirve desde `/app/packages/web/dist`
- **Catch-all:** `app.get("*")` para SPA routing (React Router)

#### Eventos Socket.IO principales

**`join-project`** - Usuario se conecta a proyecto

- **Payload:** `{ userId, projectId, invitationToken? }`
- **Acciones:**
  - Comprueba la membresía en BD antes de permitir `socket.join(projectId)`
  - Deriva nombre y rol de la BD; visitantes requieren un token de invitación válido y entran como VIEWER
  - Guarda la identidad y el proyecto autorizados en `socket.data`
  - Agrega a `io.presence` Map con timestamp
  - Emite `presence-update` a todos en el proyecto

**`ai-chat-history-request` / `ai-chat-send`** - Historial y preguntas al moderador

- Solo funcionan después de unirse a un proyecto autorizado
- El servidor persiste cada mensaje y transmite preguntas y respuestas a la sala del proyecto
- Las preguntas incluyen el nombre verificado del participante y contexto del diagrama e historial reciente
- No ejecuta acciones de edición; la generación de cambios sigue en `AIPromptBar`

**`diagram-change`** - Cambio en diagrama (ADD_NODE, UPDATE_NODE, DELETE_NODE, etc.)

- **Payload:** `{ projectId, action, payload }`
- **Validaciones:**
  - Requiere autenticación (userId y projectId en socket.data)
  - VIEWER no puede modificar (línea ~215)
- **Acciones:**
  - Emite `diagram-update` a otros usuarios: `socket.to(projectId).emit()`
  - Persiste en BD aplicando cambio incremental
  - **Acciones soportadas:**
    - `ADD_NODE` - Agrega nodo (evita duplicados)
    - `UPDATE_NODE` - Actualiza todos los campos del nodo
    - `MOVE_NODE` - Solo actualiza posición (optimizado)
    - `DELETE_NODE` - Elimina nodo
    - `ADD_EDGE` - Agrega relación
    - `DELETE_EDGE` - Elimina relación
    - `SYNC_EDGES` - Reemplaza todas las relaciones
  - Auto-incrementa versión del diagrama
- **Dónde cambiar:**
  - Validación de VIEWER: Línea ~215 condición `role === "VIEWER"`
  - Lógica de persistencia: Bloque switch líneas ~230-280

**`ping-diagram`** - Heartbeat para mantener presencia

- **Payload:** `{ projectId, userId }`
- **Actualiza:** `lastPing` del usuario en `io.presence` Map

**`leave-project`** - Usuario sale del proyecto

- **Payload:** `{ projectId, userId }`
- **Elimina:** Usuario de `io.presence` y emite `presence-update`

**`disconnect`** - Desconexión automática

- **Limpia:** Usuario de `io.presence` del proyecto actual

#### Eventos legacy (compatibilidad)

- `join-diagram`, `leave-diagram` - Versión anterior basada en diagramId
- `lock-acquire`, `lock-release` - Bloqueos directos via Socket.IO

#### Características adicionales

**Sistema de presencia:**

- `io.presence` Map: `projectId → Array<{ userId, name, role, socketId, lastPing }>`
- Limpieza automática cada 60s (usuarios con lastPing > 60s atrás)
- Emite `presence-update` cuando cambia lista

**Manejo de errores:**

- `app.use()` - Error handler global
- `process.on("uncaughtException")` - Captura errores no manejados
- `process.on("unhandledRejection")` - Captura promesas rechazadas

**Logging:**

- Emojis: 🔌 (conexión), ✅ (éxito), ❌ (error), ⚠️ (advertencia), 💾 (guardado)
- Logs detallados de cada acción de Socket.IO

#### Dónde cambiar

- **Puerto del servidor:** Línea final `PORT || 3001`
- **Límite de JSON:** Línea ~28 `express.json({ limit: '10mb' })`
- **CORS origins:** Línea ~26 `cors({ origin: "*" })` → especificar dominio
- **Tiempo de inactividad:** Línea ~434 `60000` (60s) para limpieza
- **TTL de presencia:** Línea ~171 y ~434 umbral de `60000` ms
- **Path del frontend:** Línea ~77 `/app/packages/web/dist`
- **Validación de VIEWER:** Línea ~215 para permitir/denegar acciones

**Dependencias:** `express`, `socket.io`, `@prisma/client`, `cors`, `helmet`

---

### ⚙️ Configuración del Servidor

**`packages/server/.env`** - Variables de entorno (NO commitear)

**Variables:**

- `PORT=3001` - Puerto del servidor
- `DATABASE_URL="postgresql://postgres:postgres@db:5432/diagram_editor"` - Conexión a PostgreSQL
  - Host `db` para Docker
  - Host `localhost` para desarrollo local
- `OPENAI_API_KEY="sk-proj-..."` 🧠 - API key de OpenAI (obligatoria para IA)

**Dónde cambiar:**

- Puerto: Modificar valor de `PORT`
- Base de datos: Cambiar host `db` → `localhost` si no usas Docker
- API key: Obtener en https://platform.openai.com/api-keys

---

**`packages/server/.env.example`** - Template de variables de entorno

**Qué hace:** Plantilla para crear tu propio `.env` sin exponer secretos

**Contenido:**

```
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@db:5432/diagram_editor?schema=public"
# Comentario: usar 'db' en Docker, 'localhost' en local
```

**Uso:** `cp .env.example .env` y completar con valores reales

---

**`packages/server/package.json`** - Dependencias y scripts

**Scripts:**

- `npm run dev` - Desarrollo con hot-reload (ts-node-dev)
- `npm run build` - Compilar TypeScript → JavaScript en `dist/`
- `npm start` - Ejecutar servidor compilado
- `npm run prisma:generate` - Generar cliente Prisma después de cambios en schema
- `npm run prisma:migrate` - Crear migración de BD

**Dependencias principales:**

- `express` ^4.19.2 - Framework web
- `socket.io` ^4.8.1 - WebSocket
- `@prisma/client` ^5.20.0 - ORM
- `cors` ^2.8.5 - CORS middleware
- `helmet` ^7.1.0 - Seguridad headers
- `openai` ^4.73.0 - SDK de OpenAI 🧠
- `dotenv` ^16.4.5 - Variables de entorno

**Dev dependencies:**

- `typescript` ^5.6.3, `prisma` ^5.20.0, `ts-node-dev` ^2.0.0
- Tipos: `@types/express`, `@types/cors`, `@types/node`

**Dónde cambiar:**

- Versiones: Modificar números de versión y ejecutar `npm install`
- Scripts: Agregar/modificar comandos personalizados

---

**`packages/server/tsconfig.json`** - Configuración de TypeScript

**Qué hace:** Define cómo compilar TypeScript a JavaScript

**Configuración clave:**

- `target: "ES2020"` - Versión de JavaScript objetivo
- `module: "ES2020"` - Sistema de módulos (import/export)
- `moduleResolution: "Bundler"` - Resolución para bundlers modernos
- `outDir: "dist"` - Carpeta de salida compilada
- `rootDir: "src"` - Carpeta de código fuente
- `strict: true` - Modo estricto (type-safety máximo)
- `paths: { "@shared/*": ["../shared/*"] }` - Alias para imports compartidos

**Dónde cambiar:**

- Target JS: `ES2020` → `ES2022` para features más nuevas
- Strict mode: `strict: false` si quieres validación relajada
- Output: `outDir: "build"` para cambiar carpeta de compilación
- Aliases: Agregar más paths para imports personalizados

---

### 🎨 Componentes del Frontend

**`packages/web/src/components/`**

**`TableNode.tsx`** - Nodo visual de tabla para ReactFlow

**Qué hace:** Renderiza tabla ER en el canvas con campos, tipos y relaciones visuales

**Props:**

- `id: string` - ID único del nodo
- `data: TableData` - Nombre de tabla y array de campos
- `selected?: boolean` - Si está seleccionado (borde cyan con glow)

**Características visuales:**

- Width fijo: 240px
- Borde PK: dorado (#FFD700) a la izquierda
- Borde FK: azul (#667eea) a la izquierda
- Header: fondo #333 (o #667eea si selected)
- Handles: arriba (target, verde) y abajo (source, azul)
- Footer cuando selected: "✏ Edita en el panel derecho"

**Dónde cambiar:**

- **Ancho de nodo:** Línea 18 `width: 240` - ajustar en px
- **Color PK:** Línea 41 `#FFD700` - cambiar color de borde
- **Color FK:** Línea 41 `#667eea` - cambiar color de borde
- **Color selected:** Línea 18 `border: "3px solid #00f5ff"` - cambiar color cyan
- **Tamaño de handles:** Línea 28 `width: 10, height: 10` - ajustar tamaño

**Dependencias:** reactflow, @shared/types

---

**`PropertiesPanel.tsx`** - Panel derecho de edición de tablas

**Qué hace:** Editor completo de propiedades de tablas (nombre, campos, tipos, relaciones)

**Props:**

- `selectedNode: Node | null` - Nodo actualmente seleccionado
- `availableTables: string[]` - Lista de tablas para FK
- `edges?: Edge[]` - Relaciones actuales del diagrama
- `onUpdate: (nodeId, data) => void` - Callback para actualizar nodo
- `socket?: any` - Socket.IO para sincronización
- `project?: any` - Proyecto actual

**Funciones principales:**

- `updateTable(key, value)` - Actualiza propiedad de tabla (nombre, fields)
- `updateField(index, key, value)` - Actualiza campo específico
- `addField()` - Crea campo nuevo con ID timestamp
- `removeField(i)` - Elimina campo y su relación FK si existe
- `duplicateField(i)` - Clona campo con sufijo "\_copia"

**Tipos PostgreSQL disponibles (16):**
VARCHAR(255), VARCHAR(100), TEXT, INT, BIGINT, SERIAL, BIGSERIAL, BOOLEAN, DATE, TIMESTAMP, TIMESTAMPTZ, DECIMAL(10,2), NUMERIC, JSON, JSONB, UUID

**Comportamiento automático:**

- Marcar PK → auto-marca NOT NULL (nullable: false)
- Desmarcar FK → limpia referencias (references: null)
- Eliminar campo FK → elimina edge visual con `removeFKRelation()`

**Dónde cambiar:**

- **Ancho del panel:** Línea 142 `width: 320` - ajustar en px
- **Color del header:** Línea 151 `borderBottom: "2px solid #667eea"` - cambiar color
- **Tipos de datos:** Líneas 16-32 array `DATA_TYPES` - agregar/quitar tipos
- **Campo default:** Línea 108 `name: "nuevo_campo", type: "VARCHAR(255)"` - cambiar defaults
- **Color botón agregar:** Línea 231 `background: "#667eea"` - cambiar color

**Dependencias:** reactflow, @shared/types, relationHandler

---

**`Sidebar.tsx`** - Panel izquierdo con estadísticas y acciones

**Qué hace:** Lista de tablas, contadores y botones de exportación

**Props:**

- `nodes: Node[]` - Todos los nodos del diagrama
- `edges: Edge[]` - Todas las relaciones
- `selectedNode: string | null` - ID del nodo seleccionado
- `onAddNode: () => void` - Crear nueva tabla
- `onExportSQL: () => void` - Exportar a SQL
- `onExportSpringBoot: () => void` - Exportar a Spring Boot
- `onExportFlutter: () => void` - Exportar a Flutter
- `onDeleteNode?: (nodeId) => void` - Eliminar tabla

**Estadísticas mostradas:**

- Cantidad de tablas (contador grande morado)
- Cantidad de relaciones (contador grande cyan)

**Información por tabla:**

- Nombre de tabla con emoji 📦
- Total de campos
- Cantidad de PKs (🔑)
- Cantidad de FKs (🔗)
- Botón eliminar (🗑️) con confirmación

**Dónde cambiar:**

- **Ancho del panel:** Línea 37 `width: 280` - ajustar en px
- **Color contador tablas:** Línea 70 `color: "#667eea"` - cambiar color
- **Color contador relaciones:** Línea 76 `color: "#764ba2"` - cambiar color
- **Gradiente botón nueva tabla:** Línea 86 `#667eea → #764ba2` - cambiar colores
- **Color hover Spring Boot:** Línea 135 `#6aaf50` - cambiar verde
- **Color hover Flutter:** Línea 157 `#42A5F5` - cambiar azul

**Dependencias:** reactflow, @shared/types

---

**`AIPromptBar.tsx`** 🧠 - Barra de IA multimodal (texto + voz + imagen)

**Qué hace:** Input compacto tipo ChatGPT para crear diagramas con IA (GPT-4o-mini + Vision)

**Props:**

- `projectId: string` - ID del proyecto actual
- `userId: string` - ID del usuario (para auditoría)
- `onActionsReceived: (actions[]) => void` - Callback para aplicar acciones al diagrama
- `disabled?: boolean` - Desactivar input

**Funciones principales:**

- `handleSubmit()` - POST a `/api/ai/parse-intent` con prompt de texto
- `handleImageUpload()` - POST a `/api/ai/parse-image` con imagen Base64
- `resizeAndCompressImage(file, maxSize, quality)` - Redimensiona a 1200px y comprime a 0.8
- `handleMicClick()` - Inicia/detiene Web Speech API (español)

**3 modos de entrada:**

1. **Texto 📝:** Input con límite 500 chars, enviar con Enter
2. **Voz 🎤:** Web Speech API (es-ES), auto-transcribe al input
3. **Imagen 📷:** Canvas API redimensiona + GPT-4o-mini Vision analiza

**Validaciones:**

- Longitud prompt: máx 500 caracteres (rojo >450)
- Tipo archivo: solo `image/*`
- Tamaño imagen: máx 10MB antes de comprimir
- Endpoint health check antes de enviar

**Estados visuales:**

- Normal: placeholder "Ej: 'Crea tabla cliente...'"
- Recording: placeholder "🎤 Escuchando..."
- Loading: spinner inline + input deshabilitado
- Error: mensaje flotante rojo (auto-desaparece 3-5s)

**Dónde cambiar:**

- **Límite de caracteres:** Línea 76 `if (trimmedPrompt.length > 500)` - cambiar número
- **Max tamaño imagen:** Línea 242 `> 10 * 1024 * 1024` - cambiar en bytes
- **Calidad compresión:** Línea 254 `resizeAndCompressImage(file, 1200, 0.8)` - cambiar 0.8
- **Tamaño redimensión:** Línea 254 segundo parámetro `1200` - cambiar max width/height
- **Idioma de voz:** Línea 39 `recognition.lang = "es-ES"` - cambiar a en-US, etc.
- **Gradiente botón:** Buscar `#667eea → #764ba2` - cambiar colores
- **Posición:** Línea 320 `bottom: 16` - cambiar distancia del borde

**Compatibilidad:**

- Imagen: ✅ Todos (Canvas API estándar)
- Voz: ✅ Chrome/Edge | ✅ Safari (webkit) | ❌ Firefox (botón oculto)

**Dependencias:** api.ts (Axios), Web Speech API, Canvas API

---

**`ErrorBoundary.tsx`** - Manejo de errores global de React

**Qué hace:** Captura errores de renderizado y muestra pantalla de fallback

**Métodos React:**

- `getDerivedStateFromError(error)` - Actualiza state al detectar error
- `componentDidCatch(error, errorInfo)` - Log del error y component stack

**Pantalla de error muestra:**

- Emoji 🚨 grande
- Título "Algo salió mal"
- Mensaje de error completo (.toString())
- Component stack trace (pre formateado)
- Botón "🔄 Recargar página" (window.location.reload())

**Dónde cambiar:**

- **Color de fondo:** Línea 53 `background: "#1a1a1a"` - cambiar color
- **Color del error:** Línea 78 `color: "#FF5722"` - cambiar rojo
- **Color botón:** Línea 93 `background: "#4CAF50"` - cambiar verde
- **Textos:** Líneas 60-64 - personalizar mensajes

**Uso:** Envuelve toda la app en `App.tsx` o `main.tsx`

**Dependencias:** react (Component, ErrorInfo)

---

### � Páginas del Frontend

**`packages/web/src/pages/`**

**`Login.tsx`** - Página de autenticación

**Qué hace:** Login/registro sin contraseña (solo email + nombre)

**Funciones:**

- `handleLogin()` - POST a `/api/users/login` con email y nombre
- Validación de email con regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Manejo de invitaciones: parámetro URL `?fromInvite=TOKEN`
- Si viene de invitación: vincular usuario y redirigir a proyecto
- Si no: redirigir a dashboard o returnUrl guardada
- Guarda usuario en store Zustand (`setUser`)

**Dónde cambiar:**

- **Regex de email:** Línea 24 - cambiar patrón de validación
- **Redirección default:** Línea 68 `navigate("/dashboard")` - cambiar ruta
- **Estilos del gradiente:** Líneas 90-93 colores `#667eea → #764ba2`

**Dependencias:** react-router-dom, api.ts, useAppStore

---

**`Dashboard.tsx`** - Panel de proyectos del usuario

**Qué hace:** Lista y gestiona proyectos, crea invitaciones, unirse por link

**Funciones principales:**

- `loadProjects()` - GET `/api/projects/${userId}` para cargar lista
- `createProject()` - POST `/api/projects` con nombre y userId
- `createInvitation(projectId)` - POST `/api/invitations/create` con rol EDITOR
  - Genera link universal: `http://localhost:3001/invite/TOKEN`
- `openProject(project)` - Guarda proyecto en store y navega a `/project/${id}`
- `joinByLink()` - Extrae token con regex `/invite/([a-f0-9]+)/` y navega
- `handleLogout()` - Desconecta socket y limpia store

**Estadísticas mostradas:**

- Cantidad de miembros por proyecto (`project.users.length`)
- Cantidad de diagramas por proyecto (`project.diagrams.length`)

**Dónde cambiar:**

- **Rol de invitación default:** Línea 59 `role: "EDITOR"` - cambiar a OWNER/VIEWER
- **URL base de invitaciones:** Línea 63 `res.data.url` viene del backend (ver routes/invitations.ts)
- **Regex de token:** Línea 82 `[a-f0-9]+` - si cambias formato de token
- **Colores del gradiente:** Múltiples líneas con `#667eea → #764ba2`

**Dependencias:** react-router-dom, api.ts, useAppStore, socketManager

---

**`AcceptInvite.tsx`** - Procesamiento de invitaciones

**Qué hace:** Acepta invitación y une usuario a proyecto (con o sin login)

**Flujo:**

1. Extrae `token` de la URL (`/invite/:token`)
2. GET `/api/invitations/${token}` para validar
3. **Si NO hay usuario logueado:**
   - Crea usuario temporal: `{ id: "guest_${Date.now()}", name: "Invitado", email: "guest@temp.com" }`
   - Usuario entra como VIEWER (solo lectura)
   - Navega a `/project/${id}?fromInvite=${token}`
4. **Si hay usuario logueado:**
   - POST `/api/invitations/accept` con token y userId
   - Vincula permanentemente al proyecto
   - Navega a `/project/${id}`

**Estados mostrados:**

- `🔍 Validando invitación...` (inicial)
- `�️ Accediendo al proyecto "X" como invitado...` (sin login)
- `📋 Uniéndote al proyecto "X"...` (con login)
- `❌ Invitación no encontrada` (error 404)
- `❌ Error al procesar la invitación` (otros errores)

**Dónde cambiar:**

- **Prefijo de guest ID:** Línea 27 `guest_${Date.now()}` - cambiar formato
- **Nombre de invitado:** Línea 28 `"Invitado"` - cambiar texto
- **Delay de redirección:** Líneas 35 y 48 `setTimeout(..., 1500)` - cambiar ms
- **Mensajes de estado:** Líneas 14-51 - personalizar textos

**Dependencias:** react-router-dom, api.ts, useAppStore

---

**`DiagramEditor.tsx`** - Editor colaborativo de diagramas ER

**Qué hace:** Canvas principal con ReactFlow, Socket.IO, IA, y colaboración en tiempo real

_Nota: Este archivo es muy extenso y complejo. Ver sección de Componentes y Utilidades para más detalles._

**Funcionalidades principales:**

- Editor de diagramas ER con drag & drop (ReactFlow)
- Sincronización en tiempo real vía Socket.IO
- Sistema de presencia de usuarios (avatares en vivo)
- Integración IA (AIPromptBar) para crear tablas/relaciones por texto/voz/imagen
- Sistema de locks (bloqueo de tablas mientras se editan)
- Exportación SQL, Spring Boot, Flutter
- Sidebar con lista de tablas
- PropertiesPanel para editar campos
- Sistema de roles (OWNER/EDITOR/VIEWER)
- Control de inactividad (auto-desconexión a 60s)

**Componentes renderizados:**

- `<Sidebar />` - Panel izquierdo con lista de tablas
- `<ReactFlow />` - Canvas principal con nodos y edges
- `<PropertiesPanel />` - Panel derecho para editar
- `<AIPromptBar />` - Barra inferior de IA (solo OWNER/EDITOR)
- Avatares de usuarios en línea (esquina superior derecha)

**Eventos Socket.IO emitidos:**

- `join-project` - Al montar componente
- `leave-project` - Al desmontar componente
- `diagram-change` - Al modificar nodos/edges
- `ping-diagram` - Cada 30s para mantener presencia
- `request-lock` - Al seleccionar tabla (bloqueo temporal 30s)
- `release-lock` - Al deseleccionar tabla

**Eventos Socket.IO escuchados:**

- `diagram-update` - Cambios de otros usuarios
- `presence-update` - Lista de usuarios en línea actualizada
- `lock-acquired` / `lock-released` - Estado de locks

**Dónde cambiar:**

- **Intervalo de ping:** Buscar `setInterval` con 30000ms
- **TTL de inactividad:** Backend en `routes/sessions.ts` (60s)
- **Colores de roles:** Buscar `#667eea` (OWNER), `#4CAF50` (EDITOR), etc.
- **Posición inicial de nodos:** Función `addNode()` con coordenadas x,y

**Dependencias:** reactflow, socket.io-client, zustand, Sidebar, PropertiesPanel, AIPromptBar, api.ts, socketManager

---

### �📦 Paquete Compartido (Shared)

**`packages/shared/types.ts`** - Tipos TypeScript compartidos

**Qué hace:** Single source of truth para tipos entre frontend y backend

**Contenido (156 líneas):**

**1. Enums**

- `Role` - OWNER, EDITOR, VIEWER

**2. Tipos de Diagrama**

- `Field` - Estructura de campo de tabla
  - Props: `id, name, type, isPrimary, isForeign, nullable, references, referencesField, relationType, unique, defaultValue`
- `TableData` - Datos completos de tabla
  - Props: `name, label, fields[]`

**3. Modelos Prisma (8 interfaces)**

- `User` - id, email, name, createdAt
- `Project` - id, name, description, isPublic, ownerId, users[], diagrams[]
- `ProjectUser` - id, role, userId, projectId
- `Diagram` - id, projectId, authorId, name, data (JSON), version
- `Session` - id, userId, diagramId, lastPing
- `Lock` - id, diagramId, resourceId, userId, expiresAt
- `DiagramChange` - id, diagramId, userId, action, payload (JSON)
- `Invitation` - id, projectId, email, role, token

**4. Eventos WebSocket**

- `PresenceUser` - userId, name, role, socketId
- `DiagramUpdatePayload` - action (ADD_NODE | UPDATE_NODE | DELETE_NODE | MOVE_NODE | ADD_EDGE | DELETE_EDGE), payload

**5. API DTOs**

- `LoginRequest/Response` - Autenticación
- `CreateProjectRequest` - Crear proyecto
- `CreateInvitationRequest/Response` - Sistema de invitaciones
- `AcceptInvitationRequest` - Aceptar invitación

**Uso:**

```typescript
import type { Field, TableData, Role, User } from "@shared/types";
```

**Archivos que lo importan:**

- `components/` - TableNode.tsx, Sidebar.tsx, PropertiesPanel.tsx
- `utils/` - sqlGenerator.ts, relationHandler.ts, generadores
- `server/src/routes/` - Todas las rutas del backend

**Ventajas:**

- ✅ Sin duplicación de tipos (DRY)
- ✅ TypeScript valida compatibilidad automáticamente
- ✅ Cambio en un lugar = actualiza en todos lados

**Dónde cambiar:**

- Agregar nuevos roles: Enum `Role` línea ~12
- Agregar campos a Field: Interface `Field` línea ~18
- Nuevos modelos: Agregar después de línea ~140

---

**`packages/shared/package.json`** - Config del paquete

**Qué hace:** Define el paquete compartido como módulo privado del monorepo

**Props:**

- `name: "@exam2/shared"` - Nombre del paquete
- `private: true` - No se publica en npm
- `main: "types.ts"` - Entry point
- `types: "types.ts"` - Definiciones TypeScript

---

### �📄 Páginas del Frontend

**`packages/web/src/pages/`**

**`Login.tsx`**

> Página de autenticación con diseño glassmorphism premium

- Formulario de login/registro con email y nombre
- Sistema de autenticación sin contraseña (crea usuario si no existe)
- Diseño glassmorphism con gradientes (#667eea, #764ba2) y backdrop blur
- Validación avanzada: regex para email, campos requeridos
- Mensajes de error informativos con styling dedicado (no alerts)
- Soporte para invitaciones: si viene de `/invite/:token` vincula automáticamente al proyecto
- Redirección inteligente: retorna a URL guardada o va a dashboard
- Efectos hover en inputs (focus border color) y botón (translateY)
- Guarda estado de sesión en `useAppStore`
- Soporte para Enter key en ambos inputs

**`Dashboard.tsx`**

> Panel principal del usuario autenticado

- Lista de proyectos del usuario (owner o colaborador)
- Creación de nuevos proyectos
- Generación de links de invitación reutilizables por proyecto
- Input para unirse a proyectos mediante link de invitación
- Botón de cerrar sesión con limpieza de socket
- Estadísticas por proyecto (miembros, diagramas)
- Navegación directa a editor de proyecto

**`AcceptInvite.tsx`**

> Página de procesamiento de invitaciones

- Valida token de invitación desde URL (`/invite/:token`)
- Dos flujos:
  - **Usuario guest:** Crea usuario temporal y accede como VIEWER
  - **Usuario autenticado:** Vincula al proyecto con rol asignado
- Muestra estado de carga y nombre del proyecto
- Redirección automática al editor con parámetro `fromInvite`

**`DiagramEditor.tsx`** ⭐

> Editor principal de diagramas ER (corazón de la aplicación)

- Canvas ReactFlow para dibujar tablas y relaciones
- CRUD completo de tablas (agregar, editar, eliminar)
- Sistema de relaciones visuales (1-1, 1-N, N-N) con detección automática de PK/FK
- Creación automática de tablas intermedias para relaciones N-N
- Validación de permisos por rol (OWNER/EDITOR pueden editar, VIEWER solo ve)
- Sincronización en tiempo real vía Socket.IO:
  - Eventos: `ADD_NODE`, `UPDATE_NODE`, `DELETE_NODE`, `MOVE_NODE`, `ADD_EDGE`, `DELETE_EDGE`, `SYNC_EDGES`
  - Broadcast a todos los usuarios del proyecto (excepto emisor)
- Sistema de presencia: muestra usuarios activos en barra superior
- Integración con `PropertiesPanel`, `Sidebar` y `AIPromptBar` 🧠
- Carga/guardado automático desde/hacia base de datos
- Soporte para eliminación con clic derecho y tecla Delete
- Exportación SQL, Spring Boot y Flutter con generadores
- Throttling de movimientos para optimizar red
- Manejo de reconexión y limpieza de sockets al salir
- **Integración de IA (Nuevo):**
  - Componente `AIPromptBar` renderizado en footer (solo OWNER/EDITOR)
  - Función `applyAIActions(actions: any[])` para ejecutar acciones de IA:
    - **Estrategia de ejecución en 3 fases:**
      1. **Primera pasada:** Ejecuta CreateTable, CreateRelation, DeleteTable
      2. **Segunda pasada:** Ejecuta RenameTable (para personalizar nombres de tablas intermedias)
      3. **Tercera pasada:** Ejecuta AddField de forma diferida (después de que tablas existan)
    - **Ventajas del manejo diferido:**
      - Evita pérdida de atributos en tablas intermedias N-N
      - Garantiza que tablas existan antes de agregar campos
      - Soporta tanto formato `tableName` como `targetTable`
      - Soporta arrays múltiples de campos (`fields[]`)
    - **Referencia local de nodos actualizada (`updatedNodes`):**
      - Mantiene sincronía entre estado React y operaciones de IA
      - Permite búsqueda de tablas generadas dinámicamente
      - Se actualiza después de cada CreateTable y CreateRelation
    - **Sincronización Socket.IO automática:**
      - Emite `diagram-change` después de cada acción
      - Delays entre acciones (50-150ms) para evitar race conditions
      - Broadcast a todos los colaboradores en tiempo real
    - **Acciones implementadas:**
      - `CreateTable`: Crea nodo con campos, posición aleatoria
      - `CreateRelation`:
        - 1-1 y 1-N: Crea FK en tabla correcta + edge visual
        - N-N: Crea tabla intermedia automática + 2 edges (hacia cada tabla)
      - `AddField`: Agrega campos a tabla específica (soporta múltiples)
      - `RenameTable`: Cambia nombre de tabla (útil para personalizar joins)
      - `DeleteTable`: Elimina tabla + edges relacionados
    - **Manejo de relaciones N-N especial:**
      - Detecta campos PK de ambas tablas (`sourcePK`, `targetPK`)
      - Crea tabla intermedia con nombre inferido: `{tabla1}_{tabla2}`
      - Genera 2 FKs con nombres compuestos: `{tabla}_{pk_name}`
      - Posiciona tabla intermedia entre las tablas relacionadas
      - Crea 2 edges tipo 1-N desde cada tabla original
      - Almacena metadata en `edge.data` (sourceField, targetField, relationType)
    - **Validación y logs detallados:**
      - Logs con emoji coding: 🧠 [AI], ✅, ⚠️, ❌
      - Advertencias si tabla no encontrada para AddField
      - Alert final con conteo de acciones aplicadas
      - Console tracking de cada acción ejecutada

---

### 🗂️ Gestión de Estado (Zustand)

**`packages/web/src/store/`**

**`useAppStore.ts`**

> Store global de aplicación con persistencia en localStorage

- **Estado:**
  - `user` - Usuario autenticado actual (id, email, name)
  - `project` - Proyecto actualmente abierto
- **Acciones:**
  - `setUser()` - Establecer usuario después del login
  - `setProject()` - Cambiar proyecto activo
  - `logout()` - Limpiar sesión (user y project a null)
- Usa `zustand/middleware/persist` para mantener sesión entre recargas
- Logs de debugging con emojis

---

### 🛠️ Utilidades del Frontend

**`packages/web/src/utils/`**

**`relationHandler.ts`** - Manejo de relaciones FK

**Qué hace:** Detecta PK/FK automáticamente y gestiona creación/eliminación de relaciones

**Funciones:**

- `determinePKFK(sourceTable, targetTable)` - Determina qué tabla lleva la FK
  - Si ambas tienen PK: source es tabla referenciada, target lleva FK
- `createFKField(fkTable, pkTable, relationType)` - Crea campo FK automático
  - Nombre: `{tabla}_id` (ej: `usuario_id`)
  - Evita duplicados comprobando referencias existentes
- `removeFKRelation(nodeId, fieldName, edges, setEdges)` - Elimina edge relacionado
- `updateFKRelation(nodeId, oldRef, newRef, ...)` - Actualiza referencia FK

**Dónde cambiar:**

- **Convención de nombres FK:** Línea ~73 template `${pkTable.data.name.toLowerCase()}_${pkField.name}`
- **Validación de duplicados:** Línea ~59 condición `find()` con `references` y `referencesField`

**Dependencias:** reactflow, @shared/types

---

**`relationPrompt.ts`** - Modal SweetAlert2 para tipo de relación

**Qué hace:** Muestra modal estilizado para elegir 1-1, 1-N o N-N

**Función:** `askRelationType()`

- **Return:** `"1-1" | "1-N" | "N-N" | null`
- **Ejemplos visuales:** Usuario–Perfil, Rol–Usuario, Estudiante–Curso

**Dónde cambiar:**

- **Opciones disponibles:** Línea 11 objeto `inputOptions`
- **Colores del modal:** Línea 24 `confirmButtonColor: "#0984e3"`
- **Tema:** Línea 26 `background: "#1e1e1e"` para dark mode
- **Estilos del select:** Líneas 31-50 función `didOpen()`

**Dependencias:** sweetalert2

---

**`relationStyles.ts`** - Estilos visuales de edges (ReactFlow)

**Qué hace:** Define colores y animaciones para cada tipo de relación

**Función:** `getEdgeStyle(type)`

**Colores por tipo:**

- `1-1` → Azul `#74b9ff` (línea punteada animada)
- `1-N` → Cyan `#00cec9` (línea punteada animada)
- `N-N` → Rojo `#ff7675` (línea punteada gruesa, strokeWidth: 3)
- `FK` → Verde `#00b894`

**Estilos adicionales:**

- `defaultEdgeStyle` - Verde con dash 5 5
- `selectedEdgeStyle` - Púrpura `#667eea` con strokeWidth: 3

**Dónde cambiar:**

- **Colores:** Líneas 15-42 switch cases con `stroke` property
- **Grosor:** Propiedad `strokeWidth` (default: 2, N-N: 3)
- **Animación:** Línea ~18 `animated: true` - cambiar a false
- **Patrón de línea:** `strokeDasharray: "5 5"` - cambiar números

**Dependencias:** Ninguna (CSS puro)

---

**`sqlGenerator.ts`** ⭐ - Generador PostgreSQL

**Qué hace:** Convierte diagrama ER a script SQL con ordenamiento de dependencias

**Función:** `generateSQL(nodes, edges)`

**Algoritmo:**

1. Analiza todas las tablas con `classifyTable()` de relationUtils
2. Separa tablas base (sin FK) vs dependientes (con FK)
3. Crea tablas base primero
4. Resuelve dependencias iterativamente (topological sort)
5. Detecta dependencias circulares y advierte

**Detección de tablas intermedias:**

- **JOIN_PURE** (2 FKs, sin campos) → `PRIMARY KEY (fk1, fk2)` compuesta
- **JOIN_ENRICHED** (2 FKs + campos) → `id SERIAL PRIMARY KEY`
- **ENTITY** → `id SERIAL PRIMARY KEY`

**Dónde cambiar:**

- **ON DELETE:** Línea ~88 `ON DELETE CASCADE` → cambiar a `RESTRICT`, `SET NULL`
- **Generar índices:** Agregar después de FK: `CREATE INDEX idx_name ON table(field);`
- **Normalización:** Buscar `.toLowerCase().replace(/\s+/g, '_')` para cambiar formato

**Dependencias:** reactflow, @shared/types, relationUtils.ts

---

**`springBootGenerator.ts`** ⭐ - Generador Spring Boot

**Qué hace:** Genera proyecto Maven completo con JPA + REST + Docker

**Función:** `generateSpringBootProject(model, projectName)`

**Genera:**

- `pom.xml` - Spring Boot 3.2.0, JPA, H2, Lombok
- Entities - `@Entity`, `@Data`, `@Id`, `@GeneratedValue`
- Repositories - `extends JpaRepository<Entity, Long>`
- Services - CRUD completo (findAll, findById, save, delete)
- Controllers - REST endpoints (`@GetMapping`, `@PostMapping`, etc.)
- `Dockerfile` + `docker-compose.yml`
- `README.md` con instrucciones

**Detección de tablas intermedias:**

- **JOIN_PURE** → `@ManyToMany` + `@JoinTable` (NO crea Entity separada)
- **JOIN_ENRICHED** → Entity completa con `@IdClass` o `@EmbeddedId`
- **ENTITY** → Entity estándar

**Mapeo SQL → Java:**

- `INT`, `SERIAL` → `Integer` | `BIGINT` → `Long`
- `VARCHAR`, `TEXT` → `String` | `BOOLEAN` → `Boolean`
- `DATE` → `LocalDate` | `TIMESTAMP` → `LocalDateTime`
- `DECIMAL` → `BigDecimal`

**Dónde cambiar:**

- **Puerto:** Función `getAvailablePort()` línea 32 rango `8080 + (100-1100)`
- **Base de datos:** En `application.properties` cambiar H2 por PostgreSQL
- **Versión Spring Boot:** Línea ~180 en pom.xml `<version>3.2.0</version>`
- **Mapeo de tipos:** Función `mapSqlToJavaType()` líneas 839-875

**Dependencias:** jszip, reactflow, @shared/types, relationUtils.ts

---

**`flutterGenerator.ts`** ⭐ - Generador Flutter

**Qué hace:** Genera app Flutter completa con Provider + Material Design 3

**Función:** `generateFlutterProject(model, projectName)`

**Genera:**

- `pubspec.yaml` - provider ^6.1.0, http ^1.2.0
- Models - Classes con `fromJson()`, `toJson()`, `copyWith()`
- `api_service.dart` - Mock data + HTTP client configurable
- Providers - `ChangeNotifier` con CRUD methods
- Screens - List + Form por cada entidad
- `main.dart` - Navigation con Drawer automático

**Detección de tablas intermedias:**

- **JOIN_PURE** → NO genera código (relación manejada por entidades relacionadas)
- **JOIN_ENRICHED** → CRUD completo con composite key
- **ENTITY** → CRUD completo estándar

**Configuración API (en api_service.dart generado):**

```dart
static const bool useBackend = false; // true para backend real
static const String baseUrl = "http://localhost:8080";
```

**Mapeo SQL → Dart:**

- `INT`, `SERIAL` → `int` (o `int?` si nullable)
- `VARCHAR`, `TEXT` → `String` | `BOOLEAN` → `bool`
- `DATE`, `TIMESTAMP` → `DateTime` | `DECIMAL` → `double`

**Dónde cambiar:**

- **Modo mock/backend:** En código generado línea ~12 `const bool useBackend`
- **URL backend:** Línea ~13 `const String baseUrl`
- **Datos mock:** Función `generateSampleData()` líneas 698-726
- **Mapeo de tipos:** Función `mapSqlToDartType()` líneas 1326-1335
- **Theme colors:** En main.dart generado buscar `primarySwatch`

**Dependencias:** jszip, reactflow, @shared/types, relationUtils.ts

---

**`relationUtils.ts`** ⭐⭐⭐ - Clasificación unificada de tablas

**Qué hace:** Single source of truth para clasificar tablas en TODOS los generadores

**Tipos de tabla (enum TableKind):**

1. **`ENTITY`** - Tabla normal con datos propios (0-N FKs)
2. **`JOIN_PURE`** - Tabla intermedia N-M con SOLO 2 FKs (sin columnas adicionales)
3. **`JOIN_ENRICHED`** - Tabla intermedia N-M con 2+ FKs + columnas adicionales

**Funciones:**

- `classifyTable(fields)` - Clasifica tabla según estructura
  - Detecta FKs, campos propios, timestamps opcionales
  - Return: `{ kind, foreignKeys, nonForeignFields, primaryKey }`
- `shouldGenerateCRUD(kind)` - Valida si genera CRUD
  - ENTITY: ✅ SÍ | JOIN_PURE: ❌ NO | JOIN_ENRICHED: ✅ SÍ
- `needsCompositeKey(classification)` - Determina si necesita PK compuesta

**Impacto en generadores:**

| Tipo          | SQL                   | Spring Boot              | Flutter                |
| ------------- | --------------------- | ------------------------ | ---------------------- |
| ENTITY        | id SERIAL PRIMARY KEY | Entity + CRUD            | Models + CRUD          |
| JOIN_PURE     | PK (fk1, fk2)         | @ManyToMany (sin Entity) | NO genera              |
| JOIN_ENRICHED | id o PK compuesta     | Entity + @IdClass        | Models + composite key |

**Dónde cambiar:**

- **Ignorar timestamps:** Líneas 42-46 array con `'created'`, `'updated'` - modificar o quitar
- **Lógica de clasificación:** Función `classifyTable()` líneas 27-68 - agregar nuevos criterios
- **Detección FK:** Línea 29 `f.isForeign` - cambiar si usas otra propiedad

**Dependencias:** @shared/types

---

    - **Algoritmo de resolución de dependencias:** Ordenamiento topológico
      - Separa tablas base (sin FK) vs dependientes (con FK)
      - Crea tablas en orden correcto automáticamente
      - Detección de dependencias circulares con advertencias
    - **Detección inteligente de tablas intermedias (N:M):**
      - **Join pura** (exactamente 2 FKs, sin otras columnas):
        - Genera `PRIMARY KEY (fk1, fk2)` compuesta
        - No incluye campo `id` separado
        - Ideal para relaciones puras many-to-many
      - **Join extendida** (2 FKs + columnas adicionales):
        - Genera `id SERIAL PRIMARY KEY` normal
        - Permite campos extra (cantidad, fecha, etc.)
        - Funciona como entidad completa
    - CREATE TABLE con todas las columnas y constraints
    - PRIMARY KEY y FOREIGN KEY con `ON DELETE CASCADE`
    - Tablas intermedias para relaciones N-N automáticas desde edges
    - Índices automáticos en FKs para optimizar búsquedas
    - Comentarios mínimos para producción

- `downloadSQL(sql, fileName)` - Descarga SQL como archivo `.sql`
- **Ejemplos generados:**

  ```sql
  -- Join pura (proyecto_etiqueta)
  CREATE TABLE proyecto_etiqueta (
    proyecto_id INT NOT NULL,
    etiqueta_id INT NOT NULL,
    PRIMARY KEY (proyecto_id, etiqueta_id),
    FOREIGN KEY (proyecto_id) REFERENCES proyecto(id) ON DELETE CASCADE,
    FOREIGN KEY (etiqueta_id) REFERENCES etiqueta(id) ON DELETE CASCADE
  );

  -- Join extendida (carrito)
  CREATE TABLE carrito (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    fecha TIMESTAMP DEFAULT now(),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (producto_id) REFERENCES producto(id)
  );
  ```

- Soporte: PostgreSQL 12+
- Normalización automática de nombres (lowercase, snake_case)
- Compatible con Prisma, TypeORM y Sequelize

**`springBootGenerator.ts`** ⭐

> Generador automático de proyectos Spring Boot completos desde diagrama ER con Docker integrado

- **Función principal:**
  - `generateSpringBootProject(model, projectName)` - Genera ZIP con proyecto Maven completo:
    - **Estructura del proyecto:**
      - `pom.xml` - Maven con Spring Boot 3.2, JPA, H2, Lombok
      - `Dockerfile` - Multi-stage build (Maven + JRE Alpine optimizado)
      - `docker-compose.yml` - Configuración lista para ejecutar con puerto dinámico
      - `.dockerignore` - Optimización de build Docker
      - `application.properties` - H2 en memoria con puerto aleatorio (8180-9080)
      - `{ProjectName}Application.java` - Clase principal correctamente nombrada
      - `src/main/java/{package}/entity/` - Entidades JPA
      - `src/main/java/{package}/repository/` - Repositorios JPA
      - `src/main/java/{package}/service/` - Servicios con lógica CRUD
      - `src/main/java/{package}/controller/` - Controllers REST
      - `README.md` - Documentación completa con ejemplos cURL
    - **Entidades JPA con Lombok:**
      - Anotaciones: `@Entity`, `@Table`, `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`
      - Primary Keys: `@Id` + `@GeneratedValue(strategy = IDENTITY)`
      - **Detección inteligente de relaciones:**
        - **Join pura** (solo 2 FKs sin columnas extra):
          - ❌ NO genera entidad Java separada
          - ✅ Genera `@ManyToMany` con `@JoinTable` en entidades principales
          - Ejemplo: `proyecto_etiqueta` → relación en Proyecto.java y Etiqueta.java
        - **Join extendida** (2 FKs + campos adicionales):
          - ✅ Genera entidad completa con `@Id` autoincremental
          - ✅ Genera CRUD completo (Repository, Service, Controller)
          - Relaciones: `@ManyToOne` para las FKs
          - Ejemplo: `carrito` con campos cantidad, fecha
        - Relaciones normales: `@ManyToOne`, `@OneToMany` según corresponda
    - **Repositorios:** Interfaces extendiendo `JpaRepository<Entity, Long>`
    - **Servicios:** CRUD completo
      - `findAll()` - Listar todos los registros
      - `findById(id)` - Buscar por ID
      - `save(entity)` - Crear nuevo
      - `update(id, entity)` - Actualizar existente
      - `delete(id)` - Eliminar por ID
    - **Controllers REST con endpoints funcionales:**
      - `GET /{entidad}` - Listar todos
      - `GET /{entidad}/{id}` - Obtener por ID
      - `POST /{entidad}` - Crear nuevo
      - `PUT /{entidad}/{id}` - Actualizar
      - `DELETE /{entidad}/{id}` - Eliminar
      - `@CrossOrigin(origins = "*")` - CORS habilitado
    - **Base de datos H2:**
      - URL: `jdbc:h2:mem:testdb`
      - Console: `/h2-console` (User: `sa`, Password: vacío)
      - JPA: `spring.jpa.hibernate.ddl-auto=create-drop` (auto-crea tablas)
  - `downloadSpringBootProject(zipBuffer, projectName)` - Descarga ZIP
- **Características avanzadas:**
  - Puerto aleatorio (8180-9080) para evitar conflictos
  - Dockerfile multi-stage para imágenes optimizadas (~200MB)
  - Usuario no-root en contenedor por seguridad
  - Healthcheck integrado en docker-compose
  - README con ejemplos cURL y instrucciones Docker/Maven
- **🔧 Mapeo de tipos SQL → Java MEJORADO:**
  - **Tipos numéricos:**
    - `INT`, `SERIAL` → `Integer` ✅ (antes era `Long` ❌)
    - `BIGINT`, `BIGSERIAL` → `Long`
    - `SMALLINT` → `Short`
  - **Tipos decimales:**
    - `DECIMAL`, `NUMERIC`, `MONEY` → `BigDecimal` ✅ (antes era `Double` ❌)
    - `FLOAT`, `REAL` → `Float`
    - `DOUBLE` → `Double`
  - **Tipos de texto:**
    - `VARCHAR`, `TEXT`, `CHAR` → `String`
  - **Tipos de fecha/hora:**
    - `DATE` → `LocalDate`
    - `TIMESTAMP`, `DATETIME` → `LocalDateTime`
    - `TIME` → `LocalTime`
  - **Otros tipos:**
    - `BOOLEAN` → `Boolean`
    - `UUID` → `UUID` (nuevo)
    - `BLOB`, `BYTEA` → `byte[]`
    - `JSON` → `String`
- **✨ Imports automáticos:**
  - Detecta tipos usados en cada entidad
  - Agrega imports necesarios: `java.time.LocalDate`, `java.math.BigDecimal`, etc.
  - Evita duplicados con `Set<string>`
  - Logs de depuración: `🔧 [AI JavaGen] Added import java.time.LocalDate for field 'fecha'`
  - Ordenamiento automático: `java.*` → `jakarta.*` → `lombok.*`
  - Compatible con **Jakarta EE 9+** (Spring Boot 3.x)
- **Conversión de nombres:**
  - snake_case → PascalCase (clases)
  - snake_case → camelCase (variables)
- **Ejemplos generados:**

  ```java
  // Join pura: NO genera entidad, usa @ManyToMany
  package com.app.entity;

  import java.util.Set;
  import java.util.HashSet;
  import jakarta.persistence.*;
  import lombok.Data;
  import lombok.NoArgsConstructor;
  import lombok.AllArgsConstructor;

  @Entity
  @Table(name = "proyecto")
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public class Proyecto {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Integer id;

      @ManyToMany
      @JoinTable(
          name = "proyecto_etiqueta",
          joinColumns = @JoinColumn(name = "proyecto_id"),
          inverseJoinColumns = @JoinColumn(name = "etiqueta_id")
      )
      private Set<Etiqueta> etiquetas = new HashSet<>();
  }

  // Join extendida: Genera entidad completa con imports automáticos
  package com.app.entity;

  import java.math.BigDecimal;
  import java.time.LocalDateTime;
  import jakarta.persistence.*;
  import lombok.Data;
  import lombok.NoArgsConstructor;
  import lombok.AllArgsConstructor;

  @Entity
  @Table(name = "carrito")
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public class Carrito {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Integer id;

      @ManyToOne
      @JoinColumn(name = "usuario_id")
      private Usuario usuario;

      @ManyToOne
      @JoinColumn(name = "producto_id")
      private Producto producto;

      private Integer cantidad;
      private BigDecimal precioUnitario; // DECIMAL → BigDecimal con import automático
      private LocalDateTime fecha;       // TIMESTAMP → LocalDateTime con import automático
  }
  ```

- **Listo para ejecutar:**
  - Maven: `mvn spring-boot:run`
  - Docker: `docker compose up --build`
- Soporte: Java 17+, Spring Boot 3.2, Maven 3.6+
- Compatible con IntelliJ IDEA, Eclipse, VS Code
- Listo para despliegue: Docker, Heroku, AWS Elastic Beanstalk

**`relationUtils.ts`** ⭐⭐⭐

> Módulo centralizado de clasificación de tablas para coherencia entre todos los generadores

- **Propósito:** Garantizar que SQL, Spring Boot y Flutter clasifiquen tablas intermedias de la misma forma
- **Tipos exportados:**

  ```typescript
  type TableKind = "ENTITY" | "JOIN_PURE" | "JOIN_ENRICHED";

  interface TableClassification {
    kind: TableKind;
    foreignKeys: Field[];
    nonForeignFields: Field[];
    primaryKey: Field | null;
  }
  ```

- **Funciones principales:**
  - `classifyTable(fields: Field[]): TableClassification`
    - Analiza la estructura de una tabla y retorna su clasificación
    - **ENTITY:** Tabla normal con datos propios (0, 1, o más FKs)
    - **JOIN_PURE:** Tabla intermedia N-M con SOLO 2 FKs (sin columnas adicionales)
      - Ejemplo: `proyecto_etiqueta (proyecto_id, etiqueta_id)`
      - Timestamps opcionales (created_at, updated_at) NO cuentan como campos adicionales
    - **JOIN_ENRICHED:** Tabla intermedia N-M con 2+ FKs + columnas de datos
      - Ejemplo: `carrito (usuario_id, producto_id, cantidad, fecha)`
  - `shouldGenerateCRUD(kind: TableKind): boolean`
    - Retorna `true` para ENTITY y JOIN_ENRICHED
    - Retorna `false` para JOIN_PURE (solo relación, sin entidad propia)
    - Usado por generadores para filtrar tablas a generar
  - `needsCompositeKey(classification): boolean`
    - Detecta si una tabla JOIN_ENRICHED necesita clave compuesta
    - Retorna `true` si no tiene PK simple y tiene 2+ FKs
- **Impacto en generadores:**
  - **SQL:** JOIN_PURE obtiene `PRIMARY KEY (fk1, fk2)` compuesta
  - **Spring Boot:** JOIN_PURE usa `@ManyToMany`, JOIN_ENRICHED genera Entity completa
  - **Flutter:** JOIN_PURE NO genera código, JOIN_ENRICHED genera CRUD con composite key
- **Ventajas:**
  - ✅ Lógica única y mantenible en un solo lugar
  - ✅ Consistencia garantizada entre backend y frontend
  - ✅ Fácil de extender con nuevos tipos de tablas
  - ✅ Reducción de bugs por diferencias de clasificación

**`flutterGenerator.ts`** ⭐

> Generador automático de proyectos Flutter completos desde diagrama ER con arquitectura Provider

- **Función principal:**
  - `generateFlutterProject(model, projectName)` - Genera ZIP con proyecto Flutter completo:
    - **Estructura del proyecto:**
      - `pubspec.yaml` - Dependencias: flutter, provider 6.1.0, http 1.2.0
      - `analysis_options.yaml` - Flutter lints con reglas relajadas
      - `.gitignore` - Archivos de Flutter/Dart/IDEs/Platforms
      - `lib/main.dart` - App principal con MultiProvider y rutas nombradas
      - `lib/models/{tabla}_model.dart` - Modelos Dart para cada entidad
      - `lib/services/api_service.dart` - Servicio HTTP + datos mock
      - `lib/providers/{tabla}_provider.dart` - Providers con estado CRUD
      - `lib/screens/{tabla}_list_screen.dart` - Pantallas de listado
      - `lib/screens/{tabla}_form_screen.dart` - Pantallas de formulario
      - `README.md` - Documentación completa con instrucciones
    - **Modelos Dart con null-safety:**
      - Reglas de nullable:
        - **IDs autogenerados:** `int?` (nullable, generado por backend)
        - **Foreign Keys en ENTITY:** `int?` (nullable, opcional)
        - **Foreign Keys en JOIN tables:** `int` (required, parte de la relación)
        - **Campos NOT NULL:** Sin `?`, con `required` en constructor
        - **Campos NULL:** Con `?`, sin `required`
      - Métodos generados:
        - `fromJson(Map<String, dynamic>)` - Deserialización desde API
        - `toJson()` - Serialización para API
        - `copyWith({...})` - Actualización inmutable de propiedades
        - `getCompositeKey()` - Solo en JOIN*ENRICHED (ej: `"$userId*$productoId"`)
      - Tipos mapeados: INT→int, VARCHAR→String, BOOLEAN→bool, TIMESTAMP→DateTime
    - **API Service con modo dual:**
      - **Configuración:**
        ```dart
        static const bool useBackend = false; // Cambiar a true para backend real
        static const String baseUrl = "http://localhost:8080";
        ```
      - **Modo local (useBackend = false):**
        - Datos mock generados automáticamente (2 registros de ejemplo por tabla)
        - Delay artificial de 300ms para simular latencia de red
        - Perfecto para desarrollo sin backend
      - **Modo backend (useBackend = true):**
        - Peticiones HTTP reales a Spring Boot
        - Endpoints: GET /tabla, GET /tabla/:id, POST /tabla, PUT /tabla/:id, DELETE /tabla/:id
        - Manejo de errores HTTP (throw Exception si statusCode != 200/201)
      - **Métodos por entidad:**
        - Tabla normal: `fetch{Clase}s()`, `fetch{Clase}ById()`, `create{Clase}()`, `update{Clase}()`, `delete{Clase}()`
        - JOIN_ENRICHED: Métodos adicionales con composite key (`update{Clase}ByCompositeKey()`, `delete{Clase}ByCompositeKey()`)
    - **Providers con ChangeNotifier:**
      - Estado: `List<Model> _items`, `bool _isLoading`, `String? _error`
      - Getters: `items`, `isLoading`, `error`
      - Métodos CRUD:
        - `fetchAll()` - Carga inicial desde API
        - `create(item)` - Crea nuevo registro
        - `update(item)` - Actualiza existente (PK simple o composite key)
        - `delete(id)` - Elimina por ID (o composite key si aplica)
      - `notifyListeners()` después de cada operación para actualizar UI
    - **Screens con Material Design 3:**
      - **ListScreen:**
        - AppBar con título y botón de agregar
        - **Navigation Drawer** con lista de todas las entidades:
          - Íconos: `table_chart` (ENTITY), `link` (JOIN_ENRICHED)
          - Resalta screen actual con color morado
          - Navegación automática con `Navigator.pushNamed()`
        - ListView con Card por cada registro
        - Botones de acción: Editar, Eliminar (con confirmación)
        - Estados: Loading spinner, error message, empty state
        - Búsqueda (pendiente, estructura preparada)
      - **FormScreen:**
        - AppBar con título (Crear/Editar)
        - Form con TextEditingController por cada campo editable
        - Validación básica (campos required)
        - Botón guardar con feedback visual
        - Navegación de regreso automática después de guardar
        - Manejo de IDs nullable (auto-asignados por backend)
    - **Clasificación de tablas con relationUtils:**
      - Usa `classifyTable()` para determinar tipo de tabla
      - Filtra con `shouldGenerateCRUD()`:
        - ✅ **ENTITY**: Genera código completo
        - ✅ **JOIN_ENRICHED**: Genera código con composite key
        - ❌ **JOIN_PURE**: NO genera código (relación manejada en backend)
      - Coherencia total con SQL y Spring Boot
  - `downloadFlutterProject(zipBuffer, projectName)` - Descarga ZIP
- **Características avanzadas:**
  - Material Design 3 con esquema de colores deepPurple
  - Hot reload habilitado (desarrollo Flutter estándar)
  - Null safety completo (Dart 3.0+)
  - Arquitectura escalable (fácil agregar BLoC o Riverpod)
  - README con ejemplos de configuración backend
- **Conversión de nombres:**
  - snake_case → PascalCase (clases)
  - snake_case → camelCase (propiedades)
- **Ejemplos generados:**

  ```dart
  // Modelo con null-safety correcto
  class Usuario {
    final int? id;           // Nullable: autogenerado
    final String nombre;     // Required: NOT NULL
    final String? email;     // Nullable: campo opcional

    Usuario({this.id, required this.nombre, this.email});

    factory Usuario.fromJson(Map<String, dynamic> json) {
      return Usuario(
        id: json['id'] as int?,
        nombre: json['nombre'] as String,
        email: json['email'] as String?,
      );
    }

    Map<String, dynamic> toJson() => {
      'id': id,
      'nombre': nombre,
      'email': email,
    };
  }

  // JOIN_ENRICHED con composite key
  class Carrito {
    final int usuarioId;     // Required: FK en join table
    final int productoId;    // Required: FK en join table
    final int cantidad;      // Required: campo adicional

    Carrito({required this.usuarioId, required this.productoId, required this.cantidad});

    String getCompositeKey() => "${usuarioId}_${productoId}";
  }
  ```

- **Listo para ejecutar:**
  - Instalación: `flutter pub get`
  - Web: `flutter run -d chrome`
  - Android/iOS: `flutter run`
- Soporte: Flutter 3.0+, Dart 3.0+, Android/iOS/Web/Desktop
- Compatible con Material Design 3, Provider, HTTP package

---

### 📦 Archivos Principales del Frontend

**`packages/web/src/`**

**`api.ts`** - Cliente HTTP con Axios

**Qué hace:** Configura instancia de Axios con baseURL desde variables de entorno

**Código completo (7 líneas):**

```typescript
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_URL,
});
```

**Uso:**

```typescript
import { api } from "@/api";

const res = await api.post("/api/users/login", { email, name });
const projects = await api.get(`/api/projects/${userId}`);
```

**Dónde cambiar:**

- **URL default:** Línea 3 `"http://localhost:3001"` - cambiar puerto o dominio
- **Timeout:** Agregar `timeout: 10000` en objeto de configuración línea 5
- **Headers:** Agregar `headers: { "Content-Type": "application/json" }` en línea 6
- **Interceptores:** Agregar después de línea 7 para auth tokens, error handling

**Variable de entorno:** `VITE_API_URL` en `.env` del frontend

**Dependencias:** axios

---

**`socketManager.ts`** - Gestor de conexiones Socket.IO

**Qué hace:** Singleton pattern para manejar una única instancia de Socket.IO

**Funciones:**

- `getSocket(user)` - Obtiene o crea socket si hay usuario autenticado
  - Configura auth: `{ userId, name }`
  - Transport: WebSocket only (no polling)
  - Listeners: connect, disconnect, error
- `disconnectSocket()` - Cierra conexión y limpia instancia
  - Llamar en logout o al salir del editor
- `isSocketConnected()` - Verifica estado de conexión (boolean)

**Logs automáticos:**

- 🔌 Creating new socket connection for user
- ✅ Socket connected: {socketId}
- ❌ Socket disconnected
- 🚨 Socket error: {error}

**Dónde cambiar:**

- **URL del socket:** Línea 3 `SOCKET_URL` desde `VITE_API_URL`
- **Transport:** Línea 14 `transports: ["websocket"]` - agregar `"polling"` como fallback
- **Auth data:** Líneas 15-18 objeto `auth` - agregar más campos
- **Reconexión:** Agregar `reconnection: true, reconnectionAttempts: 5` en config

**Patrón Singleton:** Solo una instancia global, reutilizada en toda la app

**Dependencias:** socket.io-client

---

**`main.tsx`** - Punto de entrada de React

**Qué hace:** Renderiza la aplicación con rutas y error boundary

**Estructura:**

```typescript
<ErrorBoundary>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dashboard" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/project/:projectId" element={<DiagramEditor />} />
      <Route path="/invite/:token" element={<AcceptInvite />} />
    </Routes>
  </BrowserRouter>
</ErrorBoundary>
```

**Rutas definidas:**

- `/` → App (redirige a dashboard o login según auth)
- `/dashboard` → App (panel de proyectos)
- `/login` → Login (autenticación)
- `/project/:projectId` → DiagramEditor (editor colaborativo)
- `/invite/:token` → AcceptInvite (procesamiento de invitaciones)

**Dónde cambiar:**

- **Agregar ruta:** Línea 15 añadir `<Route path="/nueva" element={<Nueva />} />`
- **Layout wrapper:** Envolver Routes con layout personalizado
- **Basename:** Agregar `<BrowserRouter basename="/app">` para subdirectorio

**Dependencias:** react-router-dom, ErrorBoundary

---

**`App.tsx`** - Componente raíz con protección de rutas

**Qué hace:** Maneja autenticación y redirecciones automáticas

**Lógica de redirección:**

1. **Si NO hay usuario:**
   - Permite: `/login` y `/invite/:token`
   - Redirige a `/login` en cualquier otra ruta
2. **Si hay usuario:**
   - En `/` → redirige a `/dashboard`
   - Renderiza Dashboard con datos del usuario

**useEffect hooks:**

- **Hook 1 (líneas 11-14):** Logs de debugging (user, location)
- **Hook 2 (líneas 16-31):** Lógica de redirección automática

**Dónde cambiar:**

- **Rutas públicas:** Línea 20 condición con excepciones de rutas sin auth
- **Ruta default autenticado:** Línea 28 `navigate("/dashboard")` - cambiar destino
- **Loading state:** Línea 36 `return null` - cambiar por spinner o skeleton

**Dependencias:** react-router-dom, useAppStore

---

**`vite-env.d.ts`** - Tipos TypeScript para Vite

**Qué hace:** Define tipos para variables de entorno de Vite

**Interface:**

```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}
```

**Uso en código:**

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

**Dónde cambiar:**

- **Agregar variable:** Línea 4 añadir `readonly VITE_OTRA_VAR: string;`
- **Tipos opcionales:** Cambiar `string` a `string | undefined` si es opcional

**Archivo .env correspondiente:**

```
VITE_API_URL=http://localhost:3001
```

**Nota:** Variables VITE\_ son expuestas al cliente (no usar para secretos)

**Dependencias:** Vite

---

## 🏗️ Arquitectura de Coherencia entre Generadores

### Problema Resuelto

En versiones anteriores, cada generador (SQL, Spring Boot, Flutter) tenía su propia lógica de detección de tablas intermedias, lo que causaba inconsistencias:

- ❌ SQL generaba PK compuesta para una tabla, pero Spring Boot generaba Entity completa
- ❌ Flutter generaba CRUD para tablas que Spring Boot manejaba con `@ManyToMany`
- ❌ Código generado no funcionaba correctamente sin modificaciones manuales

### Solución: `relationUtils.ts`

Se centralizó la lógica de clasificación en un módulo compartido que garantiza que **todos los generadores clasifiquen las tablas de la misma forma**.

### Clasificación Unificada

| Tipo de Tabla     | Características                       | SQL                       | Spring Boot                | Flutter                                      |
| ----------------- | ------------------------------------- | ------------------------- | -------------------------- | -------------------------------------------- |
| **ENTITY**        | Tabla normal con 0-N FKs              | PK simple `id`            | Entity + CRUD completo     | Models + Providers + Screens                 |
| **JOIN_PURE**     | Exactamente 2 FKs, sin columnas extra | PK compuesta `(fk1, fk2)` | `@ManyToMany` (sin Entity) | **NO genera código**                         |
| **JOIN_ENRICHED** | 2+ FKs + columnas adicionales         | PK compuesta o `id`       | Entity + CRUD completo     | Models + Providers + Screens (composite key) |

### Ejemplo Comparativo

**Diagrama ER con 3 tablas:**

```
Usuario (id, nombre, email)
Producto (id, nombre, precio)
Carrito (usuario_id, producto_id, cantidad, fecha)
```

**Generación SQL:**

```sql
CREATE TABLE usuario (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100)
);

CREATE TABLE producto (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2)
);

-- JOIN_ENRICHED: Tiene campos extra (cantidad, fecha)
CREATE TABLE carrito (
  usuario_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  fecha TIMESTAMP DEFAULT now(),
  PRIMARY KEY (usuario_id, producto_id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  FOREIGN KEY (producto_id) REFERENCES producto(id)
);
```

**Generación Spring Boot:**

```java
// Usuario.java - ENTITY normal
@Entity
public class Usuario {
    @Id @GeneratedValue(strategy = IDENTITY)
    private Long id;
    private String nombre;
    private String email;
}

// Carrito.java - JOIN_ENRICHED con campos adicionales
@Entity
@Table(name = "carrito")
public class Carrito {
    @Id @GeneratedValue(strategy = IDENTITY)
    private Long id;  // Generado automáticamente

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private Integer cantidad;  // Campo adicional
    private LocalDateTime fecha;  // Campo adicional
}

// CarritoRepository.java - CRUD completo
public interface CarritoRepository extends JpaRepository<Carrito, Long> {}
```

**Generación Flutter:**

```dart
// usuario_model.dart - ENTITY normal
class Usuario {
  final int? id;
  final String nombre;
  final String? email;

  Usuario({this.id, required this.nombre, this.email});
}

// carrito_model.dart - JOIN_ENRICHED
class Carrito {
  final int usuarioId;    // Required: FK en join table
  final int productoId;   // Required: FK en join table
  final int cantidad;     // Required: campo adicional
  final DateTime? fecha;  // Nullable: campo adicional

  Carrito({
    required this.usuarioId,
    required this.productoId,
    required this.cantidad,
    this.fecha
  });

  // Método especial para composite key
  String getCompositeKey() => "${usuarioId}_${productoId}";
}

// carrito_provider.dart - Provider con CRUD
class CarritoProvider extends ChangeNotifier {
  Future<void> update(Carrito item) async {
    final compositeKey = item.getCompositeKey();
    await ApiService.updateCarritoByCompositeKey(compositeKey, item.toJson());
    // ...
  }
}

// carrito_list_screen.dart + carrito_form_screen.dart
// Screens completas generadas
```

### Caso Especial: JOIN_PURE

Si la tabla intermedia **solo tuviera las 2 FKs** (sin cantidad ni fecha):

```sql
-- proyecto_etiqueta: Solo relaciona, sin datos propios
CREATE TABLE proyecto_etiqueta (
  proyecto_id INT NOT NULL,
  etiqueta_id INT NOT NULL,
  PRIMARY KEY (proyecto_id, etiqueta_id),
  FOREIGN KEY (proyecto_id) REFERENCES proyecto(id),
  FOREIGN KEY (etiqueta_id) REFERENCES etiqueta(id)
);
```

**Generación Spring Boot:**

```java
// proyecto_etiqueta NO genera Entity separada
// En su lugar, genera @ManyToMany en las entidades principales:

@Entity
public class Proyecto {
    @Id @GeneratedValue(strategy = IDENTITY)
    private Long id;

    @ManyToMany
    @JoinTable(
        name = "proyecto_etiqueta",
        joinColumns = @JoinColumn(name = "proyecto_id"),
        inverseJoinColumns = @JoinColumn(name = "etiqueta_id")
    )
    private Set<Etiqueta> etiquetas = new HashSet<>();
}
```

**Generación Flutter:**

```dart
// proyecto_etiqueta NO genera código
// La relación se maneja automáticamente en el backend con @ManyToMany
```

### Ventajas de la Arquitectura

1. **Consistencia Total:** Los 3 generadores usan la misma lógica de `relationUtils.ts`
2. **Código Funcional:** Backend y frontend compatibles sin modificaciones manuales
3. **Mantenibilidad:** Cambios en la lógica de clasificación se hacen en un solo lugar
4. **Escalabilidad:** Fácil agregar nuevos tipos de tablas (ej: auditoría, versionado)
5. **Testing:** Lógica centralizada es más fácil de probar

### Reglas de Detección

```typescript
// relationUtils.ts - Lógica compartida

// JOIN_PURE: Solo 2 FKs
if (
  foreignKeys.length === 2 &&
  (nonForeignFields.length === 0 || hasOnlyTimestamps)
) {
  return { kind: "JOIN_PURE" };
}

// JOIN_ENRICHED: 2+ FKs con datos adicionales
if (
  foreignKeys.length >= 2 &&
  nonForeignFields.length > 0 &&
  !hasOnlyTimestamps
) {
  return { kind: "JOIN_ENRICHED" };
}

// ENTITY: Tabla normal
return { kind: "ENTITY" };
```

**Timestamps ignorados:** `created_at`, `updated_at`, `timestamp` NO cuentan como campos adicionales significativos.

---

### 🌐 Configuración y Punto de Entrada del Frontend

**`packages/web/src/`**

**`api.ts`**

> Cliente Axios configurado para comunicación con backend

- Base URL configurable mediante variable de entorno `VITE_API_URL`
- Fallback a `http://localhost:3001` para desarrollo local
- Permite cambio sencillo de URL para producción editando `.env`
- Usado en todos los componentes para peticiones HTTP

**`socketManager.ts`** ⭐

> Gestor centralizado de conexiones Socket.IO con patrón Singleton

- Base URL configurable mediante variable de entorno `VITE_API_URL`
- **Funciones:**
  - `getSocket(user)` - Obtiene o crea instancia única de socket
    - Solo se conecta si hay usuario autenticado
    - Incluye auth con userId y name
    - Registra listeners de eventos connect/disconnect/error
    - Retorna null si no hay usuario (previene conexiones sin autenticar)
  - `disconnectSocket()` - Desconecta y limpia socket (importante en logout)
  - `isSocketConnected()` - Verifica estado de conexión
- Logs detallados con emojis para debugging
- Previene múltiples conexiones del mismo usuario

**`vite-env.d.ts`**

> Declaraciones de tipos TypeScript para variables de entorno de Vite

- Define interface `ImportMetaEnv` con `VITE_API_URL`
- Habilita autocompletado de `import.meta.env.VITE_API_URL`
- Referencia tipos de Vite client

**`App.tsx`**

> Componente raíz con lógica de autenticación y routing optimizado

- Verifica estado de usuario desde `useAppStore`
- Redirección automática:
  - Si NO hay usuario → `/login`
  - Si hay usuario en `/` → `/dashboard`
- Renderiza `Dashboard` solo si usuario está autenticado
- Protege rutas privadas automáticamente
- Logs de debugging para tracking de navegación
- **Mejora:** Evita renderizado innecesario con `return null` durante redirecciones

**`main.tsx`**

> Punto de entrada de la aplicación React

- Configura React Router con rutas principales:
  - `/` - App (Redirige a `/login` o `/dashboard`)
  - `/dashboard` - Dashboard del usuario
  - `/login` - Página de autenticación
  - `/project/:projectId` - Editor de diagramas
  - `/invite/:token` - Procesamiento de invitaciones
- Envuelve toda la app con `ErrorBoundary` para captura de errores
- Usa `createRoot` (React 18+) para renderizado

---

### ⚙️ Configuración del Frontend

**`packages/web/`**

**`index.html`**

> Punto de entrada HTML de la SPA

- Título: "Exam_2_sw Web"
- Meta viewport para responsive design
- Div `#root` donde React monta la aplicación
- Carga `main.tsx` como módulo ES6

**`package.json`**

> Configuración del proyecto frontend

- **Scripts:**
  - `dev` - Servidor de desarrollo Vite
  - `build` - Build de producción
  - `preview` - Preview del build en puerto 5173
- **Dependencias:**
  - **UI/Framework:** React 18.3, React Router DOM 6.28
  - **Diagramas:** ReactFlow 11.11 (librería de canvas para nodos y edges)
  - **Estado:** Zustand 5.0 (gestión de estado ligera)
  - **HTTP:** Axios 1.7
  - **WebSocket:** Socket.IO Client 4.8
  - **Modales:** SweetAlert2 11.14
  - **Archivos:** adm-zip 0.5.10 (generación de proyectos Spring Boot)
- **Dev dependencies:** TypeScript, Vite, plugin React, @types/node

**`tsconfig.json`**

> Configuración de TypeScript para el frontend

- Target: ES2020 con librerías DOM
- Module: ES2020 con resolución Bundler
- JSX: react-jsx (React 17+ sin imports explícitos)
- Strict mode habilitado
- noEmit: true (Vite maneja la compilación)
- Include: solo carpeta `src/`

**`vite.config.ts`**

> Configuración de Vite (bundler y dev server)

- Plugin React para JSX y Fast Refresh
- Servidor en puerto 5173
- `host: true` para acceso desde red local (útil para Docker)

---

### � Docker y Configuración de Deploy

**Raíz del proyecto**

**`.env`** - Variables de entorno para Docker Compose

**Qué hace:** Define configuración de servicios (PostgreSQL, servidor, OpenAI)

**Variables definidas:**

- `POSTGRES_USER` - Usuario de PostgreSQL (default: postgres)
- `POSTGRES_PASSWORD` - Contraseña de PostgreSQL (default: postgres)
- `POSTGRES_DB` - Nombre de base de datos (default: diagram_editor)
- `PORT` - Puerto del servidor Express (default: 3001)
- `OPENAI_API_KEY` - API key para GPT-4o-mini

**Dónde cambiar:**

- **Puerto servidor:** Línea 7 `PORT=3001` → cambiar si 3001 está ocupado
- **Credenciales DB:** Líneas 4-6 para cambiar usuario/password/nombre de BD
- **API Key OpenAI:** Línea 10 reemplazar con tu propia key desde platform.openai.com

**⚠️ Seguridad:** Este archivo NO debe subirse a Git (está en .gitignore)

---

**`.env.example`** - Plantilla pública de variables de entorno

**Qué hace:** Template para que otros desarrolladores sepan qué variables configurar

**Estructura:**

```
PORT=3001
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=diagram_editor
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

**Dónde cambiar:**

- **Agregar nueva variable:** Añadir línea sin valor real (ej: `OPENAI_API_KEY=tu_key_aqui`)
- **Documentar:** Agregar comentarios para variables no obvias

**Uso:** `cp .env.example .env` y luego editar .env con valores reales

---

**`.gitignore`** - Archivos excluidos del control de versiones

**Qué hace:** Previene que archivos sensibles o generados se suban a Git

**Categorías ignoradas:**

**Dependencies:**

- `node_modules/` - Dependencias npm (se instalan con package.json)
- `.pnpm-store/` - Caché de pnpm

**Build outputs:**

- `dist/`, `build/` - Archivos compilados
- `*.tsbuildinfo` - Caché de TypeScript

**Environment:**

- `.env`, `.env.local`, `.env.production` - Variables de entorno con secretos

**Logs:**

- `logs/`, `*.log`, `npm-debug.log*` - Archivos de log

**OS:**

- `.DS_Store` (macOS), `Thumbs.db` (Windows)

**IDE:**

- `.vscode/`, `.idea/`, `*.swp`, `*.swo`

**Docker:**

- `data/` - Volúmenes persistentes de Docker (BD PostgreSQL)

**Misc:**

- `coverage/`, `.cache/`

**Dónde cambiar:**

- **Ignorar carpeta adicional:** Agregar línea con path (ej: `uploads/`)
- **Permitir archivo específico:** Usar `!archivo.txt` para excepción

---

**`docker-compose.yml`** - Orquestación multi-contenedor

**Qué hace:** Define y conecta servicios PostgreSQL + Express en red interna Docker

**Servicios:**

**1. `db` (PostgreSQL 15):**

- **Imagen:** `postgres:15`
- **Environment:** Lee desde .env con fallbacks (:-postgres)
- **Puerto:** `5432:5432` (host:container)
- **Volumen:** `./data/postgres:/var/lib/postgresql/data` (persistencia)
- **Healthcheck:** `pg_isready` cada 5s, 10 reintentos (50s timeout total)

**2. `app` (Express + React):**

- **Build:** Usa Dockerfile del root
- **Depends on:** Espera a que `db` pase healthcheck antes de iniciar
- **Environment:**
  - `PORT` desde .env
  - `DATABASE_URL` construido dinámicamente: `postgresql://user:pass@db:5432/dbname?schema=public`
  - `OPENAI_API_KEY` desde .env
- **Puerto:** `3001:3001`
- **Command:** `node packages/server/dist/index.js`

**Dónde cambiar:**

- **Puerto servidor:** Línea 22 `"3001:3001"` → cambiar primer número para host
- **Puerto BD:** Línea 9 `"5432:5432"` → cambiar primer número para exponer en host
- **Healthcheck timeout:** Línea 14 `interval: 5s` → ajustar frecuencia
- **Agregar servicio:** Añadir bloque `servicename:` después de línea 23

**Comandos:**

- Iniciar: `docker compose up -d`
- Ver logs: `docker compose logs -f app`
- Detener: `docker compose down`
- Limpiar volúmenes: `docker compose down -v` ⚠️ BORRA DATOS

**Dependencias:** Docker 20.10+, Docker Compose v2

---

**`Dockerfile`** - Build multi-stage optimizado para producción

**Qué hace:** Compila frontend + backend y genera imagen Docker ligera (<100MB)

**Stage 1: `webbuild` (Node 18 Alpine)**

- **Líneas 2-8:** Compila React con Vite
- **Input:** `packages/web/`
- **Output:** `packages/web/dist/` (HTML, CSS, JS optimizados)
- **Instala:** patch-package globalmente
- **Comando:** `npm run build` en packages/web

**Stage 2: `serverbuild` (Node 18 Alpine)**

- **Líneas 10-15:** Compila TypeScript y genera Prisma Client
- **Input:** `packages/server/`
- **Output:** `packages/server/dist/` (JavaScript compilado)
- **Comandos:** `npx prisma generate` + `npm run build`

**Stage 3: `runtime` (Node 18 Alpine - producción)**

- **Líneas 17-33:** Imagen final ligera con solo archivos necesarios
- **Optimizaciones:**
  - Alpine Linux (base ~5MB vs Ubuntu ~70MB)
  - Solo production dependencies (`--omit=dev`)
  - OpenSSL instalado para Prisma Client
  - Multi-stage descarta archivos temporales de build
- **Estructura copiada:**
  - `packages/server/dist/` (código compilado)
  - `packages/server/package.json` (para npm install)
  - `packages/server/prisma/` (schema para migraciones)
  - `packages/web/dist/` (frontend estático)
- **Variables:** `NODE_ENV=production`
- **Puerto:** 3001
- **Entrypoint:** `node packages/server/dist/index.js`

**Dónde cambiar:**

- **Node version:** Líneas 2, 10, 17 `node:18-alpine` → cambiar a node:20-alpine
- **Puerto expuesto:** Línea 32 `EXPOSE 3001` → cambiar número
- **Optimización adicional:** Línea 29 agregar `RUN npm prune --production` después de install
- **Dependencias sistema:** Línea 22 `apk add` → agregar más paquetes (ej: curl, git)

**Tamaño estimado:** ~80-100MB (vs ~500MB sin multi-stage)

**Comandos:**

- Build: `docker build -t exam2-app .`
- Run: `docker run -p 3001:3001 exam2-app`

**Dependencias:** Docker 20.10+

---

**`package.json`** (Root) - Configuración del monorepo

**Qué hace:** Define workspaces npm para gestión unificada de dependencias

**Propiedades:**

- **name:** `Exam_2_sw`
- **version:** `0.1.0`
- **private:** `true` (no publicable en npm)
- **workspaces:** `["packages/*"]` (incluye server, web, shared)

**Scripts:**

- `dev:server` - Ejecuta `npm run dev` en @exam2/server
- `dev:web` - Ejecuta `npm run dev` en @exam2/web
- `build` - Compila server + web en secuencia

**Ventajas de workspaces:**

- ✅ Un solo `node_modules` en root (ahorra espacio)
- ✅ Dependencias compartidas hoisted
- ✅ `npm install` en root instala todos los workspaces
- ✅ Scripts cross-workspace con `--workspace` flag

**Dónde cambiar:**

- **Agregar workspace:** Línea 6 añadir `"packages/mobile"` al array
- **Agregar script:** Líneas 8-10 añadir `"test": "npm run test --workspaces"`
- **Cambiar nombre:** Línea 2 modificar identificador del proyecto

**Comandos útiles:**

- Instalar todo: `npm install`
- Agregar dep a server: `npm install express --workspace=@exam2/server`
- Ejecutar script en todos: `npm run build --workspaces`

**Dependencias:** npm 7+ (workspaces disponibles desde v7)

---
