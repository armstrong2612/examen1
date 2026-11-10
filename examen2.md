# Examen 2 - SW1

## Moderador de IA colaborativo

Se incorporó al editor un chat grupal separado de la herramienta existente para generar acciones sobre el diagrama. Los miembros del proyecto pueden consultar al moderador, ver quién hizo cada pregunta y recibir respuestas compartidas en tiempo real.

El moderador usa GPT-4o-mini para brindar recomendaciones en español basadas en el diagrama y en el historial reciente. Es una función de consulta: **no ejecuta acciones ni modifica el tablero**. La generación de cambios del diagrama continúa en `AIPromptBar`, disponible solo para OWNER y EDITOR.

## Funcionalidad del chat

- Se agregó `AIChatPanel`, un panel flotante con el estado de conexión, la conversación, el indicador de respuesta pendiente y el formulario para enviar preguntas.
- Se agregó dictado por voz en español en el campo del chat, con controles para iniciar/detener y mensajes de error para navegadores sin soporte o micrófonos sin permiso. La transcripción se agrega al texto escrito y respeta el límite de 2 000 caracteres.
- Cada pregunta identifica al autor con su nombre obtenido y validado por el servidor. Las respuestas aparecen como “Moderador IA”.
- Las preguntas y respuestas se persisten en PostgreSQL y se difunden a los participantes de la sala del proyecto con Socket.IO.
- Al entrar o reconectarse, el panel solicita el historial. Se cargan hasta 100 mensajes para mostrar la conversación; para crear la respuesta se consideran hasta 20 mensajes anteriores.
- El contexto se obtiene del diagrama guardado: nombres de tablas, campos (tipo, PK, FK y referencias) y relaciones. Se limita el contexto a 40 tablas, 30 campos por tabla, 80 relaciones y 12 000 caracteres.
- Las preguntas deben contener entre 1 y 2 000 caracteres.
- Si el servicio de IA falla, el servidor conserva la pregunta ya guardada y envía un error al participante que la hizo; no publica una respuesta ficticia.
- El historial del chat es compartido por proyecto; no hay una conversación independiente por participante.

## Cambios de base de datos

Se añadieron un enum y dos modelos al esquema de Prisma `packages/server/prisma/schema.prisma`.

### `AiChatMessageKind`

Enumera el tipo de mensaje:

- `USER`: pregunta o mensaje enviado por un miembro.
- `ASSISTANT`: respuesta del moderador de IA.

### `AiConversation`

Representa la conversación compartida de un proyecto:

- `id`: identificador `cuid()`, clave primaria.
- `projectId`: identificador único del proyecto; limita a una conversación por proyecto.
- `project`: relación con `Project`.
- `messages`: colección de mensajes relacionados.
- `createdAt` y `updatedAt`: marcas de tiempo.
- La relación con `Project` usa `onDelete: Cascade`; al eliminar el proyecto también se elimina su conversación.
- `Project.aiConversation` es la relación inversa opcional.

### `AiChatMessage`

Guarda cada pregunta y respuesta:

- `id`: identificador `cuid()`, clave primaria.
- `conversationId`: clave foránea a `AiConversation`.
- `kind`: enum `AiChatMessageKind`.
- `authorId`: identificador del autor para mensajes de usuario; opcional para permitir al moderador, que no es un usuario de la aplicación.
- `authorName`: nombre que se muestra en el chat.
- `content`: contenido de texto almacenado como `TEXT`.
- `requestId`: identificador opcional para asociar la pregunta con su respuesta y el estado pendiente del cliente.
- `createdAt`: fecha de creación, por defecto la hora actual.
- Índices por `(conversationId, createdAt)` para consultar el historial en orden y por `(conversationId, requestId)` para localizar los mensajes de una solicitud.
- La relación con `AiConversation` usa `onDelete: Cascade`; al eliminar una conversación se eliminan sus mensajes.

`authorId` se guarda como texto y **no** tiene relación foránea a `User`: esto permite registrar invitados efímeros sin crear cuentas de base de datos.

### Sincronización del esquema

El contenedor ejecuta `npx prisma db push --skip-generate` al iniciar, mediante `packages/server/start.sh`. Por eso, durante esta implementación, el esquema se sincronizó con la base existente al recrear el servicio `app`; no se agregó un archivo de migración SQL de Prisma. La base está configurada en `docker-compose.yml` y los datos de PostgreSQL se conservan en el volumen `pgdata`.

## Socket.IO y flujo de mensajes

El socket debe unirse primero a un proyecto autorizado. El servidor obtiene la identidad y el rol y los guarda en `socket.data`; el cliente no puede escoger su nombre o rol efectivo para el chat.

