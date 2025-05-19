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
