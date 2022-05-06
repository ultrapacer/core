module.exports = {
  list: ['altitude', 'grade', 'terrain', 'heat', 'dark', 'fatigue', 'strategy'],
  altitude: require('./altitude'),
  dark: require('./dark'),
  grade: require('./grade'),
  heat: require('./heat'),
  terrain: require('./terrain'),
  strategy: require('./strategy')
}
