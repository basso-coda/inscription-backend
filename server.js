const http = require("http");
const https = require("https");
const app = require('./src/app');
const fs = require("fs");

const isHttps = process.env.HTTPS ? process.env.HTTPS : false;

let server;

if (isHttps) {
  const credentials = {
    key: fs.readFileSync("/var/www/html/api/https/privkey.pem"),
    cert: fs.readFileSync("/var/www/html/api/https/fullchain.pem"),
  };

  server = https.createServer(credentials, app);
} else {
  server = http.createServer(app);
}

server.listen(process.env.PORT || 4000);

server.on("listening", () => {
  console.log(
    `server running : http://${process.env.HOST}:${process.env.PORT}`
  )
});
