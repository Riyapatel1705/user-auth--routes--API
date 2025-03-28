import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import  './src/config/passport.js';
import passport from 'passport';
import { AuthRouter } from './src/routes/AuthRoutes.js';
import { db } from './src/db/index.js';
import { GoogleAuthRouter } from './src/routes/GoogleAuthRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(session({
    secret: 'your_secret_key_here',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(AuthRouter);
app.use(GoogleAuthRouter);

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



const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

