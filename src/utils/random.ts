export function randRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function randChance(chance: number) {
  return Math.random() <= chance
}
