const fs = require('node:fs')

const inputGrid = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n')
  .map((row) => row.split(''))

const add = ([x, y], [dx, dy]) => {
  return [x + dx, y + dy]
}

const toStr = ([x, y]) => `${x},${y}`
const fromStr = (str) => str.split(',').map(Number)

const arrowToDelta = {
  '>': [1, 0],
  v: [0, 1],
  '<': [-1, 0],
  '^': [0, -1],
}

const minX = 0
const minY = 0
const maxX = inputGrid[0].length - 1
const maxY = inputGrid.length - 1

const startPos = [1, 0]
const endPos = [maxX - 1, maxY]

const blizzards = new Map()

const potentiallyFreePos = new Set()

for (let row = minY + 1; row < maxY; row++) {
  for (let col = minX + 1; col < maxX; col++) {
    const strCoord = toStr([col, row])
    const cell = inputGrid[row][col]

    potentiallyFreePos.add(strCoord)
    if (cell !== '.') {
      blizzards.set(strCoord, [arrowToDelta[cell]])
    }
  }
}

potentiallyFreePos.add(toStr(startPos))
potentiallyFreePos.add(toStr(endPos))

const moveBlizzards = (blizzards) => {
  const newBlizzards = new Map()

  for (const [strCoord, directions] of blizzards.entries()) {
    const coord = fromStr(strCoord)

    for (const direction of directions) {
      const newCoord = add(coord, direction)

      if (newCoord[0] === maxX) newCoord[0] = minX + 1
      if (newCoord[0] === minX) newCoord[0] = maxX - 1
      if (newCoord[1] === maxY) newCoord[1] = minY + 1
      if (newCoord[1] === minY) newCoord[1] = maxY - 1

      const newStrCoord = toStr(newCoord)

      if (!newBlizzards.has(newStrCoord)) newBlizzards.set(newStrCoord, [])
      newBlizzards.get(newStrCoord).push(direction)
    }
  }

  return newBlizzards
}

const possibleMoves = ([x, y], freePos) => {
  const candidates = [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
    [x, y],
  ]

  return candidates.filter((candidate) => freePos.has(toStr(candidate)))
}

// idx => minute, value => free positions at that minute
const freePosPerMin = []

// Assume 1000 minutes will be enough
const MAX_MIN = 1000

let blizzardPositions = blizzards
for (let minute = 0; minute < MAX_MIN; minute++) {
  const freePos = new Set(potentiallyFreePos)

  for (const strCoord of blizzardPositions.keys()) {
    freePos.delete(strCoord)
  }

  freePosPerMin.push(freePos)
  blizzardPositions = moveBlizzards(blizzardPositions)
}

const shortestPath = (from, to, startMinute) => {
  let lastMinPos = [from]

  for (let minute = startMinute; minute < freePosPerMin.length; minute++) {
    let thisMinPos = new Set()

    for (const pos of lastMinPos) {
      const moves = possibleMoves(pos, freePosPerMin[minute])

      for (const move of moves) {
        if (move[0] === to[0] && move[1] === to[1]) {
          return minute
        }

        thisMinPos.add(toStr(move))
      }
    }

    lastMinPos = [...thisMinPos].map((strPos) => fromStr(strPos))
  }
}

const trip1 = shortestPath(startPos, endPos, 0)
const trip2 = shortestPath(endPos, startPos, trip1)
const trip3 = shortestPath(startPos, endPos, trip2)

console.log('A', trip1)
console.log('B', trip3)
