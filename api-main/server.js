require('dotenv').config();
var express = require('express');
var mongoose = require('mongoose')
var bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express()
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/sdBT';
const JWT_SECRET_SESSION = process.env.JWT_SECRET_SESSION || 'YOUR_JWT_SECRET_SESSION';
const JWT_SECRET_BOOKING = process.env.JWT_SECRET_BOOKING || 'YOUR_JWT_SECRET_BOOKING';
const JWT_SECRET_TOKEN = process.env.JWT_SECRET_TOKEN || 'YOUR_JWT_SECRET_TOKEN';
const JWT_SECRET_PAYMENT = process.env.JWT_SECRET_PAYMENT || 'YOUR_JWT_SECRET_PAYMENT';


//var twilio = require('twilio');

// Schema Models --
PortDistance = require('./port_to_port-schema');
PortData = require('./port_data-schema');
ShipRates = require('./ship_rates-schema');
Pric = require('./api_pric-schema');
Users = require('./portal_users-schema');
ShipmentData = require('./booking_collection-schema');


// SSR Template
let invoice_template = require('./invoice-template');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
    console.log('ip:', req.ip);
    next();
});

mongoose.connect(MONGODB_URI).then(
        () => {console.log("DB connected.")},
        err => {console.log(err)}
    );
var db = mongoose.connection;

app.use(bodyParser.json({
    extended: true      // to support JSON-encoded bodies
}));







// ******** REST APIS ******** //

app.get('/', function(req, res, next){
    res.sendStatus(404)
});




app.post('/api/session', verifyToken, function(req, res){
    var api_token = req.token;
    Pric.AuthorizeUsage(api_token, (err, api_tok) => {
        if(err)
            console.log('Error occured: --------> '+err);
        else{
            if(!api_tok)
                res.sendStatus(403);
            else{
                let sess_id = {
                    bid: api_tok.business_id,
                    site: api_tok.website
                }
                jwt.sign({sess_id}, JWT_SECRET_SESSION, {expiresIn: '12h'}, (err, token) =>{
                    var messagePayload = {
                        "session_id": token,
                        "status": "200"
                    };
                    res.send(messagePayload);
                });
            }
        }
    });
});




app.post('/api/portDistance', verifyToken, function(req, res){
    authenticationCheck(req.token, (statusCode) => {
        if( statusCode == 403)
            res.sendStatus(403);
        else{
            var source = req.body.from;
            var dist = req.body.to;

            PortDistance.portToPortDistance(source, dist, function(err, port_){
                if(err)
                    console.log('Error occured: --------> '+err);
                res.json(port_)
            });
        }
    });
});




app.get('/api/countries', verifyToken, function(req, res, next){
    authenticationCheck(req.token, (statusCode) => {
        if(statusCode == 403)
            res.sendStatus(403);
        else{
            PortData.allCountryList(function(err, countries){
                if(err)
                    console.log('Error occured: --------> '+ err);
                else
                    countries.sort();
                    // as there is a blank space.
                    countries.shift();
                    res.json(countries)
            });
        }
    });
});




app.post('/api/country/ports', verifyToken, function(req, res){
    authenticationCheck(req.token, (statusCode) => {
        if(statusCode == 403){
            res.sendStatus(403);
        } else {
            var country = req.body.country;
            PortData.allPortInCountry(country, function(err, port_){
                if(err)
                    console.log('Error occured: --------> '+err);
                res.json(port_)
            });
        }
    });
});




app.post('/api/ports/no', verifyToken, function(req, res){
    authenticationCheck(req.token, (statusCode) => {
        if(statusCode == 403){
            res.sendStatus(403);
        } else {
            var port_no = req.body.port_no;
            PortData.portSearch(port_no, function(err, port_){
                if(err)
                    console.log('Error occured: --------> '+err);
                res.json(port_)
            });
        }
    });
});




app.post('/api/quotes/fcl', verifyToken, (req, res) => {
    authenticationCheck(req.token, (statusCode) => {
        if((statusCode == 403) || (!req.body.from_port) || (!req.body.to_port) || (!req.body.shpmt_type))
            res.sendStatus(403);
        else{
            let from_port =  req.body.from_port;
            let to_port = req.body.to_port;
            // FCL, LCL, BULK ~~~ already given fcl in api call
            let freight_mode = 'FCL';
            // 20ST, 40ST, 40HQ, 20REF, 40REF
            let shpmt_type = req.body.shpmt_type;

            getDistanceBetweenPorts(from_port, to_port, (distance_data) => {
                if(distance_data.status == 404){
                    //console.log("Error");
                    res.send({status: 404});
                } else {
                    allQuotesFCL(distance_data, shpmt_type, (sendQuotes) => {
                        res.send(sendQuotes);
                    });
                }
            });

        }
    });
});




app.post('/api/quotes/lcl', verifyToken, (req, res) => {
    authenticationCheck(req.token, (statusCode) => {
        if( (statusCode == 403) || (!req.body.from_port) || (!req.body.to_port) || (!req.body.shpmt_type))
            res.sendStatus(403);
        else{
            let from_port =  req.body.from_port;
            let to_port = req.body.to_port;
            // FCL, LCL, BULK ~~~ already given fcl in api call
            let freight_mode = 'LCL';
            // 20ST, 40ST, 40HQ, 20REF, 40REF, 5", 7", ALL BLK
            let shpmt_type = req.body.shpmt_type;

            getDistanceBetweenPorts(from_port, to_port, (distance_data) => {
                if(distance_data.status == 404){
                    //console.log("Error");
                    res.send({status: 404});
                } else {
                    allQuotesLCL(distance_data, shpmt_type, (sendQuotes) => {
                        res.send(sendQuotes);
                    });
                }
            });

        }
    });
});




