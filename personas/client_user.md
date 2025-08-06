# Persona: Cliente Usuario

Este documento define el perfil y la experiencia esperada para un cliente final que utiliza el portal de Credinet.

## 1. Misión Principal

Consultar de forma autónoma y clara la información sobre sus préstamos y pagos, mejorando la transparencia y reduciendo la necesidad de contactar a soporte.

## 2. Perfil del Usuario

-   Es un cliente de Credinet con al menos un préstamo (activo o histórico).
-   Tiene conocimientos básicos de navegación web.
-   Busca autoservicio y acceso rápido a su información financiera.

## 3. Funcionalidades Clave (Experiencia de Usuario)

Cuando un usuario con el rol `cliente` inicie sesión, deberá tener acceso a un portal personalizado con las siguientes características:

### 3.1. Dashboard del Cliente

-   **Vista Principal:** Un resumen claro y conciso de su situación financiera con Credinet.
-   **Widgets/Tarjetas de Información:**
    -   **Préstamos Activos:** Un número grande mostrando cuántos préstamos tiene actualmente en curso.
    -   **Deuda Total Pendiente:** La suma de los `outstanding_balance` de todos sus préstamos activos.
    -   **Próximo Pago:** La fecha y el monto de su próximo pago más cercano.
    -   **Últimos Pagos Realizados:** Una pequeña lista con sus 3-5 pagos más recientes.
-   **Navegación:** Enlaces claros para ir a "Mis Préstamos" y "Mi Perfil".

### 3.2. Página "Mis Préstamos"

-   **Lista de Préstamos:** Una tabla o lista de tarjetas, cada una representando un préstamo que ha tenido.
    -   **Información por Préstamo:** ID del préstamo, monto original, estado (`active`, `paid`), y saldo pendiente.
    -   **Acciones:** Un botón o enlace en cada préstamo para "Ver Detalles".

### 3.3. Página "Detalle del Préstamo"

-   **Información Completa:** Todos los detalles del préstamo seleccionado (monto, tasa, plazo, etc.).
-   **Historial de Pagos:** Una tabla con todos los pagos realizados para ese préstamo (fecha y monto).
-   **Tabla de Amortización:** La tabla de amortización completa para que pueda ver el desglose de capital e intereses de cada cuota.

### 3.4. Página "Mi Perfil"

-   **Visualización:** Ver su información personal (nombre, email de contacto).
-   **Edición (Futuro):** En una futura versión, podría permitirle actualizar su información de contacto.

## 4. Restricciones de Acceso

-   **Aislamiento Total:** Un cliente **NUNCA** debe poder ver información que no sea estrictamente suya. No puede acceder a datos de otros clientes, asociados, o información interna del sistema.
-   **Solo Lectura:** Inicialmente, todas las vistas son de solo lectura. No puede crear, modificar ni eliminar registros.
