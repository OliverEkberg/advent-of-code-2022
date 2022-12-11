const fs = require('node:fs')

const _rows = fs.readFileSync('data.txt', 'utf8').split('\n\n')

const monkeys = new Map()
const monkeyIds = []

let lcm = 1

for (const _row of _rows) {
  const { id, items, operation, test, testTrue, testFalse } =
    /Monkey (?<id>\d+):\n\W*Starting items: (?<items>.*)\n\W*Operation: new = (?<operation>.*)\n\W*Test: divisible by (?<test>\d+)\n\W*If true: throw to monkey (?<testTrue>\d+)\n\W*If false: throw to monkey (?<testFalse>\d+)/.exec(
      _row
    ).groups

  lcm *= parseInt(test)

  monkeys.set(parseInt(id), {
    items: items.split(', ').map((item) => parseInt(item)),
    operation: (old) => eval(operation),
    test: parseInt(test),
    testTrue: parseInt(testTrue),
    testFalse: parseInt(testFalse),
    inspected: 0,
  })

  monkeyIds.push(parseInt(id))
}

const compute = (monkeys, rounds, divisor) => {
  for (let round = 1; round <= rounds; round++) {
    for (const id of monkeyIds) {
      const monkey = monkeys.get(id)

      for (const item of monkey.items) {
        const worryLevel = Math.floor(monkey.operation(item) / divisor) % lcm

        const nextMonkeyId =
          worryLevel % monkey.test === 0 ? monkey.testTrue : monkey.testFalse

        monkeys.get(nextMonkeyId).items.push(worryLevel)
        monkey.inspected = monkey.inspected + 1
      }

      monkey.items = []
    }
  }

  const inspections = [...monkeys.values()].map((m) => m.inspected).sort((a, b) => a - b)
  return inspections.at(-1) * inspections.at(-2)
}

const copy = (m) => {
  const copy = new Map()

  for (const [key, val] of m.entries()) {
    copy.set(key, {
      ...val,
      items: [...val.items],
    })
  }

  return copy
}

console.log('A', compute(copy(monkeys), 20, 3))
console.log('B', compute(copy(monkeys), 10_000, 1))
