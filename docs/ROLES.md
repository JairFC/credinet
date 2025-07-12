# Descripción de Roles y Permisos

Este documento detalla los roles de usuario en el sistema Credinet y los permisos asociados a cada uno.

## Resumen de Roles

| Rol                       | Propósito                                                                 | Acceso Principal                                                              |
|---------------------------|---------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| `desarrollador`           | Acceso total al sistema para fines de desarrollo y depuración.            | Todas las rutas y funcionalidades, sin restricciones.                         |
| `administrador`           | Rol principal para la gestión del negocio. Tiene control casi total.      | CRUD completo de Asociados, Clientes, Préstamos y Usuarios.                   |
| `auxiliar_administrativo` | Apoyo al administrador con permisos elevados pero restringidos.           | Puede crear y editar, pero no eliminar entidades críticas como los Asociados. |
| `asociado`                | Usuario externo (de una empresa asociada) con acceso de solo lectura.     | Puede ver la información de sus propios préstamos y clientes, pero no editar. |

---

## Permisos Detallados

### `desarrollador`
- **Acceso Total:** Puede realizar cualquier acción que los demás roles pueden hacer. Este rol omite todas las comprobaciones de permisos y está destinado únicamente para desarrollo.

### `administrador`
- **Usuarios:** CRUD completo (Crear, Leer, Actualizar, Eliminar) sobre todos los usuarios.
- **Asociados:** CRUD completo.
- **Clientes:** CRUD completo.
- **Préstamos:** CRUD completo.
- **Pagos:** CRUD completo.
- **Dashboard:** Vista completa con todos los resúmenes.

### `auxiliar_administrativo`
- **Usuarios:** No tiene acceso a la gestión de usuarios.
- **Asociados:** Puede Crear, Leer y Actualizar asociados. **No puede eliminar asociados.**
- **Clientes:** CRUD completo.
- **Préstamos:** CRUD completo.
- **Pagos:** CRUD completo.
- **Dashboard:** Vista completa con todos los resúmenes.
- **Lógica de confirmación:** Este rol está pensado para ser un segundo par de ojos en operaciones delicadas, aunque la lógica de "confirmación" como tal no está implementada aún.

### `asociado`
- **Usuarios:** No tiene acceso.
- **Asociados:** Solo puede ver la información del asociado al que pertenece (lógica futura). Actualmente puede ver la lista de todos los asociados.
- **Clientes:** Solo puede ver los clientes asociados a los préstamos que ha originado (lógica futura).
- **Préstamos:** Solo puede ver los préstamos que ha originado. No puede crear, editar ni eliminar.
- **Pagos:** Solo puede ver los pagos de los préstamos que ha originado.
- **Dashboard:** Vista limitada a su propia actividad (lógica futura).
