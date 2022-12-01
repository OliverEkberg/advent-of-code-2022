const fs = require('node:fs')

const inventories = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n\n')
  .map((inventory) =>
    inventory
      .split('\n')
      .map((sCalorie) => parseInt(sCalorie))
      .reduce((total, calorie) => total + calorie, 0)
  )

const sortedInventories = inventories.sort((a, b) => a - b)

console.log('A', sortedInventories.at(-1))
console.log(
  'B',
  sortedInventories.at(-1) + sortedInventories.at(-2) + sortedInventories.at(-3)
)
