const bcrypt = require("bcrypt");
const createError = require("http-errors");
const User = require("../model/userSchema");
const { genAccessToken, genRefreshToken } = require("../helpers/JWT");



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
        path:"/",
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




module.exports.refreshToken=async(req,res,next)=>{
    try {
        const refreshToken = req.body.refreshToken
        console.log("refresh Token ",refreshToken)
        res.send("refreshToken ",refreshToken);
    } catch (error) {
        next(error);
    }
}




module.exports.logout = async (req, res, next) => {
  try {
    res.send("logedd out successfully");
  } catch (error) {
    next(error);
  }
};
