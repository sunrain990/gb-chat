/**
 * Created by SQB on 2015/9/29.
 */
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var http = require('http');
var crypto = require('crypto');

// 时间戳产生函数
var createTimeStamp = function () {
    return parseInt(new Date().getTime() / 1000) + '';
};

//加金币
var addGold = function(userid,gold){
    var timestamp = createTimeStamp();
    var uid = userid;
    var token = "ecp is best!!!";
    var gold = gold;
    var desc = "金币雨奖励"+gold+"个金币";
    var dt = [];
    dt.push(token);
    dt.push(timestamp);
    dt.push(uid);
    dt.sort();
    var tmpStr = dt.join("");
    //var jsobj = new jsSHA(tmpStr,'TEXT');
    //var signature = jsobj.getHash('SHA-1','HEX');

    var shasum = crypto.createHash('sha1');
    shasum.update(tmpStr);
    var signature = shasum.digest('hex');

    var paras = "?uid="+uid+"&timestamp="+timestamp+"&signature="+signature+"&gold="+gold+"&desc="+desc;

    http.get('http://www.geminno.cn/project/index.php/api/money/gold_recharge/'+paras, function(res) {
        res.on("data", function(data) {
            var jsonData = JSON.parse(data);
            //console.log(jsonData.code,jsonData.text,jsonData.data.gold);
        })
            .on('error', function(e) {
                console.log("Got error: " + e.message);
            });
    });
};

var Reward = function(){
    var self = this;
    this.on('newListener',function(listener){
        console.log('Event Listener: ' + listener);
    });

    self.on('addGold',function(data){
        console.log(data,'i am adding gold');
        //var userid = data.userid;
        //var gold = data.gold;
        addGold(data.userid,data.gold);
        console.log(data.userid,'adding gold success');
    });
};

util.inherits(Reward,EventEmitter);
module.exports = Reward;