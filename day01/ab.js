const fs = require('node:fs')
const _ = require('lodash')

const inventories = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n\n')
  .map((inventory) => _.sum(inventory.split('\n').map((sCalorie) => parseInt(sCalorie))))

const sortedInventories = inventories.sort((a, b) => a - b)

console.log('A', _.last(sortedInventories))
console.log('B', _.sum(_.takeRight(sortedInventories, 3)))
