/**
 * Created by kevin on 16/3/9.
 */
var Io = require('./Io');

function noticeAD(){
    var subDT = {
        userid:1,
        nickname:"杰米诺",
        thum:'/files/user/2015/10-12/171044464b75564591.png',
        time:'2016-03-10 00:00:00',
        type:4,
        notice:''
    };

    //if(Math.random()>0.5){
    subDT.notice = '<div style="color: green;">通知啊 通知 这是个通知！</div>';
    //}else{
    //    subDT.notice = msg2;
    //}
    Io.io.emit('c2p',subDT);
}

//setInterval(noticeAD,300000);
setInterval(noticeAD,3000);
