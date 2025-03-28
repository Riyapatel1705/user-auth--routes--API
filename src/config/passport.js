import passport  from "passport";
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import {User} from '../db/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy(
    {
        clientID:process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        callbackURL:process.env.CALL_BACK_URL,
    },
    async(accessToken,refreshToken,profile,done)=>{
        try{
            let user=await User.findOne({where:{email:profile.emails[0].value}});


            if(!user){
                user=await User.create({
                    first_name:profile.name.givenName,
                    last_name:profile.name.familyName,
                    email:profile.emails[0].value,
                    password:null
                });
            }

            return done(null,user);
        }catch(error){
            return done(error,null);
        }
    }
));

passport.serializeUser((user,done)=>{
    done(null,user.id);
});

passport.deserializeUser(async(id,done)=>{
   try{
    const user=await User.findByPk(id);
    done(null,user);
   }catch(error){
    done(error,null);
   }
});

export default passport;