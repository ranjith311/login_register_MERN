const router = require("express").Router()

const { login, register, logout } = require("../controllers/authController")


router.post("/register",register)
router.post("/login",login)
router.delete("/logout",logout)


module.exports =router