import mongoose from "mongoose";

const electricityConsumptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    previousMeterReading: {
        type: Number,
        required: [true, "Provide previous meter reading"]
    },
    todaysMeterReading: {
        type: Number,
        required: [true, "Provide today's meter reading"]
    },
    usage: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const ElectricityConsumptionModel = mongoose.model("ElectricityConsumption", electricityConsumptionSchema);

export default ElectricityConsumptionModel;
