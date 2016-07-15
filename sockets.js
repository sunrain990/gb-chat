/**
 * Created by SQB on 2015/9/7.
 */

module.exports =function(io,redis,my,mysql_pool,moment,reward,http,log4js){
    var http = require('http');
    var qs = require('querystring');
    var _ = require('lodash');
    var async = require('async');

    //客户端登录验证
    console.log('validating1');
    //奖励用户信息
    var dt = {
        rewardTime:rewardTime,
        userid:628,
        gold:2
    };
    var rewardStatus = {
        status:"initing"
    };

    var robotReply = {
        ask:"",
        status:"ready",
        word:""
    };

    function prepareRobotReply(data){
        http.get('http://www.tuling123.com/openapi/api?key=242aa6c8faa47c5e51d4ce4b3a3da7bb&info='+data.content, function(res) {
            res.on("data", function(resdt) {
                //robotReply.status = "standby";
                var jsonData = JSON.parse(resdt);
                console.log(jsonData.text);
                function filterBD(text) {
                    text = text.replace(/(图灵)/ig,"杰米诺");
                    return text;
                };

                robotReply.word = filterBD(jsonData.text);
                if(jsonData.url){
                    robotReply.word = robotReply.word+'<br/><a href="'+jsonData.url+'" target="_blank" style="color:orangered;text-decoration:underline;">点击打开链接</a>';
                }else if(jsonData.list){
                    if(jsonData.list.length!=0&&jsonData.list[0].detailurl){
                        robotReply.word = robotReply.word+'<br/><a href="'+jsonData.list[0].detailurl+'" target="_blank" style="color:orangered;text-decoration:underline;">已列出列表</a>';
                    }
                }
                //robotReply.status = "ready";

                var tempdt = data;
                tempdt.content = robotReply.word;
                tempdt.userid = 1;
                tempdt.nickname = "杰米诺";
                tempdt.thum = '/files/user/2015/10-12/171044464b75564591.png';
                //tempdt.thum = 'http://www.xmgc360.com/files/user/2015/10-12/171044464b75564591.png';
                tempdt.time = data.time+1000;
                io.emit('p2c',tempdt);
            })
                .on('error', function(e) {
                    console.log("Got error: " + e.message);
                });
        });
    }


    //prepareRobotReply('hello');


    var rewardTime = moment().valueOf();
    console.log(rewardTime,'-- 第一次奖励时间');

    //生成奖励信息
    var generateReward = function(){
        var startTime = moment().valueOf();
        var getRandomTime = parseInt(900000*Math.random());
        var rewardTime = startTime + getRandomTime;
        rewardStatus.status = "generated";

        console.log('开始奖励时间:',moment(startTime).format('YYYY-MM-DD hh:mm:ss'),'--随机间隔时间',moment(getRandomTime).format('YYYY-MM-DD hh:mm:ss'),'--奖励时间',moment(rewardTime).format('YYYY-MM-DD hh:mm:ss'),'--奖励状态:',rewardStatus.status);

        dt = {
            rewardTime:rewardTime,
            userid:628,
            gold:2
        };
        //reward.emit('addGold',dt);
        //setTimeout(doReward,getRandomTime);
    };
    // generateReward();
    //设置心跳间隔和心跳超时时间，如果timeout后，服务器端关闭连接
    io.set('heartbeat interval', 5000);
    io.set('heartbeat timeout', 60000);

    //聊天类型
    //1.对同一个聊天室的所有人发送信息（包括自己）
    //  p2c（people to chatroom）

    //redis中对应关系
    //1.socketid与用户id对应,


//加入聊天房间示例
    //io.on('connection',function(socket){
    //    socket.on('firefox',function(data){
    //        console.log('welcome directive to firefox!',data);
    //        socket.join('firefox');
    //        //broadcast方法允许当前socket client不在该分组内
    //        //socket.broadcast.to('chrome').emit('event_name',data);
    //        io.sockets.to('firefox').emit('ff_event',data);
    //    });
    //    socket.on('chrome',function(data){
    //        console.log('here!chrome!',data);
    //        socket.join('chrome');
    //        io.sockets.to('chrome').emit('event_name',data);
    //    });
    //
    //    socket.on('subscribe',function(data){
    //        console.log('welcome to ',data.room);
    //        socket.join(data.room);
    //        io.sockets.to('chrome').emit('ff_event',data.room);
    //    });
    //
    //    socket.on('unsubscribe',function(data){
    //        //
    //        console.log('byebye!!',data.room);
    //        socket.leave(data.room);
    //        io.sockets.to(data.room).emit('event_name',data.room);
    //        //离开提醒
    //        io.sockets.to('firefox').emit('ff_event','byebye');
    //    });
    //});

    //io.sockets.authorization();
    var users = [];
    var fakusers = [];

    //var my = require('./config/db/my');

    var injectUserSql = 'SELECT id FROM ecp.user WHERE createdIp="221.224.10.50f" and id>=((select max(id) from ecp.user)-(select min(id) from ecp.user))*rand()+(select min(id) from ecp.user) limit 150';
    //my.chat.query(injectUserSql,function(err,ret){
    //    if(!err){
    //        console.log(ret,'this is ret!');
    //
    //        var resed = _.sampleSize(ret, _.random(100,150));
    //
    //        var rrr = _.map(resed,function(i){
    //            return i.id;
    //        });
    //
    //        async.each(rrr,function(item,callback){
    //            var data = {
    //                data_uid:item
    //            };
    //            console.log('servicelist',item);
    //
    //
    //            data = qs.stringify(data);
    //            var opt = {
    //                method: "POST",
    //                host: "www.xmgc360.com",
    //                port: 80,
    //                path: "/project/index.php/api/user/getinfo",
    //                headers: {
    //                    "Content-Type": 'application/x-www-form-urlencoded',
    //                    "Content-Length": data.length
    //                }
    //            };
    //
    //            var req = http.request(opt, function (serverFeedback) {
    //                if (serverFeedback.statusCode == 200) {
    //                    var body = "";
    //                    serverFeedback.on('data', function (data) { body += data; })
    //                        .on('end', function () {
    //                            var body1 = (new Function("","return "+body))();
    //                            console.log(body1);
    //
    //                            if(body1.code == 1){
    //                                var fakuser = {
    //                                    userid:body1.data.id,
    //                                    //nickname:'今天我值班',
    //                                    nickname:body1.data.name,
    //                                    thum:body1.data.thum,
    //                                    isofficer:body1.data.isofficer
    //                                };
    //                                console.log(fakuser);
    //                                fakusers.push(fakuser);
    //                            }else{
    //                                console.log('no id-1');
    //                            }
    //
    //                        });
    //                }
    //                else {
    //                    console.log('else');
    //                }
    //            });
    //            req.write(data + "\n");
    //            req.on('err',function(e){
    //                console.log(e);
    //            })
    //            req.end();
    //        },function(err){
    //            if(!err){
    //                console.log(fakusers,'> done2');
    //            }else{
    //                console.log('> done1');
    //            }
    //        });
    //    }else{
    //        console.log(err);
    //    }
    //});

    //虚拟用户
    mysql_pool.chat.pool.getConnection(function(err, connection) {
        if(!err){
            connection.query(injectUserSql, function (err, ret) {
                if(!err){

                    var resed = _.sampleSize(ret, _.random(100,150));
                    console.log(resed,'this is resed!');

                    var rrr = _.map(resed,function(i){
                        return i.id;
                    });

                    async.each(rrr,function(item,callback){
                        var data = {
                            data_uid:item
                        };
                        //console.log('servicelist',item);


                        data = qs.stringify(data);
                        var opt = {
                            method: "POST",
                            host: "www.xmgc360.com",
                            port: 80,
                            path: "/project/index.php/api/user/getinfo",
                            headers: {
                                "Content-Type": 'application/x-www-form-urlencoded',
                                "Content-Length": data.length
                            }
                        };

                        var req = http.request(opt, function (serverFeedback) {
                            if (serverFeedback.statusCode == 200) {
                                var body = "";
                                serverFeedback.on('data', function (data) { body += data; })
                                    .on('end', function () {
                                        var body1 = (new Function("","return "+body))();
                                        console.log(body1);

                                        if(body1.code == 1){
                                            var fakuser = {
                                                userid:body1.data.id,
                                                //nickname:'今天我值班',
                                                nickname:body1.data.name,
                                                thum:body1.data.thum,
                                                isofficer:body1.data.isofficer
                                            };
                                            console.log(fakuser);
                                            fakusers.push(fakuser);
                                        }else{
                                            console.log('no id-1');
                                        }

                                    });
                            }
                            else {
                                console.log('else');
                            }
                        });
                        req.write(data + "\n");
                        req.on('err',function(e){
                            console.log(e);
                        })
                        req.end();
                    },function(err){
                        if(!err){
                            connection.release();
                            console.log(fakusers,'> done2');
                        }else{
                            console.log('> done1');
                        }
                    });
                }else{
                    console.log(err);
                }
            });
        }else{
            console.log(err);
        }
        // Use the connection

    });


    //redis.pub.keys('*',function(err,res){
    //    if(!err){
    //        var resed = _.sampleSize(res, _.random(100,150));
    //        var rrr = _.map(resed,function(i){
    //            return i.substring(5);
    //        });
    //
    //        async.each(rrr,function(item,callback){
    //                var data = {
    //                    data_uid:item
    //                };
    //                console.log('servicelist',item);
    //
    //
    //                data = qs.stringify(data);
    //                var opt = {
    //                    method: "POST",
    //                    host: "www.xmgc360.com",
    //                    port: 80,
    //                    path: "/project/index.php/api/user/getinfo",
    //                    headers: {
    //                        "Content-Type": 'application/x-www-form-urlencoded',
    //                        "Content-Length": data.length
    //                    }
    //                };
    //
    //                var req = http.request(opt, function (serverFeedback) {
    //                    if (serverFeedback.statusCode == 200) {
    //                        var body = "";
    //                        serverFeedback.on('data', function (data) { body += data; })
    //                            .on('end', function () {
    //                                var body1 = (new Function("","return "+body))();
    //                                console.log(body1);
    //
    //                                if(body1.code == 1){
    //                                    var fakuser = {
    //                                        userid:body1.data.id,
    //                                        //nickname:'今天我值班',
    //                                        nickname:body1.data.name,
    //                                        thum:body1.data.thum,
    //                                        isofficer:body1.data.isofficer
    //                                    };
    //                                    console.log(fakuser);
    //                                    fakusers.push(fakuser);
    //                                }else{
    //                                    console.log('no id-1');
    //                                }
    //
    //                            });
    //                    }
    //                    else {
    //                        console.log('else');
    //                    }
    //                });
    //                req.write(data + "\n");
    //                req.on('err',function(e){
    //                    console.log(e);
    //                })
    //                req.end();
    //        },function(err){
    //            if(!err){
    //                console.log(fakusers,'> done2');
    //            }else{
    //                console.log('> done1');
    //            }
    //        });
    //    }else{
    //        console.log(err);
    //    }
    //});

    var reconnect_count = 0;

    //io.use(function(socket,next){
    //    var handshakeData = socket.handshake.query;
    //    console.log('handshakeData',handshakeData);
    //    //if(){
    //    //
    //    //}
    //    users.push(handshakeData)
    //    next(
    //    );
    //});


    var getJinbiyuMsg = function(i){
            if(i==1){
                return '淅淅沥沥一阵小雨飘过，全体在线用户每人获得金币+1奖励';
            }else if(i==2){
                return '不经意间一场雷阵雨已经过去，全体在线用户每人获得金币+2奖励';
            }else if(i==3){
                return '让暴风雨来的更猛烈些吧，全体在线用户每人获得金币+3奖励';
            }
        }
        ;

    function jinbiyu(){
        var goldTime = moment().format('HH');
        console.log(goldTime,'+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
        if(goldTime <= 20&&goldTime>=8){
            function containsID(arr1,comp){
                for(var i=0;i<arr1.length;i++){
                    if(arr1[i].userid == comp){
                        console.log('yes');
                        return true;
                    }
                }
                console.log('no');
                return false;
            }

            var rmDup = function(arr){
                var tmparr = [];
                for(var i=0;i<arr.length;i++){
                    if(!containsID(tmparr,arr[i].userid)){
                        tmparr.push(arr[i]);
                    }
                }
                return tmparr;
            }
            users = rmDup(users);

            var getRanGold = parseInt(3*Math.random())+1;
            for(var i=0;i<users.length;i++){
                var dt = {
                    userid:users[i].userid,
                    gold:getRanGold
                };
                reward.emit('addGold',dt);
            }
            var tmpdt = {
                //userid:users[i].userid,
                //nickname:users[i].nickname,
                //thum:'http://www.xmgc360.com/mis/include/imgs/thumtemp.jpg',
                //thum:users[i].thum,
                time:moment().valueOf(),
                type:4,
                notice:getJinbiyuMsg(getRanGold),
                gold:getRanGold
            };
            io.emit('c2p',tmpdt);
        }


        //var dt = {
        //    userid:1,
        //    nickname:'everyone',
        //    thum:'http://www.xmgc360.com/mis/include/imgs/thumtemp.jpg',
        //    type:4,
        //    notice:'下金币雨啦！每个在线同学获得1-3个G币'
        //};
        //io.emit('c2p',dt);7200000   5400000
        var getRanTime = parseInt(5400000*Math.random());
        setTimeout(jinbiyu,getRanTime);
        console.log('金币雨将在'+moment(moment().valueOf()+getRanTime).fromNow()+'时间后开始'+'每人奖励'+getRanGold+'个金币！');
    }

    var firstGTime = parseInt(5400000*Math.random());
    console.log('金币雨将在'+moment(moment().valueOf()+firstGTime).fromNow()+'时间后开始');
    //var goldTime = moment().format('HH');
    //console.log(goldTime,'+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    //if(goldTime>=20||goldTime<=8){
    //    console.log('asdfasfdasfasdddddddddddddddddddddddddddddddddddddddasfdasfdasfs++++++++++++');
    //}
    setTimeout(jinbiyu,firstGTime);

    //var msg1 = '<div><img src="/project/uploads/201511/1/1_20151109180157.jpg" style="height:100px;display:inline-block;vertical-align:top"><div style="display:inline-block;;vertical-align:top"><p style="font-size:14px;color:red;font-weight:bold">微信扫码关注公众号<br>微信回答问题，每次赚取10金币！<br>封号有危险，请注意科学刷钱</p></div></div>';
    ////var msg1 = '<div><img src="http://www.xmgc360.com/project/uploads/201511/1/1_20151109180157.jpg" style="height:100px;display:inline-block;vertical-align:top"><div style="display:inline-block;;vertical-align:top"><p style="font-size:14px;color:red;font-weight:bold">微信扫码关注公众号<br>微信回答问题，每次赚取10金币！<br>封号有危险，请注意科学刷钱</p></div></div>';
    //var msg2 = '<a href="/_pages/static/match1510.html" style="cursor:pointer" target="_blank"><img src="/project/uploads/201511/1/1_20151111102212.png" style="width:100%"></a>';
    ////var msg2 = '<a href="http://www.xmgc360.com/_pages/static/match1510.html" style="cursor:pointer" target="_blank"><img src="http://www.xmgc360.com/project/uploads/201511/1/1_20151111102212.png" style="width:100%"></a>';
    //
    //function noticeAD(){
    //    var subDT = {
    //        userid:1,
    //        nickname:"杰米诺",
    //        thum:'/files/user/2015/10-12/171044464b75564591.png',
    //        time:moment().valueOf(),
    //        type:4,
    //        notice:''
    //    };
    //
    //    //if(Math.random()>0.5){
    //        subDT.notice = msg1;
    //    //}else{
    //    //    subDT.notice = msg2;
    //    //}
    //    io.emit('c2p',subDT);
    //}
    //
    ////setInterval(noticeAD,300000);
    //setInterval(noticeAD,3000);


    var messageBox = {

    };

    console.log('start connection...');
    io.on('connection',function(socket) {
        var socketID = socket.id;
        messageBox[socketID] = [];
        var userInfo = {
            userid:"",
            nickname:"",
            thum:"",
            isofficer:""
        };

        //init()，一建立连接的时候传入用户信息
        socket.on('onInit',function(data){

            //zixun
            my.chat.query('select * from chat.zixuns order by time desc limit 1',function(err,res1){
                if(!err){
                    for(var i=0;i<res1.length;i++){
                        res1[i].time = moment(res1[i].time).valueOf();
                    }
                    io.in(socket.id).emit('zixun',res1);
                }else{
                    console.log(err);
                }
            });

            //my.chat.query('select * from chat.messages where type=3 order by time desc limit 9',function(err,res){
            //    if(!err){
            //
            //
            //        my.chat.query('select * from chat.messages where type=5 order by time desc limit 1',function(err,res1){
            //            if(!err){
            //
            //                for(var i=0;i<res.length;i++){
            //                    res[i].to = JSON.parse(res[i].to);
            //                    res[i].time = moment(res[i].time).valueOf();
            //                    try{
            //                        res[i].extra = JSON.parse(res[i].extra);
            //                        res[i].faqid = res[i].extra.faqid;
            //                        res[i].tecdir = res[i].extra.tecdir;
            //                    }catch(err){
            //                        console.log(err);
            //                    }
            //                }
            //
            //               for(var i=0;i<res1.length;i++){
            //                   res1[i].time = moment(res1[i].time).valueOf();
            //                   res.push(res1[i]);
            //               }
            //                io.in(socket.id).emit('zixun',res);
            //            }else{
            //                console.log(err);
            //            }
            //        });
            //    }else{
            //        console.log(err);
            //    }
            //});



            //兼容google的傻逼问题，导航栏输入就自动请求
            console.log('onInit...',data.room);
            if(data.userid == undefined){
                console.log('没有用户id,没有用户信息');
                return;
            }

            userInfo.userid = data.userid;
            userInfo.nickname = data.nickname;
            userInfo.thum = data.thum;
            if(data.isofficer){
                userInfo.isofficer = data.isofficer;
            }
            //触发客户端onInit事件
            io.in(socket.id).emit('onInit',data);

            //var sql = 'SELECT * from `user` WHERE id = '+data.userid;

            //mysql.econn.query(sql,function(err,rows,fields) {
            //    if (err) {
            //        console.log('select error : ' + err);
            //    } else if (rows.length > 0) {
            //        var nickname = rows[0].nickname;
            //        userInfo.nickname = data.nickname = nickname;
            //        userInfo.thum = data.thum = convertHeadimgUrl(rows[0].smallAvatar);
            //
            //        //userInfo.nickname = nickname;
            //        //userInfo.thum = rows[0].smallAvatar;
            //
            //    } else {
            //        console.log('eeeeelse');
            //    }
            //    console.log('iam in oninitttttttttttttttting');
            //    io.in(socket.id).emit('onInit',data);
            //}

            //判断用户有没有在线 redis
            //console.log('userid'+userInfo.userid);

            //redis.store.multi()
            //    .exists('userid'+userInfo.userid)
            //    .sadd("userid"+userInfo.userid,socket.id)
            //    //.keys("*",function(err,replies){
            //    //    redis.store.mget(replies,redis.print);
            //    //})
            //    //.dbsize()
            //    .exec(function(err,replies){
            //        if(err){console.log(err,'redis err multi');}
            //        console.log("MULTI got "+ replies.length + " replies");
            //        replies.forEach(function(reply,index) {
            //            console.log(reply,index);
            //            if (reply == 0&&index ==0) {
            //                users.push(userInfo);
            //                console.log('数组添加成功！',reply,index);
            //            } else if (reply == 0&&index ==0) {
            //                console.log('已经存在userid', userInfo.userid);
            //            }
            //            else if (reply == 1&&index==1) {
            //                console.log('插入成功！');
            //            } else if (reply == 0&&index==1) {
            //                console.log('插入失败');
            //            }
            //        });
            //    });

            redis.store.exists('userid'+userInfo.userid,function(err,data){
                console.log(data,'是否存在','userid'+userInfo.userid);
                if(err){
                    console.log('if exists',err);
                }
                else{
                    if(data == 1){
                        console.log('online users '+'userid'+userInfo.userid+'exists');
                    }else if(data == 0){
                        console.log('online users '+'userid'+userInfo.userid+'not exists');
                        //function containa(users){
                        //    if(users.length ==0){
                        //        return true;
                        //    }
                        //    var arr =users.map(function(user){
                        //        return user.userid;
                        //    })
                        //        console.log('new arr',arr);
                        //    //arr.forEach(function(i){
                        //    //    if(i==userInfo.id){
                        //    //        console.log('i=userinfoid comming');
                        //    //        return false;
                        //    //    }
                        //    //});
                        //    for(var i=0;i<arr.length;i++){
                        //        if(arr[i]==userInfo.id){
                        //            return false;
                        //        }
                        //    }
                        //    return true;
                        //}
                        //console.log(containa(users),'contain?');
                        //if(containa(users)){
                        users.push(userInfo);

                        var doc = {
                            userid: userInfo.userid,
                            nickname: userInfo.nickname,
                            thum:userInfo.thum,
                            loginTime:moment().valueOf(),
                            logoutTime:moment().valueOf()
                        };
                        //new Model.LoginModel(doc).save(function(err){
                        //    console.log('come in!-----------------------------------!----------- -- - -  - - - -');
                        //    if(err){
                        //        console.log(err);
                        //    }else{
                        //        console.log('save OK!------------------------------!---------------- -- - -  - - - -');
                        //    }
                        //});

                        //new Model.LoginModel(doc).save(function(err){
                        //    if(err){
                        //        console.log(err);
                        //    }else{
                        //        console.log('用户登录信息存储 OK！id：',userInfo.userid);
                        //    }
                        //});



                        var dt = {
                            status:'online'
                        };
                        redis.pub.hmset('user:'+userInfo.userid,dt);
                        redis.pub.hmset('user:'+userInfo.userid,doc);

                        //var doc = {
                        //    userid:userInfo.userid,
                        //    nickname:userInfo.nickname
                        //};
                        //Model.LoginModel.create(doc,function(err) {
                        //    if (err) {
                        //        console.log(err);
                        //    }else{
                        //        console.log('1111111111111用户登录信息存储 OK！id：',userInfo.userid);
                        //    }
                        //});
                        //}
                    }

                    //socket信息存在redis中
                    redis.store.sadd("userid"+userInfo.userid,socket.id);
                    console.log('用户socketid存入redis，socketid为',socket.id);
                }
            });
        });


        socket.once('onInitBaseTop',function(data){
            //兼容google的傻逼问题，导航栏输入就自动请求
            console.log('onInit...',data.room);
            if(data.userid == undefined){
                console.log('没有用户id,没有用户信息');
                return;
            }

            userInfo.userid = data.userid;
            userInfo.nickname = data.nickname;
            userInfo.thum = data.thum;
            if(data.isofficer){
                userInfo.isofficer = data.isofficer;
            }
            //触发客户端onInit事件
            io.in(socket.id).emit('onInitBaseTop',data);

            redis.store.exists('userid'+userInfo.userid,function(err,data){
                console.log(data,'是否存在','userid'+userInfo.userid);
                if(err){
                    console.log('if exists',err);
                }
                else{
                    if(data == 1){
                        console.log('online users '+'userid'+userInfo.userid+'exists');
                    }else if(data == 0){
                        console.log('online users '+'userid'+userInfo.userid+'not exists');
                        users.push(userInfo);
                        var doc = {
                            userid: userInfo.userid,
                            nickname: userInfo.nickname,
                            thum:userInfo.thum,
                            loginTime:moment().valueOf(),
                            logoutTime:moment().valueOf()
                        };

                        var dt = {
                            status:'online'
                        };
                        redis.pub.hmset('user:'+userInfo.userid,dt);
                        redis.pub.hmset('user:'+userInfo.userid,doc);
                    }

                    //socket信息存在redis中
                    redis.store.sadd("userid"+userInfo.userid,socket.id);
                    console.log('用户socketid存入redis，socketid为',socket.id);
                }
            });
        });




        //如果是服务器宕机，客户端重新连接reconnect
        socket.on('reInit',function(data){
            //mysql.chat.query('select * from chat.messages order by time desc limit 10',function(err,res){
            //    if(!err){
            //        console.log(res,'this is insert chatmessages!');
            //        io.in(socket.id).emit('zixun',res);
            //    }else{
            //        console.log(err);
            //    }
            //});

            console.log('reInit...',data.room);
            reconnect_count++;
            if(reconnect_count == 1){
                users = [];
                console.log('第一次重新链接，清空所有在线用户。。。');
            }

            //兼容google的傻逼问题，导航栏输入就自动请求
            if(data.userid == undefined){
                console.log('没有用户id,没有用户信息');
                return;
            }
            userInfo.userid = data.userid;
            userInfo.nickname = data.nickname;
            userInfo.thum = data.thum;
            if(data.isofficer){
                userInfo.isofficer = data.isofficer;
            }
            io.in(socket.id).emit('onInit',data);




            //判断用户有没有在线 redis
            //console.log('userid'+userInfo.userid);

            redis.store.exists('userid_reconnect'+userInfo.userid,function(err,data){
                console.log(data,'是否存在','userid'+userInfo.userid);
                if(err){
                    console.log('if exists',err);
                }
                else{
                    if(data == 1){
                        console.log('reconnect:online users '+'userid'+userInfo.userid+'exists');
                    }else if(data == 0){
                        console.log('reconnect:online users '+'userid'+userInfo.userid+'not exists');
                        redis.store.del("userid"+userInfo.userid);
                        redis.store.sadd("userid"+userInfo.userid,"reconnected");

                        users.push(userInfo);

                        var doc = {
                            userid: userInfo.userid,
                            nickname: userInfo.nickname,
                            thum:userInfo.thum,
                            loginTime:moment().valueOf(),
                            logoutTime:moment().valueOf()
                        };
                        //new Model.LoginModel(doc).save(function(err){
                        //    if(err){
                        //        console.log(err);
                        //    }else{
                        //        console.log('reconnect:用户登录信息存储 OK！id：',userInfo.userid);
                        //    }
                        //});


                        //存入重新连接状态
                        userInfo.status = "reconnected";
                        redis.pub.hmset('user:'+userInfo.userid,userInfo);
                    }

                    //socket信息存在redis中
                    redis.store.sadd("userid"+userInfo.userid,socket.id);
                    console.log('reconnect:用户socketid存入redis，socketid为',socket.id);
                }
            });

            //设置重新连接延时参数
            redis.store.setex('userid_reconnect'+userInfo.userid,10,'reconnect');
        });


        //心跳检测，默认客户端每5秒跳动一次
        socket.conn.on('heartbeat', function() {
            var client_ip_address = socket.request.connection.remoteAddress;
            //console.log('heartbeat',socket.id,client_ip_address,moment().format('YYYY-MM-DD h:mm:ss'));
            //服务器端断开，客户端会重新链接
            //socket.conn.close();

            //服务器端删除socket
            //socket.disconnect(true);

            //关闭io服务，不能链接
            //io.close();

            //每次心跳，将用户id对应的key的超时时间设置为60秒
            if(userInfo.userid){
                //console.log('redis',userInfo.userid);
                redis.store.expire("userid"+userInfo.userid,60);
            }

            //获取所有存储的用户id对应的用户信息
            //redis.pub.hgetall('user:'+userInfo.userid,function(err,data){
            //    if(err){
            //        console.log(err);
            //    }
            //    console.log(data);
            //}),

            var onlineUserInfo = {
                //users:users,
                count:users.length
            }

            //获取所有在线人员信息
            socket.emit('onlineUsers',onlineUserInfo);
            //console.log('heart break');
        });

        socket.on('ranFriend',function(err,re){
            if(!err){
                users = _.union(users,fakusers);
                console.log(users,'this is fakusers------');
                console.log(re);

                redis.zero.lindex('service_list',0,function(err,res){
                    if(!err){

                        var data = {
                            data_uid:res
                        };

                        data = qs.stringify(data);
                        var opt = {
                            method: "POST",
                            host: "www.xmgc360.com",
                            port: 80,
                            path: "/project/index.php/api/user/getinfo",
                            headers: {
                                "Content-Type": 'application/x-www-form-urlencoded',
                                "Content-Length": data.length
                            }
                        };

                        var req = http.request(opt, function (serverFeedback) {
                            if (serverFeedback.statusCode == 200) {
                                var body = "";
                                serverFeedback.on('data', function (data) { body += data; })
                                    .on('end', function () {
                                        var body1 = (new Function("","return "+body))();


                                        var customer = {
                                            userid:body1.data.id,
                                            //nickname:'今天我值班',
                                            nickname:body1.data.name,
                                            thum:body1.data.thum,
                                            isofficer:body1.data.isofficer
                                        };

                                        console.log(customer,'this is customer------');



                                        //function containsID(arr1,comp){
                                        //    for(var i=0;i<arr1.length;i++){
                                        //        if(arr1[i].userid == comp){
                                        //            //console.log('yes');
                                        //            return true;
                                        //        }
                                        //    }
                                        //    //console.log('no');
                                        //    return false;
                                        //}
                                        //
                                        //var rmDup = function(arr){
                                        //    var tmparr = [];
                                        //    for(var i=0;i<arr.length;i++){
                                        //        if(!containsID(tmparr,arr[i].userid)){
                                        //            tmparr.push(arr[i]);
                                        //        }
                                        //    }
                                        //    return tmparr;
                                        //}
                                        //
                                        //users = rmDup(users);

                                        for(var i=0;i<users.length;i++){
                                            if(users[i].userid ==res){
                                                console.log(res,'this is res!!');
                                                users.splice(i,1);
                                            }
                                        }

                                        var ranFriendInfo = {
                                            users:users,
                                            count:users.length
                                        };
                                        if(users.length<=5){
                                            ranFriendInfo.users.unshift(customer);
                                            console.log(ranFriendInfo,'this is ranfriendInfo!');
                                            socket.emit('ranFriend',ranFriendInfo);
                                        }else{
                                            //function getArrayItems(arr,num){
                                            //    //var return_arr = new Array();
                                            //    //var tempstr = "";
                                            //    //while(1){
                                            //    //    var index = Math.ceil(Math.random()*(users.length));
                                            //    //    var boolstr = "u"+index+"id";
                                            //    //    if(tempstr.indexOf(boolstr)>0){
                                            //    //        break;
                                            //    //    }else{
                                            //    //        return_arr.push(arr[index]);
                                            //    //        tempstr = tempstr+boolstr;
                                            //    //    }
                                            //    //}
                                            //    //return return_arr;
                                            //    var return_arr = [];
                                            //    for(var i=0;i<num;i++){
                                            //        var index = Math.ceil(Math.random()*(users.length));
                                            //        return_arr.push(arr[index-1]);
                                            //    }
                                            //    return return_arr;
                                            //}
                                            //ranFriendInfo.users = getArrayItems(users,6);

                                            //function getRanFriend(arr,num){
                                            //    var return_arr = [];
                                            //    var index = Math.ceil(Math.random()*(users.length))-1;
                                            //    if(index+num<=arr.length){
                                            //        for(var i=index;i<index+num;i++){
                                            //            return_arr.push(arr[i]);
                                            //        }
                                            //    }else if(index+num>arr.length){
                                            //        for(var i=index;i<arr.length;i++){
                                            //            return_arr.push(arr[i]);
                                            //        }
                                            //        for(var i=0;i<index+num-arr.length;i++){
                                            //            return_arr.push(arr[i]);
                                            //        }
                                            //    }
                                            //    return return_arr;
                                            //}

                                            //function getRanFriend(arr,num){
                                            //    var return_arr = [];
                                            //    var index = Math.ceil(Math.random()*(users.length))-1;
                                            //    if(index+num<=arr.length){
                                            //        for(var i=index;i<index+num;i++){
                                            //            return_arr.push(arr[i]);
                                            //        }
                                            //    }else if(index+num>arr.length){
                                            //        for(var i=index;i<arr.length;i++){
                                            //            return_arr.push(arr[i]);
                                            //        }
                                            //        for(var i=0;i<index+num-arr.length;i++){
                                            //            return_arr.push(arr[i]);
                                            //        }
                                            //    }
                                            //    return return_arr;
                                            //}
                                            //
                                            //ranFriendInfo.users = getRanFriend(users,5);
                                            ranFriendInfo.users = _.sampleSize(_.uniqBy(users,'thum'), 5);
                                            ranFriendInfo.users.unshift(customer);
                                            socket.emit('ranFriend',ranFriendInfo);
                                        }
                                        console.log('用户ID：'+userInfo.userid,'用户名：'+userInfo.nickname,'执行随机伙伴函数','总伙伴数为：'+users.length);

                                    });
                            }
                            else {
                                console.log('else');
                            }
                        });
                        req.write(data + "\n");
                        req.on('err',function(e){
                            console.log(e);
                        })
                        req.end();


                    }else{
                        console.log(err);
                    }
                });
            }else{
                console.log(err);
            }


        });


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

        //监听聊天信息
        socket.on('p2c',function(data){


            //根据用户id查询用户信息
            //灌水
            if(data.type == 1){
                storemsg(data);
                //对本聊天室内所有人发送信息

                data.time = moment().valueOf();
                var edge = 10;
                if(messageBox[socketID].length<edge){
                    messageBox[socketID].push(data);
                }else if(messageBox[socketID].length>=edge){
                    messageBox[socketID].splice(0,1);
                    messageBox[socketID].push(data);

                    if(messageBox[socketID][messageBox[socketID].length-1].time-messageBox[socketID][0].time<=60000){
                        console.log('有屌丝在刷金币！！！');
                        var gdt = {
                            userid:data.userid,
                            nickname:data.nickname,
                            thum:data.thum,
                            type:4,
                            notice:'非手工刷金币，被无情的T出聊天室！',
                            time:moment().valueOf()
                        };
                        io.emit('c2p',gdt);
                        delete messageBox[socketID];
                        socket.disconnect(true);
                        return;
                    }
                }
                io.emit('p2c',data);
                //console.dir(messageBox);
                //console.log(messageBox);

                if(data.to.userid == "000"){
                    prepareRobotReply(data);
                }

                ////随机奖励用户
                //if(rewardStatus.status == "generated"){
                //    //console.log('startTime:',startTime,'--getRandomTime',getRandomTime,'--rewardTIme',rewardTime,'--rewardStatus:',rewardStatus.status);
                //    var rewardTime = dt.rewardTime;
                //    //当前获取信息时间
                //    var getMessageTime = moment().valueOf();
                //    var hourTime = moment().format('HH');
                //    if(getMessageTime>rewardTime&&hourTime<= 20&&hourTime>=8){
                //        dt = {
                //            rewardTime:rewardTime,
                //            userid:userInfo.userid,
                //            gold:parseInt(10*Math.random())
                //        };
                //        console.log('取得message时间：',getMessageTime,'奖励时间：',rewardTime);
                //        console.log('开始奖励：'+userInfo.userid,'用户：'+userInfo.nickname,'金币数：'+dt.gold);
                //        reward.emit('addGold',dt);
                //        var tmpdata = data;
                //        tmpdata.type = 4;
                //        tmpdata.time = moment().valueOf();
                //        tmpdata.gold = dt.gold;
                //        tmpdata.thum = userInfo.thum;
                //        tmpdata.notice = "幸运的发言，被系统赠送"+dt.gold+"个金币！";
                //        io.emit('c2p',tmpdata);
                //        rewardStatus.status = "rewarded";
                //        generateReward();
                //    }
                //}
            }
            //课程提问
            else if(data.type == 2){
                storemsg(data);
                //
                if(data.to.userid){
                    console.log('用户：'+data.userid,'用户名：'+data.nickname+"对->",data.to.userid,' 用户：'+data.to.nickname+'私语：',data.content);
                    redis.store.smembers("userid"+data.to.userid,function(err,res){
                        if(err){
                            console.log('私信错误：'+err);
                        }
                        else{
                            //console.log('here@',res);
                            res.forEach(function(i){
                                console.log('对客户端socketid',i,'私语',data);
                                io.to(i).emit('p2c',data);
                            });
                        }
                    });
                }
            }
            //项目提问
            else if(data.type == 3){
                var msg = clone(data);
                msg.to = JSON.stringify(msg.to);
                //data.time = moment(data.time).format('YYYY-MM-DD HH:mm:ss');
                //data.time = '2014-01-22 01:11:22';
                //msg.extra = {};
                //msg.extra.faqid = msg.faqid;
                //msg.extra.tecdir = msg.tecdir;
                //msg.extra = JSON.stringify(msg.extra);
                //delete msg.faqid;
                //delete msg.tecdir;
                msg.lasttime = '';
                //console.log('this is p2c --> data!',msg,msg.time);
                var msgsql = 'insert into chat.faqs set '+Filtermsg(msg);
                //console.log(msgsql,'--->msgsql');
                my.chat.query(msgsql,function(err,res){
                    if(!err){
                        var id = res.insertId;
                        //对所有人发送提问问题
                        data.nickname = userInfo.nickname;
                        data.time = moment().valueOf();
                        data.id = id;
                        io.emit('p2c',data);
                        console.log(res,'this is insert chatmessages!');
                    }else{
                        console.log(err);
                    }
                });
            }else{
                console.log('消息发送不正确！');
                return;
            }
        });

        socket.on('p2p',function(data){
            console.log('|||||||||||||||p2p2p2p2p22p2p2p22p2p2p22p2p！');
            storemsg(data);
            //私信悄悄话
            log4js.warn(data);

            data.time = moment().valueOf();
            //var arr = redis.store.smembers(data.usserid).keys("*",function(err,replies){
            //    console.log(replies,'rerererereplies');
            //});
            //console.log(arr);
            /*  redis.store.multi()
             //.scard(data.userid)
             .smembers(data.userid)
             //.keys("*",function(err,replies){
             //    redis.store.mget(replies,redis.print);
             //})
             //.dbsize()
             .exec(function(err,replies){
             console.log("MULTI got "+ replies.length + " replies");
             replies.forEach(function(reply,index){
             console.log("Reply " + index + ": " + reply);
             reply.forEach(function(i){
             console.log(i,'iiiiiiiiiiiiiiiiiiiiiiiii');
             io.sockets.socket(i).to('chrome').emit('p2p', 'u r in chrome chatroom now!');
             })
             });
             });*/

            //redis.store.smembers("userid"+data.userid,function(err,data){
            //    if(err){
            //       console.log('私信错误：'+err);
            //    }
            //    else{
            //        console.log('here@',data);
            //        data.forEach(function(i){
            //            console.log(i,'iiiiiiiiiiiiiiiiiiiiiiii');
            //            io.to(i).emit('p2p', 'u r in chrome chatroom now!');
            //        });
            //    }
            //});
            if(data.to.userid&&data.to.userid == '1'){
                http.get('http://www.tuling123.com/openapi/api?key=242aa6c8faa47c5e51d4ce4b3a3da7bb&info='+data.content, function(res) {
                    res.on("data", function(resdt) {
                        var jsonData = JSON.parse(resdt);
                        console.log(jsonData.text);

                        if(data.userid){
                            console.log("发送给私语本人信息：");
                            redis.store.smembers("userid"+data.userid,function(err,res){
                                if(err){
                                    console.log('私信错误self：'+err);
                                }
                                else{
                                    res.forEach(function(i){
                                        console.log('对客户端socketid',i,'私语：',data.id);
                                        io.to(i).emit('p2p',data);
                                    });
                                    var data1 = {};
                                    data1.userid = data.to.userid;
                                    data1.nickname = data.to.nickname;
                                    data1.content = jsonData.text;
                                    data1.title = data.title;
                                    data1.type = data.type;
                                    data1.time = data.time;
                                    data1.lasttime = data.lasttime;
                                    data1.thum = data.to.thum;
                                    data1.to = {};
                                    data1.to.userid = data.userid;
                                    data1.to.nickname = data.nickname;
                                    data1.to.thum = data.thum;
                                    data1.to.status = data.to.status;
                                    res.forEach(function(i){
                                        io.to(i).emit('p2p',data1);
                                    });
                                }
                            });
                        }

                        if(data.to.userid){
                            console.log("发送给私语对方信息：");
                            redis.store.smembers("userid"+data.to.userid,function(err,res){
                                if(err){
                                    console.log('私信错误：'+err);
                                }
                                else{
                                    var data1 = {};
                                    data1.userid = data.to.userid;
                                    data1.nickname = data.to.nickname;
                                    data1.content = jsonData.text;
                                    data1.title = data.title;
                                    data1.type = data.type;
                                    data1.time = data.time;
                                    data1.lasttime = data.lasttime;
                                    data1.thum = data.to.thum;
                                    data1.to = {};
                                    data1.to.userid = data.userid;
                                    data1.to.nickname = data.nickname;
                                    data1.to.thum = data.thum;
                                    data1.to.status = data.to.status;
                                    res.forEach(function(i){
                                        io.to(i).emit('p2p',data1);
                                    });
                                    res.forEach(function(i){
                                        console.log('对客户端socketid',i,'私语：',data.id);
                                        io.to(i).emit('p2p',data);
                                    });

                                }
                            });
                        }

                    })
                        .on('error', function(e) {
                            console.log("Got error: " + e.message);
                        });
                });
            }else{
                if(data.to.userid){
                    console.log("发送给私语对方信息：");
                    redis.store.smembers("userid"+data.to.userid,function(err,res){
                        if(err){
                            console.log('私信错误：'+err);
                        }
                        else{
                            res.forEach(function(i){
                                console.log('对客户端socketid',i,'私语：',data.id);
                                io.to(i).emit('p2p',data);
                            });
                        }
                    });
                }
                if(data.userid){
                    console.log("发送给私语本人信息：");
                    redis.store.smembers("userid"+data.userid,function(err,res){
                        if(err){
                            console.log('私信错误self：'+err);
                        }
                        else{
                            res.forEach(function(i){
                                console.log('对客户端socketid',i,'私语：',data.id);
                                io.to(i).emit('p2p',data);
                            });
                        }
                    });
                }
            }



            //console.log('用户：'+data.userid,'用户名：'+data.nickname+"对->",data.to.userid,' 用户：'+data.to.nickname+'私语：',data.content);
            //if(data.to.userid){
            //    console.log("发送给私语对方信息：");
            //    redis.store.smembers("userid"+data.to.userid,function(err,res){
            //        if(err){
            //            console.log('私信错误：'+err);
            //        }
            //        else{
            //            res.forEach(function(i){
            //                console.log('对客户端socketid',i,'私语：',data.id);
            //                io.to(i).emit('p2p',data);
            //            });
            //        }
            //    });
            //}
            //if(data.userid){
            //    console.log("发送给私语本人信息：");
            //    redis.store.smembers("userid"+data.userid,function(err,res){
            //        if(err){
            //            console.log('私信错误self：'+err);
            //        }
            //        else{
            //            res.forEach(function(i){
            //                console.log('对客户端socketid',i,'私语：',data.id);
            //                io.to(i).emit('p2p',data);
            //            });
            //        }
            //    });
            //}
            //if(data.to.userid == '1'){
            //    console.log('|||||||||||||||有人调戏杰米诺机器人！');
            //
            //    http.get('http://www.tuling123.com/openapi/api?key=242aa6c8faa47c5e51d4ce4b3a3da7bb&info='+data.content, function(res) {
            //        res.on("data", function(resdt) {
            //            var jsonData = JSON.parse(resdt);
            //            console.log(jsonData.text);
            //        })
            //            .on('error', function(e) {
            //                console.log("Got error: " + e.message);
            //            });
            //    });
            //}


            //arr.forEach(function(i){
            //    console.log('foreach i',i);
            //    io.sockets.socket(i).to('chrome').emit('p2p', 'u r in chrome chatroom now!');
            //});
        });

        //提问题加金币
        //socket.on('gg',function(data){
        //    console.log(data);
        //    var dt = {
        //        userid:data.userid,
        //        gold:5
        //    };
        //    reward.emit('addGold',dt);
        //    redis.store.smembers("userid"+data.userid,function(err,res){
        //        if(err){
        //            console.log('私信错误：'+err);
        //        }
        //        else{
        //            //console.log('here@',res);
        //            res.forEach(function(i){
        //                io.to(i).emit('gg',dt);
        //            });
        //        }
        //    });
        //});

        socket.on('disconnect', function () {
            //io.emit('user disconnected');
            console.log('用户：'+userInfo.userid,' 用户名：'+userInfo.nickname,'的'+socket.id,'disconnect');
            function removeUser(value){
                return (value.userid != userInfo.userid);
            }

            redis.store.scard('userid'+userInfo.userid,function(err,data){
                console.log('用户：'+userInfo.userid,' 用户名：'+userInfo.nickname,'的在线终端有'+data,'个');
                if(err){
                    console.log(err);
                }else if(data==1){
                    console.log('如果是1个：');

                    users = users.filter(removeUser);

                    redis.store.srem('userid'+userInfo.userid,socket.id);

                    var dt = {
                        status:'offline'
                    };
                    redis.pub.hmset('user:'+userInfo.userid,dt);

                    console.log('no need take place !');
                    //redis.store.sadd('userid'+userInfo.userid,'take place');
                    //redis.store.expire("userid"+userInfo.userid,10);
                }else if(data==2){
                    console.log('如果是2个：');
                    //redis.store.smembers('userid'+userInfo.userid);
                    redis.store.smembers("userid"+userInfo.userid,function(err,res){
                        if(err){
                            console.log('私信错误：'+err);
                        }
                        else{
                            redis.store.srem('userid'+userInfo.userid,socket.id);
                            res.forEach(function(i){
                                if(i =="take place" || i == "reconnected"){
                                    console.log('其中有reconnected ');
                                    users = users.filter(removeUser);
                                    //redis.store.expire("userid"+userInfo.userid,5);
                                    redis.store.del("userid"+userInfo.userid);

                                    var dt = {
                                        status:'offline'
                                    };
                                    redis.pub.hmset('user:'+userInfo.userid,dt);
                                }
                            });
                        }
                    });
                }
                else{
                    console.log('删除redis中'+'用户：'+userInfo.userid,' 用户名：'+userInfo.nickname,'的'+socket.id);
                    redis.store.srem('userid'+userInfo.userid,socket.id);
                }
            });
        });


        //var socketid = socket.id;
        //console.log(socket.id);
        //io.sockets.clients().forEach(function (socket) {
        //    console.log(socket.id);
        //})
        //io.clients(function(error, clients){
        //    if (error) throw error;
        //    console.log(clients); // => [6em3d4TJP8Et9EMNAAAA, G5p55dHhGgUnLUctAAAB]
        //});

        //socket.on('subscribe', function (data) {
        //    var subDT = {
        //        userid:data.userid,
        //        nickname:data.nickname,
        //        thum:data.nickname,
        //        time:moment().valueOf(),
        //        type:4,
        //        notice:'加入了聊天室！'
        //    };
        //    socket.join(data.room);
        //    io.sockets.to(data.room).emit('c2p',subDT);
        //    console.log('用户：'+userInfo.userid,' 用户名：'+userInfo.nickname,'的'+socket.id,' 开始subscribe加入：',data.room,'房间！');
        //});
        //socket.on('unsubscribe', function (data) {
        //    var subDT = {
        //        userid:data.userid,
        //        nickname:data.nickname,
        //        thum:data.nickname,
        //        time:moment().valueOf(),
        //        type:4,
        //        notice:'离开了聊天室！'
        //    };
        //    socket.leave(data.room);
        //    io.sockets.to(data.room).emit('c2p',subDT);
        //    console.log('用户：'+userInfo.userid,' 用户名：'+userInfo.nickname,'的'+socket.id,' unsubscribe退出：',data.room,'房间！');
        //});


        socket.on('firefox',function(data){
            console.log('welcome directive to firefox!',data);
            socket.join('firefox');
            //broadcast方法允许当前socket client不在该分组内
            //socket.broadcast.to('chrome').emit('event_name',data);
            io.sockets.to('firefox').emit('ff_event',data);
        });

        socket.on('chrome',function(data){
            console.log('here!chrome!',data);
            socket.join('chrome');
            io.sockets.to('chrome').emit('event_name',data);
        });
        //
        //socket.on('p2p',function(){
        //
        //});

        ////用户进入聊天室事件，向其他在线用户广播其用户名
        //socket.on('join', function (data) {
        //    socket.broadcast.emit('broadcast_join', data);
        //    connectionList[socketId].username = data.username;
        //});
        //
        ////用户离开聊天室事件，向其他在线用户广播其离开
        //socket.on('disconnect', function () {
        //    if (connectionList[socketId].username) {
        //        socket.broadcast.emit('broadcast_quit', {
        //            username: connectionList[socketId].username
        //        });
        //    }
        //    delete connectionList[socketId];
        //});



        ////监听客户端的请求在线消息
        //socket.on('onlineUsers',function(err,data){
        //    if(err){
        //        console.log(err);
        //    }else{
        //        console.log(data,'to onlineUsers data');
        //
        //        socket.emit('onlineUsers',users);
        //    }
        //
        //    console.log('online,users','aaaaaaaaaaaa',users,users.length);
        //
        //    console.log(users,'online users alll------------------------------------------<');
        //});

        //setInterval(function(){
        //    var subDT = {
        //        userid:1,
        //        nickname:"杰米诺",
        //        thum:'http://www.xmgc360.com/files/user/2015/10-12/171044464b75564591.png',
        //        time:moment().valueOf(),
        //        type:4,
        //        notice:'<p style="font-size:18px;font-weight:bold;">课设大赛调查问卷，答就送20金币！<br><a style="font-size:24px;color:red"  href="http://www.sojump.com/jq/5960368.aspx" target="_blank">点我点我！</a>'
        //    };
        //    io.emit('c2p',subDT);
        //},10000);

        //setInterval(function () {
        //    //socket.broadcast.to('firefox').emit('message','not everyone');
        //    io.sockets.to('firefox').emit('c2p', 'u r in firefox chatroom now!');
        //    //console.log(socket.id);
        //    //io.in(socket.id).emit('message','not everyone');
        //    //获取所有sockets的id
        //    //console.log(io.sockets.sockets.map(function(socket){
        //    //    return socket.id;
        //    //}));
        //    //io.sockets.socket(socketid).to('chrome').emit('message1', 'u r in chrome chatroom now!');
        //}, 5000);
        //console.dir(io.sockets.adapter.rooms);
    });
};
