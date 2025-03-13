import env from 'dotenv';
import express from 'express';
import path from 'path';
import { AuthRouter } from './routes/AuthRoutes.js';
const app = express();
env.config();
const PORT = 3000;

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder


app.use(AuthRouter);


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
