import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required: true
    },
    description : {
        type : String,
        required: [true, "Activity description is required"]
    },
    completed : {
        type : Boolean ,
        default : false 
    },
    pointsAwarded : {
        type : Number 
    }
},{
    timestamps : true 
})

const activityModel = mongoose.model("Activity",activitySchema)

export default activityModel