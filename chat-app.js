var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var Redis = require('./config/red-is');
var Mysql_pool = require('./config/db/my-pool');
var Mysql = require('./config/db/my')
var moment =require('moment');
var Reward = require('./reward.js');
var http = require('http');
var reward = new Reward();
//var Model = require('./database/mongo');


var Changecustomer = require('./config/callmelater/changecustomer');
Changecustomer();

var c2p = require('./config/callmelater/c2p');
c2p();
//var redisInfo = {
//    port:6380,
//    url:'localhost'
//};
////创建redis连接
//var pub;
//var sub;
//var store;
//function handleRedis(port,url){
//    pub = redis.createClient(port,url);
//    sub = redis.createClient(port,url);
//    store = redis.createClient(port,url);
//    pub.select(12);
//    store.select(13);
//    sub.select(14);
//    pub.on("error", function(error) {
//        handleRedis();
//    });
//
//    sub.on("error", function(error) {
//        handleRedis();
//    });
//
//    store.on("error", function(error) {
//        handleRedis();
//    });
//}
//handleRedis(redisInfo.port,redisInfo.url);
//var Redis = {
//    pub:pub,
//    sub:sub,
//    store:store
//};


var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
var admin = require('./routes/admin');
var ad = require('./routes/ad');

var cors = require('cors');
var app = express();

var io = require('socket.io').listen(app.listen(5000));


var log4js = require('./config/log4js/log4-js');

console.log('sosososo');
var sockets = require('./sockets');
console.log('sisisis');
//注入socket.io
sockets(io,Redis,Mysql,Mysql_pool,moment,reward,http,log4js);

var Memoto = require('./config/memoto/memoto');
Memoto.io = io;

app.use(function(req,res,next){
    console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||');
    req.io = io;
    //req.redis = Redis;
    next();
});


app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/api',api);
app.use('/admin',admin);
app.use('/ad',ad);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;