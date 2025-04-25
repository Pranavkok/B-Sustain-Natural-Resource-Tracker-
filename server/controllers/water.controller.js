import WaterConsumptionModel from "../models/waterConsumption.model.js";
import mongoose from "mongoose";
import { updateStreak } from "./streak.controller.js";

const unitToLiters = {
    glass: 0.25,
    cup: 0.24,
    bottle: 0.5,
    liter: 1,
    bucket: 10,
    gallon_us: 3.79,
    gallon_uk: 4.54,
    jug: 2
};

export async function addWater(req,res){
    try {
        const {amount,unit} = req.body ;
        const userId = req.userId ;

        if(!amount || !unit || !unitToLiters[unit]){
            return res.status(400).json({
                message: "Please provide all fields",
                success: false,
                error: true
            });
        }

        const TotalWaterUsed = amount * unitToLiters[unit] ;

        const today = new Date() ;
        today.setHours(0,0,0,0);

        const waterEntry = await WaterConsumptionModel.findOne({userId,date:today});

        if(waterEntry){
            waterEntry.amount += TotalWaterUsed 
            await waterEntry.save()
        }else{
            const newEntry = new WaterConsumptionModel({
                userId,
                amount: TotalWaterUsed,
                date: today
            });
            await newEntry.save();
        }

        const totalConsumption = await WaterConsumptionModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, totalLiters: { $sum: "$amount" } } }
        ]);

        const totalWaterUsed = totalConsumption.length ? totalConsumption[0].totalLiters : 0;

        await updateStreak(userId);

        return res.redirect('/api/user/input');

    } catch (error) {
        return res.status(500).json({
            message : error.message || error ,
            success : false ,
            error : true
        })
    }
}

export async function getTotalWater(req,res){
    try {
        const userId = req.userId 

        const totalConsumption = await WaterConsumptionModel.aggregate([
            {$match : {userId : new mongoose.Types.ObjectId(userId)} },
            {
                $group : {
                    _id : null ,
                    totalLiters : {$sum : "$amount"}
                }
            }
        ])

        const totalWaterUsed = totalConsumption.length > 0 ? totalConsumption[0].totalLiters : 0;

        return res.json({
            message: "Total water consumption fetched successfully",
            success: true,
            error: false,
            data: {
                totalConsumption: totalConsumption || [],
                totalWaterUsed
            }
        });
    } catch (error) {
        return res.status(500).json({
            message : error.message || error ,
            success : false ,
            error : true
        })
    }
}

export async function FetWeeklyWaterData(req, res) {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ message: "User not found" });

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // console.log("Fetching data from:", sevenDaysAgo, "to", today);

        const rawData = await WaterConsumptionModel.find({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: sevenDaysAgo, $lte: today }
        });

        // console.log("Raw Data:", rawData);

        if (rawData.length === 0) {
            return res.json({
                message: "No water consumption data found for this week",
                success: true,
                error: false,
                data: []
            });
        }

        const weeklyData = await WaterConsumptionModel.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    createdAt: { $gte: sevenDaysAgo, $lte: today }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        day: { $dayOfWeek: "$createdAt" }
                    },
                    totalLiters: { $sum: "$amount" }
                }
            },
            {
                $addFields: {
                    dayName: {
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
                    date: "$_id.date",
                    dayName: 1,
                    totalLiters: 1
                }
            },
            { $sort: { date: 1 } }
        ]);

        return res.json({
            message: "Weekly water consumption data fetched successfully",
            success: true,
            error: false,
            data: weeklyData
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}
