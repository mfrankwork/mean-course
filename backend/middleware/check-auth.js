const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // "Bearer abcdefabcdef"
    const token = req.headers.authorization.split(' ')[1];

    // If verify fails, error is thrown
    jwt.verify(token, 'secret_this_should_be_longer');

    next();
  } catch (error) {
    console.error(`[${req.id}] Auth failed!`);
    res.status(401).json({
      message: 'Auth failed!'
    });
  }
};
