const fs = require('node:fs')

const rows = fs.readFileSync('data.txt', 'utf8').split('\n')

const rx =
  /^Blueprint (?<id>\d+): Each ore robot costs (?<oreRobotOreCost>\d+) ore. Each clay robot costs (?<clayRobotOreCost>\d+) ore. Each obsidian robot costs (?<obsidianRobotOreCost>\d+) ore and (?<obsidianRobotClayCost>\d+) clay. Each geode robot costs (?<geodeRobotOreCost>\d+) ore and (?<geodeRobotObsidianCost>\d+) obsidian.$/

const blueprints = rows.map((row) => {
  const {
    id,
    oreRobotOreCost,
    clayRobotOreCost,
    obsidianRobotOreCost,
    obsidianRobotClayCost,
    geodeRobotOreCost,
    geodeRobotObsidianCost,
  } = rx.exec(row).groups

  const blueprint = {
    id: parseInt(id),
    ore: {
      ore: parseInt(oreRobotOreCost),
    },
    clay: {
      ore: parseInt(clayRobotOreCost),
    },
    obsidian: {
      ore: parseInt(obsidianRobotOreCost),
      clay: parseInt(obsidianRobotClayCost),
    },
    geode: {
      ore: parseInt(geodeRobotOreCost),
      obsidian: parseInt(geodeRobotObsidianCost),
    },
  }

  blueprint.maxNeeded = {
    ore: Math.max(
      blueprint.ore.ore,
      blueprint.clay.ore,
      blueprint.obsidian.ore,
      blueprint.geode.ore
    ),
    clay: blueprint.obsidian.clay,
    obsidian: blueprint.geode.obsidian,
    geode: Infinity,
  }

  return blueprint
})

const apply = (operand1, operand2, operator) => {
  return {
    ore: operator(operand1.ore ?? 0, operand2.ore ?? 0),
    clay: operator(operand1.clay ?? 0, operand2.clay ?? 0),
    obsidian: operator(operand1.obsidian ?? 0, operand2.obsidian ?? 0),
    geode: operator(operand1.geode ?? 0, operand2.geode ?? 0),
  }
}

const add = (robots, resources) => apply(robots, resources, (a, b) => a + b)
const subtract = (resources, cost) => apply(resources, cost, (a, b) => a - b)

const canBuy = (resources, cost) => {
  const result = subtract(resources, cost)
  return Math.min(...Object.values(result)) >= 0
}

const toStr = (obj) =>
  `${obj.robots.ore},${obj.robots.clay},${obj.robots.obsidian},${obj.robots.geode};${obj.resources.ore},${obj.resources.clay},${obj.resources.obsidian},${obj.resources.geode}`

const getChoices = (blueprint, robots, resources) => {
  const options = []

  for (const [material, cost] of Object.entries(blueprint)) {
    if (material === 'id' || material === 'maxNeeded') continue

    if (robots[material] < blueprint.maxNeeded[material] && canBuy(resources, cost)) {
      const option = {
        resources: add(robots, subtract(resources, cost)),
        robots: add(robots, {
          [material]: 1,
        }),
      }
      options.push([option, toStr(option)])
    }
  }

  // Always buy something if not saving up (ie being able to afford anything)
  if (options.length !== 4) {
    const option = {
      resources: add(robots, resources),
      robots,
    }
    options.push([option, toStr(option)])
  }

  return options
}

const getMaxGeodes = (blueprint, maxMinutes) => {
  let combinations = [
    {
      resources: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
      robots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
    },
  ]

  let maxGeode

  for (let minute = 1; minute <= maxMinutes; minute++) {
    let nextCombinations = []
    const unique = new Set()

    for (const { resources, robots } of combinations) {
      const choices = getChoices(blueprint, robots, resources)

      for (const choice of choices) {
        if (!unique.has(choice[1])) {
          unique.add(choice[1])
          nextCombinations.push(choice[0])
        }
      }
    }

    maxGeode = -Infinity
    for (const combination of nextCombinations) {
      maxGeode = Math.max(maxGeode, combination.resources.geode)
    }

    // Prune based on number geodes (only keep the best)
    combinations = nextCombinations.filter(
      (combination) => combination.resources.geode === maxGeode
    )
  }

  return maxGeode
}

console.log('Part 1')
let sum = 0
for (let blueprint of blueprints) {
  console.log(`Blueprint ID: ${blueprint.id}`)
  sum += getMaxGeodes(blueprint, 24) * blueprint.id
}
console.log('A', sum)

console.log('\nPart 2')
let mul = 1
for (const blueprint of blueprints.slice(0, 3)) {
  console.log(`Blueprint ID: ${blueprint.id}`)

  mul *= getMaxGeodes(blueprint, 32)
}
console.log('B', mul)
