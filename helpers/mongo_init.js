const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect(
      "mongodb+srv://admin-Ranjith:mongoadmin24@clusterfortest.lkvxp.mongodb.net/Login_Register_MERN?retryWrites=true&w=majority"
    )
    .then(() => console.log("Mongo connected"))
    .catch((err) => console.log("Err connecting mongo", err));
};
mongoose.set('strictQuery', false);

module.exports = connectDB