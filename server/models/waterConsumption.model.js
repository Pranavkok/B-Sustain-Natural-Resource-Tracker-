import mongoose from "mongoose";

const waterConsumptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: [true, "Provide water used amount"]
    }
}, {
    timestamps: true
});

const WaterConsumptionModel = mongoose.model("WaterConsumption", waterConsumptionSchema);

export default WaterConsumptionModel;
