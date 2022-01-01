const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const Post = require('./models/post');

const app = express();

// Connect to MongoDB
const mongoUser = process.env.MONGODB_USER;
const mongoPassword = process.env.MONGODB_PASSWORD;
const mongoHost = process.env.MONGODB_HOST;
const mongoDatabase = process.env.MONGODB_DATABASE;
mongoose
  .connect(`mongodb+srv://${mongoUser}:${mongoPassword}@${mongoHost}/${mongoDatabase}?retryWrites=true&w=majority`)
  .then(() => {
    console.log('Connected to database');
  })
  .catch(() => {
    console.log('Connection failed!');
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); // NOTE: Not necessary for this application

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});

app.post('/api/posts', (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  post.save().then((createdPost) => {
    res.status(201).json({
      message: 'Post added successfully',
      postId: createdPost._id
    });
  });
});

app.get('/api/posts', (req, res, next) => {
  Post.find().then((documents) => {
    res.status(200).json({
      message: 'Posts fetched successfully',
      posts: documents
    });
  });
});

app.get('/api/posts/:id', (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: 'Post not found!' });
    }
  });
});

app.put('/api/posts/:id', (req, res, next) => {
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content
  });
  Post.updateOne({ _id: req.params.id }, post)
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: 'Update successful' });
    })
    .catch((err) => {
      console.error(`UPDATE FAILED: ${err.message}`);
    });
});

app.delete('/api/posts/:id', (req, res, next) => {
  Post.deleteOne({ _id: req.params.id })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: 'Post deleted' });
    })
    .catch((err) => {
      console.error(`DELETE FAILED: ${err.message}`);
    });
});

module.exports = app;
