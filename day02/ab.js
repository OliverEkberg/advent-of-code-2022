const fs = require('node:fs')
const _ = require('lodash')

const rows = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n')
  .map((r) => r.split(' '))

const ROCK = 'r'
const PAPER = 'p'
const SCISSORS = 's'

const translate = {
  A: ROCK,
  X: ROCK,
  B: PAPER,
  Y: PAPER,
  C: SCISSORS,
  Z: SCISSORS,
}

const typeToPoints = {
  [ROCK]: 1,
  [PAPER]: 2,
  [SCISSORS]: 3,
}

// input beats output
const beats = {
  [ROCK]: SCISSORS,
  [PAPER]: ROCK,
  [SCISSORS]: PAPER,
}

// reverse beats, needed for part b
const looses = _.invert(beats)

const calcScore = (strategy) => {
  let total = 0
  for (const [op, me] of strategy) {
    // Points based on my selection
    total += typeToPoints[me]

    // Points based on outcome
    if (me === op) total += 3
    else if (beats[me] === op) total += 6
    // else op win, 0 points
  }

  return total
}

const strategyA = rows.map(([op, me]) => [translate[op], translate[me]])

const strategyB = strategyA.map(([op, me]) => {
  if (me === ROCK) return [op, beats[op]] // loose
  if (me === PAPER) return [op, op] // draw
  if (me === SCISSORS) return [op, looses[op]] // win
})

console.log('A', calcScore(strategyA))
console.log('B', calcScore(strategyB))
