const fs = require('node:fs')

const packetPairs = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n\n')
  .map((row) => row.split('\n').map((r) => JSON.parse(r)))

const compare = (left, right) => {
  if (Number.isInteger(left) && Number.isInteger(right)) {
    if (left === right) return null
    return left < right
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    for (let i = 0; i < Math.min(left.length, right.length); i++) {
      const comp = compare(left[i], right[i])
      if (typeof comp === 'boolean') return comp
    }

    if (left.length === right.length) return null
    return left.length < right.length
  }

  if (!Array.isArray(left)) left = [left]
  if (!Array.isArray(right)) right = [right]

  return compare(left, right)
}

let sum = 0

for (let i = 0; i < packetPairs.length; i++) {
  const [left, right] = packetPairs[i]

  if (compare(left, right)) sum += i + 1 // One based index
}

console.log('A', sum)

const packets = packetPairs.flatMap((pp) => pp)
const divider1 = [[2]]
const divider2 = [[6]]
packets.push(divider1, divider2)

packets.sort((a, b) => {
  const comp = compare(a, b)
  if (comp === null) return 0
  if (comp) return -1
  else return 1
})

console.log(
  'B',
  (packets.findIndex((p) => p === divider1) + 1) *
    (packets.findIndex((p) => p === divider2) + 1)
)
