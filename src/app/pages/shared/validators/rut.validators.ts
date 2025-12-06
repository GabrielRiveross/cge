import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Normaliza: quita puntos/guiones y retorna [numero, dv]
function splitRut(raw: string): { num: string; dv: string } | null {
  if (!raw) return null;
  const clean = raw.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
  if (clean.length < 2) return null;
  const num = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(num)) return null;
  return { num, dv };
}

function computeDV(num: string): string {
  let s = 0, m = 2;
  for (let i = num.length - 1; i >= 0; i--) {
    s += parseInt(num[i], 10) * m;
    m = m === 7 ? 2 : m + 1;
  }
  const r = 11 - (s % 11);
  if (r === 11) return '0';
  if (r === 10) return 'K';
  return String(r);
}

export function rutPersonaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value as string;
    if (!raw) return null;
    const parts = splitRut(raw);
    if (!parts) return { rutInvalido: true };
    const dvCalc = computeDV(parts.num);
    return dvCalc === parts.dv ? null : { rutInvalido: true };
  };
}

// Helper para mostrar bonito: 12345678K → 12.345.678-K
export function formatRut(raw: string): string {
  const parts = splitRut(raw);
  if (!parts) return raw;
  const n = parts.num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${n}-${parts.dv}`;
}
