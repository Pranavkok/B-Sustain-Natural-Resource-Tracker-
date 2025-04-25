import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import WaterConsumptionModel from "../models/waterConsumption.model.js";
import ElectricityConsumptionModel from "../models/electricityConsumption.model.js";

export async function UpdateWaterPointsDaily(req,res){
    try {
        const today = new Date()
        today.setHours(0,0,0,0)

        const users = await userModel.find({},"_id points")

        for(const user of users){
            const hasLoggedToday = await WaterConsumptionModel.exists({
                userId : new mongoose.Types.ObjectId(user._id),
                createdAt : {$gte : today}
            })

            if(hasLoggedToday){
                await userModel.findByIdAndUpdate(user._id,{
                    $inc : {points : 10}
                })
            }
            else{
                await userModel.findByIdAndUpdate(user._id,{
                    $inc : {points: -2}
                })
            }
        }
    } catch (error) {
        console.log("Error occured in update waterpoints",error.message)
    }
}

export async function UpdateElectricityPointsDaily(req,res){
    try {
        const today = new Date()
        today.setHours(0,0,0,0)

        const users = await userModel.find({},"_id points")

        for(const user of users){
            const hasLoggedToday = await ElectricityConsumptionModel.exists({
                userId : new mongoose.Types.ObjectId(user._id),
                createdAt : {$gte : today}
            })

            if(hasLoggedToday){
                await userModel.findByIdAndUpdate(user._id,{
                    $inc : {points : 10}
                })
            }
            else{
                await userModel.findByIdAndUpdate(user._id,{
                    $inc : {points: -2}
                })
            }
        }
    } catch (error) {
        console.log("Error occured in update electricity points ",error.message)
    }
}
