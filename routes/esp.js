var express = require('express');
var router = express.Router();
var fs = require('fs');
var MongoClient = require('mongodb');
var url = 'mongodb://localhost:27017/project3db';
var dbFunctions = require('../dbfunctions.js');
var mongoose   = require('mongoose');
var Esp1 = require('../models/esp1.js');
var Esp2 = require('../models/esp2.js');
var Alarm = require('../models/alarm.js');

mongoose.createConnection(url); // connect to our database


// TODO 
// Crono? voor suspicion check
// 


// checking how often there was movement in the past 5 min
var checkSuspicion = function(data, esp) {
	var motion = [];
	var motionAmount = 0;
	for (var i = data.length - 1; i >= 0; i--) {
		motion.push(data[i].pir);

		if (data[i].pir > 0) {
			motionAmount ++;
		}
	};
	if (motionAmount > 15) {
		ALARM(esp);
	} 
}

// getting data to check for suspicion
var getData = function(esp) {
	var data;

	var query = Esp1.find().sort({date: -1}).limit(30);
	query.exec(function(err, res){
		if (err){
	        res.send(err);
	    }
	    data = res;
	    checkSuspicion(data, esp);
	});
};

getData("esp1");

// creating new alarm 
var ALARM = function(esp) {
    var alarm = new Alarm();
    var date = new Date();
    alarm.location = esp;  
	alarm.day = date.getDate();
    alarm.month = date.getMonth() + 1;
    alarm.year = date.getFullYear();
    alarm.hour = date.getHours();
    alarm.time = date.getHours() + ':' + date.getMinutes();
    alarm.status = null;
    alarm.createdOn = date;

    // save the bear and check for errors
    alarm.save(function(err) {
        if (err)
            res.send(err);

        console.log({ message: 'Alarm created!' + alarm });
    });
};

setInterval(function(){
	getData("esp1");
	getData("esp2");
},300000); 

// route to get data from the esp's
router.route('/:id/:amount')
	.get(function(req, res) {

		var id = req.params.id;
		var amount = req.params.amount;

		if (id=="esp1") {
			
			var query = Esp1.find().sort({date: -1}).limit(amount);

			query.exec(function(err, data){
				if (err){
	                res.send(err);
	            }

	            res.json(data);
			});
		} else if (id=="esp2") {
			var query = Esp2.find().sort({date: -1}).limit(amount);

			query.exec(function(err, data){
				if (err){
	                res.send(err);
	            }

	            res.json(data);
			});
		} else {
			res.json({message: "no esp selected"});
		}

	});

// route for the esp's to post data to
router.route('/:id/:sensor1/:sensor2/:sensor3')
	.post(function(req, res) {
		var id = req.params.id;
		if (id == "esp1") {
			var esp1 = new Esp1();
			esp1.date = new Date(),
			esp1.pir = Number(req.params.sensor1);
			esp1.ldr = Number(req.params.sensor2);
			esp1.sound = Number(req.params.sensor3);

			esp1.save(function(err) {
	            if (err)
	                res.send(err);

	            console.log(esp1);
	            res.json({ message: 'data saved!!1!' });
	        });

		} else if (id == "esp2") {

			var esp2 = new Esp2();
			esp2.date = new Date(),
			esp2.pir = Number(req.params.sensor1);
			esp2.ldr = Number(req.params.sensor2);
			esp2.sound = Number(req.params.sensor3);

			esp2.save(function(err) {
	            if (err)
	                res.send(err);
	            console.log(esp2);
	            res.json({ message: 'data saved!!1!' });
	        });

		} else {
			res.json({message : 'Trying to POST esp data but no esp database '});
		};
	});

module.exports = router;