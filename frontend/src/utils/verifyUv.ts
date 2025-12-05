export function verifyUv(index: number): string {
  if (index < 0 || index > 15 || !Number.isInteger(index)) return "Índice UV inválido";

  if (index <= 2) return "Aproveite o sol!";
  if (index <= 5) return "Use proteção!";
  if (index <= 7) return "Proteção obrigatória!";
  if (index <= 10) return "Fique na sombra!";
  return "Evite sair!";
}