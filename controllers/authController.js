const bcrypt = require("bcrypt");
const createError = require("http-errors");
const User = require("../model/userSchema");
const { genAccessToken, genRefreshToken } = require("../helpers/JWT");
const { client } = require("../helpers/redis_init");
const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");

module.exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    //check if the user already exists or not
    const isExists = await User.findOne({ email: email });
    if (isExists) throw createError.Conflict("This email already in use");

    //hash the password
    const hash = await bcrypt.hash(password, 12);

    //create a new user
    const newUser = new User({
      name,
      email,
      password: hash,
    });

    //save the user to db
    const user = await newUser.save();

    //generate jwt and sent it to the client
    const authToken = await genAccessToken(user);
    const refreshToken = await genRefreshToken(user);

    //sending response to the client
    res
      .status(200)
      .cookie("authToken", authToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict",
      })
      .json({ success: true, user, refreshToken });
  } catch (error) {
    next(error);
  }
};




module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //check the user found or not
    const user = await User.findOne({ email: email });
    if (!user) throw createError.NotFound("No user found with this email");

    //compare the password with the hash
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) throw createError.Unauthorized("Email or password is incorrect");

    //generate jwt and sent it to the client
    const authToken = await genAccessToken(user);
    const refreshToken = await genRefreshToken(user);

    //sending response to the client
    res
      .status(200)
      .cookie("authToken", authToken, {
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict",
      })
      .json({ success: true, user, refreshToken });
  } catch (error) {
    console.log(error);
    next(error);
  }
};



module.exports.profile = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).select({
      name: 1,
      email: 1,
    });
    res
      .status(200)
      .json({ success: true, user, message: "Authenticated to profile route" });
  } catch (error) {
    next(error);
  }
};



module.exports.refreshToken = async (req, res, next) => {
  try {
    const { userId, refToken } = req.body;

    //finding the user
    const user = await User.findOne({ _id: userId }).select({
      name: 1,
      email: 1,
    });

    //get the ref token from redis with the userid
    const redisToken = await client.get(String(user._id));

    //if there is no ref token in redis throwing err
    if (!redisToken)
      throw createHttpError.InternalServerError("Token not found in redis");

    //if the ref token in redis and refresh token from body not matches
    if (redisToken != refToken) {
      throw createError.Unauthorized(
        "token from redis and body not matching"
      );
    }

    //verify the ref token from redis
    jwt.verify(
      redisToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      async (err, data) => {
        if (err) throw createError.InternalServerError(err);
       
        //if it matches create a new pair of auth token and refresh token
        const authToken = await genAccessToken(user);
        const refreshToken = await genRefreshToken(user);

        //saving the new refresh token to redis
        await client.set(String(user._id), refreshToken);

        //sending response to the client
        res
          .status(200)
          .cookie("authToken", authToken, {
            httpOnly: true,
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: "strict",
          })
          .json({ success: true, user, refreshToken });
      }
    );
  } catch (error) {
    next(error);
  }
};



module.exports.logout = async (req, res, next) => {
  try {
    //get the ref token from body
    const {refToken,userId } = req.body

    //check the ref token present in redis
    const redisToken = await client.get(String(userId))

    //if there is no ref token in redis throw err
    if(!redisToken) throw createError.Unauthorized("No token in redis")

    //if ref token and refresh token from body is not the same
    if(refToken != redisToken) throw createError.Unauthorized("redis token and ref token are not the same")
    
    //if it matches
    jwt.verify(refToken,process.env.JWT_REFRESH_TOKEN_SECRET,async(err,data)=>{
      if(err) throw createError.Unauthorized("ref token from redis failed verification")

      await client.DEL(String(data._id))
      res.clearCookie("authToken").json({success:true,message:"Logged out successfully"})
    })



  } catch (error) {
    next(error);
  }
};
