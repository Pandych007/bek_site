const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { sequelize } = require("./models");
const authRoutes = require("./routes/auth");
const playersRoutes = require("./routes/players");
const teamsRoutes = require("./routes/teams");
const rankingRoutes = require("./routes/ranking");
const errorHandler = require("./middlewares/errorHandler");
const path = require("path");

const app = express();
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/img", express.static(path.join(__dirname, "bek", "img")));

app.use("/img", (req, res, next) => {
  console.log(req.url);
  next();
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use("/auth", authRoutes);
app.use("/players", playersRoutes);
app.use("/team", teamsRoutes);
app.use("/ranking", rankingRoutes);

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Добро пожаловать в API баскетбольных команд",
    endpoints: {
      auth: {
        "POST /auth/register": "Регистрация",
        "POST /auth/login": "Авторизация",
        "GET /auth/me": "Профиль пользователя",
      },
      players: {
        "GET /players": "Список игроков",
        "GET /players/:id": "Игрок по ID",
        "POST /players": "Создать игрока (admin)",
        "PUT /players/:id": "Обновить игрока (admin)",
        "DELETE /players/:id": "Удалить игрока (admin)",
      },
      teams: {
        "POST /team": "Создать команду",
        "GET /team": "Мои команды",
        "GET /team/:id": "Команда по ID",
      },
      ranking: {
        "GET /ranking": "Рейтинг команд",
      },
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Маршрут не найден",
    path: req.path,
    method: req.method,
  });
});

app.use(errorHandler);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Подключение к базе данных установлено");

    await sequelize.sync({ force: false });
    console.log("Модели синхронизированы с базой данных");

    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(`API доступно по адресу: http://localhost:${PORT}`);
      console.log("Доступные endpoints:");
      console.log("POST /auth/register - Регистрация");
      console.log("POST /auth/login - Авторизация");
      console.log("GET  /players - Список игроков");
      console.log("POST /team - Создать команду");
      console.log("GET  /ranking - Рейтинг команд");
    });
  } catch (error) {
    console.error("Ошибка при запуске сервера:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("\nПолучен сигнал SIGINT, завершение работы...");
  await sequelize.close();
  console.log("Подключение к базе данных закрыто");
  process.exit(0);
});

startServer();
