/**
 * Created by kevin on 16/3/9.
 */
var later = require('later');
later.date.localTime();
var Memoto = require('../memoto/memoto');
var Mysql = require('../db/my-pool');
var moment = require('moment');

var cron = '*/20 * * * * *';
var schedule = later.parse.cron(cron,true);



//function noticeAD(){
//    var subDT = {
//        userid:1,
//        nickname:"杰米诺",
//        thum:'/files/user/2015/10-12/171044464b75564591.png',
//        time:'2016-03-10 00:00:00',
//        type:4,
//        notice:''
//    };
//
//
//    Mysql.chat.query('select * from chat where status=1',function(err,res){
//        if(!err){
//            console.log(res);
//        }else{
//            console.log(err);
//        }
//    });
//
//
//    //if(Math.random()>0.5){
//    subDT.notice = '<div style="color: green;">通知啊 通知 这是个通知！</div>';
//    //}else{
//    //    subDT.notice = msg2;
//    //}
//    Memoto.io.emit('c2p',subDT);
//}


function C2p(){
    console.log('c2p will load at',cron);

    later.setInterval(function(){
        //var subDT = {
        //    userid: 1,
        //    nickname: "杰米诺",
        //    thum: '/files/user/2015/10-12/171044464b75564591.png',
        //    time: '2016-03-10 00:00:00',
        //    type: 4,
        //    notice: '<div style="color: green;">通知啊http://www.baidu.com 通知 这是个通知！</div>'
        //};
        //Memoto.io.emit('c2p',subDT);

        //Mysql.chat.query('select * from advertisement where status=1 order by rand() limit 1 ',function(err,res){
        //    if(!err){
        //        console.log(res,'this c2p array');
        //        if(res.length){
        //
        //            //var index = Math.floor(res.length*Math.random());
        //            //console.log(res);
        //            //
        //            //var msg = res[index];
        //            var msg = res[0];
        //
        //            var subDT = {
        //                userid: 1,
        //                nickname: "杰米诺",
        //                thum: '/files/user/2015/10-12/171044464b75564591.png',
        //                time: moment().valueOf(),
        //                type: 4,
        //                notice: msg.content
        //            };
        //            Memoto.io.emit('c2p',subDT);
        //        }else{
        //            console.log('no guanggao!');
        //        }
        //    }else{
        //        console.log(err);
        //    }
        //});

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
                //console.log(i,msg[i]);
                tmpstr += " `"+i+"`="+"'"+msg[i]+"'"+" ,"
            }
            //去and
            var remtmpstr = tmpstr.slice(0,-1);
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
            Mysql.chat.query(msgsql,function(err,res){
                if(!err){
                    console.log(res,'this is insert chatmessages!');
                }else{
                    console.log(err);
                }
            });
        }

        Mysql.chat.pool.getConnection(function(err,connection){
            if(!err){
                connection.query('select * from advertisement where status=1 order by rand() limit 1 ',function(err,res){
                    if(!err){
                        if(res.length){
                            var msg = res[0];

                            var subDT = {
                                userid: 1,
                                nickname: "杰米诺",
                                thum: '/files/user/2015/10-12/171044464b75564591.png',
                                time: moment().valueOf(),
                                type: 5,
                                content: msg.content
                            };

                            var data1 = clone(subDT);
                            //data1.to = JSON.stringify(data1.to);
                            //data.time = moment(data.time).format('YYYY-MM-DD HH:mm:ss');
                            //data.time = '2014-01-22 01:11:22';
                            //data1.lasttime = '';
                            //console.log('this is p2c --> data!',msg,msg.time);
                            var msgsql = 'insert into chat.zixuns set '+Filtermsg(data1);
                            //console.log(msgsql,'--->msgsql');

                            connection.query(msgsql,function(err,res1){
                                if(!err){
                                    if(res1){
                                        console.log(res1.insertId,'haha no res1insertid');
                                        if(res1.insertId){
                                            console.log(res1);
                                            subDT.id = res1.insertId;
                                            Memoto.io.emit('c2p5',subDT);
                                        }
                                    }

                                    connection.release();
                                }else{
                                    console.log(err);
                                    connection.release();
                                }
                            });

                        }else{
                            console.log('no guanggao!');
                            connection.release();
                        }
                    }else{
                        console.log(err);
                    }
                });
            }else{
                console.log(err);
            }
        });

        //Mysql.chat.query('select * from advertisement where status=1 order by rand() limit 1 ',function(err,res){
        //    if(!err){
        //        console.log(res,'this c2p array');
        //        if(res.length){
        //            //var index = Math.floor(res.length*Math.random());
        //            //console.log(res);
        //            //
        //            //var msg = res[index];
        //            var msg = res[0];
        //
        //            var subDT = {
        //                userid: 1,
        //                nickname: "杰米诺",
        //                thum: '/files/user/2015/10-12/171044464b75564591.png',
        //                time: moment().valueOf(),
        //                type: 5,
        //                content: msg.content
        //            };
        //
        //            storemsg(subDT);
        //            Memoto.io.emit('c2p5',subDT);
        //        }else{
        //            console.log('no guanggao!');
        //        }
        //    }else{
        //        console.log(err);
        //    }
        //});

    }, schedule);
}

module.exports = C2p;