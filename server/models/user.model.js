import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : [true ,"Provide Name"]
    },
    email : {
        type : String ,
        required : [true , "Provide Email"],
        unique : true 
    },
    password : {
        type : String ,
        required : [true , "Provide Password"],
    },
    refresh_token: {
        type : String ,
        default : ""
    },
    verify_email: {
        type : Boolean ,
        default : false 
    },
    city : {
        type : String 
    },
    streak : {
        type : Number,
        default : 0
    },
    rank : {
        type : Number,
        default : 0
    },
    points : {
        type : Number,
        default : 0
    },
    otp : {
        type : Number
    },
    otp_expiry: {
        type : Date ,
        default : ""
    },
    lastLogDate: {
        type: Date,
        default: null 
    }
}
,{
    timestamps : true 
})

const userModel = mongoose.model("User",userSchema);

export default userModel