let start: number = 0

export function startTimer (): void {
  start = performance.now()
}

export function endTimer (funcName: string): void {
  const end = performance.now()
  console.log(`${funcName}() execution time: ${end - start} ms`)
}