app.post('/api/quotes/bulk', verifyToken, (req, res) => {
    authenticationCheck(req.token, (statusCode) => {
        if( (statusCode == 403) || (!req.body.from_port) || (!req.body.to_port) || (!req.body.shpmt_type) || (!req.body.gross_wt))
            res.sendStatus(403);
        else{
            let from_port =  req.body.from_port;
            let to_port = req.body.to_port;
            // FCL, LCL, BULK ~~~ already given fcl in api call
            let freight_mode = 'BULK';
            // 20ST, 40ST, 40HQ, 20REF, 40REF, 5", 7", ALL BLK
            let shpmt_type = req.body.shpmt_type;
            let gross_weight = req.body.gross_wt;

            getDistanceBetweenPorts(from_port, to_port, (distance_data) => {
                if(distance_data.status == 404){
                    //console.log("Error");
                    res.send({status: 404});
                } else {
                    allQuotesBulk(distance_data, shpmt_type, gross_weight, (sendQuotes) => {
                        res.send(sendQuotes);
                    });
                }
            });

        }
    });
});




app.post('/api/bookings/temp', verifyToken, (req, res) => {
    authenticationCheck(req.token, (statusCode) => {
        if( statusCode == 403){
            res.sendStatus(403);
        }
        
        else{
            let bkng_id = booking_uuidv4();
            let bkngIdHash = hashPost(bkng_id);
            let serviceId = hashPost(req.token);
            let booking_temp = {
                booking_id: bkng_id,
                service_id: serviceId,
                from_port: req.body.from_p,
                from_port_name: req.body.from_p_name,
                to_port: req.body.to_p,
                to_port_name: req.body.to_p_name,
                quote_price: req.body.freight_price,
                date: req.body.shipmentDate,
                quantity: req.body.quantity,
                freight_mode: req.body.freight_mode,
                shpmt_type: req.body.type,
                shpmt_name: req.body.shpmt_name,
                freight_services_id: req.body.freight_services_id,
                freight_services_name: req.body.freight_services_name,
                cont_id: req.body.cont_id,
                cont_image: req.body.cont_image
            }

            // console.log(booking_temp);

            jwt.sign({booking_temp}, JWT_SECRET_BOOKING, {expiresIn: '2h'}, (err, token) => {
                if(err)
                    console.log('Error occured: --------> '+err);
                else{
                    let bkng_token = {
                        booking_id: bkngIdHash,
                        booking_session: token,
                        status: 200
                    }
                    res.json(bkng_token);
                }
            });
        }
    });
});


app.post('/api/bookings/temp/verify', verifyToken, (req, res) => {
    authenticationCheck(req.token, (statusCode) => {
        if( statusCode == 403){
            res.sendStatus(403);
        }
        
        else{
            let bookingToken = req.body._bt;
        
            jwt.verify(bookingToken, JWT_SECRET_BOOKING, (err, bookingData) => {
                if(err){
                    console.log('Error occured: --------> '+err);
                    res.sendStatus(403);
                } else {
                    let booking_temp = {
                        booking_id: bookingData.booking_temp.booking_id,
                        service_id: bookingData.booking_temp.service_id,
                        from_port: bookingData.booking_temp.from_port,
                        from_port_name: bookingData.booking_temp.from_port_name,
                        to_port: bookingData.booking_temp.to_port,
                        to_port_name: bookingData.booking_temp.to_port_name,
                        quote_price: bookingData.booking_temp.quote_price,
                        date: bookingData.booking_temp.date,
                        quantity: bookingData.booking_temp.quantity,
                        freight_mode: bookingData.booking_temp.freight_mode,
                        shpmt_type: bookingData.booking_temp.shpmt_type,
                        shpmt_name: bookingData.booking_temp.shpmt_name,
                        freight_services_id: bookingData.booking_temp.freight_services_id,
                        freight_services_name: bookingData.booking_temp.freight_services_name,
                        cont_id: bookingData.booking_temp.cont_id,
                        cont_image: bookingData.booking_temp.cont_image,
                        status: 200
                    }
                    res.json(booking_temp);  
                }
            });
        }
    });
});


