/**
 * Created by kevin on 16/3/14.
 */
var http = require('http');
var qs = require('querystring');
var _ = require('lodash');

var data = {
    data_uid:1
};


data = qs.stringify(data);
var opt = {
    method: "POST",
    host: "www.geminno.cn",
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