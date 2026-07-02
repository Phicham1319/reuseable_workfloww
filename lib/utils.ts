export type ClassValue = string | number | null | false | undefined | ClassValue[];

/** เบา ๆ แทน clsx — join className ที่ truthy (รองรับ nested array) */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const i of inputs) {
    if (!i) continue;
    if (Array.isArray(i)) {
      const s = cn(...i);
      if (s) out.push(s);
    } else {
      out.push(String(i));
    }
  }
  return out.join(" ");
}
