const jwtadmin = require('jsonwebtoken'); 
module.exports = (req:any, res:any, next) => {
  console.log("In token function")
  try {
    console.log(req.headers.token)
    const token = req.headers.token;
    const decodedToken = jwtadmin.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken)
    const role = decodedToken.role;
    req.userId = role;
    if (role!="Admin") {
      throw 'User is not Admin';
    } else {
      next();
    }
  } catch (e){
      res.json("user is not Admin" );
      res.sendStatus(403);
  }
};