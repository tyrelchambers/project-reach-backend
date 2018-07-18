import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import uniqueString from 'unique-string';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./src/config');
const User = require('./src/schemas/userSchema');
const bcrypt = require('bcryptjs');
const port = process.env.PORT || 3001;
const database = config.database;
const db = mongoose.connection;
const helmet = require('helmet');
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(helmet());
app.disable('x-powered-by');

const typeDefs = `
  type Query {
    hello: String,
    users: [User!],
    user(email: String): User
  }

  type User {
    email: String,
    password: String,
    username: String,
    sessionKey: String
  }

  type Mutation {
    createUser(email: String, password: String, username: String): User
    loginUser: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello World",
    users: (obj, args, ctx) => {
      return User.find();
    },
    user: (ctx, args) => args
  },

  Mutation: {
    async createUser(obj, args, ctx) {
      
      const hashPassword = bcrypt.hashSync(args.password, 8);
      const existingUser = User.where({email: args.email});
      let token = jwt.sign({id: user._id}, config.secret, {
        expiresIn: 86400
      });

      if (!args.email) return "Need an email";
      if (!args.password) return "Password needed";
      
      // Query for user, create user if null, otherwise return
      existingUser.findOne((err, user) => {
        if (err) throw new Error(err);
        if (user) return console.log("User exists");       
      });    

      return User.create({
        email: args.email,
        password: hashPassword,
        token
      });
    }
  }
}



const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

mongoose.connect(database);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('successfully connected');
});

app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));
app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}))

app.listen(port, () => console.log("Listening on port " + port));