const forgotPasswordOtpTemplate =({name,otp})=>{
    return `
    <div style="max-width: 400px; background: #ffffff; padding: 20px; border-radius: 10px; margin: auto; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333;">Forgot Your Password?</h2>
        <p style="color: #555;">Hello <strong>${name}</strong>,</p>
        <p style="color: #555;">Use the OTP below to reset your password:</p>
        
        <div style="font-size: 24px; font-weight: bold; color: #ffffff; background: #007bff; padding: 10px; display: inline-block; border-radius: 5px;">
            ${otp}
        </div>

        <p style="color: #555; margin-top: 10px;">This OTP is valid for <strong>10 minutes</strong>. If you didn't request a password reset, please ignore this email.</p>

        <p style="margin-top: 20px; color: #777;">- BlinkeyIt Team</p>
    </div>
    `
}

export default forgotPasswordOtpTemplate