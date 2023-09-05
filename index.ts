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

  getNextRandomInRange(min : number, max : number) : number {
    return min + (max - min) * this.getNextRandomNumber()
  }

  getNextRandomGaussian(mean : number, standardDeviation : number, quality : number = 6) : number {
    return mean + standardDeviation * Math.sqrt(2) * (Array.from({ length: quality }, () => this.getNextRandomNumber()).reduce((a, b) => a + b, 0) - quality / 2)
  }

  getNextRandomExponential(lambda : number) : number {
    return -1 / lambda * Math.log(this.getNextRandomNumber())
  }

  getNextRandomGamma(k : number, lambda : number) : number {
    let result = 1
    for (let i = 0; i < k; i++) {
      result *= this.getNextRandomNumber()
    }
    return -1 / lambda * Math.log(result)
  }

  getNextRandomTriangle(min : number, max : number) : number {
    let r1 = this.getNextRandomNumber()
    let r2 = this.getNextRandomNumber()
    return min + (max - min) * Math.min(r1, r2)
  }

  getNextRandomSimpson(min : number, max : number) : number {
    let x = this.getNextRandomInRange(min / 2, max / 2)
    let y = this.getNextRandomInRange(min / 2, max / 2)
    return x + y
  }
}

const methods : {
  [key : string] : {
    funcName : string,
    params : number[]
  }
} = {
  'random numbers from 0 to 1': {
    funcName: 'getNextRandomNumber',
    params: [],
  },
  'random in some range': {
    funcName: 'getNextRandomInRange',
    params: [2, 5],
  },
  'gaussian': {
    funcName: 'getNextRandomGaussian',
    params: [5, 2],
  },
  'exponential': {
    funcName: 'getNextRandomExponential',
    params: [5],
  },
  'gamma': {
    funcName: 'getNextRandomGamma',
    params: [5, 2],
  },
  'triangle': {
    funcName: 'getNextRandomTriangle',
    params: [2, 5],
  },
  'simpson': {
    funcName: 'getNextRandomSimpson',
    params: [2, 5],
  },
}

console.log(`m: ${M}`)
console.log(`a: ${A}`)
console.log(`r0: ${R0}`)
console.log()
console.log(`results.length: ${LENGTH}`)

for (let methodName in methods) {
  let method = methods[methodName]

  console.log(`\n\n${methodName.toLocaleUpperCase()}:\n`)
  console.log(`params: ${method.params}`)

  let myRandom = new MyRandom(A, M, R0)

  let results = []

  for (let i = 0; i < LENGTH; i++) {
    results.push(myRandom[method.funcName](...method.params))
  }

  const avg = results.reduce((a, b) => a + b, 0) / results.length
  const dispersion = results.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / results.length
  const standardDeviation = Math.sqrt(dispersion)

  let period = 0
  let startPosOfLoop = 0
  let l = 0
  let resFractionOfPairsWhichAreInCircle = 0

  if (methodName === 'random numbers from 0 to 1') {
    resFractionOfPairsWhichAreInCircle = fractionOfPairsWhichAreInCircle(results)
    let tempRes = findPeriodAndStartingPostitionOfPeriod(results)
    period = tempRes.period
    startPosOfLoop = tempRes.startPosOfLoop
    l = tempRes.l
  }

  if (results.length < 200) {
    console.log(`results: ${results}`)
    console.log()
  }
  console.log(`avg: ${avg}`)
  console.log(`dispersion: ${dispersion}`)
  console.log(`standardDeviation: ${standardDeviation}`)
  console.log()
  if (methodName === 'random numbers from 0 to 1') {
    console.log(`period: ${period > 0 ? period : 'not found'}`)
    console.log(`startPosOfLoop: ${startPosOfLoop}`)
    console.log(`L: ${l}`)
    console.log(`results[0]: ${results[0]}`)
    console.log(`results[startPosOfLoop]: ${results[startPosOfLoop]}`)
    console.log()
    console.log(`fractionOfPairsWhichAreInCircle: ${resFractionOfPairsWhichAreInCircle}`)
    console.log(`Pi/4: ${Math.PI / 4}`)
  }
  console.log('------------------------------------------')

  exportNumbersIntoCSV(results, `results - ${methodName}.csv`)
}

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
  // use ',' as the separator of integer part and decimal part
  let csv = results.join('\n');
  csv = csv.replace(/\./g, ',');

  fs.writeFile(filePath, csv, (err) => {
    if (err) {
      console.error('Error writing CSV file', err);
    } else {
      console.log('CSV file has been written successfully.');
    }
  });  
}