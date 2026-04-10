var mongoose = require('mongoose');

var user_data = mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    account_type: { type: String, required: true },
    country_code: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    department: { type: String, required: true },
    job_title: { type: String, required: true },
    language: { type: String, required: true },
    facebook_url: { type: String, required: true },
    business_name: { type: String, required: true },
    bS_location: { type: String, required: true },
    bS_city: { type: String, required: true },
    bS_street_address: { type: String, required: true },
    bS_zip: { type: String, required: true },
    bS_website: { type: String, required: true },
    bS_about: { type: String, required: true },
    registered_on: { type: Number, required: true },
    last_accessed_on: { type: Number, required: true },
    acc_epac: { type: String, required: true },
    epid: { type: String, required: true },
});


var Users = module.exports = mongoose.model('Users', user_data, 'p_users');

// get all Countries.
module.exports.login = function (email, callback) {
    console.log("Requested Login API");
    Users.findOne({ email: email }, { password: 1, acc_epac: 1, epid: 1 }, callback);
}

module.exports.loginVerified = function (email, t_stmp, callback) {
    console.log("Requested Login Verified API");

    var query = { "email": email };
    var update = {
        "last_accessed_on": t_stmp
    };
    var options = {};
    Users.findOneAndUpdate(query, update, options, callback);
}

