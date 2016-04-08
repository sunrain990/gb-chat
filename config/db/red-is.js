/**
 * Created by kevin on 16/1/21.
 */
var redis = require('redis');
var os = require('os');

var redisInfo = {
    port:6380,
    url:'localhost'
};

if(os.networkInterfaces().eth1){
    for(var i=0;i<os.networkInterfaces().eth1.length;i++){
        if(os.networkInterfaces().eth1[i].family=='IPv4'){
            ipv4=os.networkInterfaces().eth1[i].address;
        }
    }
    var hostname = os.hostname();
    //console.log(hostname,ipv4);
    if(ipv4 == '121.41.41.46'){
        console.log('dev-redis');
    }else if(ipv4 == '121.41.123.2'){
        console.log('formal-redis');
    }else if(ipv4 == '120.26.245.233'){
        redisInfo.url = '10.168.161.193';
        console.log('test-redis');
    }
}


//创建redis连接
var pub;
var sub;
var store;
function handleRedis(port,url){
    pub = redis.createClient(port,url);
    sub = redis.createClient(port,url);
    store = redis.createClient(port,url);
    pub.select(12);
    store.select(13);
    sub.select(14);
    console.log('redis ready!');
    pub.on("error", function(error) {
        setTimeout(handleRedis , 2000);
    });

    sub.on("error", function(error) {
        setTimeout(handleRedis , 2000);
    });

    store.on("error", function(error) {
        setTimeout(handleRedis , 2000);
    });
}
handleRedis(redisInfo.port,redisInfo.url);
var Redis = {
    pub:pub,
    sub:sub,
    store:store
};

module.exports = Redis;