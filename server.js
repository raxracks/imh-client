const express = require("express");
const fs = require("fs");
const app = express();
const request = require('request').defaults({ encoding: null });

app.enable('trust proxy');

app.use(function(request, response, next) {
  if (process.env.NODE_ENV != 'development' && !request.secure) {
    response.redirect("https://" + request.headers.host + request.url) 
  } 
  next();
});

function generateBase64Image(contentType, base64) {
  return "data:" + contentType + ";base64," + base64;
}

function generateEmbedMeta(path, image, message) {
  return `
        <!-- Primary Meta Tags -->
        <title>IMH</title>
        <meta name="title" content="IMH">
        <meta name="description" content="${message}">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://imh.glitch.me/${path}">
        <meta property="og:title" content="${path.split("/").join("")}">
        <meta property="og:description" content="${message}">
        <meta property="og:image" content="https://i.imgur.com/${path}">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="https://imh.glitch.me/${path}">
        <meta property="twitter:title" content="${path.split("/").join("")}">
        <meta property="twitter:description" content="${message}">
        <meta property="twitter:image" content="https://i.imgur.com/${path}">

        <img src="${image}">`;
};

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/home.html");
});

app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/views/home.html");
});

app.get("/config", (req, res) => {
  res.sendFile(__dirname + "/views/config.html");
});

app.get("/extension", (req, res) => {
  res.sendFile(__dirname + "/views/extension.html");
});

app.get("/discord", (req, res) => {
  res.sendFile(__dirname + "/views/discord.html");
});

app.get("/upload", (req, res) => {
  res.sendFile(__dirname + "/views/upload.html");
});

app.get("/homeSPA", (req, res) => {
  fs.readFile(__dirname + "/views/homeSPA.html", function read(err, data) {
    if (err) {
        throw err;
    }
    const content = data;

    res.send(content);
  });
});

app.get("/configSPA", (req, res) => {
  fs.readFile(__dirname + "/views/configSPA.html", function read(err, data) {
    if (err) {
        throw err;
    }
    const content = data;

    res.send(content);
  });
});

app.get("/extensionSPA", (req, res) => {
  fs.readFile(__dirname + "/views/extensionSPA.html", function read(err, data) {
    if (err) {
        throw err;
    }
    const content = data;

    res.send(content);
  });
});

app.get("/discordSPA", (req, res) => {
  fs.readFile(__dirname + "/views/discordSPA.html", function read(err, data) {
    if (err) {
        throw err;
    }
    const content = data;

    res.send(content);
  });
});

app.get("/uploadSPA", (req, res) => {
  fs.readFile(__dirname + "/views/uploadSPA.html", function read(err, data) {
    if (err) {
        throw err;
    }
    const content = data;

    res.send(content);
  });
});

app.get('/check-ver/:path/:version', (req, res) => {
  let path = req.params.path;
  let version = new Date(req.params.version);
  
  fs.stat(__dirname + "/views/" + path + ".html", function(err, stats) {
    var mtime = new Date(stats.mtime);
    res.send(mtime > version);
  });
});

app.get('/IMH_Extension', (req, res) => {
  res.sendFile(__dirname + "/extension/extension.zip");
});

app.get("/*", (req, res) => {
  let path = req.path;
  let embed = false;
  let message = "Uploaded with IMH";
  
  if(path.startsWith("/i/")) {
    path = path.split("/i/").join("");
    embed = true;
  }
  
  if(path.includes("/m/")) {
    message = decodeURI(path.split("/m/")[1]);
    path = path.split("/m/")[0];
  }
  
  request.get(`https://i.imgur.com/${path}`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let base64 = Buffer.from(body).toString('base64');
      let image = generateBase64Image(response.headers["content-type"], base64);
      let imageBuffer = Buffer.from(base64, 'base64');
      if(embed) {
        res.writeHead(200, {
          'Content-Type': 'image/png'
        });
        res.end(imageBuffer);
      } else {
        res.send(generateEmbedMeta(path, image, message));
      };
    };
  });
});

app.listen(process.env.PORT, () => console.log("IMH Middleman Online!"));

