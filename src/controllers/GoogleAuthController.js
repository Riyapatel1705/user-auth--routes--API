import passport from "passport";

export const authenticateUser = passport.authenticate("google", { scope: ["profile", "email"] });

export const authenticateCallback = passport.authenticate("google", { failureRedirect: "/" });

export const googleAuthSuccess = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    res.json({ message: "Google authentication successful", user: req.user });
};
