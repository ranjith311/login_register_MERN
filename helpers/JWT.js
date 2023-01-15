const jwt = require("jsonwebtoken");

const genAccessToken = (user) => {
  return new Promise((resolve, reject) => {
    if (user._id) {
      resolve(
        jwt.sign({ _id: user._id }, process.env.JWT_AUTH_SECRET, {
          expiresIn: "1d",
        })
      );
    }
  });
};

const genRefreshToken = (user) => {
  return new Promise((resolve, reject) => {
    resolve(
      jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
      })
    );
  });
};

module.exports = { genAccessToken, genRefreshToken };
