require('dotenv').config();
const express = require('express');
var bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
var path = require('path');
let mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/sdBT';
const JWT_SECRET_TOKEN = process.env.JWT_SECRET_TOKEN || 'YOUR_JWT_SECRET_TOKEN';
const JWT_SECRET_PAYOUT = process.env.JWT_SECRET_PAYOUT || 'YOUR_JWT_SECRET_PAYOUT';
const JWT_SECRET_PAYMENT = process.env.JWT_SECRET_PAYMENT || 'YOUR_JWT_SECRET_PAYMENT';


// Database connections
mongoose.connect(MONGODB_URI, { useNewUrlParser: true }).then(
  () => { console.log("DB connected.") },
  err => { console.log(err) }
);
let db = mongoose.connection;

// loading schema
let TransCloud = require('./trans-cloud-schema');

// SSR Template
let xff_tp = require('./payment-template');

// Constants
const PORT = 3002;


// App
const app = express();
app.use(bodyParser.json({
  extended: true      // to support JSON-encoded bodies
}));

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
  console.log('ip:', req.ip);
  next();
});


app.get('/', (req, res) => {
  res.sendfile(__dirname + "/backtext.html");
  // res.send("M-convba-cv");
});

// Generate Payouts-url
app.post('/generate/payout', (req, res) => {
  console.log('Generating Payout Api');
  
  let xprs_tok = req.body.xprs;

  jwt.verify(xprs_tok, JWT_SECRET_TOKEN, (err, authData) => {
    if (err) {
      // console.log(xprs_tok, err);
      res.sendStatus(403);
    } else {
      // console.log(authData);
      let payment_data = {
        // userid is must
        usid: authData.tok.email,
        awb: authData.tok.awb,
        price: Math.round(authData.tok.quote_price)
      };
      jwt.sign(payment_data, JWT_SECRET_PAYOUT, {expiresIn: '5m'}, (err, token) =>{
        var messagePayload = {
            "payment_url": 'http://localhost:3002/payment/' + token
        };
        res.send(messagePayload);
      });
    }
  });
});


// verify url payload and send data
app.get('/payment/:token', (req, res) => {
  console.log('Payment URL Api');
  payment_validity = req.params.token;
  // verify token
  jwt.verify(payment_validity, JWT_SECRET_PAYOUT, (err, authData) => {
    if (err) {
      res.send(xff_tp.errorPayout());
    } else {
      let payment_data = {
        awb: authData.awb,
        price: Math.round(authData.price)
      };
      // verify status
      jwt.sign(payment_data, JWT_SECRET_PAYMENT, {expiresIn: '5h'}, (err, token) =>{
        // send token used ~ confirmation pending
        res.send(xff_tp.generatePayment(authData.awb, authData.price, token));
      });
    }
  });
});


// app.post('/booking/data', (req, res) => {
//   console.log('Booking Data');
   
// })


app.listen(PORT);
console.log(`Running on http://localhost:${PORT}`, 'Payment Server ----> UP');
