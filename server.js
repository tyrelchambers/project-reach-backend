import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./src/config');
const User = require('./src/schemas/userSchema');
const Project = require('./src/schemas/projectSchema');
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
    login(email: String!, password: String!): String,
    allProjects: [Project]
  }

  type User {
    email: String,
    password: String,
    username: String
  }

  type Project {
    title: String,
    description: String,
    userId: ID,
    comments: [Comment],
    imageUrl: String
  }

  type Comment {
    userId: ID,
    comment: String
  }

  type Mutation {
    createUser(email: String, password: String, username: String): String,
    createProject(title: String!, description: String!): Project
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
      
      if (!email) throw new Error("No email provided");
      if (!password) throw new Error("No password provided");
      if (!user) throw new Error("User does not exist");

      const validPass = await bcrypt.compare(password, user.password);

      if (!validPass) throw new Error("Email or password are incorrect");

      return jwt.sign({id: user._id, email: user.email}, config.secret, {
        expiresIn:"1d"
      });
    },
    allProjects: () => {
      return Project.find();
    }
  },

  Mutation: {
    createUser: (_, {email, password}) => {
      const hashPassword = bcrypt.hashSync(password, 8);

      if (!email) throw new Error("No email provided");
      if (!password) throw new Error("No password provided");

      const user = User.create({
        email,
        password: hashPassword
      });
      
      return jwt.sign({id: user._id, email: user.email}, config.secret, {
        expiresIn: 86400
      });
    },
    createProject: async (obj, {title, description, authToken}, ctx) => {
      const existingProject = await Project.findOne({title});
      const token = authToken;

      if (existingProject) throw new Error("A project with that title already exsits.");

      const project = Project.create({
        title,
        description
      });

      return project;
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