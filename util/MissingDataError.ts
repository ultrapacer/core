export class MissingDataError extends Error {
  constructor(message: string, field: string) {
    super(message)
    this.name = 'MissingDataError'
    this.field = field
  }
  field: string
}
