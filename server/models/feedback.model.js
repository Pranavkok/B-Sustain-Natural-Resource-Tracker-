import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : "User"
    },
    feedbackText : {
        type : String,
        required : [true , "provide feedback"]
    }
},{
    timestamps : true
})

const FeedbackModel = mongoose.model("Feedback",feedbackSchema)

export default FeedbackModel