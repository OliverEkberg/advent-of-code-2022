const fs = require('node:fs')
const _ = require('lodash')

const rows = fs.readFileSync('data.txt', 'utf8').split('\n')

const splitStringInMiddle = (str) => {
  let middle = str.length / 2
  return [str.substr(0, middle), str.substr(middle)]
}

const scoreChar = (char) => {
  const subtract = char.toLowerCase() === char ? 96 : 38
  return char.charCodeAt(0) - subtract
}

const computeAnswer = (groups) => {
  let sum = 0

  for (const group of groups) {
    const groupChars = group.map((g) => [...g])

    const commonChar = [..._.intersection(...groupChars)][0]
    sum += scoreChar(commonChar)
  }

  return sum
}

const aInput = rows.map((r) => splitStringInMiddle(r))
const bInput = _.chunk(rows, 3)

console.log('A', computeAnswer(aInput))
console.log('B', computeAnswer(bInput))
