const fs = require('node:fs')

let [stacksInput, proInput] = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n\n')
  .map((input) => input.split('\n'))

const stacks = new Map()

let stackId = 1
for (let col = 0; col < stacksInput[0].length; col += 4) {
  for (const row of stacksInput) {
    if (row[col] === '[') {
      if (!stacks.has(stackId)) stacks.set(stackId, [])
      stacks.get(stackId).push(row[col + 1])
    }
  }
  stackId++
}

const runProcedure = (stacks, maxStackId, procedure, moveMultiple) => {
  for (const row of procedure) {
    const [, num, , from, , to] = row.split(' ').map(Number)

    const fromStack = stacks.get(from)
    const toStack = stacks.get(to)

    const toMove = []
    for (let i = 0; i < num; i++) {
      toMove.push(fromStack.shift())
    }

    if (!moveMultiple) toMove.reverse()
    toStack.unshift(...toMove)
  }

  let res = ''
  for (let i = 1; i <= maxStackId; i++) {
    res += stacks.get(i).shift()
  }

  return res
}

const stacksA = stacks
const stacksB = new Map()

// Manually copy stacks for B as we mutate it
for (const [key, value] of stacksA.entries()) {
  stacksB.set(key, [...value])
}

console.log('A', runProcedure(stacksA, stackId - 1, proInput, false))
console.log('B', runProcedure(stacksB, stackId - 1, proInput, true))
