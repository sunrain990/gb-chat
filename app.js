var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var Redis = require('./config/red-is');
var mysql = require('mysql');
var moment =require('moment');
var Reward = require('./reward.js');
var http = require('http');
var reward = new Reward();
var Model = require('./database/mongo');


var Changecustomer = require('./config/callmelater/changecustomer');
Changecustomer();
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

//创建mysql连接
//chat信息
var econn;
function handleEcpMysql(){
    econn = mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'root',
        database:'ecp',
        port:'3306'
    });

    //连接错误
    econn.connect(function(err){
        if(err){
            console.log('error when connecting to db:',err);
            setTimeout(handleEcpMysql,2000);
        }

    });

    econn.on('error', function (err) {
        console.log('db error', err);
        // 如果是连接断开，自动重新连接
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleEcpMysql();
        } else {
            throw err;
        }
    });
}
var pconn;
function handleProjectMysql(){
    pconn = mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'root',
        database:'project',
        port:'3306'
    });

    pconn.connect(function(err) {
        if (err) {
            console.log("error when connecting to db:", err);
            setTimeout(handleProjectMysql, 5000);
        }
    });

    pconn.on('error', function (err) {
        console.log('db error', err);
        // 如果是连接断开，自动重新连接
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleProjectMysql();
        } else {
            throw err;
        }
    });
};
//统一初始化
//handleEcpMysql();
//handleProjectMysql();
var Mysql ={
    econn:econn,
    pconn:pconn
};



var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
var admin = require('./routes/admin');

var cors = require('cors');
var app = express();
var io = require('socket.io').listen(app.listen(5000));
var log4js = require('./config/log4js/log4-js');

var sockets = require('./sockets');
//注入socket.io
sockets(io,Redis,Mysql,moment,reward,Model,http,log4js);

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