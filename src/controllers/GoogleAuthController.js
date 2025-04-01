import passport from "passport";
import jwt from 'jsonwebtoken';


//add google authentication 
export const authenticateUser = passport.authenticate("google", { scope: ["profile", "email"] });

//add authentication callback
export const authenticateCallback = (req, res, next) => {
    passport.authenticate("google", async (err, user, info) => {
        if (err) return res.status(500).json({ message: "Internal Server Error" });

        if (!user) {
            return res.status(401).json({ message: "Access Denied: You must register first." });
        }

        // Generate JWT for authenticated user
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({
            message: "Google authentication successful",
            user: { id: user.id, email: user.email },
            token
        });
    })(req, res, next);
};


//success message after successful authentication
export const googleAuthSuccess = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    res.json({ message: "Google authentication successful", user: req.user });
};
