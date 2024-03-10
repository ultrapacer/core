// this round tested 10x faster than lodash round
export function round(num: number, digits: number = 0) {
  return Math.round(num * 10 ** digits) / 10 ** digits
}

/**
 * linear interpolation between points
 * @param  x0 - first x value
 * @param  x1 - second x value
 * @param  y0 - first y value
 * @param  y1 - second y value
 * @param  x  - input x value
 * @returns  estimated y value
 */
export function interp(x0: number, x1: number, y0: number, y1: number, x: number): number {
  return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
}

/**
 * interpolate one array against another
 * @param xs  - reference array of x's
 * @param ys  - referece array of y's
 * @param x2s - input array of x values to interpolate
 * @returns array of estimated y values
 */
export function interpArray(xs: number[], ys: number[], x2s: number[]) {
  let i = 0
  let j = 0
  const y2s = []
  for (i = 0; i < x2s.length; i++) {
    if (x2s[i] < xs[j]) {
      y2s.push(ys[j])
    } else {
      while (j < xs.length - 1 && xs[j + 1] <= x2s[i]) {
        j++
      }
      if (j === xs.length - 1 || x2s[i] === xs[j]) {
        y2s.push(ys[j])
      } else {
        y2s.push(interp(xs[j], xs[j + 1], ys[j], ys[j + 1], x2s[i]))
      }
    }
  }
  return y2s
}

export function linearRegression(xyr: number[][]): number[] {
  let i
  let x
  let y
  let r
  let sumx = 0
  let sumy = 0
  let sumx2 = 0
  let sumxy = 0
  let sumr = 0

  for (i = 0; i < xyr.length; i++) {
    // this is our data pair
    x = xyr[i][0]
    y = xyr[i][1]

    // this is the weight for that pair
    // set to 1 (and simplify code accordingly, ie, sumr becomes xy.length) if
    // weighting is not needed
    r = xyr[i][2]

    // consider checking for NaN in the x, y and r variables here
    // (add a continue statement in that case)

    sumr += r
    sumx += r * x
    sumx2 += r * (x * x)
    sumy += r * y
    sumxy += r * (x * y)
  }

  // note: the denominator is the variance of the random variable X
  // the only case when it is 0 is the degenerate case X==constant
  const b = (sumy * sumx2 - sumx * sumxy) / (sumr * sumx2 - sumx * sumx)
  const a = (sumr * sumxy - sumx * sumy) / (sumr * sumx2 - sumx * sumx)

  return [a, b]
}

export function wlslr(x1s: number[], y1s: number[], x2s: number[], th: number) {
  // weighted least squares linear regression routine
  // x1s: source x array
  // y1s: source y array
  // x2s: destination x array
  //  th: smoothing (points included)
  let a = 0 // lower index x1s/y1s included
  let b = 0 // upper index x1s/y1s included
  const mbs: number[][] = []
  x2s.forEach((x2) => {
    while (x1s[a] < x2 - th) {
      a++
    }
    if (a > 0 && x1s[a] >= x2) {
      a--
    }
    while (b < x1s.length - 1 && x1s[b + 1] <= x2 + th) {
      b++
    }
    if (b < x1s.length - 1 && x1s[b] <= x2) {
      b++
    }

    const ith = Math.max(th, Math.abs(x2 - x1s[a]) + 0.001, Math.abs(x2 - x1s[b]) + 0.001)
    const xyr = []
    let w = 0
    for (let i = a; i <= b; i++) {
      w = (1 - (Math.abs(x2 - x1s[i]) / ith) ** 3) ** 3
      xyr.push([x1s[i], y1s[i], w])
    }
    mbs.push(linearRegression(xyr))
  })
  return mbs
}

// shorthand comparisons to the r decimal place
export function rlt(a: number, b: number, r: number) {
  return round(a, r) < round(b, r)
}
export function rgt(a: number, b: number, r: number) {
  return round(a, r) > round(b, r)
}
export function rlte(a: number, b: number, r: number) {
  return round(a, r) <= round(b, r)
}
export function rgte(a: number, b: number, r: number) {
  return round(a, r) >= round(b, r)
}
export function req(a: number, b: number, r: number) {
  return round(a, r) === round(b, r)
}
