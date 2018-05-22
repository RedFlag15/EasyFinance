// server.js
// set up ======================================================================
// get all the tools we need
const express = require("express");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const port = process.env.PORT || 3000;
const passport = require("passport");
const flash = require("connect-flash");
require("./config/passport")(passport); // pass passport for configuration
// set up our express application
app.use(
    morgan("dev", {
        skip: function(req, res) {
            return res.method == "GET";
        }
    })
); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());

app.set("view engine", "ejs"); // set up ejs for templating
app.use(express.static(path.join(__dirname, "public")));
// required for passport
app.use(
    session({
        secret: "laboratoriosoftware",
        resave: true,
        saveUninitialized: true
    })
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require("./app/routes.js")(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log("The magic happens on port " + port);
