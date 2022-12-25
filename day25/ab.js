const fs = require('node:fs')

const rows = fs.readFileSync('data.txt', 'utf8').split('\n')

const snafuToDecimal = (snafuStr) => {
  const rev = [...snafuStr].reverse()

  let val = 0
  for (let i = 0; i < snafuStr.length; i++) {
    const base = 5 ** i

    if (rev[i] === '-') {
      val += -1 * base
    } else if (rev[i] === '=') {
      val += -2 * base
    } else {
      val += parseInt(rev[i]) * base
    }
  }

  return val
}

const decimalToSnafu = (decimal) => {
  const digitOrder = ['1', '2', '=', '-', '0']

  const digits = []

  let addDigitPoint = '1'
  let idx = 0
  while (true) {
    const offset = snafuToDecimal(addDigitPoint)

    if (decimal < offset) {
      return digits.reverse().join('')
    }

    const digitIdx = Math.floor(((decimal - offset) / 5 ** idx) % 5)
    digits.push(digitOrder[digitIdx])

    addDigitPoint += '='
    idx++
  }
}

let sum = 0
for (const row of rows) {
  sum += snafuToDecimal(row)
}

console.log(decimalToSnafu(sum))
