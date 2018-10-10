var mongoose = require('mongoose');

var pric_data = mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    company_name: { type: String, required: true },
    website: { type: String, required: true },
    registered_on: { type: Number, required: true },
    private_id: { type: String, required: true },
    public_id: { type: String, required: true },
    business_id: { type: String, required: true },
    last_erm: { type: String, required: true }
   
});


var Pric = module.exports = mongoose.model('Pric', pric_data, 'api_prchs');




// Authoriazion of api.
module.exports.AuthorizeUsage = (api_id, callback) => {
	console.log("Requested API Authorization");
	Pric.findOne( {public_id: api_id}, { website:1, business_id:1 }, callback);
}

// Authentication of api.
module.exports.VerifyBusinessApi = (api_id, callback) => {
	console.log("Requested API Authentication");
	Pric.findOne( {business_id: api_id}, { website:1 }, callback);
}