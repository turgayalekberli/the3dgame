// Функции сглаживания: принимают прогресс t от 0 до 1, возвращают «сглаженный» прогресс

// Быстро стартует, плавно замедляется
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) ** 2
}

// Как easeOut, но с небольшим перелётом за 1 и возвратом — «пружинка»
export function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}
