const express = require("express");
const { Player, Team, User, sequelize } = require("../models");
const router = express.Router();

router.get("/", async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "total_points",
    order = "DESC",
  } = req.query;

  const offset = (page - 1) * limit;
  const orderDirection = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

  const { count, rows: users } = await User.findAndCountAll({
    include: [
      {
        model: Team,
        as: "teams",
        include: [
          {
            model: Player,
            as: "players",
            through: { attributes: [] },
            attributes: [
              "id",
              "name",
              "points",
              "rebounds",
              "assists",
              "fouls",
              "steals",
              "turnovers",
              "blocks",
            ],
          },
        ],
      },
    ],
    where: {
      role: "user",
    },
    order: [["name", "ASC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  const ranking = users.map((user) => {
    let teamCount = 0;
    let totalPlayers = 0;

    let totalPoint = 0;
    let totalrebounds = 0;
    let totalassists = 0;
    let totalfouls = 0;
    let totalsteals = 0;
    let totalturnovers = 0;
    let totalblocks = 0;

    user.teams.forEach((team) => {
      teamCount++;
      team.players.forEach((player) => {
        totalPoint += parseFloat(player.points) || 0;
        totalrebounds += parseFloat(player.rebounds) || 0;
        totalassists += parseFloat(player.assists) || 0;
        totalfouls += parseFloat(player.fouls) || 0;
        totalsteals += parseFloat(player.steals) || 0;
        totalturnovers += parseFloat(player.turnovers) || 0;
        totalblocks += parseFloat(player.blocks) || 0;
        totalPlayers++;
      });
    });

    return {
      user_name: user.name,
      total_count: totalPlayers,
      total_points: parseFloat(totalPoint.toFixed(1)),
      total_rebounds: parseFloat(totalrebounds.toFixed(1)),
      total_assists: parseFloat(totalassists.toFixed(1)),
      total_fouls: parseFloat(totalfouls.toFixed(1)),
      total_steals: parseFloat(totalsteals.toFixed(1)),
      total_turnovers: parseFloat(totalturnovers.toFixed(1)),
      total_blocks: parseFloat(totalblocks.toFixed(1)),
    };
  });

  ranking.sort((a, b) => {
    if (sortBy && a[sortBy] && b[sortBy]) {
      return orderDirection === "DESC"
        ? b[sortBy] - a[sortBy]
        : a[sortBy] - b[sortBy];
    }
    return 0;
  });
  return res.json({
    ranking,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    totalUsers: count,
  });
});

module.exports = router;