app.post('/api/create/newShipment', verifyToken, (req, res) => {
    authenticationCheck(req.token, (statusCode) => {
        if( statusCode == 403){
            res.sendStatus(403);
        }
        
        else{
            let booking_data = req.body._booking;

            let shipment = {
                booking_id: booking_data.booking_id ,
                service_id: booking_data.service_id ,
                awb: booking_data.awb ,
                from_p: booking_data.from_p ,
                to_p: booking_data.to_p ,
                from_p_name: booking_data.from_p_name ,
                to_p_name: booking_data.to_p_name ,
                freight_services_name: booking_data.freight_services_name ,
                freight_mode: booking_data.freight_mode ,
                freight_services_id: booking_data.freight_services_id ,
                shipment_type: booking_data.shipment_type ,
                shpmt_name: booking_data.shpmt_name ,
                cont_id: booking_data.cont_id ,
                shipmentDate: booking_data.shipmentDate ,
                quantity: booking_data.quantity ,
                quote_price: Math.round(booking_data.quote_price) ,
                first_name: booking_data.first_name ,
                last_name: booking_data.last_name ,
                telephone: booking_data.telephone ,
                email: booking_data.email ,
                address: booking_data.address ,
                client_payment_address: booking_data.client_payment_address,
                booking_ts: Date.now(),
                isSuccess: 0,
                isVerified: 0,
                isCancled: 0
            };
            ShipmentData.newShipment(shipment);
            // console.log("New Shipment Api Called.")

            let tok = {
                awb: booking_data.awb,
                quote_price: Math.round(booking_data.quote_price),
                email: booking_data.email
            };

            jwt.sign({tok}, JWT_SECRET_TOKEN, {expiresIn: '1m'}, (err, token) => {
                if(err)
                    console.log('Error occured: --------> '+err);
                else{
                    let resp = {
                        xprs_tk: token,
                        status: 200
                    }
                    res.json(resp);
                }
            });
        }
    });
});


app.post('/confirmTransaction/', (req, res) => {
    const tk = req.body.token;
    const txh = req.body.txhash;
    const custAddr = req.body.custAddr;
  
    // verify token
    // check status
    jwt.verify(tk, JWT_SECRET_PAYMENT, (err, authData) => {
      if (err) {
        console.log(err);
        res.sendStatus(403);
      } else {
        // console.log(authData);
        // update token
        let awb = authData.awb;
        if(txh != "0"){
            ShipmentData.updatePayment(awb, custAddr, txh, Date.now(), 1, (err, updateData) => {
                if(err){
                    res.sendStatus(403);
                } else{
                    res.sendStatus(200);
                }
            });
        } else{
            ShipmentData.updatePayment(awb, custAddr, "NA", Date.now(), 0, (err, updateData) => {
                if(err){
                    res.sendStatus(403);
                } else{
                    res.sendStatus(200);
                }
            });
        }
      }
    });
  })



// login api
app.post('/api/login', verifyToken, (req, res) => {
    authenticationCheck(req.token, (statusCode) => {
        if( statusCode == 403){
            res.sendStatus(403);
        }
        
        else{
            let email = req.body.email;
            let password = req.body.eqpt;

            Users.login(email, (err, user_data) =>{
                if(err){
                    console.log('Error occured: --------> '+err);
                } else {
                    let hash_pass = hashPost(user_data.password);
                    let lastUpdate = Math.floor(new Date() / 1000);
                    if(hash_pass === password){
                        // console.log(hash_pass);
                        // console.log(lastUpdate);
                        Users.loginVerified(email, lastUpdate, (err, res1) => {
                            if(err){
                                console.log('Error occured: --------> '+err);
                            } else {
                                res.send(user_data);
                            }
                        })
                    }   
                    else
                        res.sendStatus(404);
                }
            });

        }
    });
});



// all transaction api
app.post('/api/transaction', verifyToken, (req, res) => {
    authenticationCheck(req.token, (statusCode) => {
        if( statusCode == 403){
            res.sendStatus(403);
        }
        
        else{
            let email = req.body._euid;

            // implement the logic for verification email 
            if(email == "abhishek@bittracker.com"){
                ShipmentData.allBookedShipmentsByAdmin((err, txData) => {
                    if(err){
                        res.json({status: 403});
                    } else {
                        const txn = {
                            allTx: txData,
                            status: 200
                        };
                        res.send(txn);
                    }
                });
            } else {
                ShipmentData.allBookedShipmentsByEmail(email, (err, txData) => {
                    if(err){
                        res.json({status: 403});
                    } else {
                        const txn = {
                            allTx: txData,
                            status: 200
                        };
                        res.send(txn);
                    }
                });
            }  
        }
    });
});


// generate Invoice
app.get('/api/transaction/invoice/:auth/:token', verifyURLToken, (req, res) => {
    console.log("Requsted Print Invoice.")
    authenticationCheck(req.params.auth, (statusCode) => {
        if( statusCode == 403){
            res.send(invoice_template.errorInvoice());
        }
        else{
            let awb = req.params.token;
            // console.log(awb);
            ShipmentData.shipmentByAwb(awb, (err, txData) => {
                if(err){
                    res.send(invoice_template.errorInvoice());
                } else {
                    if(txData.isCancled == 0 || txData.isCancled == 1){
                        res.send(invoice_template.errorInvoice());
                    } else {
                        res.send(invoice_template.generateInvoice(txData));
                    } 
                }
            });
        }
    });
});


app.get('/getAllTxNs', (req, res) => {
    ShipmentData.shipmentByisVerified((err, data) => {
        if(err){
            res.send({status: 404});
        } else {
            res.send({
                data: data,
                status: 200
            });
        }
    });
});


app.get('/updatePaymentStatus/:awb/:status', (req, res) => {
    console.log('Update transaction process initiated: ' + req.params.awb + '  -> status: ' + req.params.status);
    
    let awb = req.params.awb;
    let status = req.params.status;


    if(status == 1){
        // transaction is canceled
        ShipmentData.updatePaymentVerified(awb, "NA", Date.now(), 1, 1, (err, data) => {
            if(err){
                res.send({status: 404});
            } else {
                res.send({
                    status: 200
                });
            }
        });

    } else {
        // transaction is approved
        ShipmentData.updatePaymentVerified(awb, booking_uuidv4(), Date.now(), 1, 2, (err, data) => {
            if(err){
                res.send({status: 404});
            } else {
                res.send({
                    status: 200
                });
            }
        });
    }   
});









