import FuelConsumptionModel from "../models/fuelConsumption.model.js";
import { getDistance } from "../utils/getDistance.js";
import mongoose from "mongoose";
import { updateStreak } from "./streak.controller.js";
import userModel from "../models/user.model.js";

const FUEL_EFFICIENCY = {
    "Petrol Car": 15,  // 15 km per liter
    "Diesel Car": 20,  // 20 km per liter
    "Electric Bike": 50, // 50 km per kWh
    "Public Transport": 100 // 100 km per liter equivalent
};

export async function logFuelConsumption(req,res){
    try {
        const userId = req.userId 
        const {fromPlace,toPlace,Mode} = req.body

        if (!fromPlace || !toPlace || !Mode) {
            return res.status(400).json({ 
                message: "Plz Provide to necessary fields" ,
                success : false ,
                error : true
            });
        }

        const allowedModes = ["Petrol Car", "Diesel Car", "Electric Bike", 
                             "Public Transport", "Bicycle", "Walking"];
        if (!allowedModes.includes(Mode)) {
            return res.status(400).json({ 
                message: "Invalid transport mode",
                success: false,
                error: true,
                allowedModes // Show allowed modes in response
            });
        }

        const distance = await getDistance(fromPlace,toPlace);

        if(!distance){
            return res.status(400).json({
                message : "error occur while calculating the distance",
                success : false ,
                error : true
            })
        }

        let pointsAwarded = 0 ;

        if(Mode == "Bicycle" || Mode == "Walking"){
            pointsAwarded = distance * 1 ;
        }
        else if(Mode == "Public Transport"){
            pointsAwarded = distance * 0.5 ;
        }
        else if(Mode == "Electric Bike"){
            pointsAwarded = distance * 0.25 ;
        }
        else{
            const efficiency = FUEL_EFFICIENCY[Mode];
            if(!efficiency){
                return res.status(400).json({ 
                    message: "Invalid transport mode" ,
                    success : false , 
                    error : true 
                });
            }
            pointsAwarded = 0 ;
        }

        const newFuelEntry = new FuelConsumptionModel({
            userId,
            fromPlace,
            toPlace,
            distance,
            transportMode : Mode,
            pointsAwarded
        });

        const UpdatePoints = await userModel.findOneAndUpdate(
            { _id: userId },
            { $inc: { points: pointsAwarded } },
            { new: true, upsert: true }
        );

        await newFuelEntry.save()

        await updateStreak(userId);

        return res.redirect('/api/user/input');
        
    } catch (error) {
        res.status(500).json({
            message: error.message || "Internal Server Error",
            success: false,
            error : true
        });
    }
}

export async function getTodaysConsumption(req,res){
    try {
        const userId = req.userId
        const todayStart = new Date();
        todayStart.setHours(0,0,0,0)

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999)

        const todayData = await FuelConsumptionModel.find({userId,
            createdAt : { $gte : todayStart, $lte : todayEnd }
        })

        if(!todayData.length){
            return res.status(404).json({
                message: "No fuel data found for today",
                success: false,
                error: true
            });
        }

        return res.json({
            message: "Today's fuel data retrieved",
            success: true,
            error: false,
            data: todayData
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Internal Server Error",
            success: false,
            error : true
        });
    }
}

export async function getWeeklyFuelUsage(req,res){
    try {
        const userId = req.userId
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0,0,0,0);

        const weeklyData = await FuelConsumptionModel.aggregate([
            {
                $match : {
                    userId: new mongoose.Types.ObjectId(userId),
                    createdAt : {$gte : sevenDaysAgo}
                }
            },
            {
                $group : {
                    _id : {
                        date :  { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        day: { $dayOfWeek: "$createdAt" }
                    },
                    totalDistance: { $sum: "$distance" },
                    totalPoints: { $sum: "$pointsAwarded" }
                }
            },
            {
                $addFields : {
                    day: {
                        $arrayElemAt: [
                            ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                            { $subtract: ["$_id.day", 1] }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    day: 1,
                    date: "$_id.date",
                    totalDistance: 1,
                    totalPoints: 1
                }
            },
            { $sort: { date: 1 } }
        ])

        if (!weeklyData.length) {
            return res.status(404).json({
                message: "No fuel data found for the past 7 days",
                success: false,
                error : true 
            });
        }

        return res.json({
            message: "Weekly fuel data retrieved",
            success: true,
            data: weeklyData,
            error : false 
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || "Internal Server Error",
            success: false,
            error : true
        });
    }
}