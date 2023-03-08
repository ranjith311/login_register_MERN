
const router = require("express").Router()
const { login, register, logout, profile, refreshToken } = require("../controllers/authController")
const { regValidate, validate, logValidate } = require("../middlewares/formValidation")

const { verifyJwt } = require("../middlewares/verfiy_jwt")



router.post("/register",regValidate,validate,register)
router.post("/login",logValidate,validate,login)
router.get("/profile",verifyJwt,profile)
router.post("/refresh-token",refreshToken)
router.delete("/logout",logout)


module.exports =router