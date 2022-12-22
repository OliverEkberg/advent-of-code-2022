const fs = require('node:fs')

const [strMap, strPath] = fs.readFileSync('data.txt', 'utf8').split('\n\n')

const toStr = ([x, y]) => `${x},${y}`

const grid = strMap.split('\n').map((row) => row.split(''))

const startY = 0
let startX = Infinity
let maxAxis = -Infinity
const originalMap = new Map()
for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[row].length; col++) {
    const cell = grid[row][col]
    if (cell === ' ') continue
    if (row === startY) startX = Math.min(startX, col)
    maxAxis = Math.max(maxAxis, row, col)
    originalMap.set(toStr([col, row]), cell)
  }
}

const path = []
for (const match of strPath.matchAll(/(\d+)([RL])?/g)) {
  const [, strNbr, rotateDir] = match
  path.push([Number(strNbr), rotateDir])
}

const rotateRight = ([dx, dy]) => {
  if (dx === 1) return [0, 1]
  if (dx === -1) return [0, -1]
  if (dy === 1) return [-1, 0]
  if (dy === -1) return [1, 0]
}

const rotateLeft = (dir) => {
  return rotateRight(rotateRight(rotateRight(dir)))
}

const add = ([x, y], [dx, dy]) => {
  return [x + dx, y + dy]
}

const valueDirection = ([dx, dy]) => {
  if (dx === 1) return 0
  if (dx === -1) return 2
  if (dy === 1) return 1
  if (dy === -1) return 3
}

const computePassword = (foldMap) => {
  const map = new Map(originalMap)
  let pos = [startX, startY]
  let direction = [1, 0]

  for (const [numSteps, rotateDir] of path) {
    for (let i = 0; i < numSteps; i++) {
      let nextPos = add(pos, direction)
      let nextDirection = direction

      // Out of bound
      if (!map.has(toStr(nextPos))) {
        const [dx, dy] = direction

        if (!foldMap) {
          if (dx === 1) {
            for (let col = 0; col < maxAxis; col++) {
              if (!map.has(toStr([col, nextPos[1]]))) continue
              nextPos = [col, nextPos[1]]
              break
            }
          }

          if (dx === -1) {
            for (let col = maxAxis; col >= 0; col--) {
              if (!map.has(toStr([col, nextPos[1]]))) continue
              nextPos = [col, nextPos[1]]
              break
            }
          }

          if (dy === 1) {
            for (let row = 0; row < maxAxis; row++) {
              if (!map.has(toStr([nextPos[0], row]))) continue
              nextPos = [nextPos[0], row]
              break
            }
          }

          if (dy === -1) {
            for (let row = maxAxis; row >= 0; row--) {
              if (!map.has(toStr([nextPos[0], row]))) continue
              nextPos = [nextPos[0], row]
              break
            }
          }
        } else {
          const [x, y] = nextPos
          if (dx === 1) {
            if (y > 49 && y < 100) {
              nextDirection = [0, -1]
              nextPos = [50 + y, 49]
            }
            if (y < 50) {
              nextDirection = [-1, 0]
              nextPos = [99, 149 - y]
            }
            if (y > 149 && y < 200) {
              nextDirection = [0, -1]
              nextPos = [y - 100, 149]
            }
            if (y > 99 && y < 150) {
              nextDirection = [-1, 0]
              nextPos = [149, 149 - y]
            }
          }

          if (dx === -1) {
            if (y < 50) {
              nextDirection = [1, 0]
              nextPos = [0, 149 - y]
            }
            if (y > 49 && y < 100) {
              nextDirection = [0, 1]
              nextPos = [y - 50, 100]
            }
            if (y > 99 && y < 150) {
              nextDirection = [1, 0]
              nextPos = [50, 149 - y]
            }
            if (y > 149 && y < 200) {
              nextDirection = [0, 1]
              nextPos = [y - 100, 0]
            }
          }

          if (dy === 1) {
            if (x < 50) {
              nextDirection = [0, 1]
              nextPos = [x + 100, 0]
            }
            if (x > 99 && x < 150) {
              nextDirection = [-1, 0]
              nextPos = [99, x - 50]
            }
            if (x > 49 && x < 100) {
              nextDirection = [-1, 0]
              nextPos = [49, x + 100]
            }
          }

          if (dy === -1) {
            if (x > 49 && x < 100) {
              nextDirection = [1, 0]
              nextPos = [0, x + 100]
            }
            if (x > 99 && x < 150) {
              nextDirection = [0, -1]
              nextPos = [x - 100, 199]
            }
            if (x < 50) {
              nextDirection = [1, 0]
              nextPos = [50, 50 + x]
            }
          }
        }
      }

      if (map.get(toStr(nextPos)) === '#') break
      direction = nextDirection
      pos = nextPos
    }

    if (rotateDir) {
      if (rotateDir === 'R') direction = rotateRight(direction)
      if (rotateDir === 'L') direction = rotateLeft(direction)
    }
  }

  return 1000 * (pos[1] + 1) + 4 * (pos[0] + 1) + valueDirection(direction)
}

console.log('A', computePassword(false), computePassword(false) === 26558)
console.log('B', computePassword(true), computePassword(true) === 110400)
