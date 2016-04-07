/**
 * Created by SQB on 2015/9/30.
 */
var mongoose = require('mongoose');
var db  = mongoose.createConnection('mongodb://127.0.0.1:27017/chat');
var moment = require('moment');
var Schema = mongoose.Schema;
//model crud操作
//http://blog.csdn.net/jbboy/article/details/37928739

//链接错误
db.on('error',function(error){
    console.log(error);
});

//LoginSchema
var loginSchema = {
    userid:{type:Number},
    nickname:{type:String,default:'匿名用户'},
    thum:{type:String,default:'http://www.geminno.cn/files/user/2015/03-20/185231f8021f174279.jpg'},
    loginTime:{type:String,default:moment().valueOf()},
    logoutTime:{type:String,default:moment().valueOf()}
};
var LoginSchema = new Schema(loginSchema);

var LoginModel = db.model('login',LoginSchema);

var chatSchema = {
    userid:{type:Number},
    nickname:{type:String},
    content:{type:String},
    title:{type:String},
    type:{type:Number},
    time:{type:String},
    lasttime:{type:String},
    thum:{type:String},
    to:{}
};
var ChatSchema = new Schema(chatSchema);

var ChatMoel = db.model('chat',ChatSchema);

var Model = {
    LoginModel:LoginModel,
    ChatModel:ChatMoel
}

module.exports = Model;