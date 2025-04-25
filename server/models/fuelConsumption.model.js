import mongoose from "mongoose";

const fuelConsumptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    fromPlace: {
        type: String,
        required: [true, "Provide starting location"]
    },
    toPlace: {
        type: String,
        required: [true, "Provide destination location"]
    },
    distance: {
        type: Number,
        required: [true, "Provide travel distance"]
    },
    transportMode: {
        type: String,
        enum: ["Petrol Car", "Diesel Car", "Electric Bike", "Public Transport", "Bicycle", "Walking"],
        required: [true, "Select transport mode"]
    },
    pointsAwarded: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const FuelConsumptionModel = mongoose.model("FuelConsumption", fuelConsumptionSchema);

export default FuelConsumptionModel;
