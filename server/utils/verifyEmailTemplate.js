const verifyEmailTemplate =({name,url})=>{
    return `
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
        <tr>
            <td align="center">
                <h1 style="color: #2c7a2c;">Welcome to Bsustain , ${name}!</h1>
                <p style="color: #555555; font-size: 16px;">Track your impact. Save resources. Thrive sustainably.</p>
                <p style="color: #333333; font-size: 16px;">Please verify your email to activate your account.</p>
                <a href="${url}" style="display: inline-block; background-color: #2c7a2c; color: #ffffff; padding: 12px 24px; font-size: 16px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                    Verify Email
                </a>
                <p style="color: #777777; font-size: 14px; margin-top: 20px;">If you didn't sign up for Bsustain, you can ignore this email.</p>
                <p style="color: #999999; font-size: 12px;">Bsustain: Track. Save. Thrive. 🌱</p>
            </td>
        </tr>
    </table>
    `
}

export default verifyEmailTemplate