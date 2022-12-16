const fs = require('node:fs')

const rows = fs.readFileSync('data.txt', 'utf8').split('\n')

const START_NODE = 'AA'
const LIMIT_1 = 30
const LIMIT_2 = 26

const rx =
  /^Valve ([A-Z]+) has flow rate=(\d+); tunnel[s]? lead[s]? to valve[s]? (([A-Z]+,?\W?)+)$/

const fullGraph = new Map()

// Straight up parse the input as a graph
for (const row of rows) {
  const [, valve, strRate, strNeighbours] = rx.exec(row)
  const rate = parseInt(strRate)
  const neighbours = strNeighbours.split(', ')

  fullGraph.set(valve, { rate, neighbours })
}

const dijkstra = (start) => {
  const nodes = new Map()
  nodes.set(start, { distance: 0, from: null })

  const pq = [start]

  while (pq.length > 0) {
    const from = pq.pop()
    const { neighbours } = fullGraph.get(from)

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

  return nodes
}

// Reduce the graph to only include nodes with an actual flow rate
const reducedGraph = new Map()
for (const [fromNode, { rate }] of fullGraph.entries()) {
  if (rate === 0 && fromNode !== START_NODE) continue

  const distances = dijkstra(fromNode)

  const neighbours = []
  for (const [neighbour, { distance }] of distances.entries()) {
    // Remove any neighbours without flow and self
    if (fullGraph.get(neighbour).rate === 0 || neighbour === fromNode) continue
    neighbours.push([neighbour, distance])
  }

  reducedGraph.set(fromNode, { rate, neighbours })
}

const cost = (from, to) => {
  return reducedGraph.get(from).neighbours.find((v) => v[0] === to)[1]
}

const value = (node) => reducedGraph.get(node).rate

const possibleMoves = (from, time, visited) => {
  return reducedGraph
    .get(from)
    .neighbours.filter((v) => v[1] + 1 <= time)
    .map((v) => v[0])
    .filter((m) => !visited.has(m))
}

const strPath = (path) => {
  if (typeof path === 'string') return path
  return path.join('-')
}
const parsePath = (str) => str.split('-')

const recursePaths = (time, from = START_NODE, visited = new Set(), path = []) => {
  const moves = possibleMoves(from, time, visited)

  if (moves.length === 0) return new Set([strPath(path) + '-' + from])

  const paths = new Set()

  for (const move of moves) {
    const timeLeft = time - cost(from, move) - 1
    const movePaths = recursePaths(timeLeft, move, new Set([...visited, move]), [
      ...path,
      from,
    ])

    for (const p of movePaths) paths.add(p)
  }

  return paths
}

const pathValueFactory = (startTime) => (path) => {
  if (typeof path === 'string') {
    path = parsePath(path)
    path.shift()
  }

  let score = 0
  let timeLeft = startTime

  let prev = START_NODE
  for (const node of path) {
    timeLeft -= cost(prev, node) + 1
    score += value(node) * timeLeft
    prev = node
  }

  return score
}

// Part 1
const pathValue1 = pathValueFactory(LIMIT_1)

let part1 = 0
for (const strPath of recursePaths(LIMIT_1)) {
  part1 = Math.max(part1, pathValue1(strPath))
}

console.log('A', part1)

// Part 2
const uniquePaths = new Set()
for (const path of recursePaths(LIMIT_2)) {
  const split = parsePath(path)
  let curr = split.shift()

  for (const part of split) {
    curr += '-' + part
    uniquePaths.add(curr)
  }
}

const pathValue2 = pathValueFactory(LIMIT_2)

const paths = [...uniquePaths]
  .map((p) => {
    const [, ...rest] = parsePath(p)
    return rest
  })
  .sort((p1, p2) => {
    const v1 = pathValue2(p1)
    const v2 = pathValue2(p2)

    if (v1 === v2) return 0
    if (v1 > v2) return -1
    return 1
  })

let part2 = 0

for (const path1 of paths) {
  for (const path2 of paths) {
    const overlaps = path1.some((p) => path2.includes(p))

    if (!overlaps) {
      const value = pathValue2(path1) + pathValue2(path2)

      if (value > part2) {
        part2 = value

        // It is possible to exit early if we can guarantee no larger value can be found
        const theoreticalMax = pathValue2(paths[0]) + pathValue2(path2)
        if (theoreticalMax <= part2) {
          console.log('B', part2)
          process.exit(0)
        }
      }
    }
  }
}

console.log('B', part2)
