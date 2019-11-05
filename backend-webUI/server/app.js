var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var cors = require('cors');

//list router
var indexRouter = require('./controllers/routes/index');
var usersRouter = require('./controllers/routes/users');
//device router
var userDeviceRouter = require('./controllers/routes/userDevice');
//data router
var userDataRouter = require('./controllers/routes/user_data');

/* */

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '/controllers/views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './controllers/public')));
app.use(cors());

app.use(session({
  secret: "guess who am i",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1800000 }
  //store: MemoryStore()
}));

//routing
app.use('/', indexRouter);
app.use('/users/', usersRouter);
app.use('/userdevice/', userDeviceRouter);
app.use('/userdata/', userDataRouter);

//start service
app.listen(8080, '10.55.123.52', function (err) {
  if (err) {
    console.log("Have error: " + JSON.stringify(err));
    throw err;
  }
  console.log("Start successfully");
});





