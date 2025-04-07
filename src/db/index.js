import { Sequelize } from "sequelize";

export const db = new Sequelize("my_database", "new", "new@71", {
  host: "localhost",
  dialect: "mysql",
});

(async () => {
  try {
    await db.authenticate();
    console.log("Connected to MySQL using sequelize");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();
