const jwt = require("jsonwebtoken");
// verify token
function verifyToken(req, res, next) {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        return res.status(401).send("invalid token");
      }
      req.user = data;
      next();
    });
  } else {
    return res.status(401).send("no token provided");
  }
}
// verify token and authorization
function verifyTokenAndAuthorization(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user._id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).send("you are not allowed");
    }
  });
}
// verify token and is admin
function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (!req.user.isAdmin) {
      return res.status(403).send("only admin");
    }
    next();
  });
}
module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
};