// ******** METHODS FOR DIFFERENT TASKS ******** //
// FORMAT OF TOKEN
// Authorization: <access_token>

// Verify Token
function verifyToken(req, res, next) {
    // Get auth header value
    const reqHeader = req.headers['authorization'];
    // Check if reqHeader is undefined
    if(typeof reqHeader !== 'undefined') {
      // Get token from reqHeader
      req.token = reqHeader;
      // Next middleware
      next();
    } else {
      // Forbidden
      res.sendStatus(403);
    }  
}
  

function verifyURLToken(req, res, next) {
    // Get auth header value
    const reqHeader = req.params.auth;
    // Check if reqHeader is undefined
    if(typeof reqHeader !== 'undefined') {
      // Get token from reqHeader
      req.token = reqHeader;
      // Next middleware
      next();
    } else {
      // Forbidden
      res.sendStatus(403);
    }  
}
  


// GUID FOR SESSION  
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}



// Booking Ids
function booking_uuidv4() {
    return 'xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function hashPost(value){

    // md5 hash library function
    var MD5 = function(d){
        result = M(V(Y(X(d),8*d.length)));
        return result.toLowerCase()
    };
    function M(d){
        for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)
            _=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);
            return f
        }
    function X(d){
        for(var _=Array(d.length>>2),m=0;m<_.length;m++)
            _[m]=0;
        for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;
        
        return _
    }
    function V(d){
        for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);
        return _
    }
    function Y(d,_){
        d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;
        for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){
            var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}
            return Array(m,f,r,i)
        }
    function md5_cmn(d,_,m,f,r,i){
        return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)
    }
    function md5_ff(d,_,m,f,r,i,n){
        return md5_cmn(_&m|~_&f,d,_,r,i,n)
    }
    function md5_gg(d,_,m,f,r,i,n){
        return md5_cmn(_&f|m&~f,d,_,r,i,n)
    }
    function md5_hh(d,_,m,f,r,i,n){
        return md5_cmn(_^m^f,d,_,r,i,n)
    }
    function md5_ii(d,_,m,f,r,i,n){
        return md5_cmn(m^(_|~f),d,_,r,i,n)
    }
    function safe_add(d,_){
        var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m
    }
    function bit_rol(d,_){
        return d<<_|d>>>32-_
    };
    // md5 function end here


    // Getting the hash value
    //console.log(value);
    return MD5(value);
}
  


// Authentication
function authenticationCheck(sessId, sessionsR){
    jwt.verify(sessId, JWT_SECRET_SESSION, (err, authData) => {
        if(err){
            sessionsR(403);
        } else {
            Pric.VerifyBusinessApi(authData.sess_id.bid, (err, auth) => {
                if(err){
                    console.log('Error occured: --------> '+err);
                    sessionsR(403);
                } else {
                    if(auth === null)
                        sessionsR(403);
                    else{    
                        sessionsR(200);
                    }
                }
            });
              
        }
    });
}



// Getting Distance between ports
function getDistanceBetweenPorts(from_port, to_port, distance){
    PortDistance.portToPortDistance(from_port, to_port, function(err, port_){
        if((err) || (port_.length == 0)){
            console.log('Error occured: --------> '+err);
            distance({status: 404});
        } else {
            let fromPortName;
            let toPortName;

            if( from_port == port_[0].from){
                fromPortName = port_[0].from_name;
                toPortName = port_[0].to_name;
            } else {
                fromPortName = port_[0].to_name;
                toPortName = port_[0].from_name;
            }

            let data = {
                from_portId: from_port,
                from_name: fromPortName,
                to_portId: to_port,
                to_name: toPortName,
                distance: port_[0].distance,
                status: 200
            }
            distance(data);
        }
    });
}





// Getting shipment type alternator ~~~ FCL
function allQuotesFCL(distance_data, cont_type, allQuotes){
    if(cont_type === '20ST'){
        quotesFCL(distance_data, "ST20", (quote) => {
            allQuotes(quote);
        });
    }
    else if(cont_type === '40ST'){
        quotesFCL(distance_data, "ST40", (quote) => {
            allQuotes(quote);
        });
    }
    else if(cont_type === '40HQ'){
        quotesFCL(distance_data, "HQ40", (quote) => {
            allQuotes(quote);
        });
    }
    else if(cont_type === '20REF'){
        quotesFCL(distance_data, "REF20", (quote) => {
            allQuotes(quote);
        });
    }
    else if(cont_type === '40REF'){
        quotesFCL(distance_data, "REF40", (quote) => {
            allQuotes(quote);
        });  
    }
    else{
        allQuotes({status: 404});
    }
}



