var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

var index = require('./routes/index');
var users = require('./routes/users');

//Import routes for "catalog" area of site.
var catalog = require('./routes/catalog');

var compression = require('compression');
var helmet = require('helmet');

// Create the Express application object.
var app = express();

app.use(helmet());

// Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB =
  process.env.MONGODB_URI
  || 'mongodb://pool:Faktaro@ds163679.mlab.com:63679/train_ll';
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'icon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(cookieParser());

// Compress all routes.
app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// Add catalog routes to middleware chain.
app.use('/catalog', catalog);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
