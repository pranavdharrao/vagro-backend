const jwt=require("jsonwebtoken");
const User=require('../models/User')
const JWT_SECRET=process.env.JWT_SECRET_KEY;


const fetchUser=async (req,res,next)=>{
    const token=(req.cookies.authToken)?req.cookies.authToken:req.get('authToken');
    if(!token){
        res.clearCookie("token");
        res.clearCookie("loggedInTime");
        res.clearCookie("isEmailVerified");
        // res.clearCookie("isMobileVerified");
        // res.clearCookie("isProfileCompleted");
        return res.status(401).json({error:"Invalid Token"});
    }
    try {
        const data=jwt.verify(token,JWT_SECRET);
        const user=await User.findById(data.userId);
        if(!user){
            res.clearCookie("token");
            res.clearCookie("loggedInTime");
            res.clearCookie("isEmailVerified");
            // res.clearCookie("isMobileVerified");
            // res.clearCookie("isProfileCompleted");
            return res.status(404).clearCookie("authToken").json("User Not Found");
        }
        req.user=data.userId;
        next();
    } catch (error) {
        res.clearCookie("token");
        res.clearCookie("loggedInTime");
        res.clearCookie("isEmailVerified");
        // res.clearCookie("isMobileVerified");
        // res.clearCookie("isProfileCompleted");
        console.log("Error with token: { "+error.message+" }")
        res.status(419).json({error:"Invalid Token"});
    }
}
module.exports=fetchUser;
