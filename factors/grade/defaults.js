module.exports = {
  // f = a*x^2 + b*x
  // goes linear at lower and upper bounds
  a: 0.0021,
  b: 0.0340,
  lower: {
    lim: -22,
    m: -0.0584,
    b: -0.0164
  },
  upper: {
    lim: 16,
    m: 0.1012,
    b: 0.4624
  }
}
