import { expect, test } from "bun:test";

// The prompt doesn't name the export, so a default export counts too, as it did in the old template.
const subject: { isPrime?: (n: number) => boolean; default?: (n: number) => boolean } = await import(
  Bun.env.THUNDERJAR_SUBJECT ?? "./isPrime.reference.ts"
);
const isPrime = subject.isPrime ?? subject.default!;

test("2 is prime", () => expect(isPrime(2)).toBe(true));
test("17 is prime", () => expect(isPrime(17)).toBe(true));
test("15 is not prime", () => expect(isPrime(15)).toBe(false));
test("0 is not prime", () => expect(isPrime(0)).toBe(false));
test("1 is not prime", () => expect(isPrime(1)).toBe(false));
