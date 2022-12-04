const fs = require('node:fs')
const _ = require('lodash')

const rows = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n')
  .map((pairs) => pairs.split(','))

let a = 0
let b = 0
for (const [s1, s2] of rows) {
  const [min1, max1] = s1.split('-').map((s) => parseInt(s))
  const [min2, max2] = s2.split('-').map((s) => parseInt(s))

  // part a
  if (_.inRange(min1, min2, max2 + 1) && _.inRange(max1, min2, max2 + 1)) a++
  else if (_.inRange(min2, min1, max1 + 1) && _.inRange(max2, min1, max1 + 1)) a++

  // part b
  if (_.inRange(min2, min1, max1 + 1) || _.inRange(min1, min2, max2 + 1)) b++
}

console.log('A', a)
console.log('B', b)
