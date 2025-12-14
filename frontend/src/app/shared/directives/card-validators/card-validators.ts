import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validador personalizado para número de tarjeta
export function cardNumberValidator(control: AbstractControl): ValidationErrors | null {
  const numeroTarjeta = control.value.replace(/\s+/g, ''); // Elimina espacios

  if (!/^\d{13,19}$/.test(numeroTarjeta)) {  // Verifica que tenga entre 13 y 19 dígitos
    return { invalidLength: true };
  }

  if (!luhnCheck(numeroTarjeta)) {
    return { invalidCardNumber: true };
  }

  return null;
}

// Función para realizar la verificación del algoritmo de Luhn
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function detectCardType(numeroTarjeta: string): string {
    const number = numeroTarjeta.replace(/\s+/g, ''); // Elimina espacios
  
    if (/^4[0-9]{0,}$/.test(number)) return 'Visa';
    if (/^5[1-5][0-9]{0,}$/.test(number)) return 'MasterCard';
    if (/^3[47][0-9]{0,}$/.test(number)) return 'Amex';
    if (/^6(?:011|5[0-9]{2})[0-9]{0,}$/.test(number)) return 'Discover';
    if (/^3(?:0[0-5]|[68][0-9])[0-9]{4,}$/.test(number)) return 'Diners Club';
    if (/^(?:2131|1800|35\d{3})\d{11}$/.test(number)) return 'JCB';
    
    return 'Unknown';
  }

  export function cvvValidator(control: AbstractControl): ValidationErrors | null {
    const cvv = control.value;
    if (!/^\d{3,4}$/.test(cvv)) {
      return { invalidCvv: true };
    }
    return null;
  }

  export function expirationDateValidator(control: AbstractControl): ValidationErrors | null {
    const [month, year] = control.value.split('/').map((val: string) => parseInt(val, 10));
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear() % 100; // Obtener el año en formato de dos dígitos
  
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { expired: true };
    }
    if (month < 1 || month > 12) {
      return { invalidMonth: true };
    }
  
    return null;
  }

  export function formatCardNumber(numeroTarjeta: string): string {
    return numeroTarjeta.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
  }

  