import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
    badgeName: {
        type: String,
        required: [true, "Provide a badge name"]
    },
    description: {
        type: String
    },
    achievedAt: {
        type: Date
    },
    unlockedBy: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }] // Array of users who unlocked this badge
}, {
    timestamps: true
});

const BadgeModel = mongoose.model("Badge", badgeSchema);
export default BadgeModel;