// Getting shipment type calculator -- FCL
function quotesFCL(distance_data, cont_type, fullquotes){
    if(cont_type === 'ST20'){
        ShipRates.fclAllQuotes20ST((err, quotes) => {
            if(err)
                console.log('Error occured: --------> '+err);
            else{
                fullQuoteDetails(distance_data, cont_type, quotes, quotes[0].ST20, (allQ_) => {
                    fullquotes(allQ_)
                });
            }
        });
    }
    
    else if(cont_type === 'ST40'){
        ShipRates.fclAllQuotes40ST((err, quotes) => {
            if(err)
                console.log('Error occured: --------> '+err);
            else{
                fullQuoteDetails(distance_data, cont_type, quotes, quotes[0].ST40, (allQ_) => {
                    fullquotes(allQ_)
                });
            }
        });
    }
    
    else if(cont_type === 'HQ40'){
        ShipRates.fclAllQuotes40HQ((err, quotes) => {
            if(err)
                console.log('Error occured: --------> '+err);
            else{
                fullQuoteDetails(distance_data, cont_type, quotes, quotes[0].HQ40, (allQ_) => {
                    fullquotes(allQ_)
                });
            }
        });
    }
    else if(cont_type === 'REF20'){
        ShipRates.fclAllQuotes20REF((err, quotes) => {
            if(err)
                console.log('Error occured: --------> '+err);
            else{
                fullQuoteDetails(distance_data, cont_type, quotes, quotes[0].REF20, (allQ_) => {
                    fullquotes(allQ_)
                });
            }
        });
    }
    else if(cont_type === 'REF40'){
        ShipRates.fclAllQuotes40REF((err, quotes) => {
            if(err)
                console.log('Error occured: --------> '+err);
            else{
                fullQuoteDetails(distance_data, cont_type, quotes, quotes[0].REF40, (allQ_) => {
                    fullquotes(allQ_)
                });
            }
        });
    }
    else{
        fullquotes({status: 404});
    }
}


// Getting shipment type full name
function shipmentTypeClassifier(shpmt_type){
    if(shpmt_type === 'ST20'){
        return "20ft Standard";
    }
    else if(shpmt_type === 'ST40'){
        return "40ft Standard";
    }
    else if(shpmt_type === 'HQ40'){
        return "40ft High Cube";
    }
    else if(shpmt_type === 'REF20'){
        return "20ft Reefer";
    }
    else{
        if(shpmt_type === 'REF40')
            return "40ft Reefer";
    }
}


// Getting full quote / shipment_type
function fullQuoteDetails(distance_data, cont_type, quotes, rate, allQuotes){
    
    let distance_ptp = distance_data.distance;
    let containerQuotes = [];

    quotes.forEach(cont => {
        let ophc = Math.round(((cont.ADE * rate) + (cont.ERIE * rate) + (cont.FFCO * rate) + (cont.HDL * rate) + 
                                (cont.IHWE * rate) + (cont.ODF * rate) + (cont.PAE * rate) + (cont.ULE * rate) + 
                                (cont.OTHC * rate))*100)/100;
        let oc = Math.round((((cont.OER + 0.07) * rate * distance_ptp))*100)/100;
        let dphc = Math.round(((cont.ADI * rate) + (cont.ERII * rate) + (cont.IHWI * rate) + (cont.IMP * rate) + (cont.PAI * rate) + 
                                (cont.ULI * rate) + (cont.DTHC * rate))*100)/100;

        let  total_quote =  Math.round(((cont.ADE * rate) + (cont.ERIE * rate) + (cont.FFCO * rate) + (cont.HDL * rate) + 
                            (cont.IHWE * rate) + (cont.ODF * rate) + (cont.PAE * rate) + (cont.ULE * rate) + 
                            (cont.OTHC * rate) + ((cont.OER + 0.07) * rate * distance_ptp) + (cont.ADI * rate) + 
                            (cont.ERII * rate) + (cont.IHWI * rate) + (cont.IMP * rate) + (cont.PAI * rate) + 
                            (cont.ULI * rate) + (cont.DTHC * rate))*100)/100;

        let carrier = {
            liner_name: cont.NAME,
            liner_id: cont.CARRIER_ID,
            liner_image: cont.SIGN + ".gif",
            liner_image_id: cont.SIGN + ".png",
            liner_terms: "FIFO",
            total_quote_price: total_quote,
            currency: "USD",

            origin_chrgs: ophc,
            origin_port_handling_charges:[
                {
                   type:"Agency Documentation Fee Exports",
                   charges: Math.round((cont.ADE * rate)* 100)/100
                },
                {
                   type:"Ecological and Radiological Service(Export)",
                   charges: Math.round((cont.ERIE * rate)* 100)/100
                },
                {
                   type:"Forwarder Commission - Origin",
                   charges: Math.round((cont.FFCO * rate)* 100)/100
                },
                {
                   type:"Lift On Lift Off Service",
                   charges: Math.round((cont.HDL * rate)* 100)/100
                },
                {
                   type:"Inland Haulage Container Weighing(Export)",
                   charges: Math.round((cont.IHWE * rate)* 100)/100
                },
                {
                   type:"Documentation Fee - Origin",
                   charges: Math.round((cont.ODF * rate)* 100)/100
                },
                {
                   type:"Port Additionals or Port Dues - Export",
                   charges: Math.round((cont.PAE * rate)* 100)/100
                },
                {
                   type:"Agency Logistics fee export",
                   charges: Math.round((cont.ULE * rate)* 100)/100
                },
                {
                   type:"Original Terminal Handling Charge",
                   charges: Math.round((cont.OTHC * rate)* 100)/100
                }
            ],
            ocean_chrgs: oc,
            ocean_charges:[
                {
                   type:"Ocean Freight",
                   charges: Math.round(((cont.OER + 0.07) * rate * distance_ptp)* 100) /100
                }
            ],
            delivery_chrgs: dphc,
            delivery_port_charges:[
                {
                   type:"Agency Documentation Fee imports",
                   charges: Math.round((cont.ADI * rate)*100)/100
                },
                {
                   type:"Ecological and Radiological Service(Import)",
                   charges: Math.round((cont.ERII * rate)*100)/100
                },
                {
                   type:"Inland Haulage Container Weighing(Export)",
                   charges: Math.round((cont.IHWI * rate)*100)/100
                },
                {
                   type:"Import Service",
                   charges: Math.round((cont.IMP * rate)*100)/100
                },
                {
                   type:"Port Additionals or Port Dues - Import",
                   charges: Math.round((cont.PAI * rate)*100)/100
                },
                {
                   type:"Agency Logistic Fee Import",
                   charges: Math.round((cont.ULI * rate)*100)/100
                },
                {
                   type:"Destination Terminal Handling Charge",
                   charges: Math.round((cont.DTHC * rate)*100)/100
                }
            ]
        }
        containerQuotes.push(carrier);
    });

    let days_ = Math.floor(distance_ptp/(10*24));
    let hours = Math.floor(((distance_ptp/(10*24)) - days_)*24);

    let container_type = shipmentTypeClassifier(cont_type);

    const quotes_r = {
        from_port: distance_data.from_name,
        from_port_id: distance_data.from_portId,
        to_port: distance_data.to_name,
        to_port_id: distance_data.to_portId,
        distance: distance_ptp,
        time: days_ + " Day(s) " + hours + " hour(s)",
        container_type: container_type,
        quotes: containerQuotes,
        status: 200
    }
    allQuotes(quotes_r);
}



