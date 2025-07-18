# Lógica de Negocio: Conceptos Fundamentales

Este documento es la **fuente de verdad** para la lógica de negocio de Credinet. Todo el desarrollo y la documentación deben alinearse con los principios aquí descritos.

## 1. Entidades Principales

El ecosistema de Credinet gira en torno a cinco entidades interconectadas:

1.  **Usuario (`User`):**
    -   **Definición:** Cualquier individuo con credenciales para acceder al sistema.
    -   **Propósito:** La autenticación y la autorización se basan en los usuarios. Cada usuario tiene asignado un único rol.

2.  **Asociado (`Associate`):**
    -   **Definición:** Una entidad de negocio externa (empresa o individuo) que origina préstamos.
    -   **Propósito:** Actúan como intermediarios o promotores. Ganan una comisión por los préstamos que generan.
    -   **Relación:** Un usuario con el rol `asociado` está directamente vinculado a una (y solo una) entidad `Associate`.

3.  **Cliente (`Client`):**
    -   **Definición:** La persona o entidad final que recibe un préstamo.
    -   **Propósito:** Son los beneficiarios de los servicios financieros.
    -   **Relación:** Un cliente puede tener múltiples préstamos. En el futuro, un cliente podrá tener su propio `User` para acceder al sistema.

4.  **Préstamo (`Loan`):**
    -   **Definición:** El producto financiero central. Es un contrato de dinero entre la empresa y un `Cliente`.
    -   **Propósito:** Representa el núcleo de las operaciones.
    -   **Relación:** Un préstamo siempre pertenece a un `Cliente` y puede ser originado por un `Asociado`.

5.  **Pago (`Payment`):**
    -   **Definición:** Un registro de un abono de dinero realizado contra un `Préstamo`.
    -   **Propósito:** Rastrear el progreso de la liquidación de un préstamo.

## 2. Reglas de Negocio Clave

### 2.1. Sistema de Comisiones de Asociados

-   **Regla 1 (Tasa por Defecto):** Cada `Asociado` tiene una `default_commission_rate` (tasa de comisión por defecto). Este es el porcentaje estándar que ganarán por un préstamo.
-   **Regla 2 (Anulación por Préstamo):** Al crear un `Préstamo`, la tasa de comisión se puede anular para ese préstamo específico. El valor del formulario se pre-rellena con la tasa por defecto del asociado, pero puede ser modificado por un usuario con permisos.
-   **Regla 3 (Inmutabilidad):** La `commission_rate` guardada en el `Préstamo` es la tasa final y contractual para ese préstamo. No cambia si la tasa por defecto del asociado se actualiza en el futuro.

### 2.2. Sistema de Niveles de Asociado

-   **Regla 1 (Niveles y Límites):** Cada entidad `Associate` tiene asignado un `level` (ej. Plata, Oro). Cada nivel tiene un `max_loan_amount` (límite de préstamo) asociado.
-   **Regla 2 (Validación de Límite):** Al crear un préstamo originado por un asociado, el sistema debe validar que el monto del préstamo no exceda el `max_loan_amount` del nivel de ese asociado.
-   **Regla 3 (Promoción de Nivel):** Existe un plan para desarrollar un sistema que pueda sugerir o automatizar la promoción de un asociado a un nivel superior basado en su rendimiento y buen comportamiento de pago.

### 2.3. Cálculo de Saldos de Préstamos

-   **Regla 1 (Saldo Pendiente - Lógica Actual):** El `outstanding_balance` (saldo pendiente) de un préstamo se calcula actualmente utilizando una **tabla de amortización teórica**.
    -   **Fórmula:** `Saldo Pendiente = (Monto de Cuota Teórica * Número Total de Cuotas) - Total Pagado`
    -   **Justificación:** Este método refleja con mayor precisión cuánto le queda por pagar al cliente según el plan original, incluyendo los intereses futuros.
-   **Regla 2 (Planes Futuros):** Esta lógica será refinada en el futuro para manejar escenarios más complejos como pagos adelantados, pagos atrasados y reestructuraciones. La lógica actual es la base para la versión inicial.

### 2.3. Ciclo de Vida de un Préstamo

Un préstamo tiene varios estados (`status`):
-   `pending`: El préstamo ha sido creado pero aún no está activo (fondos no desembolsados).
-   `active`: El préstamo está en curso y se esperan pagos.
-   `paid`: El préstamo ha sido liquidado en su totalidad.
-   `defaulted`: El préstamo ha caído en mora según las políticas de la empresa (lógica específica a definir).
