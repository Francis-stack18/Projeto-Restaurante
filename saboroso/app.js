var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var formidable = require("formidable");
require("dotenv").config();
var http = require("http");
var socket = require("socket.io");
var bodyParser = require("body-parser");

var session = require("express-session");
var RedisStore = require("connect-redis")(session);
var redis = require("redis");

var indexRouter = require("./routes/index")(io);
var adminRouter = require("./routes/admin")(io);

var app = express();

var http = http.Server(app);
var io = socket(http);
io.on("connection", function (socket) {});

app.use(function (req, res, next) {
  let isMultipart =
    req.headers["content-type"] &&
    req.headers["content-type"].includes("multipart/form-data");

  if (req.method === "POST" && isMultipart) {
    var form = new formidable.IncomingForm({
      uploadDir: path.join(__dirname, "/public/images"),
      keepExtensions: true,
    });

    form.parse(req, function (err, fields, files) {
      req.body = fields;
      req.fields = fields;
      req.files = files;
      next();
    });
  } else {
    next();
  }
});

var redisClient = redis.createClient({
  host: "127.0.0.1",
  port: 6379,
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    store: new RedisStore({
      client: redisClient,
    }),
    secret: "Password",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(logger("dev"));

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/admin", adminRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

http.listen(3000, function () {
  console.log("Servidor rodando");
});
