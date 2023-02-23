const redis = require("redis");
const Redis = require('ioredis');


const client = new Redis({
    host: process.env.REDIS_HOST,
    port: 12988,
    password: process.env.REDIS_PASSWORD
});


client.on("connect", () => console.log("Client connected to redis"));
client.on("ready", () => console.log("Client ready to use"));
client.on("error", (err) => console.log(err.message));
client.on("end", () => console.log("Client diconnected "));
process.on("SIGINT", () => {
  client.quit();
});

module.exports = {client};
