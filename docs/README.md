# Bienvenido a la Documentación de Credinet

Este directorio es el "cerebro" del proyecto Credinet. Contiene toda la información necesaria para entender, operar y extender el sistema. Está diseñado para ser la **única fuente de verdad** para todos los colaboradores, ya sean humanos o agentes de IA.

## Épica Actual: Modernización de Perfiles de Usuario

Actualmente, la iniciativa principal del proyecto es la **Modernización de Perfiles de Usuario**. Esto implica la fusión de la antigua tabla `clients` en la tabla `users`, la adición de campos de perfil enriquecidos (dirección, CURP), y la implementación de entidades relacionadas como `beneficiaries` y `associate_levels`. Puedes encontrar más detalles sobre el progreso y los próximos pasos en el [Resumen de Sesión](./session_summary.md).

## ¿Qué Buscas? Guía Rápida

-   **"Quiero entender cómo funciona el negocio (las reglas, los roles, los procesos)."**
    -   **Empieza aquí:** Lee los documentos en la carpeta `business_logic/` en orden numérico. Son la base de todo.

-   **"Necesito entender la arquitectura técnica (qué tecnología usamos, cómo se conectan las partes)."**
    -   **Ve a:** La carpeta `system_architecture/`. Encontrarás diagramas, descripciones de los componentes (frontend, backend) y el esquema de la base de datos.

-   **"¿Cómo debo escribir o estructurar el CSS?"**
    -   **Consulta:** La nueva [Guía de Arquitectura CSS](./guides/05_css_architecture_and_style_guide.md).

-   **"Quiero empezar a desarrollar o configurar mi entorno."**
    -   **Sigue la guía:** El directorio `onboarding/` tiene las instrucciones paso a paso. Lee primero `01_developer_setup.md` y luego `02_system_health_check.md` para entender nuestras herramientas de calidad.

-   **"¿Por qué se tomó una decisión de diseño o arquitectura específica?"**
    -   **Consulta los registros:** La carpeta `adr/` (Architectural Decision Records) documenta las decisiones importantes y su justificación.

-   **"Necesito asumir un rol específico (ej. desarrollador backend)."**
    -   **Adopta una persona:** La carpeta `personas/` define los perfiles clave del proyecto, sus responsabilidades y las herramientas que utilizan.

## Protocolo de Actualización

La documentación es código. Cualquier cambio en la funcionalidad o arquitectura **debe** ir acompañado de una actualización en los documentos relevantes.

-   **Cambio en la lógica de negocio:** Actualiza `business_logic/` y crea un `adr/` si la decisión es significativa.
-   **Cambio en el código (API, DB):** Actualiza `system_architecture/`.
-   **Añadir una nueva dependencia o cambiar el proceso de setup:** Actualiza `onboarding/`.

## Épica Actual: Refactorización del Sistema de Roles

Actualmente, la iniciativa principal del proyecto es la **Refactorización del Sistema de Roles a un Modelo Puro**. Esto permitirá que los usuarios tengan múltiples roles y mejorará la flexibilidad del sistema de permisos. Puedes encontrar más detalles sobre el progreso y los próximos pasos en el [Resumen de Sesión](./session_summary.md).