// Getting shipment type alternator ~~~ BULK
function allQuotesBulk(distance_data, cont_type, gross_weight, allQuotes){
    if((cont_type === 'HNDSZ') && ((gross_weight >= 3000) && (gross_weight <= 20000))){
        quotesBulk(distance_data, "HNDSZ", gross_weight, (quote) => {
            allQuotes(quote);
        });
    }
    else if((cont_type === 'HNDMX') && ((gross_weight >= 20000) && (gross_weight <= 40000))){
        quotesBulk(distance_data, "HNDMX", gross_weight, (quote) => {
            allQuotes(quote);
        });
    }
    else if((cont_type === 'SUPRMX') && ((gross_weight >= 40000) && (gross_weight <= 50000))){
        quotesBulk(distance_data, "SUPRMX", gross_weight, (quote) => {
            allQuotes(quote);
        });
    }
    else if((cont_type === 'ULTRMX') && ((gross_weight >= 50000) && (gross_weight <= 70000))){
        quotesBulk(distance_data, "ULTRMX", gross_weight, (quote) => {
            allQuotes(quote);
        });
    }
    else if((cont_type === 'PNMX') && ((gross_weight >= 70000) && (gross_weight <= 90000))){
        quotesBulk(distance_data, "PNMX", gross_weight, (quote) => {
            allQuotes(quote);
        });  
    }
    else if((cont_type === 'CPSZ') && ((gross_weight >= 90000) && (gross_weight <= 100000))){
        quotesBulk(distance_data, "CPSZ", gross_weight, (quote) => {
            allQuotes(quote);
        });  
    }
    else{
        allQuotes({status: 404});
    }
}




// Getting shipment type calculator -- BULK
function quotesBulk(distance_data, cont_type, gross_weight, fullquotes){
    if(cont_type === 'HNDSZ'){
        ShipRates.bulkAllQuotesHNDSZ((err, quotes) => {
            if(err)
                console.log('Error occured: --------> '+err);
            else{
                fullQuoteDetailsBLK(distance_data, cont_type, gross_weight, quotes, quotes[0].HNDSZ, (allQ_) => {
                    fullquotes(allQ_)
                });
            }
        });
    }
    
    else if(cont_type === 'HNDMX'){
        ShipRates.bulkAllQuotesHNDMX((err, quotes) => {
            if(err)
                console.log('Error occured: --------> '+err);
            else{
                fullQuoteDetailsBLK(distance_data, cont_type, gross_weight, quotes, quotes[0].HNDMX, (allQ_) => {
                    fullquotes(allQ_)
                });
            }
        });
    }
    
    else if(cont_type === 'SUPRMX'){
        ShipRates.bulkAllQuotesSUPRMX((err, quotes) => {
            if(err)
                console.log('Error occured: --------> '+err);
            else{
                fullQuoteDetailsBLK(distance_data, cont_type, gross_weight, quotes, quotes[0].SUPRMX, (allQ_) => {
                    fullquotes(allQ_)
                });
            }
        });
    }

    else if(cont_type === 'ULTRMX'){
        ShipRates.bulkAllQuotesULTRMX((err, quotes) => {
            if(err)
                console.log('Error occured: --------> '+err);
            else{
                fullQuoteDetailsBLK(distance_data, cont_type, gross_weight, quotes, quotes[0].ULTRMX, (allQ_) => {
                    fullquotes(allQ_)
                });
            }
        });
    }
    
    else if(cont_type === 'PNMX'){
        ShipRates.bulkAllQuotesPNMX((err, quotes) => {
            if(err)
                console.log('Error occured: --------> '+err);
            else{
                fullQuoteDetailsBLK(distance_data, cont_type, gross_weight, quotes, quotes[0].PNMX, (allQ_) => {
                    fullquotes(allQ_)
                });
            }
        });
    }
    else if(cont_type === 'CPSZ'){
        ShipRates.bulkAllQuotesCPSZ((err, quotes) => {
            if(err)
                console.log('Error occured: --------> '+err);
            else{
                fullQuoteDetailsBLK(distance_data, cont_type, gross_weight, quotes, quotes[0].CPSZ, (allQ_) => {
                    fullquotes(allQ_)
                });
            }
        });
    }
    else{
        fullquotes({status: 404});
    }
}



