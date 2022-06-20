const express = require('express');
const multer = require('multer');
const { title } = require('process');

const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth.js');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid MIME type');
    if (isValid) {
      error = null;
    }
    cb(error, 'backend/images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.get('', (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then((count) => {
      console.debug(`[${req.id}] Posts fetched successfully`);
      res.status(200).json({
        message: 'Posts fetched successfully',
        posts: fetchedPosts,
        maxPosts: count
      });
    });
});

router.post('', checkAuth, multer({ storage }).single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename
  });
  post.save().then((createdPost) => {
    console.debug(`[${req.id}] Post added successfully: ${createdPost._id}`);
    res.status(201).json({
      message: 'Post added successfully',
      post: {
        // ...createdPost, // Spread operator returns a copy of all attributes from object, including ones from mongoose that we do not need
        id: createdPost._id,
        title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath
      }
    });
  });
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      console.debug(`[${req.id}] Post found: ${req.params.id}`);
      res.status(200).json(post);
    } else {
      console.debug(`[${req.id}] Post not found: ${req.params.id}`);
      res.status(404).json({ message: 'Post not found!' });
    }
  });
});

router.put('/:id', checkAuth, multer({ storage }).single('image'), (req, res, next) => {
  let imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  } else {
    imagePath = req.body.imagePath;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath
  });
  Post.updateOne({ _id: req.params.id }, post)
    .then((result) => {
      console.debug(`[${req.id}] Post updated: ${req.params.id}`);
      console.log(result);
      res.status(200).json({ message: 'Update successful' });
    })
    .catch((err) => {
      console.error(`[${req.id}] UPDATE FAILED: ${err.message}`);
    });
});

router.delete('/:id', checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id })
    .then((result) => {
      console.debug(`[${req.id}] Post deleted: ${req.params.id}`);
      console.log(result);
      res.status(200).json({ message: 'Post deleted' });
    })
    .catch((err) => {
      console.error(`[${req.id}]DELETE FAILED: ${err.message}`);
    });
});

module.exports = router;
