// const http = require("http");
// const https = require("https");
// const app = require('./src/app');
// const fs = require("fs");

// const isHttps = process.env.HTTPS ? process.env.HTTPS : false;

// let server;

// if (isHttps) {
//   const credentials = {
//     key: fs.readFileSync("/var/www/html/api/https/privkey.pem"),
//     cert: fs.readFileSync("/var/www/html/api/https/fullchain.pem"),
//   };

//   server = https.createServer(credentials, app);
// } else {
//   server = http.createServer(app);
// }

// server.listen(process.env.PORT || 4000);

// server.on("listening", () => {
//   console.log(
//     `server running : http://${process.env.HOST}:${process.env.PORT}`
//   )
// });



const http = require("http");
const https = require("https");
const fs = require("fs");
const app = require('./src/app');

// Détecte si on est sur Render (pas de certificats)
const isRender = !!process.env.RENDER; // RENDER=true dans les variables Render

// Détermine si HTTPS doit être utilisé (par défaut non)
const isHttps = process.env.HTTPS === "true" && !isRender;

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

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "localhost";

server.listen(PORT, () => {
  const protocol = isHttps ? "https" : "http";
  console.log(`Server running at ${protocol}://${HOST}:${PORT}`);
});

