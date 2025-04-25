import UserModel from "../models/user.model.js"

export async function updateStreak(userId) {
    try {
        const user = await UserModel.findById(userId);
        if (!user) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Remove time part

        const lastLog = user.lastLogDate ? new Date(user.lastLogDate) : null;

        if (lastLog) {
            lastLog.setHours(0, 0, 0, 0); // Remove time part from last log date

            const diff = (today - lastLog) / (1000 * 60 * 60 * 24); // Difference in days

            if (diff === 1) {
                user.streak += 1; // Continue streak
            } else if (diff > 1) {
                user.streak = 1; // Reset streak
            }
        } else {
            user.streak = 1; // First-time log
        }

        user.lastLogDate = today;
        await user.save();
    } catch (error) {
        console.error("Error updating streak:", error);
    }
}

export async function getStreakValue(userId) {
    try {
        const user = await UserModel.findById(userId, "streak lastLogDate");
        if (!user) {
            return null;
        }
        return user.streak;
    } catch (error) {
        console.error("Error getting streak value:", error);
        return null;
    }
}

export async function getStreak(req, res) {
    try {
        const userId = req.userId;
        const user = await UserModel.findById(userId, "streak lastLogDate");

        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        return res.json({
            message: "Streak retrieved successfully",
            success: true,
            streak: user.streak,
            lastLogDate: user.lastLogDate
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
}
