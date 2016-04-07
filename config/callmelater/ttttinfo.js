/**
 * Created by kevin on 16/3/3.
 */
var later = require('later');
later.date.localTime();
var Redis = require('../red-is');


var schedule1 = later.parse.cron('*/1 * * * * *',true);
later.setTimeout(function(){
    Changecustomer1();
},schedule1);

function Changecustomer1() {
    later.setInterval(function () {
        //Redis.zero.lindex('testlist', 0, function (err, res) {
        //    if (!err) {
        //        console.log('this is customer', res);
        //    } else {
        //        console.log(err);
        //    }
        //});

        Redis.zero.rpoplpush('testlist','testlist',function(err,res){
            if(!err){
                console.log('this is customer',res);
            }else{
                console.log(err);
            }
        });
    }, schedule1);
}