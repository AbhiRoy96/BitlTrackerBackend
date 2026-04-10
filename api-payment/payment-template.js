module.exports.generatePayment = (awb, price, tok) => {
    let xrft_template = `
    <html>
    <head>
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO"
            crossorigin="anonymous">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    
        <title>Payment Gateway for `+ awb +` </title>
    
        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
            crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49"
            crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy"
            crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/gh/ethereum/web3.js@1.0.0-beta.34/dist/web3.min.js"></script>
        <style>
            body{
                font-family: -apple-system, BlinkMacSystemFont,
                "Segoe UI", "Roboto", "Oxygen",
                "Ubuntu", "Cantarell", "Fira Sans",
                "Droid Sans", "Helvetica Neue", sans-serif;
            }
            .btn{
                border-radius: 0;
            }

            .nav-title{
                font-weight: 300;
                color: #0b7fff;
            }

            .nav-title b{
                color: #bc18fc;
                font-weight: 700;
            }

            #acc_id, #awb_id, #amt_id{
                padding-left: 0.5em;
            }

            .card-title{
                color: #0b7fff;
            }

            .content-p{
                border: 0.5em, black, solid;
                border-radius: 5em;
            }

            .modal-dialog {
                max-width: 650px !important;
            }

            .modal-body{
                padding: 0 0 1rem 0 !important;
            }

            .icon-success{
                color: #28a745;
                font-size: 7.0em;
                border: 0.06em #28a745 solid;
                padding: 0.2em;
                border-radius: 5em;
                text-align: center;
            }

            .icon-error{
                color: #dc3545;
                font-size: 7.0em;
                border: 0.06em #dc3545 solid;
                padding: 0.2em;
                border-radius: 5em;
                text-align: center;
            }

            .footer-copyright{
                background-color: #343a40;
                color: white;
                font-weight: 300;
                text-align: center;
                padding: 0.5em;
            }

            .footer-copyright b{
                color: #0b7fff;
            }

            /* loader styles */
            .loader {
                height: 4px;
                width: 100%;
                position: relative;
                overflow: hidden;
                background-color: #ddd;
                margin-bottom: 0.5rem;
            }
            .loader:before{
                display: block;
                position: absolute;
                content: "";
                left: -200px;
                width: 200px;
                height: 4px;
                background-color: #0874ff;
                animation: loading 2s linear infinite;
            }

            @keyframes loading {
                from {left: -200px; width: 30%;}
                50% {width: 30%;}
                70% {width: 70%;}
                80% { left: 50%;}
                95% {left: 120%;}
                to {left: 100%;}
            }
        </style>
    </head>
    
    <body oncontextmenu="return false">
    
        <nav class="navbar navbar-light bg-dark">
            <h4 class="nav-title"><b>BitTracker</b> | Payment Gateway</h4>
        </nav>
        <div id="home" class="container">
            <div id="contract_area">
                <br><br>
                <div class="card">
                    <div class="card-body">
                        <h4 id="err-heading" class="card-title display-4"><b>Web3 Not Detected!</b></h4>
                        <br><br>
                        <h5 id="err-text">Please use a Web3 enabled browser, like Mist. Else you can use the Metamask plugin to use this Dapp!</h5>
                        <br>
                        <button value="Refresh Page" class="btn btn-primary" onClick="window.location.reload()">Refresh</button>
                        <br>
                    </div>
                </div>
                <br>
            </div>
            <div id="content-p">
                <br>
                <div class="card">
                    <div class="card-body">
                        <h4 class="card-title display-4"><b>Payment Confirmation</b></h4>
                        <br>
                        <table>
                            <tr>
                                <td><h6 class="display-5"><b>Account Address:</b></h6></td>
                                <td>
                                    <h6 class="display-5" id="acc_id"></h6>
                                </td>
                            </tr>
                            <tr>
                                <td><h6 class="display-5"><b>Booking Fingerprint:</b></h6></td>
                                <td>
                                    <h6 class="display-5" id="awb_id"></h6>
                                </td>
                            </tr>
                            <tr>
                                <td><h6 class="display-5"><b>Total Payable Price:</b></h6></td>
                                <td>
                                    <h6 class="display-5" id="amt_id"></h6>
                                </td>
                            </tr>
                        </table>
                        <br>
                        <button id="createNewContract" class="btn btn-primary" onclick="createContractMerc()" data-toggle="modal"
                            data-target="#paymentStatus">Confirm Payment</button>
                        <br>
                    </div>
                </div>
                
                
                <!-- Payment Modal -->
                <div class="modal fade" id="paymentStatus" tabindex="-1" role="dialog" aria-labelledby="paymentStatusLabel"
                    aria-hidden="true" data-backdrop="static" data-keyboard="false">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-body">
                                <div class="loader"></div>
                                <div id="transactionStatus"
                                    style="width: 100%; padding-top: 2vh; font-size: 1rem !important; text-align: center;">
                                        <!-- contents of the transaction status -->
                                </div>
                                <h6 style="text-align:center">Please wait while we process your transaction...</h6>
                            </div>
                        </div>
                    </div>
                </div>
                    <!-- end of all -->
            </div>
        </div>

        <br>
        <footer class="page-footer font-small blue">
            <div class="footer-copyright">© 2019 Copyright Reserved By <b>BitTracker Inc. & Co.</b></div>
        </footer>


        <script type="text/javascript">
            let accID;
            let awb = "`+ awb +`";
            let amt = `+ price +`;

            let xpress_t = "` + tok + `";
            // console.log(xpress_t);


            // Checking if Web3 has been injected by the browser (Mist/MetaMask)
            if (typeof web3 !== 'undefined') {
    
                // Use Mist/MetaMask's provider
                window.web3 = new Web3(web3.currentProvider);
                if (web3.currentProvider.isMetaMask === true) {
                    if (typeof web3.eth.defaultAccount === 'undefined') {
                        console.log('Oops! Your browser does not support Ethereum Ðapps.')
                    }
                    else {
                        web3.eth.getAccounts((err, res) => {
                            if (res.length == 0) {
                                document.getElementById('content-p').style.display = "none";
                                document.getElementById('contract_area').style.display = "block";
                                document.getElementById("createNewContract").disabled = true;
                                document.getElementById('err-heading').innerHTML = "No Accounts Detected!";
                                document.getElementById('err-text').innerHTML = "Please Sign In to Mist/Metamask! If you do not have a Ethereum wallet account, create one, its free!";
                            } else {
                                document.getElementById('content-p').style.display = "block";
                                document.getElementById('contract_area').style.display = "none";
                                document.getElementById("createNewContract").disabled = false;
                                accID = res[0];
                                document.getElementById('acc_id').innerHTML = accID;
                                document.getElementById('awb_id').innerHTML = awb;
                                document.getElementById('amt_id').innerHTML = amt + ' wei';
                            }
    
                        })
                    }
                }
            } else {
                document.getElementById('content-p').style.display = "none";
                document.getElementById('contract_area').style.display = "block";
                document.getElementById('err-heading').innerHTML = "Web3 Not Detected!";
                document.getElementById('err-text').innerHTML = "Please use a Web3 enabled browser, like Mist. Else you can use the Metamask plugin to use this Dapp!";
            }
    
    
            function createContractMerc() {
                const contractAddr = '0x5385A87381ECeEA6FB2bB1B33bEb138F31eDA757'
                const contractABI = [{ "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "purchasedContracts", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "type": "function", "stateMutability": "view" }, { "constant": false, "inputs": [{ "name": "_merc", "type": "string" }, { "name": "_value", "type": "uint256" }, { "name": "from", "type": "address" }], "name": "setContactAWB", "outputs": [], "payable": true, "type": "function", "stateMutability": "payable" }, { "inputs": [], "payable": false, "type": "constructor", "stateMutability": "nonpayable" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "from", "type": "address" }, { "indexed": false, "name": "to", "type": "address" }, { "indexed": false, "name": "price", "type": "uint256" }, { "indexed": false, "name": "awb", "type": "string" }], "name": "Transfering", "type": "event" }];
    
                const MercContract = new web3.eth.Contract(contractABI, contractAddr);
                const data = MercContract.methods.setContactAWB(awb.toString(), amt, accID.toString()).encodeABI()
    
                web3.eth.getAccounts((err, res) => {
                    const txObject = {
                        gasLimit: web3.utils.toHex(6000000),
                        gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
                        to: contractAddr,
                        from: res[0],
                        data: data,
                        value: web3.utils.toHex(web3.utils.toWei(amt.toString(), 'wei')),
                    };
    
                    web3.eth.sendTransaction(txObject, (err, res) => {
                        if (err) {

                            document.getElementById('transactionStatus').innerHTML = '<i class="material-icons icon-error">clear</i><br><br><h2><span class="badge badge-danger">Transaction Failed</span></h2><h6>' + err.message.substring(46);




                            // document.getElementById('transactionStatus').innerHTML = '<h6><span class="badge badge-danger">Error</span> Transaction Failed. Detailed Error: ' + err.message.substring(46) + '<br>Please wait while we process your transaction...</h6>';
                            confirm_tansaction(xpress_t, accID.toString(), "0");
                            document.getElementById("createNewContract").disabled = true;
                            
                            setTimeout(() => {
                                window.close(window.location);
                                document.getElementById('transactionStatus').innerHTML = '';
                            }, 20000);
                        } else {
                            // success

                            document.getElementById('transactionStatus').innerHTML = '<i class="material-icons icon-success">done</i><br><br><h2><span class="badge badge-success">Transaction Successful</span></h2><h6>Hash: ' + res;





                            // document.getElementById('transactionStatus').innerHTML = '<h6><span class="badge badge-success">Success</span> Transaction Successful! Transaction hash: ' + res + '<br>Please wait while we process your transaction...</h6>';
                            confirm_tansaction(xpress_t, accID.toString(), res);
                            document.getElementById("createNewContract").disabled = true;

                            setTimeout(() => {
                                window.close(window.location);
                                document.getElementById('transactionStatus').innerHTML = '';
                            }, 20000);
                        }
                    })
                })
    
            }

            function confirm_tansaction(xpress_tk, caccID, tx){
                var xmlhttp = new XMLHttpRequest();             // new HttpRequest instance
                xmlhttp.open("POST", "http://localhost:3000/confirmTransaction/");
                xmlhttp.setRequestHeader("Content-Type", "application/json");
                xmlhttp.send(JSON.stringify({token: xpress_tk, custAddr: caccID, txhash: tx}));
            }
    
        </script>
    </body>
    </html>`;
    return xrft_template;
};


