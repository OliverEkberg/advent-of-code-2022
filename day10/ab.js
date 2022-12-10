const fs = require('node:fs')

const rows = fs.readFileSync('data.txt', 'utf8').split('\n')

const WIDTH = 40
const HEIGHT = 6
const specificCycles = [20, 60, 100, 140, 180, 220]

const getRow = (cycle) => Math.floor(cycle / WIDTH) + 1
const getCol = (cycle) => cycle % WIDTH

let x = 1
let cycle = 0
let sum = 0

const litPixels = new Set()

const spritePos = (pos) => {
  return [pos, pos + 1, pos + 2]
}

const handleCycle = (cycle) => {
  // Part 1
  if (specificCycles.includes(cycle)) sum += x * cycle

  // Part 2
  const col = getCol(cycle)
  const row = getRow(cycle)

  if (spritePos(x).includes(col)) litPixels.add(`${row}-${col}`)
}

for (const row of rows) {
  cycle++
  handleCycle(cycle)

  if (row === 'noop') continue

  cycle++
  handleCycle(cycle)

  x += parseInt(row.split(' ')[1])
}

console.log('A', sum)

// Print CRT
for (let row = 1; row <= HEIGHT; row++) {
  let line = ''

  for (let col = 1; col <= WIDTH; col++) {
    line += litPixels.has(`${row}-${col}`) ? '#' : '.'
  }

  console.log(line)
}
