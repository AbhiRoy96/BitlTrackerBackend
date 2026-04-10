module.exports.generateInvoice = (invoice) => {
    let inv_template = `
    <html>
    <head>
        <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO"
                crossorigin="anonymous">
            <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700" rel="stylesheet">

            <link href="https://fonts.googleapis.com/css?family=Libre+Barcode+128" rel="stylesheet"> 

            <title>Invoice For `+ invoice.awb +`</title>
            
            <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
                crossorigin="anonymous"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49"
                crossorigin="anonymous"></script>
            <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy"
                crossorigin="anonymous"></script>

            <style>
                body{
                    font-family: -apple-system, BlinkMacSystemFont,
                        "Segoe UI", "Roboto", "Oxygen",
                        "Ubuntu", "Cantarell", "Fira Sans",
                        "Droid Sans", "Helvetica Neue", sans-serif;

                }

                .icQr{
                    font-family: 'Libre Barcode 128', cursive;
                    font-size: 2.75em;
                    transform: scale(0.7, 2.2);
                }

                @media print {
                    body{
                        width: 21cm;
                        height: 29.7cm;
                        margin: 20mm 45mm 30mm 45mm; 
                        /* change the margins as you want them to be. */
                    } 
                }

                hr{
                    width: 65%;
                    color: black;
                    left: 0;
                    margin: 0 !important;
                    margin-left: 1%;
                }
            </style>
    </head>

    <body oncontextmenu="return false">
        <div>
            <table style="width: 65%">
                <tr>
                    <td style="text-align:center">
                        <h1 class="display-6">`+ invoice.freight_services_name +`</h1>
                        <h4>S.A.Chemin Rieu 12-14,1208 Geneva Switzerland</h4>
                        <h5>Contact Us: +41227038888</h5>
                    </td>
                </tr>
            </table>
            <br>
            <hr>
            <br>
            <br>
            <table style="width: 60%">
                    <tr>
                            <td><b>Invoice Number</b></td>
                            <td style="text-align:end"><b>Invoice Date</b></td>
                        </tr>
                    <tr>
                        <td>`+ invoice.invoiceNumber +`</td>
                        <td style="text-align:end">`+ invoice.payment_ts +`</td>
                    </tr>
            </table>
            <br>
            <br>
            <table style="width: 60%">
                <tr>
                    <td>
                        <table style="width: 100%">
                            <tr><td><h3>BitTracker Inc & Co.</h3></td></tr>
                            <tr><td>Cumberland Place, 26 Fenian St,</td></tr>
                            <tr><td>Dublin, Ireland,</td></tr>
                            <tr><td>D02 FF20</td></tr>
                        </table>
                    </td>
                    <td>
                        <table style="width: 100%">
                            <tr><td><b>Customer Name & Address:</b></td></tr>
                            <tr><td>`+ invoice.first_name + ` ` + invoice.last_name +`</td></tr>
                            <tr><td>`+ invoice.address +`</td></tr>
                            <tr><td>`+ invoice.telephone +`</td></tr>
                            <tr><td>`+ invoice.email +`</td></tr>
                        </table>
                    </td>
                </tr>
            </table>

            <br><br>
            <h4><u>Freight Details</u></h4>
            <table style="width: 60%">
                <tr>
                    <td><h6><b>Marine Waybill(MWB):</b> &nbsp; `+ invoice.awb +`</h6></td>
                    <td><div class="icQr">`+ invoice.awb +`</div></td>
                </tr>
            </table>
            
            <br>
            <table class="table" style="width: 60%">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col">Origin Port</th>
                        <th scope="col">Discharge Port</th>
                        <th scope="col">Type</th>
                        <th scope="col">Pickup Date</th>
                        <th scope="col">Quote Price</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>`+ invoice.from_p_name +`</td>
                        <td>`+ invoice.to_p_name +`</td>
                        <td>`+ invoice.shipment_type +`</td>
                        <td>`+ invoice.shipmentDate +`</td>
                        <td>$ `+ invoice.quote_price +`</td>
                    </tr>
                </tbody>
            </table>


            <br><br>
            <h4><u>Payment Details</u></h4>
            <h6><b>Payee's Wallet Address:</b> &nbsp; `+ invoice.client_payment_address +`</h6>
            <h6><b>Transaction Id:</b> &nbsp; `+ invoice.transactionHash +`</h6>
            <h6><b>Amount Paid:</b> &nbsp; $ `+ invoice.quote_price +`</h6>
            <br>
    
            <br><br>
            <h6>This is a Computer generated Invoice.</h6>
        </div>
        
    </body>

    </html>`;
    return inv_template;
};


module.exports.errorInvoice = () => {
    let template_err = `
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>404 Error | Download Invoice</title>
    
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