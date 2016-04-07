var express = require('express');
var router = express.Router();
var moment = require('moment');
var crypto = require('crypto');

router.post('/showmsgRT',function(req,res){
    /*{
        keyword:'',
        uid:32,
        type:'success',
        text:''
    }*/

    /*
    *
    * 浏览器端发送生成signature
     var uid = 1;
     var timestamp = parseInt(new Date().getTime() / 1000) + '';
     var token = 'ecp is best!!!';
     var desc = "from broswer";
     var arr = [];
     arr.push(token);
     arr.push(timestamp);
     arr.push(uid);
     arr.sort();
     var tmpStr = arr.join("");
     var signature = Crypto.sha1(tmpStr);

     浏览器端生成paras1
     var paras1 = {
         uid:uid,
         signature:signature,
         timestamp:timestamp
     };
    *
    * */
    //验证signature
    var timestamp = req.body.timestamp;
    var token = "ecp is best!!!";
    var uid = req.body.uid;
    var type= req.body.type;
    var text = req.body.text;
    var sec = req.body.sec;

    var tmpArr = [];
    tmpArr.push(token);
    tmpArr.push(timestamp);
    tmpArr.push(uid);
    tmpArr.sort();
    var tmpStr = tmpArr.join("");


    var shasum = crypto.createHash('sha1');
    shasum.update(tmpStr);
    var signature = shasum.digest('hex');
    if(signature == req.body.signature){
        console.log('验证成功！！！！');

        var userid = req.body.uid;
       /* var dt = {
            userid:'1',
            nickname:'jiemini',
            thum:'http://www.geminno.cn/files/user/2015/10-12/171044464b75564591.png',
            type:4,
            notice:'hohohohoho',
            time:moment().valueOf()
        };*/
        var dt = {
            uid:uid,
            type:type,
            text:text,
            sec:sec
        };

        req.redis.store.exists('userid'+userid,function(err,data) {
            console.log(data, '是否存在', 'userid' +userid);
            if (err) {
                console.log('if exists', err);
            }
            else {
                if (data == 0) {
                    console.log('data 为0')
                    res.json(
                        {code:-1,text:'目前当前用户不存在'}
                    );
                } else if (data >= 0) {
                    console.log('online users ' + 'userid' + userid + 'exists');
                    req.redis.store.smembers("userid"+userid,function(err,res){
                        if(err){
                            console.log('私信错误：'+err);
                        }
                        else{
                            res.forEach(function(i){
                                //req.io.to(i).emit('a2p',dt);
                                req.io.to(i).emit('a2p',dt);
                            });
                        }
                    });

                    res.json({code:1,text:"ok"});
                }
            }
        });












    }else{
        console.log('验证失败，不做处理');
        res.json({code:-1,text:'验证信息失败！'});
    }

});






module.exports = router;
