/**
 * Created by kevin on 16/3/3.
 */
var later = require('later');
later.date.localTime();
var Redis = require('../red-is');


var cron = '0 0 2 * * *';
var schedule = later.parse.cron(cron,true);

//var cron = '*/1 * * * * *';
//var schedule = later.parse.cron(cron,true);
//var schedule1 = later.parse.cron('*/1 * * * * *',true);
//later.setTimeout(function(){
//    Changecustomer1();
//},schedule1);
//
//function Changecustomer1() {
//    console.log('will load at',cron);
//    later.setInterval(function () {
//        Redis.zero.lindex('testlist', 0, function (err, res) {
//            if (!err) {
//                console.log('this is customer', res);
//            } else {
//                console.log(err);
//            }
//        });
//    }, schedule1);
//}


function Changecustomer() {
    console.log('will load at',cron);
    later.setInterval(function () {
        Redis.zero.rpoplpush('service_list','service_list',function(err,res){
            if(!err){
                console.log('this is customer',res);
            }else{
                console.log(err);
            }
        });
    }, schedule);
}

module.exports = Changecustomer;