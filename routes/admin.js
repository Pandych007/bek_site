const express = require("express");
const { Player, Team, User } = require("../models");
const { authenticate, authorize } = require("../middlewares/auth");
const router = express.Router();
const { Op } = require("sequelize");

// GET /admin/

// GET /admin/players
router.get(
  "/players",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, position, status, search } = req.query;
      const offset = (page - 1) * limit;
      const where = {};
      if (position) {
        where.position = position;
      }
      if (status == "active") {
        where.is_active = true;
      } else {
        where.is_active = false;
      }
      if (search) {
        where.name = {
          [Op.like]: `%${search}%`,
        };
      }

      const { count, rows: players } = await Player.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
        includes: [
          {
            model: Team,
            as: "teams",
            attributes: ["id"],
            through: { attributes: [] },
          },
        ],
      });

      const playerWithTeamsCount = players.map((player) => ({
        ...player.toJSON(),
        teams_count: player.teams ? player.teams.length : 0,
      }));

      res.json({
        players: playerWithTeamsCount,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalPlayers: count,
      });
    } catch (error) {
      next(error);
    }
  },
);
//GET /admin/users
router.get(
  "/users",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, search } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows: users } = await Player.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
        attributes: ["id", "name", "email", "role", "created_at", "updated_at"],
      });

      res.json({
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalUsers: count,
      });
    } catch (error) {
      next(error);
    }
  },
);
//GET /admin/teams
router.get(
  "/teams",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const offset = (page - 1) * limit;
      const where = {};

      if (search) {
        where.name = {
          [Op.like]: `%${search}%`,
        };
      }

      const { count, rows: teams } = await Team.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
        includes: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
            through: { attributes: [] },
          },
          {
            model: Player,
            as: "players",
            attributes: ["id", "name", "position"],
            through: { attributes: [] },
          },
        ],
      });

      const teamsWithPlayerCount = teams.map((team) => ({
        ...team.toJSON(),
        player_count: team.players ? team.players.length : 0,
      }));

      res.json({
        teams: teamsWithPlayerCount,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalTeams: count,
      });
    } catch (error) {
      next(error);
    }
  },
);
// /admin/teams/:id
router.delete(
  "/teams/:id",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const team = await Team.findByPk(req.params.id, {
        include: [
          {
            model: Player,
            as: "players",
            through: { attributes: [] },
          },
        ],
      });

      if (!team) {
        return res.status(404).json({ error: "Команда не найдена" });
      }

      const playerIds = team.players.map((player) => player.id);
      if (playerIds.length > 0) {
        await Player.update(
          { is_active: true },
          {
            where: {
              id: {
                [Op.in]: playerIds,
              },
            },
          },
        );
      }

      await team.destroy();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

// /admin/deleteUser для админа
router.delete(
  "/deleteUser/:id",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найдена" });
      }

      await user.destroy();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

// /admin/getAllUsers для админа
router.get(
  "/getAllUsers",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const users = await User.findAll();

      res.json({
        users: users,
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
