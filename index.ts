import * as fs from 'fs';

const A = 103577
const M = 101183
const R0 = 108109
const LENGTH = M + 100

export class MyRandom {
  private a: number
  private m: number
  private r: number

  constructor(a : number, m : number, r0 : number) {
    this.a = a
    this.m = m
    this.r = r0
  }

  getNextRandomNumber() : number {
    this.r = (this.a * this.r) % this.m
    return this.r / this.m
  }
}

let myRandom = new MyRandom(A, M, R0)

let results = []

for (let i = 0; i < LENGTH; i++) {
  results.push(myRandom.getNextRandomNumber())
}

const sum = results.reduce((a, b) => a + b, 0)
const avg = sum / results.length
const dispersion = results.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / results.length
const standardDeviation = Math.sqrt(dispersion)
const resFractionOfPairsWhichAreInCircle = fractionOfPairsWhichAreInCircle(results)

let { period, startPosOfLoop, l } = findPeriodAndStartingPostitionOfPeriod(results)

console.log(`m: ${M}`)
console.log(`a: ${A}`)
console.log(`r0: ${R0}`)
console.log('\n')
console.log(`results.length: ${results.length}`)
if (results.length < 200) {
  console.log(`results: ${results}`)
}
console.log('\n')
console.log(`avg: ${avg}`)
console.log(`dispersion: ${dispersion}`)
console.log(`standardDeviation: ${standardDeviation}`)
console.log('\n')
console.log(`period: ${period > 0 ? period : 'not found'}`)
console.log(`startPosOfLoop: ${startPosOfLoop}`)
console.log(`L: ${l}`)
console.log(`results[0]: ${results[0]}`)
console.log(`results[startPosOfLoop]: ${results[startPosOfLoop]}`)
console.log('\n')
console.log(`fractionOfPairsWhichAreInCircle: ${resFractionOfPairsWhichAreInCircle}`)
console.log(`Pi/4: ${Math.PI / 4}`)
console.log('\n')

exportNumbersIntoCSV(results, 'results.csv')

function findPeriodAndStartingPostitionOfPeriod(results : number[]) : { period : number, startPosOfLoop : number, l : number } {
  let period = 0
  let startPosOfLoop = 0
  for (let i = 0; i < results.length; i++) {
    let resultsCopy = results.slice(i)
    let first = resultsCopy.shift()
    while (resultsCopy.length > 0) {
      let next = resultsCopy.shift()
      period++
      if (first === next) {
        startPosOfLoop = i
        break
      }
    }

    if (period === results.length - 1) {
      period = 0
      startPosOfLoop = 0
    }

    if (period > 0) {
      break
    }
  }

  let l = startPosOfLoop + period

  return { period, startPosOfLoop, l }
}

function pairIsInCircle(x : number, y : number) : boolean {
  return Math.pow(x, 2) + Math.pow(y, 2) < 1
}

function fractionOfPairsWhichAreInCircle(results : number[]) {
  let pairsInCircle = 0
  for (let i = 0; i < results.length; i += 2) {
    if (pairIsInCircle(results[i], results[i + 1])) {
      pairsInCircle++
    }
  }
  return pairsInCircle / (Math.floor(results.length / 2))
}

function exportNumbersIntoCSV(results : number[], filePath : string) {
  const csv = results.join('\n');

  fs.writeFile(filePath, csv, (err) => {
    if (err) {
      console.error('Error writing CSV file', err);
    } else {
      console.log('CSV file has been written successfully.');
    }
  });  
}