// Getting shipment type full name
function bulkTypeClassifier(cont_type){
    if(cont_type === 'HNDSZ'){
        return "Handysize Bulk Carrier";
    }
    else if(cont_type === 'HNDMX'){
        return "Handymax Bulk Carrier";
    }
    else if(cont_type === 'SUPRMX'){
        return "Supramax Bulk Carrier";
    }
    else if(cont_type === 'ULTRMX'){
        return "Ultramax Bulk Carrier";
    }
    else if(cont_type === 'PNMX'){
        return "Panamax Bulk Carrier";
    }
    else{
        if(cont_type === 'CPSZ')
            return "Capsize Bulk Carrier";
    } 
}


// Getting BULK full quote / shipment_type
function fullQuoteDetailsBLK(distance_data, cont_type, gross_weight, quotes, rate, allQuotes){
    let distance_ptp = distance_data.distance;
    let containerQuotes = [];

    quotes.forEach(cont => {

        let charges_oc = Math.round(((rate * gross_weight * distance_ptp))* 100) /100;

        let ophc = Math.round(((cont.HDL))*100)/100;
        let oc = charges_oc + Math.round((cont.HZDC * charges_oc)*100)/100 + Math.round((cont.DNGR * charges_oc)*100)/100;
        let dphc = Math.round(((cont.IMP))*100)/100;

        let  total_quote =  Math.round(((cont.HDL) + charges_oc + (cont.IMP))*100)/100 + Math.round((cont.HZDC * charges_oc)*100)/100
                            + Math.round((cont.DNGR * charges_oc)*100)/100;

        let carrier = {
            liner_name: cont.NAME,
            liner_id: cont.CARRIER_ID,
            liner_image: cont.SIGN + ".gif",
            liner_image_id: cont_type + ".png",
            liner_terms: "FIFO",
            total_quote_price: total_quote,
            currency: "USD",

            origin_chrgs: ophc,
            origin_port_handling_charges:[
                {
                   type:"Lift On Lift Off Service",
                   charges: Math.round((cont.HDL)* 100)/100
                }
            ],

            ocean_chrgs: oc,
            ocean_charges:[
                {
                   type:"Ocean Freight",
                   charges: charges_oc
                },
                {
                    type:"Hazardious Cargo Charges",
                    charges: Math.round((cont.HZDC * charges_oc)*100)/100
                },
                {
                    type:"Demurrage Charges",
                    charges: Math.round((cont.DNGR * charges_oc)*100)/100
                 }
            ],

            delivery_chrgs: dphc,
            delivery_port_charges:[
                {
                   type:"Import Service",
                   charges: Math.round((cont.IMP)*100)/100
                }
            ]
        }
        containerQuotes.push(carrier);
    });

    let days_ = Math.floor(distance_ptp/(10*24));
    let hours = Math.floor(((distance_ptp/(10*24)) - days_)*24);

    let container_type = bulkTypeClassifier(cont_type);

    const quotes_r = {
        from_port: distance_data.from_name,
        from_port_id: distance_data.from_portId,
        to_port: distance_data.to_name,
        to_port_id: distance_data.to_portId,
        distance: distance_ptp,
        time: days_ + " Day(s) " + hours + " hour(s)",
        container_type: container_type,
        gross_wt: gross_weight,
        quotes: containerQuotes,
        status: 200
    }
    allQuotes(quotes_r);
}




// Getting shipment type alternator ~~~ BOX
function allQuotesLCL(distance_data, cont_type, allQuotes){
    if(cont_type === 'IBOX5'){
        quotesLcl(distance_data, "IBOX5", (quote) => {
            allQuotes(quote);
        });
    }
    else if(cont_type === 'IBOX7'){
        quotesLcl(distance_data, "IBOX7", (quote) => {
            allQuotes(quote);
        });  
    }
    else{
        allQuotes({status: 404});
    }
}



// Getting shipment type calculator -- BOX
function quotesLcl(distance_data, cont_type, fullquotes){
    if(cont_type === 'IBOX5'){
        ShipRates.lclAllQuotesIBOX5((err, quotes) => {
            if(err)
                console.log('Error occured: --------> '+err);
            else{
                fullQuoteDetailsBOX(distance_data, cont_type, quotes, quotes[0].IBOX5, (allQ_) => {
                    fullquotes(allQ_)
                });
            }
        });
    }
    
    else if(cont_type === 'IBOX7'){
        ShipRates.lclAllQuotesIBOX7((err, quotes) => {
            if(err)
                console.log('Error occured: --------> '+err);
            else{
                fullQuoteDetailsBOX(distance_data, cont_type, quotes, quotes[0].IBOX7, (allQ_) => {
                    fullquotes(allQ_)
                });
            }
        });
    }

    else{
        fullquotes({status: 404});
    }
}



