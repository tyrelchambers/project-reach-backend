import { makeExecutableSchema } from 'graphql-tools';

const userSchema = makeExecutableSchema({
  typeDefs: `
    type Users {
      email: String,
      password: String,
      username: String,
      token: String
    }

    type Query {
      users: [Users]
    }
  `
});

module.exports = userSchema;