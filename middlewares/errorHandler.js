function errorHandler(err, req, res, next) {
  console.log("Error", err);

  if (err.name == "JsonWebTokenError") {
    return res.status(401).json({ error: "Неверный токен" });
  }
  if (err.name == "TokenExpiredError") {
    return res.status(401).json({ error: "Токен истек" });
  }
  if (err.name == "SequelizeValidationError") {
    const errors = err.errors.map((error) => ({
      field: error.path,
      message: error.message,
    }));
    return res.status(400).json({
      error: "Ошибка валидации",
      details: errors,
    });
  }

  if (err.name == "SequelizeUniqueError") {
    return res
      .status(400)
      .json({ error: "Запись с тами данными уже существует" });
  }
  if (err.name == "SequelizeForeignkeyKeyConstrainError") {
    return res
      .status(400)
      .json({ error: "Нарушение целостности внешнего ключа" });
  }
  res.status(500).json({
    error: "Внутреняя ошибка сервер",
    message: process.env.NODE_ENV == "development" ? err.message : undefined,
  });
}
module.exports = errorHandler;
