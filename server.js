import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { AuthRouter } from './src/routes/AuthRoutes.js';
import { UserRouter } from './src/routes/UserRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//use AuthRoutes
app.use('/',AuthRouter);

//use UserRoutes
app.use('/',UserRouter);

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});