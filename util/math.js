export function round(num, digits = 0) {
  return Math.round(num * 10 ** digits) / 10 ** digits
}

export function interp(x0, x1, y0, y1, x) {
  return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
}

export function interpArray(xs, ys, x2s) {
  // interpolate an array to another
  // xs: array of x's, ordered small to large
  // ys: array of corresponding y's
  // x2s: array of new x's to interpolate on

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

export function linearRegression(xyr) {
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

export function wlslr(x1s, y1s, x2s, th) {
  // weighted least squares linear regression routine
  // x1s: source x array
  // y1s: source y array
  // x2s: destination x array
  //  th: smoothing (points included)
  let a = 0 // lower index x1s/y1s included
  let b = 0 // upper index x1s/y1s included
  const mbs = []
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
// this round function defined above seems to perform much better than lodash round
export function rlt(a, b, r) {
  return round(a, r) < round(b, r)
}
export function rgt(a, b, r) {
  return round(a, r) > round(b, r)
}
export function rlte(a, b, r) {
  return round(a, r) <= round(b, r)
}
export function rgte(a, b, r) {
  return round(a, r) >= round(b, r)
}
export function req(a, b, r) {
  return round(a, r) === round(b, r)
}
