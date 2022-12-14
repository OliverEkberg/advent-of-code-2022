const fs = require('node:fs')

const toStr = ([x, y]) => `${x},${y}`
const fromStr = (str) => str.split(',').map(Number)

const rows = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n')
  .map((r) => r.split(' -> ').map((c) => fromStr(c)))

const grid = new Map()

for (const coords of rows) {
  for (let i = 1; i < coords.length; i++) {
    const from = coords[i - 1]
    const to = coords[i]

    // It only ever changes at once axis
    const cAxis = from[0] !== to[0] ? 0 : 1
    const d = Math.sign(to[cAxis] - from[cAxis])

    for (let s = from[cAxis]; s !== to[cAxis] + d; s += d) {
      const newCoord = [...from]
      newCoord[cAxis] = s

      grid.set(toStr(newCoord), '#')
    }
  }
}

const nextMove = (grid, x, y, iter = 0) => {
  // We could also just reach stack overflow, but 3000 recursions should suffice
  if (iter > 3000) return false
  if (!grid.has(toStr([x, y + 1]))) return nextMove(grid, x, y + 1, iter + 1)
  if (!grid.has(toStr([x - 1, y + 1]))) return nextMove(grid, x - 1, y + 1, iter + 1)
  if (!grid.has(toStr([x + 1, y + 1]))) return nextMove(grid, x + 1, y + 1, iter + 1)

  return [x, y]
}

const run = (grid) => {
  let i = 1
  while (true) {
    const atRest = nextMove(grid, 500, 0)
    if (!atRest) return i - 1

    if (atRest[0] === 500 && atRest[1] === 0) {
      return i
    }

    grid.set(toStr(atRest), '+')
    i++
  }
}

// Part 1
const gridA = new Map(grid)

console.log('A', run(gridA))

// Part 2
const gridB = new Map(grid)

const floorY = Math.max(...[...gridB.keys()].map((c) => fromStr(c)[1])) + 2

// Easiest way to simulate the infinite floor in this case is to add a really long one
const FLOOR_RADIUS = 10_000
for (let x = -FLOOR_RADIUS; x <= FLOOR_RADIUS; x++) {
  gridB.set(toStr([x, floorY]), '#')
}

console.log('B', run(gridB))
