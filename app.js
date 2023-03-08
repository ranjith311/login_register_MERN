require("dotenv").config();
const express = require("express");
const connectDB = require("./helpers/mongo_init");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors")
const cookieParser = require("cookie-parser");
const session = require("express-session")
// const {client} = require("./helpers/redis_init")


connectDB()
app.use(cors())
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24;

app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized:true,
    cookie: { maxAge: oneDay,httpOnly:true,sameSite: true },
    resave: false 
}));


app.use(express.json())
app.use("/api/", require("./routes/authRoute"));



app.use((err, req, res, next) => {
  const error = {
    success:false,
    status: err.status || 500,
    message: err.message || "Something went wrong",
  };
  res.status(error.status).json(error)
});



app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
