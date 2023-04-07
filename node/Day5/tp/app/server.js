const http = require("http");
const env = require("dotenv").config("../.env");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");
const pug = require("pug");

const customParseFormat = require("dayjs/plugin/customParseFormat");
const students = require("./data/students");
const studentsFormattedDate = require("./utils");

dayjs.extend(customParseFormat);

const server = http.createServer((req, res) => {

  const url = req.url;

  if (url === "/") {

    fs.readFile(
      path.join(__dirname, "view", "home.html"),
      "utf8",
      (err, content) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end("<h1>Erreur serveur</h1>");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(content);
        }
      }
    );
  }

  else if (url === "/css/style.css") {
    const cssPath = path.join(__dirname, "assets", "css", "style.css");
    fs.readFile(cssPath, "utf-8", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Erreur du serveur");
      } else {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.end(data);
      }
    });
  }

 
  else if (url === "/users") {
    const studentsBetterDate = studentsFormattedDate(students);
    const html = pug.renderFile(
      path.join(__dirname, "templates", "users.pug"),
      {
        studentsBetterDate,
      }
    );
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  }
  else if (url.startsWith("/delete/")) {
    const userId = parseInt(url.split("/")[2]);
    if (userId >= 0 && userId < students.length) {
      students.splice(userId, 1);
      res.writeHead(302, { Location: "/users" });
      res.end();
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>Utilisateur non trouvé</h1>");
    }
  } else if (url.startsWith("/add")) {
    const user = req.url.split("?")[1];
    const name = user.split("&")[0].split("=")[1];
    const birth = user.split("&")[1].split("=")[1];
    students.push({ name, birth });
    res.writeHead(302, { Location: "/users" });
    res.end();
  }

  else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 Not found</h1>");
  }
});

if (process.env.APP_ENV === "development") {
  const port = process.env.APP_PORT; // || 3000;
  const url = process.env.APP_LOCALHOST; // || "http://localhost";
  server.listen(port, () => {
    console.log(`Server is running on port ${port}, url : ${url}`);
  });
}