const fs = require('node:fs')

const rows = fs.readFileSync('data.txt', 'utf8').split('\n').map(Number)

const mix = (numbers, times) => {
  const lookupTable = new Map()

  for (let i = 0; i < numbers.length; i++) {
    lookupTable.set(i, numbers[i])
  }

  for (let round = 0; round < times; round++) {
    for (let i = 0; i < rows.length; i++) {
      const curr = lookupTable.get(i)

      if (curr.value % rows.length === 0) continue

      const idx = numbers.indexOf(curr)
      numbers.splice(idx, 1)
      numbers.splice((idx + curr.value) % numbers.length, 0, curr)
    }
  }
}

const sumGroove = (numbers) => {
  let sum = 0
  let startIdx = numbers.findIndex((v) => v.value === 0)

  for (const offset of [1000, 2000, 3000]) {
    sum += numbers[(startIdx + offset) % numbers.length].value
  }

  return sum
}

const aNumbers = rows.map((row) => ({ value: row }))
const bNumbers = rows.map((row) => ({ value: row * 811589153 }))

mix(aNumbers, 1)
mix(bNumbers, 10)

console.log('A', sumGroove(aNumbers))
console.log('B', sumGroove(bNumbers))
