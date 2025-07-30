export function generateCurp({ nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, sexo, estadoNacimiento }) {
    const getVocal = (str) => {
        for (let i = 1; i < str.length; i++) {
            if ('AEIOU'.includes(str[i].toUpperCase())) return str[i];
        }
        return 'X';
    };

    const getConsonante = (str) => {
        for (let i = 1; i < str.length; i++) {
            if (!'AEIOU'.includes(str[i].toUpperCase())) return str[i];
        }
        return 'X';
    };

    const normalizar = (str) => {
        if (!str) return 'X';
        const conAcentos = "ÁÉÍÓÚÜ";
        const sinAcentos = "AEIOUU";
        for (let i = 0; i < conAcentos.length; i++) {
            str = str.replace(new RegExp(conAcentos[i], 'gi'), sinAcentos[i]);
        }
        return str.toUpperCase();
    };

    const estados = {
        'AGUASCALIENTES': 'AS', 'BAJA CALIFORNIA': 'BC', 'BAJA CALIFORNIA SUR': 'BS',
        'CAMPECHE': 'CC', 'COAHUILA': 'CL', 'COLIMA': 'CM', 'CHIAPAS': 'CS',
        'CHIHUAHUA': 'CH', 'DISTRITO FEDERAL': 'DF', 'DURANGO': 'DG',
        'GUANAJUATO': 'GT', 'GUERRERO': 'GR', 'HIDALGO': 'HG', 'JALISCO': 'JC',
        'MEXICO': 'MC', 'MICHOACAN': 'MN', 'MORELOS': 'MS', 'NAYARIT': 'NT',
        'NUEVO LEON': 'NL', 'OAXACA': 'OC', 'PUEBLA': 'PL', 'QUERETARO': 'QT',
        'QUINTANA ROO': 'QR', 'SAN LUIS POTOSI': 'SP', 'SINALOA': 'SL',
        'SONORA': 'SR', 'TABASCO': 'TC', 'TAMAULIPAS': 'TS', 'TLAXCALA': 'TL',
        'VERACRUZ': 'VZ', 'YUCATAN': 'YN', 'ZACATECAS': 'ZS', 'NACIDO EN EL EXTRANJERO': 'NE'
    };

    nombre = normalizar(nombre);
    apellidoPaterno = normalizar(apellidoPaterno);
    apellidoMaterno = normalizar(apellidoMaterno || 'X');

    let curp = '';
    curp += apellidoPaterno.charAt(0);
    curp += getVocal(apellidoPaterno);
    curp += apellidoMaterno.charAt(0);
    curp += nombre.charAt(0);

    const [year, month, day] = fechaNacimiento.split('-');
    curp += year.substring(2);
    curp += month;
    curp += day;

    curp += sexo === 'HOMBRE' ? 'H' : 'M';
    curp += estados[estadoNacimiento];

    curp += getConsonante(apellidoPaterno);
    curp += getConsonante(apellidoMaterno);
    curp += getConsonante(nombre);

    // Placeholder for homoclave - real calculation is complex
    curp += '00';

    return curp;
}