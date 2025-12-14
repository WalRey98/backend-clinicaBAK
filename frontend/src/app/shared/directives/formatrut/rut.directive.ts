import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appRut]',
  standalone: true,
})
export class RutDirective {
  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event']) onInputChange(event: any) {
    let initialValue = this.ngControl.control?.value;

    // Limitar la entrada solo a caracteres válidos (números y K/k)
    initialValue = initialValue.replace(/[^0-9kK]/g, '').toUpperCase();

    // Verificar si el RUT es menor a 10 millones (los primeros dos dígitos menores a 10) y no tiene un "0" antepuesto
    if (parseInt(initialValue.slice(0, 2)) < 10 && !initialValue.startsWith('0') && initialValue.length >= 7) {
      initialValue = '0' + initialValue;
    }

    // Formatear el RUT con puntos y guion
    const formattedRut = this.formatRut(initialValue);
    this.ngControl.control?.setValue(formattedRut, { emitEvent: false });
  }

  formatRut(rut: string): string {
    // Eliminar caracteres no válidos y dejar solo números y 'K'
    rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();

    // Agregar el guion antes del dígito verificador
    if (rut.length > 1) {
      rut = rut.slice(0, -1) + '-' + rut.slice(-1);
    }

    // Insertar los puntos de separación de miles en el RUT
    // if (rut.length > 5) {
    //   rut = rut.slice(0, -5) + '.' + rut.slice(-5);
    // }
    // if (rut.length > 9) {
    //   rut = rut.slice(0, -9) + '.' + rut.slice(-9);
    // }

    return rut;
  }
}
