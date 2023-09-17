var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var passport = require('passport');
const mongoStore = require('connect-mongo');;
var mongoose = require("mongoose");
var app = express()

app.use(expressSession({
  resave:false,
  saveUninitialized:true,
  secret:'shopping',
  cookie:{
     maxAge:(24* 60 * 60 * 1000)
  },
  store:mongoStore.create({
      mongoUrl:'mongodb+srv://arbazkhan290602:Arbazkhan290602@cluster0.ttk9ral.mongodb.net/',
      autoRemove:'disabled'
  },function(err){
      console.log(err|| 'connect mongo setup ok');
  })
}));

app.use(passport.authenticate('session'));

// passport.serializeUser(function(user, cb) {
//   process.nextTick(function() {
//     cb(null, { id: user.id, username: user.username, name: user.name });
//   });
// });

// passport.deserializeUser(function(user, cb) {
//   process.nextTick(function() {
//     return cb(null, user);
//   });
// });


passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
