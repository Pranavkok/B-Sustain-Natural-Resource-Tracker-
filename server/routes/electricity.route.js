import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import { GetTodaysElectricityConsumption, GetWeeklyElectricityData, logElectricityUsage } from "../controllers/electricity.controller.js";

const electricityRouter = Router()

electricityRouter.post('/add-eData',auth,logElectricityUsage)
electricityRouter.get('/get-latest',auth ,GetTodaysElectricityConsumption)
electricityRouter.get('/get-week',auth,GetWeeklyElectricityData)

export default electricityRouter