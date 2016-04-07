/**
 * Created by kevin on 16/1/21.
 */
var redis = require('redis');
var redisInfo = {
    port:6380,
    url:'localhost'
};
//创建redis连接
var pub;
var sub;
var store;
var zero;
function handleRedis(port,url){
    zero = redis.createClient(port,url);
    pub = redis.createClient(port,url);
    sub = redis.createClient(port,url);
    store = redis.createClient(port,url);
    zero.select(0);
    pub.select(12);
    store.select(13);
    sub.select(14);
    pub.on("error", function(error) {
        handleRedis();
    });

    sub.on("error", function(error) {
        handleRedis();
    });

    store.on("error", function(error) {
        handleRedis();
    });
}
handleRedis(redisInfo.port,redisInfo.url);
var Redis = {
    zero:zero,
    pub:pub,
    sub:sub,
    store:store
};

module.exports = Redis;