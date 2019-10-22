var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const CONFIG = require('./config/server-config');
var indexRouter = require('./controllers/routes/index');
var usersRouter = require('./controllers/routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '/controllers/views'));
app.set('view engine', 'ejs');

// Config Middleware 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './controllers/public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//Log Env
console.log("Environment:", CONFIG)


//DATABASE
const models = require("./models/mysql-connector");
models.sequelize.authenticate().then(() => {
  console.log('Connected to SQL database:', CONFIG.db_name);
})
.catch(err => {
  console.error('Unable to connect to SQL database:',CONFIG.db_name, err);
});
if(CONFIG.app==='dev'){
  //models.sequelize.sync();//creates table if they do not already exist
   models.sequelize.sync({ force: true });//deletes all tables then recreates them useful for testing and development purposes
}
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
