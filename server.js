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
const Comment = require('./src/schemas/commentSchema');
const bcrypt = require('bcryptjs');
const port = process.env.PORT || 3001;
const database = config.database;
const db = mongoose.connection;
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const util = require('util');
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
    allProjects: [Project],
    projects(creator: String): [Project],
    projectById(project_id: String): Project,
    account(token: String): User

  }

  type User {
    email: String,
    password: String,
    username: String
  }

  type Project {
    _id: ID,
    title: String,
    description: String,
    headline: String,
    creator: String,
    comments: [Comment],
    imageUrl: String,
    created_at: String
  }

  type Comment {
    creator: ID,
    project: String,
    comment: String,
    created_at: String
  }

  type Mutation {
    createUser(email: String, password: String, username: String): String,
    createProject(title: String, description: String, creator: String, headline: String): String,
    deleteProject(creator: String, project_id: String): String,
    updateProject(creator: String, title: String, description: String): String,
    login(email: String, password: String): String,
    postComment(comment: String, project_id: String, creator: String): String,
    updateAccount(email: String, password: String, username: String, creator: String): String
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello World",
    users: (obj, args, ctx) => {
      return User.find();
    },
    user: (ctx, args) => args,
    allProjects: () => {
      return Project.find();
    },
    projects: async (_, {creator}) => {
      const decoded = jwt.decode(creator, config.secret);
      const ObjectId = mongoose.Types.ObjectId;
      const id = ObjectId(decoded.id);

      return Project.find({creator: id});
    },
    projectById: async (_, {project_id}) => {
      const ObjectId = mongoose.Types.ObjectId;
      const id = ObjectId(project_id);
      
      return Project.findOne({_id: id})
                    .populate('comments');
    },
    account: async (_, {token}) => {
      const decoded = jwt.decode(token, config.secret);
      const ObjectId = mongoose.Types.ObjectId;
      const id = ObjectId(decoded.id);

      return User.findOne({_id: id});
    }
  },

  Mutation: {
    createUser: async (_, {email, password}) => {
      const hashPassword = bcrypt.hashSync(password, 8);
      const existingUser = await User.findOne({email});

      if (existingUser) throw new Error("User exists");
      if (!email) throw new Error("No email provided");
      if (!password) throw new Error("No password provided");

      const user = await User.create({
        email,
        password: hashPassword
      });
      
      return jwt.sign({id: user._id, email: user.email}, config.secret, {
        expiresIn: "30d"
      });
    },
    createProject: async (obj, {title, description, headline, creator}, ctx) => {
      const existingProject = await Project.findOne({title});
      const existingUser = await User.findOne({email: creator});

      if (existingProject) throw new Error("A project with that title already exsits.");
      if (!existingUser) throw new Error("User not valid");

      const project = Project.create({
        title,
        description,
        creator: existingUser._id,
        headline
      });
      return project;
    },
    deleteProject: async (_, {creator, project_id}) => {
      const decoded = jwt.decode(creator, config.secret);
      const ObjectId = mongoose.Types.ObjectId;
      const id = ObjectId(decoded.id);

      const project = await Project.findOneAndRemove({creator: id, _id: ObjectId(project_id)});

      return project;
    },
    updateProject: async (_, {creator, title, description}) => {
      const decoded = jwt.decode(creator, config.secret);
      const ObjectId = mongoose.Types.ObjectId;
      const id = ObjectId(decoded.id);
      
      const project = await Project.findOneAndUpdate({creator: id, title, description});

      return project;
    },
    postComment: async (_, {comment, project_id, creator}) => {
      const decoded = jwt.decode(creator, config.secret);
      const ObjectId = mongoose.Types.ObjectId;
      const projectId = ObjectId(project_id);
      const userId = decoded.email;
      const project = await Project.findOne({_id: projectId});
      const newComment = await Comment.create({
        comment,
        creator: userId,
        project: projectId
      });

      newComment.save((err) => {
        if (err) return new Error(err);

        project.comments.push(newComment._id);
        project.save();
      });
      
      return newComment;
    },
    login: async (_, {email, password}) => {
      const user = await User.findOne({email});
      if (!email) throw new Error("No email provided");
      if (!password) throw new Error("No password provided");
      if (!user) throw new Error("User does not exist");

      const validPass = await bcrypt.compare(password, user.password);

      if (!validPass) throw new Error("Email or password are incorrect");
      return jwt.sign({id: user._id, email: user.email}, config.secret, {
        expiresIn:"30d"
      });
    },
    updateAccount: async (_, {email, password, username, creator}) => {
      const decoded = jwt.decode(creator, config.secret);
      const ObjectId = mongoose.Types.ObjectId;
      const id = ObjectId(decoded.id);
      const user = await User.findOne({_id: id});
      const validPass = await bcrypt.compare(password, user.password);
      
      if (!email) return new Error("No email provided");
      if (!password) return new Error("No password provided");
      // if (!validPass) return
      return User.findOneAndUpdate({_id: id}, {email, username, password});
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