| Evento | Dirección | Datos y comportamiento |
|---|---|---|
| `join-project` | Cliente → servidor | Recibe `userId`, `projectId` y opcionalmente `invitationToken`. Verifica acceso antes de añadir el socket a la sala. |
| `project-joined` | Servidor → cliente | Confirma el `projectId` y el rol efectivo después de una unión autorizada. |
| `ai-chat-history-request` | Cliente → servidor | Solicita el historial del proyecto asociado al socket; no acepta un proyecto arbitrario del cliente. |
| `ai-chat-history` | Servidor → cliente | Devuelve `{ projectId, messages }`, hasta los 100 mensajes más recientes en orden cronológico. |
| `ai-chat-send` | Cliente → servidor | Recibe `{ message, requestId }`. El proyecto y el autor se derivan de la sesión Socket.IO validada. |
| `ai-chat-message` | Servidor → sala del proyecto | Difunde el mensaje de usuario ya guardado y después la respuesta de IA ya guardada. |
| `ai-chat-error` | Servidor → cliente solicitante | Comunica errores de permiso, longitud, configuración o generación de respuesta; incluye `requestId` cuando está disponible. |

Flujo de una pregunta:

1. El servidor vuelve a validar el acceso del socket.
2. Crea u obtiene la conversación del proyecto.
3. Lee hasta 20 mensajes anteriores.
4. Guarda la pregunta con el autor determinado por la base de datos y la difunde a la sala.
5. Obtiene el diagrama persistido y solicita una respuesta a `answerProjectQuestion`.
6. Vuelve a verificar el acceso del socket.
7. Guarda la respuesta como `ASSISTANT` con autor “Moderador IA” y la difunde a la misma sala.

El servicio `answerProjectQuestion` envía el diagrama como contexto de sistema, pasa preguntas previas identificadas por participante y respuestas previas del moderador, y limita la respuesta a 700 tokens. El prompt instruye al modelo a responder en español, ofrecer recomendaciones prácticas y no afirmar que modificó el tablero ni revelar razonamiento interno.

## Acceso y permisos

- Un usuario registrado solo puede entrar si es dueño del proyecto (`Project.ownerId`) o miembro en `ProjectUser`.
- El rol y nombre de miembros se consultan en la base de datos; se ignoran los valores `name` y `role` del cliente para autoría y autorización del chat.
- VIEWER puede consultar al moderador, pero sus eventos `diagram-change` siguen bloqueados.
- Invitados con IDs `guest_...` solo pueden entrar si presentan un token de invitación válido asociado al mismo proyecto. Se les asigna rol VIEWER y una identidad de presencia temporal por socket.
- `ai-chat-history-request` y `ai-chat-send` requieren acceso vigente al proyecto.
- El servidor valida la membresía también al procesar cada cambio del diagrama; no permite usar el socket unido a un proyecto para cambiar otro.
- `leave-project` y los pings de presencia usan el estado del socket, no un `userId` arbitrario enviado en esos eventos.

## Archivos modificados

- `packages/server/prisma/schema.prisma`: enum, modelos, relaciones e índices de las conversaciones y mensajes.
- `packages/server/src/services/aiService.ts`: función `answerProjectQuestion` para generar respuestas contextuales.
- `packages/server/src/index.ts`: validación de acceso a salas, eventos de chat, lectura del historial, contexto del diagrama, persistencia y difusión.
- `packages/web/src/components/AIChatPanel.tsx`: interfaz y cliente Socket.IO del chat.
- `packages/web/src/pages/DiagramEditor.tsx`: conexión del panel, envío del token de invitación de invitados y re-unión del socket tras reconexión.
- `README.md`: descripción del chat, roles y eventos colaborativos.
- `examen2.md`: documentación del examen y de los cambios implementados.

## Verificación realizada

- `docker compose build app` completó correctamente: generó el cliente Prisma y compiló TypeScript y Vite.
- El contenedor `app` se recreó y quedó activo junto con el contenedor saludable de PostgreSQL.
- El inicio del contenedor confirmó que Prisma sincronizó el esquema.
- Se consultó el modelo `aiConversation` desde Prisma en el contenedor en ejecución.
- El endpoint `/health` respondió HTTP 200 con `{"status":"ok"}`.
- El dictado usa Web Speech API (`SpeechRecognition` o `webkitSpeechRecognition`); para probarlo hace falta un navegador compatible y conceder permiso de micrófono.
- No se verificó una conversación completa contra OpenAI; esa prueba requiere que `OPENAI_API_KEY` sea válida, esté cargada en Docker y tenga acceso al modelo.
- Vite mostró advertencias preexistentes sobre el tamaño de un bundle y un módulo importado estática y dinámicamente; el build final terminó correctamente.

## Limitación de autenticación existente

El inicio de sesión actual del proyecto solicita email y nombre, pero no verifica credenciales ni usa tokens de autenticación. La autorización del socket comprueba la membresía y obtiene el nombre/rol desde la base, pero la identidad de usuario que presenta el cliente todavía no está respaldada por una autenticación fuerte. Se recomienda implementar autenticación real antes de usar esa identidad para operaciones sensibles.
