const fs = require('node:fs')

const rows = fs.readFileSync('data.txt', 'utf8').split('\n')
const rx = /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/

const dist = ([x1, y1], [x2, y2]) => Math.abs(x1 - x2) + Math.abs(y1 - y2)

// contains [[x,y], distance]
const sensors = []

for (const row of rows) {
  const [, sx, sy, bx, by] = rx.exec(row).map(Number)

  sensors.push([[sx, sy], dist([sx, sy], [bx, by])])
}

// gets the range of x positions given sensor covers at y (or null if none)
const getRange = ([sx, sy], d, y) => {
  const diff = Math.abs(sy - y)
  const range = [sx - d + diff, sx + d - diff]
  if (range[0] > range[1]) return null
  return range
}

const overlaps = (r1, r2) => {
  if (r2[0] <= r1[1] && r1[1] <= r2[1]) return true
  if (r1[0] <= r2[1] && r2[1] <= r1[1]) return true
  return false
}

const mergeRanges = (ranges) => {
  ranges.sort((r1, r2) => r1[0] - r2[0])

  let merged = []

  for (const r2 of ranges) {
    const r1 = merged.at(-1)
    if (r1 && overlaps(r1, r2)) {
      r1[0] = Math.min(r1[0], r2[0])
      r1[1] = Math.max(r1[1], r2[1])
    } else {
      merged.push([r2[0], r2[1]])
    }
  }

  return merged
}

const getRanges = (y) => {
  const ranges = sensors.map((s) => getRange(s[0], s[1], y)).filter((r) => r)
  return mergeRanges(ranges)
}

// part 1
const rowY = 2000000

let blocked = 0
for (const range of getRanges(rowY)) {
  blocked += range[1] - range[0]
}

console.log('A', blocked)

// part 2
const max = 4000000

for (let y = 0; y <= max; y++) {
  const ranges = getRanges(y)
  if (ranges.length < 2) continue

  for (let i = 1; i < ranges.length; i++) {
    // gap of exactly 1 => our y is determined and the gap itself is our x
    if (ranges[i][0] - ranges[i - 1][1] === 2) {
      const x = ranges[i][0] - 1
      console.log('B', x * 4000000 + y)
      process.exit(0)
    }
  }
}
