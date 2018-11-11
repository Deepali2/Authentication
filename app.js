const express               = require("express"),
      bodyParser            = require("body-parser"),
      mongoose              = require("mongoose"),
      ObjectId              = require("mongodb").ObjectID,
      passport              = require("passport"),
      LocalStrategy         = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose"),
      ejs                   = require("ejs"),
      User                  = require("./models/user"),
      app                   = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(require("express-session")({
  secret: "It seems like a nice day today",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/auth_demo_app", {useNewUrlParser: true});
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=================================
//ROUTES
//=================================

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res) {
  res.render("secret");
});

//AUTH ROUTES

//SIGN UP ROUTES
//show sign up form
app.get("/register", function(req, res) {
  res.render("register");
});
//handling user sign up
app.post("/register", function(req, res) {  
  User.register(new User({username: req.body.username}), req.body.password, function(err, user){
    if (err) {
      console.log("error in user sign up: ", err);
      return res.render("register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secret");
      });
    }
  });
});

//LOGIN ROUTES
//show login form
app.get("/login", function(req, res) {
  res.render("login");
});
//handle login
app.post("/login", passport.authenticate("local", {
  successRedirect: "/secret",
  failureRedirect: "/login"
  }), function(req, res) {
  
});

//LOGOUT ROUTE
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}


app.get("*", function(req, res) {
  res.send("Hello. Check your URL");
});

app.listen(3001, function() {
  console.log("listening on port 3001");
});