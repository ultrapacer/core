function monster1(disposition) {
  this.disposition = disposition;
}

const handler1 = {
  construct: (target, args) => {
    console.log('monster1 constructor called');
    // expected output: "monster1 constructor called"

    return new target(...args);
  },
  get: (target, property) => {
        console.log(property)
        return this
  }
};

const proxy1 = new Proxy(monster1, handler1);
module.exports = proxy1