const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Team = sequelize.define(
  "Team",
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
    logo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    total_points: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
  },
  {
    tableName: "teams",
    timestamps: true,
  }
);

module.exports = Team;
