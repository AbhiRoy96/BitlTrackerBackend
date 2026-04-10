require('dotenv').config();
const express = require('express')
const api_helper = require('./ApiCaller-schema')
let mongoose = require('mongoose');

const app = express()
const port = 3004

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/sdBT';

// Database connections
mongoose.connect(MONGODB_URI, { useNewUrlParser: true }).then(
        () => {console.log("DB connected.")},
        err => {console.log(err)}
    );
    let db = mongoose.connection;

// loading schema
let TransCloud = require('./trans-cloud-schema');



// main time setter function.
function update_auto(){
    setTimeout(() => {
        // initial call after 10 sec.
        updater();
      }, 10000);
    // updation of transaction every 120 sec cycle.
    setInterval(() => {
        updater();
    }, 120000);
}


// updater function which initiates the transaction.
function updater() {
    let ttym = new Date();
    console.log("Checking Latest Logs - " + ttym.toGMTString());
    api_helper.make_API_call('http://localhost:3000/getAllTxNs')
    .then(response => {
        if(response.status == 200){
            console.log('Fetched all recent transactions ...')
            response.data.forEach(pendingTx => {
                if(pendingTx.awb != null && pendingTx.client_payment_address != null && pendingTx.transactionHash != null && pendingTx.quote_price  != null){
                    updatetransAction(pendingTx.awb, pendingTx.client_payment_address, pendingTx.transactionHash, pendingTx.quote_price);
                } else {
                    if(pendingTx.isSuccess == 0 && ((Date.now() - new Date(pendingTx.booking_ts)) > 300000)){
                        console.log('Transaction Timed Out ...');
                        updateTx(pendingTx.awb, 1);
                    }

                    // vulnerability ~ xxx
                    
                    
                }
            });
        } else {
            console.log('Error fetching recent transactions ...')
            console.log('error')
        }
    })
    .catch(error => {
        console.log(error)
    })
}



// function Verifies update status
function updatetransAction(awb, clientAdd, txHash, value){
    if(txHash == "NA"){
        // cancel transactions.
        console.log('AWB: '+ awb +' has been Cancled!');
        updateTx(awb, 1);

    } else {
        // if transaction Hash is not NA
        TransCloud.searchTransActions(awb, (err, data) => {
            if(err){
                // cancel transactions.
                console.log('TxHash: '+ txHash +' Has been Cancled');
                updateTx(awb, 1);
                
                
            } else {
                // check status send .
                if(data != null) {
                    if(data.awb == awb && data.trans_from == clientAdd && data.transactionhash == txHash && data.event == "Transfering" && data.trans_value == value){
                        // approve transactions
                        console.log('TxHash: '+ txHash +' Has been Approved');
                        updateTx(awb, 2);
                        
                    } else {
                        // cancel transactions.
                        console.log('TxHash: '+ txHash +' Has been Cancled');
                        updateTx(awb, 1);
    
                    }
                }
            }
        });
    }
}


// cancles tx which have mre than 300 transaction time.
function updatetransActionTimeout(awb){
    updateTx(awb, 1);
}


// update transaction function
function updateTx(awb, status){
    api_helper.make_API_call('http://localhost:3000/updatePaymentStatus/' + awb + '/' + status)
    .then(response => {
        if(response.status == 200){
            console.log('Successfully Updated Booking AWB:' + awb + ' ...');
        } else {
            console.log('Failed Updating Booking AWB:' + awb + ' ...');
        }
    })
    .catch(error => {
        console.log(error)
    })
}



// app starter function.
app.listen(port, () => {
    update_auto();
    console.log(`App listening on port ${port}!`, 'Transaction Verifier Server ----> UP')
});

  
  
