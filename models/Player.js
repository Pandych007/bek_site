const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Player = sequelize.define(
  "Player",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    position: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rebounds: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    assists: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    fouls: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    steals: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    turnovers: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    blocks: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    points: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    avatar: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "players",
    timestamps: true,
  }
);

module.exports = Player;
