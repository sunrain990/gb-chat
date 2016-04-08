/**
 * Created by kevin on 15/11/27.
 */
var mysql = require('mysql');
var pool;

var os = require('os');

function handlePool () {

    var ipv4;

    if(os.networkInterfaces().eth1){
        for(var i=0;i<os.networkInterfaces().eth1.length;i++){
            if(os.networkInterfaces().eth1[i].family=='IPv4'){
                ipv4=os.networkInterfaces().eth1[i].address;
            }
        }
        var hostname = os.hostname();
        //console.log(hostname,ipv4);
        if(ipv4 == '121.41.41.46'){
            pool = mysql.createPool({
                host: 'rdsf39n5tp6w482946xa.mysql.rds.aliyuncs.com',
                user: 'ecp_test',
                password: 'ecp_test',
                database: 'chat',
                port: 3306
            });
            console.log('informal');
        }else if(ipv4 == '121.41.123.2'){
            pool = mysql.createPool({
                host: 'rdsvy6jrfrbi2a2.mysql.rds.aliyuncs.com',
                user: 'ecp',
                password: 'CqmygDsx2s_MYSQL',
                database: 'chat',
                port: 3306
            });
            console.log('formal');
        }else if(ipv4 == '120.26.245.233'){
            conn = mysql.createPool({
                host: 'rdsf39n5tp6w482946xa.mysql.rds.aliyuncs.com',
                user: 'ecp_test',
                password: 'ecp_test',
                database: 'chat',
                port: 3306
            });
            console.log('test');
        }
    }else if(os.networkInterfaces().lo0){
        for(var i=0;i<os.networkInterfaces().lo0.length;i++){
            if(os.networkInterfaces().lo0[i].family=='IPv4'){
                ipv4=os.networkInterfaces().lo0[i].address;
            }
        }
        if(ipv4 == '127.0.0.1'){
            pool = mysql.createPool({
                host: 'localhost',
                user: 'root',
                password: 'root',
                database: 'chat',
                port: 3306
                //,
                //multipleStatements: true
            });
            console.log('localhost');
        }
    }

}
handlePool();

exports.chat = {};

exports.chat.pool = pool;

exports.chat.query = function (sql,param2,callback){
    if(typeof param2 === 'function'){
        this.getConnection(function (err, connection){
            connection.query(sql, function (){
                param2.apply(connection, arguments);
                console.log(connection.threadId);
                connection.release();
            });
        })
    }else if(typeof param2 === 'object'){
        this.getConnection(function (err,connection){
            connection.query(sql,param2,function (){
                callback.apply(connection, arguments);
                console.log(connection.threadId);
                connection.release();
            });
        })
    }

}.bind(pool);