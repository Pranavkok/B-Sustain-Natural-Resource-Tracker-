import { Router } from "express"
import { getTodaysConsumption, getWeeklyFuelUsage, logFuelConsumption } from "../controllers/fuel.controller.js";
import auth from "../middleware/auth.middleware.js";

const fuelRouter = Router();

fuelRouter.post('/add-fuelData',auth,logFuelConsumption)
fuelRouter.get('/get-todayfuelData',auth,getTodaysConsumption)
fuelRouter.get('/get-weeklyfuelData',auth,getWeeklyFuelUsage)

export default fuelRouter