// Getting shipment type full name
function shipmentTypeClassifierLCL(cont_type){
    if(cont_type === 'IBOX5'){
        return 'Box - 5000 Kg Pellet';
    }
    else{
        if(cont_type === 'IBOX7')
            return 'Box - 7000 Kg Pellet';
    } 
}


// Getting BOX full quote / shipment_type
function fullQuoteDetailsBOX(distance_data, cont_type, quotes, rate, allQuotes){
    let distance_ptp = distance_data.distance;
    let containerQuotes = [];

    quotes.forEach(cont => {
        let ophc = Math.round(((cont.ADE * rate) + (cont.ERIE * rate) + (cont.FFCO * rate) + (cont.HDL * rate) + 
                                (cont.IHWE * rate) + (cont.ODF * rate) + (cont.PAE * rate) + (cont.ULE * rate) + 
                                (cont.OTHC * rate))*100)/100;

        let oc = Math.round(((cont.OER + 0.035) * rate * distance_ptp)* 100) /100
        
        let dphc = Math.round(((cont.ADI * rate) + (cont.ERII * rate) + (cont.IHWI * rate) + (cont.IMP * rate) + (cont.PAI * rate) + 
                                (cont.ULI * rate) + (cont.DTHC * rate))*100)/100;


        let  total_quote =  Math.round(((cont.ADE * rate) + (cont.ERIE * rate) + (cont.FFCO * rate) + (cont.HDL * rate) + 
                            (cont.IHWE * rate) + (cont.ODF * rate) + (cont.PAE * rate) + (cont.ULE * rate) + 
                            (cont.OTHC * rate) + ((cont.OER + 0.035) * rate * distance_ptp) + (cont.ADI * rate) + 
                            (cont.ERII * rate) + (cont.IHWI * rate) + (cont.IMP * rate) + (cont.PAI * rate) + 
                            (cont.ULI * rate) + (cont.DTHC * rate))*100)/100;

        let carrier = {
            liner_name: cont.NAME,
            liner_id: cont.CARRIER_ID,
            liner_image: cont.SIGN + ".gif",
            liner_image_id: "lcl.png",
            liner_terms: "FIFO",
            total_quote_price: total_quote,
            currency: "USD",

            origin_chrgs: ophc,
            origin_port_handling_charges:[
                {
                   type:"Agency Documentation Fee Exports",
                   charges: Math.round((cont.ADE * rate)* 100)/100
                },
                {
                   type:"Ecological and Radiological Service(Export)",
                   charges: Math.round((cont.ERIE * rate)* 100)/100
                },
                {
                   type:"Forwarder Commission - Origin",
                   charges: Math.round((cont.FFCO * rate)* 100)/100
                },
                {
                   type:"Lift On Lift Off Service",
                   charges: Math.round((cont.HDL * rate)* 100)/100
                },
                {
                   type:"Inland Haulage Container Weighing(Export)",
                   charges: Math.round((cont.IHWE * rate)* 100)/100
                },
                {
                   type:"Documentation Fee - Origin",
                   charges: Math.round((cont.ODF * rate)* 100)/100
                },
                {
                   type:"Port Additionals or Port Dues - Export",
                   charges: Math.round((cont.PAE * rate)* 100)/100
                },
                {
                   type:"Agency Logistics fee export",
                   charges: Math.round((cont.ULE * rate)* 100)/100
                },
                {
                   type:"Original Terminal Handling Charge",
                   charges: Math.round((cont.OTHC * rate)* 100)/100
                }
            ],
            ocean_chrgs: oc,
            ocean_charges:[
                {
                   type:"Ocean Freight",
                   charges: Math.round(((cont.OER + 0.035) * rate * distance_ptp)* 100) /100
                }
            ],
            delivery_chrgs: dphc,
            delivery_port_charges:[
                {
                   type:"Agency Documentation Fee imports",
                   charges: Math.round((cont.ADI * rate)*100)/100
                },
                {
                   type:"Ecological and Radiological Service(Import)",
                   charges: Math.round((cont.ERII * rate)*100)/100
                },
                {
                   type:"Inland Haulage Container Weighing(Export)",
                   charges: Math.round((cont.IHWI * rate)*100)/100
                },
                {
                   type:"Import Service",
                   charges: Math.round((cont.IMP * rate)*100)/100
                },
                {
                   type:"Port Additionals or Port Dues - Import",
                   charges: Math.round((cont.PAI * rate)*100)/100
                },
                {
                   type:"Agency Logistic Fee Import",
                   charges: Math.round((cont.ULI * rate)*100)/100
                },
                {
                   type:"Destination Terminal Handling Charge",
                   charges: Math.round((cont.DTHC * rate)*100)/100
                }
            ]
        }
        containerQuotes.push(carrier);
    });

    let days_ = Math.floor(distance_ptp/(10*24));
    let hours = Math.floor(((distance_ptp/(10*24)) - days_)*24);

    let container_type = shipmentTypeClassifierLCL(cont_type);

    const quotes_r = {
        from_port: distance_data.from_name,
        from_port_id: distance_data.from_portId,
        to_port: distance_data.to_name,
        to_port_id: distance_data.to_portId,
        distance: distance_ptp,
        time: days_ + " Day(s) " + hours + " hour(s)",
        container_type: container_type,
        quotes: containerQuotes,
        status: 200
    }
    allQuotes(quotes_r);
}




// ****** APP SERVER RUNNING LOG ****** //
app.listen(3000, () => console.log('Server Running on port 3000.', 'Main Server ----> UP'))
