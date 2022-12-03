const fs = require('node:fs')

const rows = fs.readFileSync('data.txt', 'utf8').split('\n')

const splitStringInMiddle = (str) => {
  let middle = str.length / 2
  return [str.substr(0, middle), str.substr(middle)]
}

const intersect = (...sets) => {
  let common = sets[0]
  for (const set of sets) {
    const subIntersect = new Set()
    for (const el of set) {
      if (common.has(el)) subIntersect.add(el)
    }

    common = subIntersect
  }

  return common
}

const chunk = (arr, chunkSize) => {
  const chunks = []

  for (let i = 0; i < arr.length; i += chunkSize) {
    const c = arr.slice(i, i + chunkSize)
    chunks.push(c)
  }

  return chunks
}

const scoreChar = (char) => {
  const subtract = char.toLowerCase() === char ? 96 : 38
  return char.charCodeAt(0) - subtract
}

const computeAnswer = (groups) => {
  let sum = 0

  for (const group of groups) {
    const groupCharSets = group.map((g) => new Set(g))

    const commonChar = [...intersect(...groupCharSets)][0]
    sum += scoreChar(commonChar)
  }

  return sum
}

const aInput = rows.map((r) => splitStringInMiddle(r))
const bInput = chunk(rows, 3)

console.log('A', computeAnswer(aInput))
console.log('B', computeAnswer(bInput))
