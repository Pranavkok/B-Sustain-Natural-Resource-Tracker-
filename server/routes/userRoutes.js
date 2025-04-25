import { Router } from "express"
import { forgotPasswordController, getUserProfileController, loginUserController, logoutUserController, refreshTokenController, registerUserController, resetPasswordController, updateProfileController, verifyEmailController, verifyOtpController } from "../controllers/user.controller.js"
import auth from "../middleware/auth.middleware.js"
import { GetLeaderBoard, GetTopUsers, GetUserRank } from "../controllers/leaderboard.controller.js"
import { getStreak } from "../controllers/streak.controller.js"
import { getBadgeData } from "../controllers/badge.controller.js"

const userRouter = Router()

userRouter.post('/register', registerUserController);

userRouter.post('/login', async (req, res) => {
    try {
        await loginUserController(req, res);
        res.redirect('/dashboard');
    } catch (error) {
        res.render('login', { error: error.message });
    }
});

userRouter.get('/logout',auth,logoutUserController)
userRouter.post('/verify-email',verifyEmailController)
userRouter.post('/refresh-token',refreshTokenController)
userRouter.put('/forgot-password',forgotPasswordController)
userRouter.put('/verify-otp',verifyOtpController)
userRouter.put('/reset-password',resetPasswordController)
// userRouter.get('/get-profile',auth,getUserProfileController)
userRouter.post('/update-profile',auth,updateProfileController)
userRouter.get('/get-leaderboard',GetLeaderBoard)
userRouter.get('/get-topusers',GetTopUsers)
userRouter.get('/user-rank',auth,GetUserRank)
userRouter.get('/get-streak',auth,getStreak)
userRouter.get('/get-badges', auth,getBadgeData)

export default userRouter