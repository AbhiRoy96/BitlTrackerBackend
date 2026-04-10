let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');
SALT_WORK_FACTOR = 10;


let CustomerSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true, trim: true },
    emailConsent: { type: String, required: true, trim: true },
    email_verified: { type: String, required: true, trim: true },
    userId: { type: String, unique: true, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    given_name: { type: String, required: true, trim: true },
    picture: { type: String, required: true, trim: true },
    phone: { type: String, unique: true, required: true, trim: true },
    country: { type: String, trim: true },
    locale: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    passwordConf: { type: String, required: true, trim: true },
    registeredOn: { type: Date, required: true, trim: true },
    registrationIp: { type: String, required: true, trim: true },
    registeredVia: { type: String, required: true, trim: true },
    isActive: { type: String, required: true, trim: true },
    updateDate: { type: Date, required: true, trim: true },
    provider: { type: String, trim: true },
    isSubscribed: { type: String, trim: true },
    at_hash: { type: String, trim: true },
    jti: { type: String, trim: true },
    session_key: { type: String, trim: true },
    lastLoginIp: { type: String, required: true, trim: true },
    last_accessed_on: { type: Date, trim: true }
});


let Custmr = module.exports = mongoose.model('Custmr', CustomerSchema, 'staff');


module.exports.customerSignUp = (custData, s_token, callback) => {
    console.log("Customer-Signup Api Requested!");

    let newCust = new Custmr(custData);
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if(err) console.log(err);
        else {
            bcrypt.hash(newCust.password, salt, (err, hash) => {
                if(err) console.log(err);
                else{
                    newCust.password = hash;
                    newCust.passwordConf = hash;
                    newCust.session_key = s_token;
                    newCust.last_access_on = new Date();
                    newCust.save(callback)
                }
            });
        }
    });
}