const fs = require('node:fs')
const _ = require('lodash')

const rows = fs.readFileSync('data.txt', 'utf8').split('\n')

const fileSystem = new Map()
let currDir = fileSystem
let currPath = []

for (let i = 0; i < rows.length; i++) {
  const [, command, arg] = rows[i].split(' ')

  if (command === 'cd') {
    // Set path
    if (arg === '/') currPath = []
    else if (arg === '..') currPath.splice(-1)
    else currPath.push(arg)

    // Ensure path exists in file system and reference to current dir is correct
    let location = fileSystem
    for (const dir of currPath) {
      if (!location.has(dir)) location.set(dir, new Map())
      location = location.get(dir)
    }

    currDir = location
  } else {
    while (true) {
      i++

      // Reacted the end
      if (!rows?.[i]) break
      const parts = rows[i].split(' ')

      // Reached next command
      if (parts[0] === '$') {
        i--
        break
      }

      if (parts[0] !== 'dir') {
        currDir.set(parts[1], parseInt(parts[0]))
      }
    }
  }
}

// dir reference => size
const dirs = new Map()

const getSize = (dir) => {
  if (dirs.has(dir)) return dirs.get(dir)

  let size = 0
  for (const value of dir.values()) {
    if (typeof value === 'number') size += value
    else size += getSize(value)
  }

  dirs.set(dir, size)
  return size
}

const usedSpace = getSize(fileSystem)
const freeSpace = 70000000 - usedSpace
const requiredFreeSpace = 30000000 - freeSpace

let combinedSmallDirSize = 0
let smallestSufficientDirSize = Infinity

for (const dirSize of dirs.values()) {
  if (dirSize <= 100000) combinedSmallDirSize += dirSize

  if (dirSize >= requiredFreeSpace && dirSize < smallestSufficientDirSize) {
    smallestSufficientDirSize = dirSize
  }
}

console.log('B', combinedSmallDirSize)
console.log('B', smallestSufficientDirSize)
