require("dotenv").config()
const express = require("express")
const connectDB = require("./helpers/mongo_init")
const app = express()
const PORT = process.env.PORT || 5000

connectDB()

app.use("/api/",require("./routes/authRoute"))

app.listen(PORT,()=>console.log(`Server is running at port ${PORT}`))