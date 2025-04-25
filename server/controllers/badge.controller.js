import mongoose from "mongoose";
import ElectricityConsumptionModel from "../models/electricityConsumption.model.js";
import { getStreakValue } from "./streak.controller.js";
import WaterConsumptionModel from "../models/waterConsumption.model.js";
import FuelConsumptionModel from "../models/fuelConsumption.model.js";

export async function getBadgeData(req,res){
    try {
         const userid = req.userId;
            if (!userid) {
                return { success: false, message: "User ID is required" };
            }
         // Get all records and calculate sums
         const electricityConsumptions = await ElectricityConsumptionModel.find({ userId: userid });
         const waterConsumptions = await WaterConsumptionModel.find({ userId: userid });
         const fuelConsumptions = await FuelConsumptionModel.find({ userId: userid });
         const streak = await getStreakValue(userid);

         // Calculate total sums
         const totalElectricity = electricityConsumptions.reduce((sum, record) => sum + (record.usage || 0), 0);
         const totalWater = waterConsumptions.reduce((sum, record) => sum + (record.amount || 0), 0);
         const totalFuel = fuelConsumptions.reduce((sum, record) => sum + (record.pointsAwarded || 0), 0);

         const dataOfBadge = {
             electricity: totalElectricity,
             water: totalWater,
             fuel: totalFuel,
             streak: streak || 0
         };
         return {
            success: true,
            error: false,
            data: dataOfBadge,
            message: "Badge data fetched successfully"
         };
    } catch (error) {
        console.error("Error fetching badge data:", error);
        return { 
            success: false, 
            error: true,
            message: "Internal server error" 
        };
    }
}