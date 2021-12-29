const express = require('express');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

app.post('/api/posts', (req, res, next) => {
  console.log();
});

app.use('/api/posts', (req, res, next) => {
  const posts = [
    {
      id: 'gdhsjg',
      title: 'First server-side post',
      content: 'Some content',
    },
    {
      id: 'wqewewewe',
      title: 'Second server-side post',
      content: 'More content',
    },
  ];
  res.status(200).json({
    message: 'Posts fetched successfully',
    posts,
  });
});

module.exports = app;
