const express = require("express");
const { Player, Team } = require("../models");
const { authenticate, authorize } = require("../middlewares/auth");
const router = express.Router();
const { Op } = require("sequelize");

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, position, search } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (position) {
      where.position = position;
    }
    if (search) {
      where.name = {
        [Op.iLike]: `%${search}%`,
      };
    }
    const { count, rows: players } = await Player.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["position", "DESC"]],
    });
    res.json({
      players,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalPlayers: count,
    });
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const player = await Player.findByPk(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Игрока не найден" });
      }
      await player.destroy();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

router.post("/", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const {
      name,
      position,
      avatar,
      cost,
      points,
      rebounds,
      assists,
      fouls,
      steals,
      turnovers,
      blocks,
    } = req.body;

    if (!name || !position || !cost) {
      return res.status(400).json({
        error: "Имя, позиция и стоимость обязательны!",
      });
    }

    const player = await Player.create({
      name,
      position,
      rebounds: rebounds ? parseFloat(rebounds) : 0,
      assists: assists ? parseFloat(assists) : 0,
      fouls: fouls ? parseFloat(fouls) : 0,
      steals: steals ? parseFloat(steals) : 0,
      turnovers: turnovers ? parseFloat(turnovers) : 0,
      blocks: blocks ? parseFloat(blocks) : 0,
      points: points ? parseFloat(points) : 0,
      avatar: avatar ? avatar : "",
      cost: parseFloat(cost),
    });
    res.status(201).json(player);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) {
      return res.status(404).json({ error: "Игрок не найден" });
    }

    const {
      name,
      avatar,
      cost,
      points,
      rebounds,
      assists,
      fouls,
      steals,
      turnovers,
      blocks,
      is_active,
    } = req.body;
    await player.update({
      name: name || player.name,
      avatar: avatar || player.avatar,
      cost: cost !== undefined ? parseFloat(cost) : player.cost,
      points: points !== undefined ? parseFloat(points) : player.points,
      rebounds: rebounds !== undefined ? parseFloat(rebounds) : player.rebounds,
      assists: assists !== undefined ? parseFloat(assists) : player.assists,
      fouls: fouls !== undefined ? parseFloat(fouls) : player.fouls,
      steals: steals !== undefined ? parseFloat(steals) : player.steals,
      turnovers:
        turnovers !== undefined ? parseFloat(turnovers) : player.turnovers,
      blocks: blocks !== undefined ? parseFloat(blocks) : player.blocks,
      is_active: is_active !== undefined ? is_active : player.is_active,
    });
    res.json(player);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
