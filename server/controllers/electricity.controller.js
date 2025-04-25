import ElectricityConsumptionModel from "../models/electricityConsumption.model.js";
import mongoose from "mongoose";
import { updateStreak } from "./streak.controller.js";


export async function logElectricityUsage(req, res) {
    try {
        const userId = req.userId;
        const { todaysMeterReading } = req.body;

        if (!todaysMeterReading) {
            return res.status(400).json({ message: "Today's meter reading is required" });
        }

        // Check if entry already exists for today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const existingEntry = await ElectricityConsumptionModel.findOne({
            userId,
            createdAt: { 
                $gte: todayStart,
                $lte: todayEnd
            }
        });

        if (existingEntry) {
            return res.status(400).json({
                message: "You have already logged electricity usage for today",
                success: false
            });
        }

        const lastEntry = await ElectricityConsumptionModel.findOne({ userId })
            .sort({ createdAt: -1 }); 

        if (!lastEntry) {
            return res.status(404).json({ message: "No previous entry found" });
        }

        if (todaysMeterReading <= lastEntry.todaysMeterReading) {
            return res.status(400).json({
                message: "New meter reading must be greater than previous reading",
                success: false,
                previousReading: lastEntry.todaysMeterReading,
                attemptedReading: todaysMeterReading
            });
        }

        const usage = todaysMeterReading - lastEntry.todaysMeterReading;

        const newEntry = new ElectricityConsumptionModel({
            userId,
            previousMeterReading: lastEntry.todaysMeterReading,
            todaysMeterReading,
            usage: usage // Only today's usage, not cumulative
        });


        await newEntry.save();
        await updateStreak(userId);

        // alert("Electricity usage logged successfully"); 
        return res.redirect('/api/user/input');

    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false,
            error: true
        });
    }
}

export async function GetTodaysElectricityConsumption(req, res) {
    try {
        const userId = req.userId;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // Start of today

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999); // End of today

        const todayEntry = await ElectricityConsumptionModel.findOne({
            userId,
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });

        if (!todayEntry) {
            return res.status(404).json({
                message: "No electricity data found for today",
                success: false
            });
        }

        res.json({
            message: "Today's electricity consumption retrieved",
            success: true,
            data: todayEntry
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}

export async function GetWeeklyElectricityData(req, res) {
    try {
        const userId = req.userId;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const weeklyData = await ElectricityConsumptionModel.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        dayOfWeek: { $dayOfWeek: "$createdAt" } 
                    },
                    minReading: { $min: "$todaysMeterReading" },
                    maxReading: { $max: "$todaysMeterReading" }
                }
            },
            {
                $addFields: {
                    day: {
                        $arrayElemAt: [
                            ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                            { $subtract: ["$_id.dayOfWeek", 1] }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    day: 1,
                    date: "$_id.date",
                    minReading: 1,
                    maxReading: 1,
                    totalUsage: { $subtract: ["$maxReading", "$minReading"] }
                }
            },
            { $sort: { date: 1 } }
        ]);

        if (!weeklyData.length) {
            return res.status(404).json({
                message: "No electricity data found for the past 7 days",
                success: false,
                sevenDaysAgo
            });
        }

        return res.json({
            message: "Weekly electricity data retrieved",
            success: true,
            data: weeklyData
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}
