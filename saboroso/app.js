var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

// 1. Importa a Sessão e o Connect Redis (padrão v6)
var session = require("express-session");
var RedisStore = require("connect-redis")(session);
var redis = require("redis");

var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");

var app = express();

// 2. Cria o cliente clássico do Redis compatível com a V3.2
var redisClient = redis.createClient({
  host: "127.0.0.1",
  port: 6379,
});

// View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 3. Configura a sessão
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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/admin", adminRouter);

// ... (Mantenha o resto das rotas de erro no final exatamente iguais)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handlers
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
