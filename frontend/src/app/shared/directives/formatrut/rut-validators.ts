import { AbstractControl, ValidationErrors } from '@angular/forms';

export function validarRutChileno(control: AbstractControl): { [key: string]: any } | null {
    const rut = control.value;
    if (!rut) return null;
  
    const rutClean = rut.replace(/\./g, '').replace('-', '');
  
    const cuerpo = rutClean.slice(0, -1);
    const dv = rutClean.slice(-1).toUpperCase();
  
    // Verificar si el cuerpo contiene todos los dígitos iguales
    if (/^(\d)\1+$/.test(cuerpo)) {
      return { rutInvalido: true }; // RUT inválido por contener todos los dígitos iguales
    }
  
    if (cuerpo.length < 7 || !/^\d+$/.test(cuerpo)) {
      return { rutInvalido: true };
    }
  
    let suma = 0;
    let multiplo = 2;
  
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
  
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
  
    return dvCalculado === dv ? null : { rutInvalido: true };
  }