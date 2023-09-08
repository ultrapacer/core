class MissingDataError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'MissingDataError'
    this.field = field
  }
}

module.exports = MissingDataError
