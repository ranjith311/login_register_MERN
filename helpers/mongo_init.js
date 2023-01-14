const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect(
      process.env.MONGO_URI
    )
    .then(() => console.log("Mongo connected"))
    .catch((err) => console.log("Err connecting mongo", err));
};
mongoose.set('strictQuery', false);

module.exports = connectDB