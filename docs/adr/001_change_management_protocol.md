# ADR-001: Protocolo de Gestión de Cambios Basado en Riesgo

**Estado:** Aceptado

**Fecha:** 2025-07-20

---

## 1. Contexto

A medida que el proyecto Credinet crece en complejidad, realizar cambios ad-hoc se vuelve cada vez más arriesgado. Una modificación simple puede tener efectos inesperados en otras partes del sistema. Necesitamos un protocolo estructurado para clasificar los cambios, definir los pasos requeridos para cada uno y asignar responsabilidades a los agentes correctos, minimizando el riesgo de regresiones.

---

## 2. Decisión Tomada

Se ha decidido implementar un **Protocolo de Gestión de Cambios de 3 Niveles**, basado en el riesgo y el impacto potencial de la tarea. El agente `project_manager` actuará como coordinador principal, decidiendo el nivel de riesgo de una tarea e iniciando el protocolo correspondiente.

---

## 3. Protocolos por Nivel de Riesgo

### Nivel 1: Cambio de Bajo Riesgo

-   **Descripción:** Tareas con impacto aislado y predecible.
-   **Ejemplos:**
    -   Correcciones de texto o estilos en el frontend.
    -   Bugs con una causa raíz clara y una solución contenida.
    -   Añadir un nuevo campo a un modelo que no afecta la lógica existente.
-   **Protocolo:**
    1.  El `project_manager` asigna la tarea directamente al agente especialista (`frontend_developer` o `backend_developer`).
    2.  El especialista implementa el cambio.
    3.  **Verificación Obligatoria:** El especialista reconstruye el entorno y ejecuta el `System Health Check` para confirmar que no se introdujeron regresiones.
    4.  El especialista hace el commit y fusiona los cambios.

### Nivel 2: Cambio de Medio Riesgo

-   **Descripción:** Tareas que involucran la creación de nueva funcionalidad o la modificación de lógica existente, afectando tanto al backend como al frontend.
-   **Ejemplos:**
    -   Crear un nuevo CRUD completo para una entidad (ej. "Beneficiarios").
    -   Añadir un nuevo dashboard.
    -   Modificar una regla de negocio existente (ej. cambiar cómo se calcula una comisión).
-   **Protocolo:**
    1.  El `project_manager` crea las tarjetas necesarias en el `project_board.md`.
    2.  **Backend Primero:** Se asigna la tarea de backend al `backend_developer`.
    3.  **Verificación Backend:** Una vez completado, se ejecuta el `System Health Check`. Si la nueva funcionalidad necesita ser probada, se **actualiza el `smoke_test.py`** para incluirla.
    4.  **Frontend Después:** Se asigna la tarea de frontend al `frontend_developer`.
    5.  **Verificación Final:** Se ejecuta de nuevo el `System Health Check` tras los cambios del frontend.
    6.  El `project_manager` coordina la fusión de los cambios.

### Nivel 3: Cambio de Alto Riesgo (Refactorización Mayor)

-   **Descripción:** Tareas que alteran la arquitectura fundamental del sistema.
-   **Ejemplos:**
    -   Cambiar el sistema de autenticación (ej. a multi-rol).
    -   Modificar la estructura de la base de datos de forma significativa.
    -   Actualizar una librería principal (ej. FastAPI, React).
-   **Protocolo:**
    1.  El `project_manager` invoca el **"Protocolo de Refactorización Mayor"** como se detalla en `docs/guides/01_major_refactoring_protocol.md`.
    2.  **Coordinación de Agentes Múltiples:** El `project_manager` puede invocar a otros agentes según sea necesario durante el proceso:
        -   `qa_validator`: Para definir los casos de prueba que el `smoke_test.py` debe cubrir *antes* de empezar.
        -   `debugger_expert`: Si el ciclo de depuración se bloquea.
        -   `cybersecurity_expert`: Para auditar los cambios si la modificación afecta a la seguridad (ej. autenticación, permisos).
    3.  La fusión a la rama principal solo se realiza tras la ejecución exitosa del `smoke_test.py` actualizado y la actualización de toda la documentación relevante.

---

## 4. Consecuencias

-   **Positivas:**
    -   Reduce drásticamente el riesgo de regresiones.
    -   Aporta claridad y predictibilidad al proceso de desarrollo.
    -   Asegura que la calidad (`Health Check`) y la documentación se mantengan sincronizadas con el código.
-   **Negativas:**
    -   El proceso es más lento y burocrático para cambios simples, pero la ganancia en estabilidad justifica el coste.
