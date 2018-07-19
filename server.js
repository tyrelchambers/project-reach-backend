import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';

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
    user(email: String): User,
    login(email: String!, password: String!): String

  }

  type User {
    email: String,
    password: String,
    username: String
  }

  type Mutation {
    createUser(email: String, password: String, username: String): String
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello World",
    users: (obj, args, ctx) => {
      return User.find();
    },
    user: (ctx, args) => args,
    login: async (_, {email, password}) => {
      const user = await User.findOne({email});

      if (!user) throw new Error("User does not exist");

      const validPass = await bcrypt.compare(password, user.password);

      if (!validPass) throw new Error("Email or password are incorrect");

      return jwt.sign({id: user._id, email: user.email}, config.secret, {
        expiresIn:"1d"
      });
    }
  },

  Mutation: {
    createUser: (_, {email, password}) => {
      const hashPassword = bcrypt.hashSync(password, 8);
      const user = User.create({
        email,
        password: hashPassword
      });
      
      return jwt.sign({id: user._id, email: user.email}, config.secret, {
        expiresIn: 86400
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