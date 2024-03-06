import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Customers = db.define(
  "customers",
  {
    name: {
      type: DataTypes.STRING,
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [13],
      },
    },
    telp: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    profile_picture: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 20],
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    otp: {
      type: DataTypes.STRING,
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Customers;
