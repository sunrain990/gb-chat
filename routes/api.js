var express = require('express');
var router = express.Router();
var moment =require('moment');
var Redis = require('../config/red-is');
var Memoto = require('../config/memoto/memoto');

/* GET home page. */
router.get('/test', function(req, res, next) {
    res.send(req.body);
});

router.post('/test', function(req, res, next) {
    console.log(req.body);
    res.send(req.body);
});

router.post('/chat/notice/ask',function(req,res){
    console.log(req.body);
    //console.log(req.body.user[userid],'abcdefg!');
    //if(!req.body.user){
    //    res.json({code:0,text:'失败！'});
    //    return;
    //}

    var msg = {
        userid:req.body.userid,
        nickname:req.body.nickname,
        thum:req.body.thum,
        content:req.body.content,
        title: req.body.title,
        type:req.body.type,
        faqid:req.body.faqid,
        time:moment(req.body.time).valueOf(),
        tecdir:req.body.tecdir,
    };

    Memoto.io.emit('p2c',msg);
    res.json({code:1,text:'',data:{}});
});

router.post('/chat/notice/answer',function(req,res){
    console.log(req.body);

    var dt = {
        userid:req.body.userid,
        nickname:req.body.nickname,
        thum:req.body.thum,
        content:req.body.content,
        title:req.body.title,
        faqid:req.body.faqid,
        time:moment(req.body.time).valueOf(),
        tecdir:req.body.tecdir,
        type:4,
        //type:req.body.type,
        //notice:req.body.notice
        notice:'提问的问题<a target="_blank" href="/_pages/faq/faqDetails.html?faqid='+req.body.faqid+'">《'+req.body.title+'》</a>，得到了回复！'
    };
    req.io.emit('c2p',dt);
    res.json({code:1,text:"成功！"});
});

router.post('/chat/notice/badge',function(req,res){
    console.log(req.body,'i am badge!');
    var msg = {
        badge:req.body.badge,
        userid:req.body.userid
    };
    Redis.store.smembers("userid"+msg.userid,function(err,res){
        if(err){
            console.log('私信错误：'+err);
        }
        else{
            res.forEach(function(i){
                console.log('heheda',i);
                //Memoto.io.to(i).emit('badge',msg);
                Memoto.io.in(i).emit('badge',msg);
            });
        }
    });
    res.json({code:1,text:'success',data:{}});
});

router.post('/chat/notify1',function(req,res,next){
    console.log(req.body,'--------------<<<<<<<');
    console.log(req.body.data);
    //var targetusers = req.body.targetusers;
    //var post = req.body.post;
    //var chat = req.body.id;
    //console.log(targetusers,post,chat,'6666666');

    //Redis.store.smembers("userid"+targetusers,function(err,res){
    //    if(err){
    //        console.log('私信错误：'+err);
    //    }
    //    else{
    //        res.forEach(function(i){
    //            io.to(i).emit('p2p',data);
    //        });
    //        res.forEach(function(i){
    //            console.log('对客户端socketid',i,'私语：',data.id);
    //            io.to(i).emit('p2p',data);
    //        });
    //    }
    //});

    if(!req.body.data){
        return res.json({code:-1,text:'失败！',data:{}});
    }

    var userid = req.body.data.targetid;
    var dt = {
        text:req.body.data.title
    };
    console.log(userid,dt.text);

    Redis.store.smembers("userid"+userid,function(err,res){
        if(!err){
            res.forEach(function(i){
                console.log(i,'------this is socketid------',dt);
                req.io.to(i).emit('c4p',dt);
                req.io.in(i).emit('c4p',{text:'not everyone!'});
            });
        }
    });

    var dt = {
       text:'浏阳河，玩过了几道弯！'
    };
    req.io.emit('c4p',dt);
    res.json({code:1,text:"成功！",data:{
        dt:dt
    }});
});

router.post('/chat/notify',function(req,res,next){
    console.log(req.body,'--------------<<<<<<<');
    //var targetusers = req.body.targetusers;
    //var post = req.body.post;
    //var chat = req.body.id;
    //console.log(targetusers,post,chat,'6666666');

    //Redis.store.smembers("userid"+targetusers,function(err,res){
    //    if(err){
    //        console.log('私信错误：'+err);
    //    }
    //    else{
    //        res.forEach(function(i){
    //            io.to(i).emit('p2p',data);
    //        });
    //        res.forEach(function(i){
    //            console.log('对客户端socketid',i,'私语：',data.id);
    //            io.to(i).emit('p2p',data);
    //        });
    //    }
    //});

    var bdata = JSON.parse(req.body.data);
    console.log(bdata);
    for(var i=0;i<bdata.length;i++){
        var userid = bdata[i].targetid;
        var dt = {
            text:bdata[i].title
        };
        Redis.store.smembers("userid"+userid,function(err,res){
            if(!err){
                res.forEach(function(i){
                    console.log(i,'------this is socketid------',dt);
                    req.io.to(i).emit('c4p',dt);
                    //req.io.in(i).emit('c4p',{text:'not everyone!'});
                });
            }else{
                return res.json({code:-1});
            }
        });
    }
    //var aa = '[{"id":"16373","type":"4","targetid":"1687","time":"2016-01-22 12:11:58","title":"\\u60a8\\u63d0\\u51fa\\u7684\\u95ee\\u9898[gfjhgpuhiuu]\\u6709\\u4e86\\u65b0\\u56de\\u590d\\u70b9\\u51fb<a href=\'\\/_pages\\/faq\\/faqDetails.html?faqid=1670}\'>\\u8fd9\\u91cc<\\/a>","content":"","pics":""}]';
    //var bb = JSON.parse(aa);
    //console.log(bb,bb.targetid);
    //
    //
    //var userid = req.body.data.targetid;
    //
    //
    ////var userid = req.body.userid;
    ////var dt = {
    ////    text:req.body.title
    ////};
    //console.log(userid,dt.text);



    //var dt = {
    //    text:'浏阳河，玩过了几道弯！'
    //};
    //req.io.emit('c4p',dt);
    res.json({code:1,text:"成功！",data:{
        dt:dt
    }});
});


module.exports = router;
