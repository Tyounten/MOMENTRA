import jwt from "jsonwebtoken";
const isAuthenticated = async (req,res,next)=>{
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({
                message:'User not authenticated',
                success:false
            });
        }

        console.log("JWT_SECRET is:", process.env.JWT_SECRET);

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if(!decode){
            return res.status(401).json({
                message:'Invalid',
                success:false
            });
        }
        req.id = decode.userId;
        next();
    } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
        message: "Unauthorized",
        success: false
    });
}
}

export default isAuthenticated;