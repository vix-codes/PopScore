const jwt = require("jsonwebtoken");

const DEFAULT_SECRET = "popscore-dev-secret";

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || DEFAULT_SECRET,
    { expiresIn: "7d" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || DEFAULT_SECRET);
}

module.exports = { signToken, verifyToken };
