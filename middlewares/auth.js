const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Токен доступа отсутствует" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Неверный токен" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Доступ запрещен" });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
