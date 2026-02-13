// tests/mocks/mongoose.cjs
module.exports = {
  connect: jest.fn(() => Promise.resolve({
    connection: {
      host: 'localhost',
      name: 'greencore-test',
      readyState: 1,
    },
  })),
  connection: {
    readyState: 1,
    host: 'localhost',
    name: 'greencore-test',
    db: {
      admin: () => ({
        ping: jest.fn(() => Promise.resolve({ ok: 1 })),
      }),
      listCollections: () => ({
        toArray: jest.fn(() => Promise.resolve([
          { name: 'users' },
          { name: 'energydatas' },
          { name: 'subscribers' },
        ])),
      }),
    },
    close: jest.fn(() => Promise.resolve()),
  },
  disconnect: jest.fn(() => Promise.resolve()),
  Schema: class MockSchema {
    constructor() {
      this.methods = {};
      this.statics = {};
      this.virtuals = {};
    }
    pre() { return this; }
    post() { return this; }
    index() { return this; }
    virtual() { return this; }
  },
  model: jest.fn((name, schema) => {
    return class MockModel {
      constructor(data) {
        Object.assign(this, data);
      }
      static find = jest.fn(() => Promise.resolve([]));
      static findOne = jest.fn(() => Promise.resolve(null));
      static findById = jest.fn(() => Promise.resolve(null));
      static create = jest.fn((data) => Promise.resolve(new MockModel(data)));
      static countDocuments = jest.fn(() => Promise.resolve(0));
      static aggregate = jest.fn(() => Promise.resolve([]));
      save = jest.fn(() => Promise.resolve(this));
    };
  }),
};
