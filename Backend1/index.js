//#region express configures
//=============Libraries==================
require("dotenv").config();
var express = require("express");
var path = require("path");
var logger = require("morgan");
const session = require("client-sessions");
//const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan"); // logging library


//=========Routing import===================
const authRouting = require("./routes/auth");
const userRouting = require("./routes/user");
const searchRouting = require("./routes/search");
const recipesRouting = require("./routes/recipes");

//=========DB import========================
const DButils = require("./routes/utils/DButils");

//===========App config===================
var app = express();
var port = process.env.PORT || "3000";

//set cores to all origen
//app.use(cors()); //TODO
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// print request logs
app.use(morgan(":method :url :status  :response-time ms"));
//To serve static files such as images, CSS files, and JavaScript files
app.use(express.static(path.join(__dirname, "public"))); 
//cookies setting
app.use(session({
    cookieName: "session", // the cookie key name
    secret: process.env.COOKIE_SECRET, // the encryption key
    duration: 30 * 60 * 1000, // expired after 30 minutes
    activeDuration: 0 // if expiresIn < activeDuration,
    //the session will be extended by activeDuration milliseconds
  })
);

//#endregion

app.get("/alive", (req, res) => res.send("i'm alive!"));


//=========Routing===============
app.use("/recipes", recipesRouting);
app.use("/user", userRouting);
app.use("/search", searchRouting);
app.use(authRouting);


//reoutnug to get HTML? //TODO
app.get("/", (req, res) => res.send("welcome"));

//deafoult routing
app.use((req,res) => {
  res.sendStatus(404);
})

app.use(function (err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).send({ message: err.message, success: false });
});

const server = app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});

process.on("SIGINT", function () {
  if (server) {
    server.close(() => console.log("server closed"));
  }
  process.exit();
});
