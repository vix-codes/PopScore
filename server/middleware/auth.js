const { readStore } = require("../data/store");
const { verifyToken } = require("../utils/token");

function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token is required." });
  }

  try {
    const token = header.replace("Bearer ", "");
    const payload = verifyToken(token);
    const { users } = readStore();
    const user = users.find((item) => item.id === payload.sub);

    if (!user) {
      return res.status(401).json({ message: "User not found for this token." });
    }

    req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access is required." });
  }

  return next();
}

module.exports = { requireAuth, requireAdmin };
