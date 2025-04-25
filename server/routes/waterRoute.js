import { Router } from "express";
import { addWater, getTotalWater, FetWeeklyWaterData } from "../controllers/water.controller.js";
import auth from "../middleware/auth.middleware.js";

const waterRouter = Router()

waterRouter.post('/add-water',auth,addWater)
waterRouter.get('/get-totalwater',auth,getTotalWater)
waterRouter.get('/get-weekdata',auth,FetWeeklyWaterData)

export default waterRouter