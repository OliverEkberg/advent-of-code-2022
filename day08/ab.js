const fs = require('node:fs')
const _ = require('lodash')

const rows = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n')
  .map((r) => r.split('').map((tree) => parseInt(tree)))

const score = (row, col) => {
  let up = 0
  for (let i = row - 1; i >= 0; i--) {
    up++
    if (rows[i][col] >= rows[row][col]) break
  }

  let down = 0
  for (let i = row + 1; i < rows.length; i++) {
    down++
    if (rows[i][col] >= rows[row][col]) break
  }

  let right = 0
  for (let i = col + 1; i < rows[row].length; i++) {
    right++
    if (rows[row][i] >= rows[row][col]) break
  }

  let left = 0
  for (let i = col - 1; i >= 0; i--) {
    left++
    if (rows[row][i] >= rows[row][col]) break
  }

  return up * down * right * left
}

const visibleFromOutside = (row, col) => {
  // On the edge
  if (row === 0 || col === 0 || row === rows.length - 1 || col === rows[row].length - 1)
    return true

  // up
  for (let i = 0; i < row; i++) {
    if (rows[i][col] >= rows[row][col]) break
    if (i === row - 1) return true
  }

  // down
  for (let i = row + 1; i < rows.length; i++) {
    if (rows[i][col] >= rows[row][col]) break
    if (i === rows.length - 1) return true
  }

  // right
  for (let i = col + 1; i < rows[row].length; i++) {
    if (rows[row][i] >= rows[row][col]) break
    if (i === rows[row].length - 1) return true
  }

  // left
  for (let i = 0; i < col; i++) {
    if (rows[row][i] >= rows[row][col]) break
    if (i === col - 1) return true
  }
}

let numVisibleFromOutside = 0
let maxScore = 0

for (let row = 0; row < rows.length; row++) {
  for (let col = 0; col < rows[row].length; col++) {
    if (visibleFromOutside(row, col)) numVisibleFromOutside++
    maxScore = Math.max(score(row, col), maxScore)
  }
}

console.log('A', numVisibleFromOutside)
console.log('B', maxScore)
