/**
 * Created by kevin on 16/3/3.
 */
var http = require('http');
var qs = require('querystring');

var data = {
    data_uid:5994
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
                console.log(body,'\n---this is body!');
                var body1 = (new Function("","return "+body))();
                console.log('end',body1);
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