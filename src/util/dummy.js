// dummy object
const handler = {
  // construct: ({}, args) => {
  //  return new target(...args)
  // },
  get: (target, property, value, other) => {
    return () => { return value }
  }
}

const dummy = new Proxy({}, handler)
module.exports = dummy
