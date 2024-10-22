export const getRandomElement = <T>(array: T[]) => {
  if (array.length === 0) {
    throw new Error('Unexpected empty array')
  }

  return array[Math.floor(Math.random() * array.length)]
}
