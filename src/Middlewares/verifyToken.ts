const jwt = require('jsonwebtoken'); 
module.exports = (req, res, next) => {
  console.log("In token function")
  try {
    console.log(req.headers.token)
    const token = req.headers.token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken)
    const userId = decodedToken.userId;
    req.userId = userId;
    if (! userId) {
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch (e){
      res.sendStatus(403);
  }
};