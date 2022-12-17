const fs = require('node:fs')

const dxs = fs
  .readFileSync('data.txt', 'utf8')
  .split('')
  .map((v) => (v === '<' ? -1 : 1))

const fromStr = (str) => str.split(',').map(Number)
const toStr = ([x, y]) => `${x},${y}`

const xMin = 0
const xMax = 7

const getFigure = (nbr, y) => {
  if (nbr === 0) {
    return [
      [xMin + 2, y],
      [xMin + 3, y],
      [xMin + 4, y],
      [xMin + 5, y],
    ]
  }

  if (nbr === 1) {
    return [
      [xMin + 2, y + 1],
      [xMin + 3, y],
      [xMin + 3, y + 1],
      [xMin + 3, y + 2],
      [xMin + 4, y + 1],
    ]
  }

  if (nbr === 2) {
    return [
      [xMin + 2, y],
      [xMin + 3, y],
      [xMin + 4, y],
      [xMin + 4, y + 1],
      [xMin + 4, y + 2],
    ]
  }

  if (nbr === 3) {
    return [
      [xMin + 2, y],
      [xMin + 2, y + 1],
      [xMin + 2, y + 2],
      [xMin + 2, y + 3],
    ]
  }

  if (nbr === 4) {
    return [
      [xMin + 2, y],
      [xMin + 2, y + 1],
      [xMin + 3, y],
      [xMin + 3, y + 1],
    ]
  }
}

const numShapes = 5

const moveCoords = (coords, { dx = 0, dy = 0 }) => {
  return coords.map(([x, y]) => [x + dx, y + dy])
}

const normalize = (vals) => {
  const w = vals[0]

  return vals.map((v) => v - w)
}

const key = (ints) => ints.join(',')

const TYPES = {
  BUILD_SEQUENCE: 1,
  COMPUTE_SEQUENCE_DY: 2,
  ANSWER: 3,
}

const run = (iterations, type, seq, inc) => {
  let map = new Set()

  const free = (coords) => {
    return coords.every((c) => !map.has(toStr(c)) && c[1] >= 0 && c[0] >= xMin && c[0] < xMax)
  }

  let yMax = -1

  const yMaxes = new Array(xMax - xMin).fill(yMax)

  const patternIds = new Map()
  const heights = []
  const patternIdHistory = []

  const isSequence = () => {
    if (patternIdHistory.length < seq.length) return false
    const historyTail = patternIdHistory.slice(-seq.length)

    for (let i = 0; i < historyTail.length; i++) {
      if (historyTail[i] !== seq[i]) return false
    }

    return true
  }

  let iter = 0
  let windIdx = 0
  while (true) {
    const parts = getFigure(iter % numShapes, yMax + 4)

    let curr = parts
    while (true) {
      const dx = dxs[windIdx % dxs.length]
      const movedByWind = moveCoords(curr, { dx })
      windIdx++

      const next = free(movedByWind) ? movedByWind : curr
      const movedDown = moveCoords(next, { dy: -1 })

      if (!free(movedDown)) {
        for (const coord of next) {
          map.add(toStr(coord))

          if (coord[1] > yMaxes[coord[0]]) {
            yMaxes[coord[0]] = coord[1]
          }

          yMax = Math.max(...yMaxes)
        }

        break
      } else {
        curr = movedDown
      }
    }

    const pattern = key(normalize(yMaxes))
    if (!patternIds.has(pattern)) {
      patternIds.set(pattern, patternIds.size)
    }

    patternIdHistory.push(patternIds.get(pattern))

    if (type === TYPES.ANSWER && isSequence()) {
      const numSeq = Math.floor((iterations - iter) / seq.length)

      const dy = numSeq * inc
      const eqIterations = numSeq * seq.length

      map = new Set(
        [...map]
          .map((c) => fromStr(c))
          .map(([x, y]) => [x, y + dy])
          .map((r) => toStr(r))
      )

      for (let x = xMin; x < xMax; x++) {
        yMaxes[x] = yMaxes[x] + dy
      }

      yMax = Math.max(...yMaxes)
      iter += eqIterations
    }

    if (type === TYPES.COMPUTE_SEQUENCE_DY && isSequence()) {
      heights.push([...yMaxes])
      if (heights.length === 2) {
        const dys = new Set()

        for (let x = xMin; x < xMax; x++) {
          dys.add(heights[1][x] - heights[0][x])
        }

        if (dys.size !== 1) throw new Error('More than one dy found')

        return [...dys][0]
      }
    }

    iter++
    if (iter === iterations) {
      if (type === TYPES.ANSWER) return yMax + 1
      break
    }
  }

  const patternIdSeq = [...patternIdHistory].reverse()

  const patternIdSeqStr = patternIdSeq.join(',')

  const sequence = []
  for (let patternLength = 1; patternLength < patternIdSeq.length; patternLength++) {
    sequence.push(patternIdSeq[patternLength - 1])
    const seqStr = sequence.join(',')

    const idx1 = patternIdSeqStr.indexOf(seqStr)
    const idx2 = patternIdSeqStr.indexOf(seqStr, idx1 + 1)
    const idx3 = patternIdSeqStr.indexOf(seqStr, idx2 + 1)
    const diffs = new Set([idx2 - idx1, idx3 - idx2])

    if (idx2 - idx1 === seqStr.length + 1 && diffs.size === 1) {
      break
    }
  }

  if (type === TYPES.BUILD_SEQUENCE) return sequence.reverse()
  throw new Error('No type matched')
}

const computeAnswer = (iterations) => {
  // 10_000 iterations should be enough to find a sequence
  const sequence = run(10_000, TYPES.BUILD_SEQUENCE)
  const dy = run(Infinity, TYPES.COMPUTE_SEQUENCE_DY, sequence)
  return run(iterations, TYPES.ANSWER, sequence, dy)
}

console.log('A', computeAnswer(2022))
console.log('B', computeAnswer(1000000000000))
