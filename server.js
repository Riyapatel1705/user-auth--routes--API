import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { AuthRouter } from './src/routes/AuthRoutes.js';
import { UserRouter } from './src/routes/UserRoutes.js';
import { db } from './src/db/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use(AuthRouter);
app.use(UserRouter);

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

(async ()=>{
    try{
        await db.sync({alter:true});
        console.log('Database synchronised');
    }catch(err){
        console.error('Error syncing datatbase:',err);
    }
})();



const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});