module.exports.errorPayout = () => {
    let template_err = `
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>404 Error | Payment Gateway</title>
    
        <link href="https://fonts.googleapis.com/css?family=Montserrat:500" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css?family=Titillium+Web:700,900" rel="stylesheet">
    
        
        <style>
        * {
            -webkit-box-sizing: border-box;
                    box-sizing: border-box;
          }
          
          body {
            padding: 0;
            margin: 0;
          }
          
          #notfound {
            position: relative;
            height: 100vh;
          }
          
          #notfound .notfound {
            position: absolute;
            left: 50%;
            top: 50%;
            -webkit-transform: translate(-50%, -50%);
                -ms-transform: translate(-50%, -50%);
                    transform: translate(-50%, -50%);
          }
          
          .notfound {
            max-width: 767px;
            width: 100%;
            line-height: 1.4;
            padding: 0px 15px;
          }
          
          .notfound .notfound-404 {
            position: relative;
            height: 150px;
            line-height: 150px;
            margin-bottom: 25px;
          }
          
          h1 {
            font-family: 'Titillium Web', sans-serif;
            font-size: 186px;
            font-weight: 900;
            margin: 0px;
            text-transform: uppercase;
            -webkit-background-clip: text;
            -webkit-text-fill-color: #00000080;
            background-size: cover;
            background-position: center;
          }
          
          .notfound h2 {
            font-family: 'Titillium Web', sans-serif;
            font-size: 26px;
            font-weight: 700;
            margin: 0;
          }
          
          .notfound p {
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 0px;
            text-transform: uppercase;
          }
          
          .notfound a {
            font-family: 'Titillium Web', sans-serif;
            display: inline-block;
            text-transform: uppercase;
            color: #fff;
            text-decoration: none;
            border: none;
            background: #5c91fe;
            padding: 10px 40px;
            font-size: 14px;
            font-weight: 700;
            border-radius: 1px;
            margin-top: 15px;
            -webkit-transition: 0.2s all;
            transition: 0.2s all;
          }
          
          .notfound a:hover {
            opacity: 0.8;
          }
          
          @media only screen and (max-width: 767px) {
            .notfound .notfound-404 {
              height: 110px;
              line-height: 110px;
            }
            .notfound .notfound-404 h1 {
              font-size: 120px;
            }
          }
          
        </style>
           
    </head>
    
    <body>
    
        <div id="notfound">
            <div class="notfound">
                <div class="notfound-404">
                    <h1>404</h1>
                </div>
                <h2>Oops! This Page Could Not Be Found</h2>
                <p>Sorry but the page you are looking for does not exist, have been removed. name changed or is temporarily unavailable</p>
                <a href="#">Go To Homepage</a>
            </div>
        </div>
    </body>
    </html>`;
    return template_err;
}