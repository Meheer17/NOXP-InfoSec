/********************************************
 * DO NOT EDIT THIS FILE
 * the verification process may break
 *******************************************/

var express = require("express");
var bcrypt = require('bcrypt');
var app = express();
app.disable("x-powered-by");
var fs = require("fs");
var path = require("path");
var helmet = require("helmet");

app.use(helmet())
app.use(helmet({
  frameguard: {         // configure
    action: 'deny'
  },
  contentSecurityPolicy: {    // enable and configure
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ['style.com'],
    }
  },
  dnsPrefetchControl: false     // disable
}))
// app.use(helmet.hidePoweredBy())
// app.use(helmet.frameguard({action: 'deny'}))
// app.use(helmet.xssFilter())
// app.use(helmet.noSniff())
// app.use(helmet.ieNoOpen())
// app.use(helmet.hsts({maxAge: 90*24*60*60, force: true}))
app.use(helmet.dnsPrefetchControl())
app.use(helmet.noCache())
// app.use(helmet.contentSecurityPolicy({ directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "trusted-cdn.com"] }} ))

bcrypt.hash('passw0rd!', 13, (err, hash) => {
  console.log(hash);
  //$2a$12$Y.PHPE15wR25qrrtgGkiYe2sXo98cjuMCG1YwSI5rJW1DSJp0gEYS
  bcrypt.compare('passw0rd!', hash, (err, res) => {
    console.log(res); //true
  });
});

var hash = bcrypt.hashSync("myPlaintextPassword", 3);
var result = bcrypt.compareSync("myPlaintextPassword", hash);
console.log(result);
app.use(function (req, res, next) {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, content-type, Accept",
  });
  app.disable("x-powered-by");
  next();
});

app.get("/file/*?", function (req, res, next) {
  if (req.params[0] === ".env") {
    return next({ status: 401, message: "ACCESS DENIED" });
  }
  fs.readFile(path.join(__dirname, req.params[0]), function (err, data) {
    if (err) {
      return next(err);
    }
    res.type("txt").send(data.toString());
  });
});

var main = require("./myApp.js");
app.get("/app-info", function (req, res) {
  // list middlewares mounted on the '/' camper's app
  var appMainRouteStack = main._router.stack
    .filter((s) => s.path === "")
    .map((l) => l.name)
    // filter out express default middlewares
    .filter(
      (n) => !(n === "query" || n === "expressInit" || n === "serveStatic")
    );

  // filter out CORS Headers
  var hs = Object.keys(res.getHeaders()).filter(
    (h) => !h.match(/^access-control-\w+/)
  );
  var hObj = {};
  hs.forEach((h) => {
    hObj[h] = res.getHeaders()[h];
  });
  delete res.get("strict-transport-security");
  res.json({ headers: hObj, appStack: appMainRouteStack });
});

app.get("/package.json", function (req, res, next) {
  fs.readFile(__dirname + "/package.json", function (err, data) {
    if (err) return next(err);
    res.type("txt").send(data.toString());
  });
});

app.use(function (req, res, next) {
  res.status(404).type("txt").send("Not Found");
});

module.exports = app;

/********************************************
 * DO NOT EDIT THIS FILE
 * the verification process may break
 *******************************************/
