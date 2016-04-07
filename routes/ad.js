/**
 * Created by kevin on 16/3/9.
 */
var express = require('express');
var router = express.Router();
var moment = require('moment');
var advertisementDao = require('../service/advertisement/advertisementDao');

router.post('/c',function(req,res,next){
    advertisementDao.c(req,res,next);
});

router.post('/u',function(req,res,next){
    advertisementDao.u(req,res,next);
});

router.post('/r',function(req,res,next){
    advertisementDao.r(req,res,next);
});

router.post('/d',function(req,res,next){
    advertisementDao.d(req,res,next);
});

router.post('/morezx',function(req,res,next){
    advertisementDao.morezx(req,res,next);
})

router.post('/ask',function(req,res,next){
    advertisementDao.ask(req,res,next);
})

module.exports = router;