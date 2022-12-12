const fs = require('node:fs')
const _ = require('lodash')

const grid = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n')
  .map((r) => r.split(''))

let ERow = null
let ECol = null
let SRow = null
let SCol = null

for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[row].length; col++) {
    if (grid[row][col] === 'E') {
      grid[row][col] = 'z'
      ERow = row
      ECol = col
    } else if (grid[row][col] === 'S') {
      grid[row][col] = 'a'
      SRow = row
      SCol = col
    }
  }
}

const canMove = (from, to) => {
  return to.charCodeAt(0) - from.charCodeAt(0) <= 1
}

const toStr = (row, col) => `${row}-${col}`
const fromStr = (str) => str.split('-').map(Number)

const directions = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

const dijkstra = (startRow, startCol) => {
  const nodes = new Map()
  const start = toStr(startRow, startCol)
  nodes.set(start, { distance: 0, from: null })

  const pq = [start]

  while (pq.length > 0) {
    const from = pq.pop()
    const [fromRow, fromCol] = fromStr(from)

    for (const [dRow, dCol] of directions) {
      const row = fromRow + dRow
      const col = fromCol + dCol

      const cell = grid?.[row]?.[col]

      if (!cell) continue

      const to = toStr(row, col)
      if (!nodes.has(to)) nodes.set(to, { distance: Infinity, from: null })

      const toNode = nodes.get(to)
      const fromNode = nodes.get(from)

      if (canMove(cell, grid[fromRow][fromCol]) && toNode.distance > fromNode.distance + 1) {
        toNode.distance = fromNode.distance + 1
        toNode.from = from

        // This could be optimized with binary search
        let added = false
        for (let idx = 0; idx < pq.length; idx++) {
          if (toNode.distance > nodes.get(pq[idx]).distance) {
            pq.splice(idx, 0, to)
            added = true
            break
          }
        }
        if (!added) pq.push(to)
      }
    }
  }

  return nodes
}

const nodes = dijkstra(ERow, ECol)
console.log('A', nodes.get(toStr(SRow, SCol)).distance)

let minDistance = Infinity

for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[row].length; col++) {
    if (grid[row][col] === 'a') {
      const distance = nodes.get(toStr(row, col))?.distance
      if (!distance) continue
      minDistance = Math.min(minDistance, distance)
    }
  }
}

console.log('B', minDistance)
