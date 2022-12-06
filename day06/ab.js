const fs = require('node:fs')
const _ = require('lodash')

const input = fs.readFileSync('data.txt', 'utf8')
const chars = [...input]

function findFirstMarker(distinctChars) {
  for (let i = distinctChars - 1; i < chars.length; i++) {
    const seq = new Set()

    for (let idx = i; idx > i - distinctChars; idx--) {
      seq.add(chars[idx])
    }

    if (seq.size === distinctChars) return i + 1
  }
}

console.log('A', findFirstMarker(4))
console.log('B', findFirstMarker(14))
