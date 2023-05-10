class MissingDataError extends Error {
  constructor (message) {
    super(message)
    this.name = 'MissingDataError'
  }
}

module.exports = MissingDataError
