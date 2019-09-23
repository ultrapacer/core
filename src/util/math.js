function round (num, digits) {
  return Math.round(num * (10 ** digits)) / 10 ** digits
}

function interp (x0, x1, y0, y1, x) {
  return y0 + (x - x0) / (x1 - x0) * (y1 - y0)
}

function linearRegression (xyr) {
  var i
  var x
  var y
  var r
  var sumx = 0
  var sumy = 0
  var sumx2 = 0
  var sumxy = 0
  var sumr = 0
  var a
  var b

  for (i = 0; i < xyr.length; i++) {
    // this is our data pair
    x = xyr[i][0]; y = xyr[i][1]

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
  b = (sumy * sumx2 - sumx * sumxy) / (sumr * sumx2 - sumx * sumx)
  a = (sumr * sumxy - sumx * sumy) / (sumr * sumx2 - sumx * sumx)

  return [a, b]
}

module.exports = {
  linearRegression: linearRegression,
  round: round,
  interp: interp
}
