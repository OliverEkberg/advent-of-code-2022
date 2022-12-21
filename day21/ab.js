const fs = require('node:fs')

const rows = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n')
  .map((r) => r.split(': '))

const root = 'root'
const you = 'humn'

let memo = new Map()
const expressions = new Map()

for (const [m, o] of rows) {
  if (Number.isSafeInteger(parseInt(o))) {
    memo.set(m, parseInt(o))
  } else {
    const [op1, operator, op2] = o.split(' ')
    expressions.set(m, [op1, op2, (a, b) => eval(`a ${operator} b`), operator])
  }
}

const containsMap = new Map()
const contains = (node, value) => {
  if (containsMap.has(node)) return containsMap.get(node)

  if (node === value) {
    containsMap.set(node, true)
    return true
  }

  if (memo.has(node)) {
    containsMap.set(node, false)
    return false
  }

  const [op1, op2] = expressions.get(node)

  const val = contains(op1, value) || contains(op2, value)
  containsMap.set(node, val)
  return val
}

const recurse = (node, targetValue) => {
  if (memo.has(node)) return memo.get(node)
  if (node === you) {
    memo.set(you, targetValue)
    return targetValue
  }

  const [op1, op2, apply, operator] = expressions.get(node)

  if (contains(op1, you)) {
    const valueOther = recurse(op2)

    let valueThis
    if (operator === '+') {
      valueThis = targetValue - valueOther
    }
    if (operator === '-') {
      valueThis = targetValue + valueOther
    }
    if (operator === '*') {
      valueThis = targetValue / valueOther
    }
    if (operator === '/') {
      valueThis = targetValue * valueOther
    }

    recurse(op1, valueThis)
  }

  if (contains(op2, you)) {
    const valueOther = recurse(op1)

    let valueThis
    if (operator === '+') {
      valueThis = targetValue - valueOther
    }
    if (operator === '-') {
      valueThis = -1 * (targetValue - valueOther)
    }
    if (operator === '*') {
      valueThis = targetValue / valueOther
    }
    if (operator === '/') {
      valueThis = valueOther / targetValue
    }

    recurse(op2, valueThis)
  }

  memo.set(node, apply(recurse(op1), recurse(op2)))
  return memo.get(node)
}

const memoSave = new Map(memo)
console.log('A', recurse(root))
memo = new Map(memoSave)

memo.delete(you)

let leaf
let targetValue

const [leaf1, leaf2] = expressions.get(root)

if (contains(leaf1, you)) {
  leaf = leaf1
  targetValue = recurse(leaf2)
} else {
  leaf = leaf2
  targetValue = recurse(leaf1)
}

recurse(leaf, targetValue)

console.log('B', memo.get(you))
