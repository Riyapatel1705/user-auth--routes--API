// db.js
import { Sequelize } from "sequelize";

export const db = new Sequelize("event_db", "new", "new@71", {
  host: "localhost",
  dialect: "mysql",
});
