import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function checkEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(control.value);
    return isValid ? null : { invalidEmail: true };
  };
}

export function noSpacesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasSpace = /\s/.test(control.value);
    return hasSpace ? { containsSpace: true } : null;
  };
}

//info - Duże i male Litery
//info - cyfry
//info - znaki specjalne
//info - minimum 12 znaków

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';
    const isValid =
      value.length >= 12 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /\d/.test(value) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(value);

    return isValid ? null : { weakPassword: true };
  };
}

export function spaceAndSpecialCharValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null;

    const hasSpaces = /\s/.test(value);
    const hasSpecialChars = /[^a-zA-Z0-9]/.test(value);

    if (hasSpaces) {
      return { hasSpaces: true };
    }

    if (hasSpecialChars) {
      return { hasSpecialChars: true };
    }

    return null;
  };
}

export function noNumbersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value && /\d/.test(value)) {
      return { hasNumber: true };
    }
    return null;
  };
}

//Info - Tylko  godziny zakończone :00 lub :30
export function fullOrHalfHourValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    let date: Date;
    try {
      date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return { invalidDate: true };
    } catch {
      return { invalidDate: true };
    }

    const minutes = date.getMinutes();
    return minutes === 0 || minutes === 30 ? null : { notFullOrHalfHour: true };
  };
}

//Info - Sprawdza czy czas rozpoczęcia jest różny od czasu zakończenia
export function startNotEqualEndTimeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return startDate.getTime() === endDate.getTime()
      ? { sameStartEndTime: true }
      : null;
  };
}

//Info - Sprawdza czy czas zakończenia jest późniejszy niż czas rozpoczęcia
export function endAfterStartTimeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;

    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);

    return endDate.getTime() <= startDate.getTime()
      ? { endBeforeStart: true }
      : null;
  };
}
