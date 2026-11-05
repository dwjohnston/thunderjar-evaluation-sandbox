/** Round fractional cents to whole cents. See SPEC.md. */
export function roundCents(x) {
  const whole = Math.floor(x);
  const frac = x - whole;
  if (frac > 0.5) return whole + 1;
  if (frac < 0.5) return whole;
  return whole % 2 === 0 ? whole : whole + 1;
}

// TODO: discount(cents, percent) — see SPEC.md
