/**
 * Created by kevin on 16/3/9.
 */
var Mysql = require('../../config/db/my-pool');
var Memoto = require('../../config/memoto/memoto');
var moment = require('moment');
var uuid = require('node-uuid');

function Filtermsg(msg){
    var tmpstr="";
    for(var i in msg){
        if(msg[i] == undefined){
            continue;
        }else if(i == 'id'){
            continue;
        }else if(i.indexOf('time')>-1){
            msg[i] = moment(msg[i]).format('YYYY-MM-DD HH:mm:ss');
        }else if(i.indexOf('$$')>-1){
            continue;
        }
        console.log(i,msg[i]);
        tmpstr += " `"+i+"`="+"'"+msg[i]+"'"+" ,"
    }
    //去and
    var remtmpstr = tmpstr.slice(0,-1);
    return remtmpstr;
}

//Mysql.chat.query('insert into advertisement set '+insertFilter(msg),function(err,res){
//    if(!err){
//        console.log(res,'this c2p array');
//        if(res.length == 0){
//            console.log('not anything there!');
//        }else{
//            console.log(res);
//
//            var subDT = {
//                userid: 1,
//                nickname: "杰米诺",
//                thum: '/files/user/2015/10-12/171044464b75564591.png',
//                time: '2016-03-10 00:00:00',
//                type: 4,
//                notice: '<div style="color: green;">通知啊 通知 这是个通知！</div>'
//            };
//            Memoto.io.emit('c2p',subDT);
//        }
//    }else{
//        console.log(err);
//    }
//});

function insertFilter(msg){
    var tmpstr="";
    for(var i in msg){
        if(msg[i] == undefined){
            continue;
        }else if(i == 'id'){
            continue;
        }else if(i.indexOf('time')>-1){
            msg[i] = moment(msg[i]).format('YYYY-MM-DD HH:mm:ss');
        }else if(i.indexOf('$$')>-1){
            continue;
        }
        console.log(i,msg[i]);
        tmpstr += " `"+i+"`="+"'"+msg[i]+"'"+" ,";
    }
    //去and
    var remtmpstr = tmpstr.slice(0,-1);
    if(remtmpstr == ""){
        remtmpstr += '() values()';
    }
    return remtmpstr;
}

function updateFilter(msg){
    var tmpstr="";

    for(var i in msg){
        if(msg[i] == undefined){
            continue;
        }else if(i == 'id'){
            continue;
        }else if(i.indexOf('time')>-1){
            msg[i] = moment(msg[i]).format('YYYY-MM-DD HH:mm:ss');
        }else if(i.indexOf('$$')>-1){
            continue;
        }
        console.log(i,msg[i]);
        tmpstr += " `"+i+"`="+"'"+msg[i]+"'"+" ,"
    }
    //去and
    var remtmpstr = tmpstr.slice(0,-1);
    return remtmpstr;
}


function where(obj,createtime){
    var tmpstr=" where";
    if(obj == {}){
        tmpstr = "";
    }
    for(var i in obj){
        if(i.indexOf('time')>-1){
            obj[i] = moment(obj[i]).format('YYYY-MM-DD HH:mm:ss');
        }
        if(obj[i] == undefined){
            continue;
        }else if(i.indexOf('$$')>-1){
            continue;
        }else if(i.indexOf('starttime')>-1){
            tmpstr += " `"+createtime+"`>"+"'"+obj[i]+"'"+" and";
            continue;
        }else if(i.indexOf('endtime')>-1){
            tmpstr += " `"+createtime+"`<"+"'"+obj[i]+"'"+" and";
            continue;
        }
        console.log(i,obj[i]);
        tmpstr += " `"+i+"`="+"'"+obj[i]+"'"+" and";
    }
    //去and
    var remtmpstr = tmpstr.slice(0,-3);
    return remtmpstr;
}





function storemsg(data){
    var data1 = clone(data);
    data1.to = JSON.stringify(data1.to);
    //data.time = moment(data.time).format('YYYY-MM-DD HH:mm:ss');
    //data.time = '2014-01-22 01:11:22';
    data1.lasttime = '';
    //console.log('this is p2c --> data!',msg,msg.time);
    var msgsql = 'insert into chat.messages set '+Filtermsg(data1);
    //console.log(msgsql,'--->msgsql');
    my.chat.query(msgsql,function(err,res){
        if(!err){
            console.log(res,'this is insert chatmessages!');
        }else{
            console.log(err);
        }
    });
}

function clone(o){
    var k, ret= o, b;
    if(o && ((b = (o instanceof Array)) || o instanceof Object)) {
        ret = b ? [] : {};
        for(k in o){
            if(o.hasOwnProperty(k)){
                ret[k] = clone(o[k]);
            }
        }
    }
    return ret;
}

