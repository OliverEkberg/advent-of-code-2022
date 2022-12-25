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

const decimalToBaseFactory = (digitOrder, baseToDecimal) => (decimal) => {
  const digits = []

  let smallestDigitValue = Infinity
  let smallestDigit = null

  for (const digit of digitOrder) {
    const decimalValue = baseToDecimal(digit)
    if (decimalValue < smallestDigitValue) {
      smallestDigit = digit
      smallestDigitValue = decimalValue
    }
  }

  let addDigitPoint = digitOrder[0]
  let idx = 0
  while (true) {
    const offset = baseToDecimal(addDigitPoint)

    if (decimal < offset) {
      return digits.reverse().join('')
    }

    const digitIdx = Math.floor(
      ((decimal - offset) / digitOrder.length ** idx) % digitOrder.length
    )
    digits.push(digitOrder[digitIdx])

    addDigitPoint += smallestDigit
    idx++
  }
}

const decimalToSnafu = decimalToBaseFactory(['1', '2', '=', '-', '0'], (str) =>
  snafuToDecimal(str)
)

let sum = 0
for (const row of rows) {
  sum += snafuToDecimal(row)
}

console.log(decimalToSnafu(sum))
