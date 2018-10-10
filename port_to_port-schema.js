var mongoose = require('mongoose');

var port_to_port = mongoose.Schema({
    from:{ type: Number, required: true },
    from_name:{ type: String, required: true },
    to:{ type: Number, required: true },
    to_name:{ type: String, required: true },
    distance:{ type: Number, required: true }
});


var PortDistance = module.exports = mongoose.model('PortDistance', port_to_port, 'portDistance');


// module.exports.getTrains = function(callback, limit) {
// 	console.log("Requested getTrains() API");
// 	Trains.find(callback).limit(15);
// }


module.exports.portToPortDistance = function(from_port, to_port, callback) {
	console.log("Requested Port To Port Distance() API");
	//Trains.find({src: from, dstn: to}, callback);
	PortDistance.find({ $or: [{from: from_port, to: to_port}, {from: to_port, to: from_port}] }, callback);
}

// module.exports.baseFares = function(traino, callback){
//    console.log("Requested baseFares() API");
//    Trains.findOne({trainNo: traino}, {AC1Tier:1, AC2Tier: 1, sleeperClass: 1}, callback);
// }

// module.exports.getTrainName_DepAtFromStn = function(traino, callback){
//    console.log("Requested getTrainName_DepAtFromStn() API");
//    Trains.find({$or: traino}, {trainNo:1, trainName:1, depAtFromStn: 1}, callback);
// }