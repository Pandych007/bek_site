const express = require("express");
const { Player, Team, User, TeamPlayer } = require("../models");
const { authenticate, authorize } = require("../middlewares/auth");
const { Op } = require("sequelize");
const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const teams = await Team.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Player,
          where: { is_active: false },
          as: "players",
          through: { attributes: [] },
          attributes: [
            "id",
            "name",
            "position",
            "points",
            "cost",
            "avatar",
            "rebounds",
            "assists",
            "fouls",
            "steals",
            "turnovers",
            "blocks",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(teams);
  } catch (error) {
    console.log(error);
    next(next);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { name, logo, playerIds, ostatok, budget } = req.body;
    const userId = req.user.id;

    //const userId = req.user.id;
    if (!name || !playerIds || !Array.isArray(playerIds)) {
      return res.status(400).json({
        error: "Название команды и список игроков обязвтельны",
      });
    }

    if (playerIds.length > 7) {
      return res.status(400).json({
        error: "В команде не может быть больше 7 игроков",
      });
    }

    const players = await Player.findAll({
      where: {
        id: playerIds,
        is_active: true,
      },
    });

    if (players.length !== playerIds.length) {
      return res.status(400).json({
        error: "Некоторые игроки не найдены или не активны",
      });
    }

    const totalCost = players.reduce(
      (sum, player) => sum + parseFloat(player.cost),
      0,
    );
    const BUDGET_LIMIT = budget;

    if (totalCost > BUDGET_LIMIT) {
      return res.status(400).json({
        error: "Превышен бюджет команды",
      });
    }

    const totalPoints = players.reduce(
      (sum, player) => sum + parseFloat(player.points),
      0,
    );
    const team = await Team.create({
      name,
      logo,
      user_id: userId,
      total_points: totalPoints,
    });

    await team.addPlayers(players);

    for (const player of players) {
      await player.update({ is_active: false });

      /*await TeamPlayer.create({
        team_id: team_id,
        player_id: player.id,
      });*/
    }

    const teamWithPlayers = await Team.findByPk(team.id, {
      include: [
        {
          model: Player,
          as: "players",
          through: { attributes: [] },
        },
      ],
    });

    const user = await User.findByPk(userId);

    await user.update({ budget: ostatok });

    res.status(201).json({
      message: "Команда успешно создана",
      team: teamWithPlayers,
      budget: BUDGET_LIMIT - totalCost,
      totalPoints,
    });
  } catch (error) {
    next(error);
  }
});

//для админа получить все команды
router.get(
  "/admin/getAllTeams",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const teams = await Team.findAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
            required: false,
          },
          {
            model: Player,
            as: "players",
            through: { attributes: [] },
            attributes: ["id", "name", "cost", "avatar"],
            required: false,
          },
        ],
      });

      res.json(teams);
    } catch (error) {
      console.log(error);
      next(next);
    }
  },
);

module.exports = router;
