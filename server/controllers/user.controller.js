import userModel from "../models/user.model.js";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken";
import sendEmail from "../config/sendEmail.js";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import genarateAccessToken from "../utils/genarateAccessToken.js"
import genarateRefreshToken from "../utils/genarateRefreshToken.js"
import generatedOtp from "../utils/generateOtp.js";
import forgotPasswordOtpTemplate from "../utils/forgotPasswordOtpTemplate.js";
import ElectricityConsumptionModel from "../models/electricityConsumption.model.js";


export async function registerUserController(req,res){
    try {
        const {name,email,password,city,prevReading} = req.body

        if(!name || !email || !password ||!prevReading){
            return res.status(400).json({
                message : "Please Provide Required Inputs i.e Name , Email , Password , City and prev Reading",
                success : false ,
                error : true 
            })
        }

        const user = await userModel.findOne({email})

        if(user){
            return res.status(400).json({
                message : "User Already Exist",
                success : false ,
                error : true 
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password,salt)
        const payload = {
            name ,
            email,
            password : hashedPassword,
            city 
        }

        const newUser = new userModel(payload)
        const save = await newUser.save()
        const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`

        const elec_Entry = new ElectricityConsumptionModel({
            userId: newUser._id,
            previousMeterReading: prevReading,
            todaysMeterReading: prevReading,
            usage: 0
        })
        const save_eData = await elec_Entry.save();

        try {
            await sendEmail({
                sendTo: email,
                subject: "Verification Email from B-Sustain",
                html: verifyEmailTemplate({ name, url: verifyEmailUrl })
            });
        } catch (emailError) {
            console.error("Email sending failed:", emailError.message);
        }
        res.redirect('/api/user/login');
        
    } catch (error) {
        res.render('register', { error: error.message });
    }
}

export async function verifyEmailController(req,res){
    try {
       const {code} = req.body 
       
       const user = await userModel.findOne({_id : code})

       if(!user){
        return res.status(400).json({
            message : "Invalid code",
            error : true ,
            success : false
        })
       }

       if (user.verify_email) {
        return res.status(400).json({
            message: "Email already verified",
            error: true,
            success: false
        });
    }

       const updateUser = await userModel.updateOne({ _id : code},{
        verify_email : true 
       })

       return res.json({
        message : "Verified the user",
        error : false ,
        success : true
    })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error ,
            error : true ,
            success : false
        })
    }
}

export async function loginUserController(req,res){
    try {
    const {email,password} = req.body 

    if(!email || !password){
        return res.status(400).json({
            message : "Provide Email and Password",
            success : false ,
            error : true
        })
    }

    const user = await userModel.findOne({email})
    if(!user){
        return res.status(400).json({
            message : "User doesn't Exist",
            success : false ,
            error : true 
        })
    }

    const checkPassword = await bcryptjs.compare(password,user.password)

    if(!checkPassword){
        return res.status(400).json({
            message : "Incorrect Password ",
            success : false ,
            error : true 
        })
    }

    const accessToken = await genarateAccessToken(user._id)
    const refreshToken = await genarateRefreshToken(user._id)

    const updateUser = await userModel.findByIdAndUpdate(user?._id,{
        last_login_date : new Date()
    })

    const cookiesOption = {
        httpOnly : true ,
        secure :true,
        samesite : "None"
    }

    res.cookie('accessToken',accessToken,cookiesOption)
    res.cookie('refreshToken',refreshToken,cookiesOption)

    res.redirect('/api/user/dashboard')

    } catch (error) {
        res.render('login',{error : error.message})
    }
}

export async function logoutUserController(req,res){
    try {
        const userid = req.userId
        const cookiesOption = {
            httpOnly : true ,
            secure :true,
            samesite : "None"
        }
        res.clearCookie("accessToken",cookiesOption);
        res.clearCookie("refreshToken",cookiesOption);

        const removeRefreshToken = await userModel.findByIdAndUpdate(userid,{
            refresh_token : ""
        })

        res.json({
            message : "Successfully Loggedout",
            error : false ,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true ,
            success : false 
        })
    }
}

export async function refreshTokenController(req,res){
    try {
    const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1];

    if(!refreshToken){
        return res.status(401).json({
            message : "Invalid token",
            error : true ,
            success : false
        })
    }

    const verifyToken = await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)

    if(!verifyToken){
        return res.status(401).json({
            message : "Token is expired ",
            error : true ,
            success : false 
        })
    }

    const userId = verifyToken?._id

    const newAccessToken = await genarateAccessToken(userId)

    const cookiesOption = {
        httpOnly : true ,
        secure :true,
        samesite : "None"
    }

    res.cookie('accessToken',newAccessToken,cookiesOption)
    
    return res.json({
        message : "New Access Token is generated ",
        error : false ,
        success : true ,
        data : {
            accessToken : newAccessToken
        }
    })
    } catch (error) {
        return res.status(500).json({
            message : error.message ,
            error : true ,
            success : false 
        })
    }
}

export async function forgotPasswordController(req,res){
    try {
        const {email} = req.body
        const user = await userModel.findOne({email})

        if(!user){
            return res.status(400).json({
                message : "User not Found" ,
                error : true ,
                success : false 
               }) 
        }

        const otp = generatedOtp()
        const expireTime = Date.now() + 60 * 60 * 1000

        const update = await userModel.findByIdAndUpdate(user._id,{
            otp : otp,
            otp_expiry : new Date(expireTime).toISOString()
        })

        await sendEmail({
            sendTo : email ,
            subject : "Forgot Your Password of BlinkeyIt",
            html : forgotPasswordOtpTemplate({
                name : user.name ,
                otp : otp
            })
        })

        res.cookie("resetEmail", email, { maxAge: 60 * 60 * 1000, httpOnly: true })

        return res.json({
            message : "OTP sent successfully ? Check your email",
            data : otp,
            success : true ,
            error : false 
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error ,
            error : true ,
            success : false 
           }) 
    }
}

export async function verifyOtpController(req,res){
    try {
        const {otp} = req.body
        const email = req.cookies.resetEmail || "";
        const user = await userModel.findOne({email})

        if(!user){
            return res.status(400).json({
                message : "Enter valid email id",
                success : false ,
                error : true 
            })
        }

        if(new Date(user.otp_expiry) < new Date()){
            return res.status(400).json({
                message : "OTP Expired",
                success : false ,
                error : true 
            })
        }

        const stored_OTP = user.otp 

        if(stored_OTP !== otp){
            return res.status(400).json({
                message : "Entered Wrong OTP",
                success : false ,
                error : true 
            })
        }

        const clearOTP = await userModel.findByIdAndUpdate(user._id,{
            otp : "",
            otp_expiry : ""
        }, { new: true })

        res.cookie("otpVerified", true, { maxAge: 60 * 60 * 1000, httpOnly: true });

        return res.json({
            message : "OTP is Verified Successfully",
            success : true ,
            error : false 
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            success : false ,
            error : true 
        })
    }
}

export async function resetPasswordController(req,res){
    try {
        const {password} = req.body
        const email = req.cookies.resetEmail || ""
        const otpVerified = req.cookies.otpVerified;

        if (!email || !otpVerified) {
            return res.status(403).json({
                message: "Unauthorized: Please verify OTP before resetting password",
                success: false,
                error: true
            });
        }

        const user = await userModel.findOne({email})

        if(!user){
            return res.status(400).json({
                message : "User not Found",
                success : false ,
                error : true 
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password,salt)

        const update = await userModel.findByIdAndUpdate(user._id,{
            password : hashedPassword
        } ,{ new: true })

        res.clearCookie("resetEmail");
        res.clearCookie("otpVerified");

        return res.json({
            message : "Password reset sucessfully",
            success : true ,
            error : false 
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error ,
            success : false ,
            error :true
        })
    }
}

export async function getUserProfileController(req, res){
    try {
        const userID = req.userId;

        const user = await userModel.findById(userID);

        if (!user) {
            return res.status(400).json({
                message: "User Not Found in Database",
                success: false,
                error: true
            });
        }

        return res.json({
            message: "Profile Fetched Successfully",
            data: {
                name: user.name,
                email: user.email,
                city: user.city,
                streak: user.streak,
                rank: user.rank,
                points: user.points
            },
            success: true,
            error: false
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}

export async function updateProfileController(req,res){
    try {
        const userID = req.userId 
        const {name,email,city} = req.body

        if(!name || !email || !city){
            return res.status(400).json({
                message : "Provide all required Fields i.e Name , Email , City",
                success : false ,
                error : true 
            })
        }

        const updatedUser = await userModel.findByIdAndUpdate(userID,{
            name : name ,
            email : email ,
            city : city 
        },{ new: true, runValidators: true })

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                error: true
            });
        }

        // return res.json({
        //     message : "Profile Updated Successfully",
        //     success : true ,
        //     error : false 
        // })
        return res.redirect('/api/user/profile');

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}
