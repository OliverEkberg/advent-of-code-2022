const fs = require('node:fs')
const _ = require('lodash')

const rows = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n')
  .map((r) => r.split(' '))

const runMotions = (numKnots) => {
  const positions = new Set()
  const visitPos = ({ x, y }) => positions.add(`${x},${y}`)

  const rope = []
  while (rope.length < numKnots) rope.push({ x: 0, y: 0 })

  const head = rope.at(0)
  const tail = rope.at(-1)
  visitPos(tail)

  for (const [direction, strSteps] of rows) {
    const steps = Number(strSteps)

    for (let step = 0; step < steps; step++) {
      for (let knotIdx = 0; knotIdx < rope.length; knotIdx++) {
        const curr = rope[knotIdx]
        const prev = curr === head ? null : rope[knotIdx - 1]

        // Head moves, rest follows
        if (curr === head) {
          if (direction === 'R') curr.x = curr.x + 1
          if (direction === 'L') curr.x = curr.x - 1
          if (direction === 'U') curr.y = curr.y - 1
          if (direction === 'D') curr.y = curr.y + 1

          continue
        }

        const dx = prev.x - curr.x
        const dy = prev.y - curr.y

        // Equal or adjacent pos requires no move
        if (Math.max(Math.abs(dx), Math.abs(dy)) <= 1) continue

        curr.x = curr.x + Math.sign(dx)
        curr.y = curr.y + Math.sign(dy)

        if (curr === tail) visitPos(tail)
      }
    }
  }

  return positions.size
}

console.log('A', runMotions(2))
console.log('B', runMotions(10))
