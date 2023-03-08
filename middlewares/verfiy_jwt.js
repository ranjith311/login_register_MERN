const createError = require("http-errors")
const jwt  = require("jsonwebtoken")

const verifyJwt =(req,res,next)=>{
    try {
       
        //checking if the cookies found in header
        if(req.headers.cookie){
            

            const cookies = req.headers.cookie.split(/[ =]+/)

            //checking cookies has the authToken
            if(!cookies.includes("authToken")) throw createError.NotFound("No authtoken in header")
           
            //finding the index and accessing the authToken
            const index = cookies.indexOf("authToken")
            let token = cookies[index+1]


            if(token.endsWith(";")){
                token = token.slice(0,-1)
            }

            //verfiying authToken with jwt
            jwt.verify(token,process.env.JWT_AUTH_SECRET,(err,user)=>{
                if(err) throw createError.Unauthorized(err)

                //putting that user to request header to access in the protected route
                req.user = user

                //checking the user from session and jwt is the same or not
                if(req.session.userId !== user._id) throw new createError.Unauthorized("session validation failed, invalid token")
               
                //go to next
                next()
            })

        }else{

            //throwing error if there is no cookies in header
            throw createError.NotFound("No cookies in header")
        }

    } catch (error) {
        
        //if any thing goes wrong with the try block send errors to the client
        res.status(error.status || 500).json({success:false,message:error.message || "Something went wrong"})
    }
}

module.exports = {verifyJwt}