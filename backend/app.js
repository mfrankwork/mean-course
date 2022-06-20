const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const postRoutes = require('./routes/posts');

const app = express();

// Connect to MongoDB
//
// NOTE: If you are using MongoDB Atlas, make sure that Network Access is configured for your IP address
const mongoUser = process.env.MONGODB_USER;
const mongoPassword = process.env.MONGODB_PASSWORD;
const mongoHost = process.env.MONGODB_HOST;
const mongoDatabase = process.env.MONGODB_DATABASE;
const mongoConnStr = `mongodb+srv://${mongoUser}:${mongoPassword}@${mongoHost}/${mongoDatabase}?retryWrites=true&w=majority`;
mongoose
  .connect(mongoConnStr)
  .then(() => {
    console.log('Connected to database');
  })
  .catch((err) => {
    console.error('Connection failed!', err);
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); // NOTE: Not necessary for this application
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});

app.use('/api/posts', postRoutes);

module.exports = app;
