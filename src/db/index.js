// index.js
import { db } from './db.js';
import './models/User.js';
import './models/Event.js';
import './models/Bookmark.js';
import './models/Feedback.js';

import './association.js';

(async () => {
  try {
    await db.authenticate();
    console.log("Connected to MySQL using Sequelize");
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
  }
})();

