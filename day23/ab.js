const fs = require('node:fs')

const grid = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n')
  .map((r) => r.split(''))

const toStr = ([x, y]) => `${x},${y}`
const fromStr = (str) => str.split(',').map(Number)

let state = new Set()
for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[row].length; col++) {
    if (grid[row][col] === '#') state.add(toStr([col, row]))
  }
}

const N = [0, -1]
const NE = [1, -1]
const E = [1, 0]
const SE = [1, 1]
const S = [0, 1]
const SW = [-1, 1]
const W = [-1, 0]
const NW = [-1, -1]

const ALL_DIRS = [N, NW, W, SW, S, SE, E, NE]

// [direction to move, [directions to check]]
const MOVE_DIRS = [
  [N, [N, NE, NW]],
  [S, [S, SE, SW]],
  [W, [NW, W, SW]],
  [E, [E, NE, SE]],
]

const add = ([x, y], [dx, dy]) => {
  return [x + dx, y + dy]
}

const allDirectionsFree = (pos, directions, state) => {
  return directions
    .map((dir) => add(pos, dir))
    .map((coord) => toStr(coord))
    .every((strCoord) => !state.has(strCoord))
}

const computePart1 = (state) => {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const coord of state) {
    const [x, y] = fromStr(coord)
    minX = Math.min(x, minX)
    minY = Math.min(y, minY)
    maxX = Math.max(x, maxX)
    maxY = Math.max(y, maxY)
  }

  return (maxX - minX + 1) * (maxY - minY + 1) - state.size
}

const part1Rounds = 10
let startMoveIdx = 0

let round = 0
while (true) {
  round++
  const wantedMoves = new Map()

  for (const pos of state) {
    const [x, y] = fromStr(pos)

    if (allDirectionsFree([x, y], ALL_DIRS, state)) continue

    for (let moveIdx = startMoveIdx; moveIdx < startMoveIdx + MOVE_DIRS.length; moveIdx++) {
      const [move, checks] = MOVE_DIRS[moveIdx % MOVE_DIRS.length]

      if (allDirectionsFree([x, y], checks, state)) {
        const movePos = add([x, y], move)
        const movePosStr = toStr(movePos)

        if (!wantedMoves.has(movePosStr)) wantedMoves.set(movePosStr, [])
        wantedMoves.get(movePosStr).push(pos)
        break
      }
    }
  }

  if (wantedMoves.size === 0) {
    console.log('B', round)
    process.exit(0)
  }

  state = new Set(state)
  for (const [pos, wants] of wantedMoves.entries()) {
    if (wants.length > 1) continue
    state.add(pos)
    state.delete(wants[0])
  }

  startMoveIdx = (startMoveIdx + 1) % MOVE_DIRS.length

  if (part1Rounds === round) {
    console.log('A', computePart1(state))
  }
}
