const fs = require('node:fs')

const coords = fs
  .readFileSync('data.txt', 'utf8')
  .split('\n')
  .map((r) => r.split(',').map(Number))

const freeSides = (graph) => {
  let num = 0

  for (const neighbours of graph.values()) {
    num += 6 - neighbours.size
  }

  return num
}

const addNeighbours = (graph) => {
  for (const [strCoord, neighbours] of graph.entries()) {
    const [x, y, z] = fromStr(strCoord)

    if (graph.has(toStr([x, y, z + 1]))) neighbours.add(toStr([x, y, z + 1]))
    if (graph.has(toStr([x, y, z - 1]))) neighbours.add(toStr([x, y, z - 1]))

    if (graph.has(toStr([x - 1, y, z]))) neighbours.add(toStr([x - 1, y, z]))
    if (graph.has(toStr([x + 1, y, z]))) neighbours.add(toStr([x + 1, y, z]))

    if (graph.has(toStr([x, y - 1, z]))) neighbours.add(toStr([x, y - 1, z]))
    if (graph.has(toStr([x, y + 1, z]))) neighbours.add(toStr([x, y + 1, z]))
  }
}

const dijkstra = (start, graph) => {
  const nodes = new Map()
  nodes.set(start, { distance: 0, from: null })

  const pq = [start]

  while (pq.length > 0) {
    const from = pq.pop()
    const neighbours = graph.get(from)

    for (const to of neighbours) {
      if (!nodes.has(to)) nodes.set(to, { distance: Infinity })

      const toNode = nodes.get(to)
      const fromNode = nodes.get(from)

      if (toNode.distance > fromNode.distance + 1) {
        toNode.distance = fromNode.distance + 1

        // This could be optimized with binary search
        let added = false
        for (let idx = 0; idx < pq.length; idx++) {
          if (toNode.distance > nodes.get(pq[idx]).distance) {
            pq.splice(idx, 0, to)
            added = true
            break
          }
        }
        if (!added) pq.push(to)
      }
    }
  }

  return new Set(nodes.keys())
}

const toStr = (coord) => coord.join(',')
const fromStr = (str) => str.split(',').map(Number)

const inputGraph = new Map()

let max = -Infinity
let min = Infinity

for (const [x, y, z] of coords) {
  min = Math.min(min, x, y, z)
  max = Math.max(max, x, y, z)
  inputGraph.set(toStr([x, y, z]), new Set())
}

max++
min--

addNeighbours(inputGraph)

console.log('A', freeSides(inputGraph))

// A graph that will for sure contain the droplet
const cubeGraph = new Map()

for (let x = min; x <= max; x++) {
  for (let y = min; y <= max; y++) {
    for (let z = min; z <= max; z++) {
      cubeGraph.set(toStr([x, y, z]), new Set())
    }
  }
}

addNeighbours(cubeGraph)

// Remove inputGraph from cubeGraph
for (const [strCoord] of inputGraph.entries()) {
  cubeGraph.delete(strCoord)
  for (const neighbours of cubeGraph.values()) {
    neighbours.delete(strCoord)
  }
}

const waterNodes = dijkstra(toStr([min, min, min]), cubeGraph)

const solidDroplet = new Map()
for (let x = min; x <= max; x++) {
  for (let y = min; y <= max; y++) {
    for (let z = min; z <= max; z++) {
      if (waterNodes.has(toStr([x, y, z]))) continue
      solidDroplet.set(toStr([x, y, z]), new Set())
    }
  }
}

addNeighbours(solidDroplet)

console.log('B', freeSides(solidDroplet))
