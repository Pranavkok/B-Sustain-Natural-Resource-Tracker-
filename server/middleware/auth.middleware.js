import jwt from "jsonwebtoken"

const auth = async(req,res,next)=>{
    try {
        let token;
        if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers?.authorization) {
            token = req.headers?.authorization?.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "Please provide authentication token",
                error: true,
                success: false
            });
        }

        const decode = await jwt.verify(token,process.env.SECRET_KEY_ACCESS_TOKEN)

        if(!decode){
            return res.status(401).json({
                message : "UnAuthorized token",
                error : true ,
                success : false 
            })
        }

        req.userId = decode.id

        next()
    } catch (error) {
        return res.json({
            message : error.message || error,
            error : true ,
            success : false 
        })
    }
}

export default auth 