module.exports = {
    c:function(req,resp,next){

        var msg = req.body;
        var uuidtmp = uuid.v4();
        msg.uuid = uuidtmp;
        msg.nickname = msg.nickname?msg.nickname:"杰米诺";
        msg.thum = msg.thum?msg.thum:"/files/user/2015/10-12/171044464b75564591.png";
        msg.type = msg.type?msg.type:4;
        msg.content = msg.content?msg.content:'<div style="color: green;">这是个通知！</div>';

        console.log(msg,'this is msg');

        var insertSql = 'insert into advertisement set '+insertFilter(msg);
        console.log(insertSql,'this is insertSql');

        Mysql.chat.pool.getConnection(function(err, connection) {
            // Use the connection
            connection.query(insertSql, function (err, ret) {
                if(!err){
                    console.log(ret,'this is ret');
                    connection.query('select * from advertisement where id = '+ret.insertId,function(err,ret1){
                        if(!err){
                            console.log(ret1);
                            resp.json({
                                code:1,
                                text:'返回成功！',
                                data:ret1
                            });
                        }else{
                            console.log(err);
                            resp.json({
                                code:-1,
                                text:'返回失败！',
                                data:err
                            });
                        }

                        connection.release();
                    });
                }else{
                    console.log(err);
                    return resp.json({
                        code:-1,
                        text:'新建失败！',
                        data:err
                    })
                }
            });
        });

        //Mysql.chat.query(insertSql,function(err,ret){
        //    if(!err){
        //        console.log(ret,'----insert success');
        //        return resp.json({code:1});
        //    }else{
        //        console.log(err);
        //        return resp.json({code:-1});
        //    }
        //});
    },
    r:function(req,resp,next){
        var msg = req.body;

        var listSql = 'select * from advertisement '+where(msg);
        console.log(listSql,'this is listSql');

        Mysql.chat.pool.getConnection(function(err, connection) {
            // Use the connection
            connection.query(listSql, function (err, ret) {
                if(!err){
                    console.log(ret);
                    resp.json({
                        code:1,
                        text:'列出成功！',
                        data:ret
                    });
                }else{
                    console.log(err);
                    resp.json({
                        code:-1,
                        text:'列出失败！',
                        data:err
                    });
                }
                connection.release();
                console.log('connection released!')
            });
        });
    },
    d:function(req,resp,next){
        var msg = req.body;
        var id = msg.id;
        if(!id){
            console.log('noid');
            return resp.json({
                code:-1,
                text:'未传广告id',
                data:{}
            })
        }

        var deleteSql = 'delete from advertisement where id = '+id;

        Mysql.chat.pool.getConnection(function(err,connection){
            connection.query(deleteSql,function(err,ret){
                if(!err){
                    console.log(ret);
                    resp.json({
                        code:1,
                        text:'删除成功！',
                        data:{
                            id:id
                        }
                    });
                }else{
                    console.log(err);
                    resp.json({
                        code:-1,
                        text:'删除失败！',
                        data:err
                    });
                }
                connection.release();
                console.log('connection released!');
            });
        });
    },
    u:function(req,resp,next){
        var msg = req.body;

        var FilteredMsg = updateFilter(msg);
        if(!FilteredMsg){
            return resp.json({
                code:-1,
                text:'没有需要更新的键值',
                data:{}
            });
        }
        var updateSql = 'update advertisement set '+updateFilter(msg)+'where id='+msg.id;;

        Mysql.chat.pool.getConnection(function(err,connection){
            connection.query(updateSql,function(err,ret){
                if(!err){
                    console.log(ret);
                    resp.json({
                        code:1,
                        text:'更新成功！',
                        data:ret
                    });
                }else{
                    console.log(err);
                    resp.json({
                        code:-1,
                        text:'更新失败！',
                        data:err
                    });
                }
                connection.release();
                console.log('connection released!');
            })
        })
    },
    morezx:function(req,resp,next){
        var lastmsg = req.body.lastmsg;
        var id = lastmsg.id;
        console.log(id,'moreid');
        var morezxsql = 'select * from chat.messages where id<'+id+' and type in (3,5) order by time desc limit 10';
        Mysql.chat.pool.getConnection(function(err,connection){
           if(!err){
               connection.query(morezxsql,function(err,ret){
                   if(!err){
                       for(var i=0;i<ret.length;i++){
                            ret[i].time = moment(ret[i].time).valueOf();
                       }
                       resp.json({
                           code:1,
                           text:'',
                           data:ret
                       });
                   }else{
                       console.log(err);
                   }
                   connection.release();
               });
           }else{
               console.log(err);
           }
        });
    },
    ask:function(req,resp,next){
        //var ask = req.body.ask;
        //
        console.log('asked!',req.body);
        //var data = req.body;
        //if(data.type == 3){
        //    var msg = clone(data);
        //    msg.to = JSON.stringify(msg.to);
        //    //data.time = moment(data.time).format('YYYY-MM-DD HH:mm:ss');
        //    //data.time = '2014-01-22 01:11:22';
        //    //msg.extra = {};
        //    //msg.extra.faqid = msg.faqid;
        //    //msg.extra.tecdir = msg.tecdir;
        //    //msg.extra = JSON.stringify(msg.extra);
        //    //delete msg.faqid;
        //    //delete msg.tecdir;
        //    msg.lasttime = '';
        //    //console.log('this is p2c --> data!',msg,msg.time);
        //    var msgsql = 'insert into chat.faqs set '+Filtermsg(msg);
        //    //console.log(msgsql,'--->msgsql');
        //    my.chat.query(msgsql,function(err,res){
        //        if(!err){
        //            var id = res.insertId;
        //            //对所有人发送提问问题
        //            data.nickname = userInfo.nickname;
        //            data.time = moment().valueOf();
        //            data.id = id;
        //            io.emit('p2c',data);
        //            console.log(res,'this is insert chatmessages!');
        //        }else{
        //            console.log(err);
        //        }
        //    });
        //}



        var msg = {
            userid:1,
            nickname:'杰米诺',
            thum:'http://www.geminno.cn/files/user/2015/10-12/171044464b75564591.png',
            content:'这是内容',
            title: '这是title',
            type:3,
            faqid:1,
            time:1459324524501,
            tecdir:'C++',
        }

        Memoto.io.emit('c2p5',msg);
        resp.json({code:1,text:'',data:{}});
    }
}