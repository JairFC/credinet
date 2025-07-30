
import re

def generate_curp(first_name, last_name, maternal_last_name, birth_date, gender, birth_state):
    # Lógica de generación de CURP (simplificada)
    # Esta es una implementación de ejemplo y puede no ser 100% precisa
    # para todos los casos borde, pero cubre la estructura básica.

    # 1. Primera letra del primer apellido
    curp = last_name[0]

    # 2. Primera vocal interna del primer apellido
    for char in last_name[1:]:
        if char in 'AEIOU':
            curp += char
            break

    # 3. Primera letra del segundo apellido
    curp += maternal_last_name[0] if maternal_last_name else 'X'

    # 4. Primera letra del nombre
    curp += first_name[0]

    # 5. Fecha de nacimiento (AAMMDD)
    curp += birth_date.strftime('%y%m%d')

    # 6. Sexo
    curp += 'H' if gender.upper() == 'HOMBRE' else 'M'

    # 7. Clave de la entidad federativa
    # (Aquí se necesitaría un mapa de estados a claves)
    # Por ahora, usaremos las dos primeras letras del estado
    curp += birth_state[:2].upper()

    # 8. Primera consonante interna del primer apellido
    for char in last_name[1:]:
        if char not in 'AEIOU':
            curp += char
            break

    # 9. Primera consonante interna del segundo apellido
    if maternal_last_name:
        for char in maternal_last_name[1:]:
            if char not in 'AEIOU':
                curp += char
                break
    else:
        curp += 'X'

    # 10. Primera consonante interna del nombre
    for char in first_name[1:]:
        if char not in 'AEIOU':
            curp += char
            break

    # 11. Homoclave y dígito verificador (simplificado)
    curp += '01'

    return curp.upper()
