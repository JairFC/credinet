# Sistema de Comisiones

Este documento detalla la arquitectura y lógica del sistema de comisiones para asociados dentro de Credinet.

## 1. Filosofía de Diseño

El sistema de comisiones se ha diseñado siguiendo estos principios:

- **Flexibilidad:** Permitir tasas de comisión estándar por asociado, con la capacidad de anularlas para préstamos específicos (ej. promociones).
- **Auditabilidad:** Cada préstamo debe registrar la tasa de comisión exacta con la que fue creado. Cambios futuros en las tasas de los asociados no deben afectar a los registros pasados.
- **Usabilidad:** El sistema debe ser intuitivo, pre-llenando la información más común para agilizar el proceso de creación de préstamos y reducir errores.

## 2. Arquitectura: Modelo Híbrido

Se ha optado por un modelo híbrido que combina una tasa de comisión por defecto a nivel de asociado con la capacidad de anulación a nivel de préstamo individual.

### 2.1. Base de Datos

La implementación se basa en dos columnas clave en tablas diferentes:

1.  **Tabla `associates`:**
    - Se añade una nueva columna: `default_commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00`.
    - **Propósito:** Almacena la tasa de comisión estándar o "de lista" para cada asociado. Este es el valor que se usará por defecto para todos los nuevos préstamos que se le asignen.

2.  **Tabla `loans`:**
    - Se utiliza la columna existente: `commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00`.
    - **Propósito:** Almacena la tasa de comisión *final y contractual* para ese préstamo específico. Este valor es inmutable una vez que el préstamo está activo y es la fuente de verdad para todos los cálculos de comisiones.

### 2.2. Flujo de Lógica

El proceso de creación de un préstamo seguirá el siguiente flujo:

1.  **Selección de Asociado (Frontend):** En el formulario de creación de un nuevo préstamo, el usuario selecciona un asociado de una lista.
2.  **Obtención de Tasa por Defecto (Backend/Frontend):** Al seleccionar el asociado, el frontend realiza una petición a la API (o ya tiene la información) para obtener el `default_commission_rate` de ese asociado.
3.  **Auto-relleno del Formulario (Frontend):** El campo "Tasa de Comisión" en el formulario se rellena automáticamente con el valor obtenido.
4.  **Anulación Opcional (Frontend):** El usuario (si tiene los permisos adecuados) tiene la opción de modificar manualmente el valor pre-rellenado en el campo "Tasa de Comisión". Esto permite manejar casos especiales o promociones.
5.  **Guardado del Préstamo (Backend):** Al enviar el formulario, el valor final del campo "Tasa de Comisión" se guarda en la columna `commission_rate` de la tabla `loans`. El sistema no necesita saber si fue el valor por defecto o uno anulado; simplemente guarda el dato final.

## 3. Futuras Mejoras (A Considerar)

- **Cálculo de Comisiones sobre Pagos:** Para un modelo financiero más sólido, se podría implementar una tabla `commission_records` que registre la porción de la comisión "ganada" con cada pago realizado por el cliente, en lugar de calcularla toda al inicio del préstamo.
- **Roles y Permisos:** Definir qué roles de usuario (ej. 'administrador') pueden anular la tasa de comisión por defecto.

Este enfoque nos proporciona un sistema robusto, auditable y preparado para futuras expansiones.
