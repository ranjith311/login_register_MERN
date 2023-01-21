const redis = require("redis");
const Redis = require('ioredis');

// const client = redis.createClient({
//   port: 6379,
//   host: "redis-12988.c305.ap-south-1-1.ec2.cloud.redislabs.com",
// });
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
