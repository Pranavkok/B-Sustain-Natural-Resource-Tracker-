import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()
import cookieParser from "cookie-parser"
import morgan from "morgan"
import helmet from "helmet"
import mongoose from "mongoose"
import cron from "node-cron"
import connectDb from "./config/connectDB.js"
import userRouter from "./routes/userRoutes.js"
import feedbackRouter from "./routes/feedbackRoute.js"
import waterRouter from "./routes/waterRoute.js"
import { UpdateElectricityPointsDaily, UpdateWaterPointsDaily } from "./utils/updateUserPoints.js"
import electricityRouter from "./routes/electricity.route.js"
import fuelRouter from "./routes/fuel.route.js"
import path from "path"
import { fileURLToPath } from 'url'
import { getTotalWater, FetWeeklyWaterData } from "./controllers/water.controller.js"
import { GetTodaysElectricityConsumption, GetWeeklyElectricityData } from "./controllers/electricity.controller.js"
import { getTodaysConsumption, getWeeklyFuelUsage } from "./controllers/fuel.controller.js"
import { getStreak } from "./controllers/streak.controller.js"
import { GetLeaderBoard, GetTopUsers, GetUserRank } from "./controllers/leaderboard.controller.js"
import auth from "./middleware/auth.middleware.js"
import { getUserProfileController } from "./controllers/user.controller.js"
import { getBadgeData } from "./controllers/badge.controller.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    credentials : true ,
    origin : process.env.FRONTEND_URL
}))

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // No 'unsafe-inline'
      styleSrc: ["'self'", "https:", "'unsafe-inline'"], // allow Tailwind styles
      objectSrc: ["'none'"],
    }
  })
);

// app.use(
//     helmet.contentSecurityPolicy({
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'"], // No 'unsafe-inline'
//         styleSrc: ["'self'", "https:", "'unsafe-inline'"], // allow Tailwind styles
//         objectSrc: ["'none'"],
//       }
//     })
//   );

const port = process.env.PORT || 8080 ;

cron.schedule("59 23 * * *", async () => {
    console.log("⏳ Running daily water check...");
    await UpdateWaterPointsDaily();
    await UpdateElectricityPointsDaily();
    console.log("✅ Daily water check completed.");
});

app.get('/',(req,res)=>{
    res.render("landing.ejs")
})
app.get('/api/user/register',(req,res)=>{
    res.render("register.ejs")
})
app.get('/api/user/login',(req,res)=>{
    res.render("login.ejs")
})
app.get('/api/user/dashboard', auth, async (req, res) => {
    try {
        // Store the original res.json function
        const originalJson = res.json;
        let dashboardData = {};

        // Override res.json temporarily to capture data
        res.json = function(data) {
            return data;
        };

        // Call all controllers and store their responses
        dashboardData.waterTotal = await getTotalWater
        (req, res);
        dashboardData.weeklyWater = await FetWeeklyWaterData(req, res);
        dashboardData.electricityToday = await GetTodaysElectricityConsumption(req, res);
        dashboardData.weeklyElectricity = await GetWeeklyElectricityData(req, res);
        dashboardData.fuelToday = await getTodaysConsumption(req, res);
        dashboardData.weeklyFuel = await getWeeklyFuelUsage(req, res);
        dashboardData.streak = await getStreak(req, res);
        dashboardData.rank = await GetUserRank(req, res);

        // Restore original res.json
        res.json = originalJson;
        console.log(dashboardData);
        
        // Render dashboard with all data
        // return res.json({
        //     message: "Dashboard data fetched successfully",
        //     data: dashboardData,
        //     success: true,
        //     error: false
        // });
        res.render('dashboard', { data: dashboardData });

    } catch (error) {
        console.error('Dashboard Error:', error);
        res.render('dashboard', { 
            error: 'Failed to load dashboard data',
            data: null
        });
    }
});

app.get('/api/user/profile', auth, async (req, res) =>{
    try {
        const originalJson = res.json;
        let ProfileData = {};

        // Override res.json temporarily to capture data
        res.json = function(data) {
            return data;
        };

        ProfileData = await getUserProfileController(req, res);

        res.json = originalJson;
        // console.log(dashboardData);
        
        // res.json({
        //     data : ProfileData,
        //     success : true,
        // })
        // Render dashboard with all data
        res.render('profile', { data: ProfileData });

    } catch (error) {
        console.error('Dashboard Error:', error);
        res.render('profile', { 
            error: 'Failed to load dashboard data',
            data: null
        });
    }
});

app.get('/api/user/update-profile', auth, async (req, res) =>{
    try {
        res.render('updateProfile');
    } catch (error) {
        console.error('updateProfile Error:', error);
        res.render('updateProfile', { 
            error: 'Failed to load updateProfile data',
            data: null
        });
    }
});

app.get('/api/user/leaderboard',auth,async (req,res) => {
    try {
        const originalJson = res.json;
        let leaderboardData;
        let topUsers;
        let userRank;

        // Override res.json temporarily to capture data
        res.json = function(data) {
            return data;
        };

        leaderboardData = await GetLeaderBoard(req, res);
        topUsers = await GetTopUsers(req,res);
        userRank = await GetUserRank(req,res);


        res.json = originalJson;
        // res.json({ all: leaderboardData , three : topUsers , you : userRank });
        res.render('leaderboard', { all: leaderboardData , three : topUsers , you : userRank });
    } catch (error) {
        console.error('leaderboard Error:', error);
        res.render('leaderboard', { 
            error: 'Failed to load leaderboard data',
            data: null
        }); 
    }
})

app.get('/api/user/input',auth,async (req,res) => {
    try {
        res.render('inputPage');
    } catch (error) {
        console.error('input page  Error:', error);
        res.render('inputPage', { 
            error: 'Failed to load input page ',
            data: null
        }); 
    }
}
)

app.get('/api/user/feedback', auth, async (req, res) => {
    try {
        const feedbackResponse = await feedbackRouter.getFeedback(req, res);
        
        if (!feedbackResponse.success) {
            throw new Error('Feedback fetch failed');
        }

        // res.render('feedback', { data: feedbackResponse });
        return res.json({
            message: "Feedback fetched successfully",
            data: feedbackResponse,
            success: true,
            error: false
        });
    } catch (error) {
        console.error('feedback page Error:', error);
        res.render('feedback', { 
            error: 'Failed to load feedback page',
            data: { data: [] }
        });
    }
});

app.get('/api/user/badges', auth, async (req, res) => {
    try {
        const badgeData = await getBadgeData(req, res);
        if (!badgeData.success) {
            throw new Error(badgeData.message || 'Badge data fetch failed');
        }
        res.render('badges', { 
            data: badgeData.data,
            success: true,
            error: false
        });
    } catch (error) {
        console.error('Badge page Error:', error);
        res.render('badges', { 
            error: error.message || 'Failed to load badge data',
            success: false,
            data: null
        });
    }
});


app.use('/api/user',userRouter)
app.use('/api/feedback',feedbackRouter)
app.use('/api/water',waterRouter)
app.use('/api/electricity',electricityRouter)
app.use('/api/fuel',fuelRouter)

connectDb().then(()=>{
    app.listen(port,()=>{
        console.log(`Server serving on port ${port}`)
    })
})