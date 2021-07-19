var express = require("express");
var bodyParser = require("body-parser");
//var uniqid = require("uniqid");
var app = express();
var mysql = require('mysql');
const cors = require('cors');
const { request } = require("express");
 
app.use(cors());

var con = mysql.createConnection({
  host: "db-admin.cbsrzgbgkhst.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "admin1234",
  database: "db_admin"
});

con.connect(function(err) {
    if (err) throw err;
  
   console.log('connection successful');
});

// var users = [{
//     email : 'abc@abc.ca',
//     firstName : 'ABC',
//     id : '5abf6783'
//     },
//     {
//     email : 'xyz@xyz.ca',
//     firstName: 'XYZ',
//     id : '5abf674563'
//     }]

let port = process.env.PORT || 2007
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});

app.get('/homepage',(req,res) => {
    return res.status(200).json({
        success: true,
        message: "Homepage",
    });
});

app.get('/homepage/items', (req, res) => {

        con.query(`SELECT * FROM item_details`, function(err, result, fields) {
            console.log(result.length);
            
            if (err)
            {
                return res.status(404).json({
                    success: false,
                    message: "No user found!"
                })
            } 
            if (result)
            {
                return res.status(200).json({
                    success: true,
                    message: "Users retrieved",
                    data: result
                });
            } 
        });

});

app.get('/cart/items', (req, res) => {

    con.query(`SELECT * FROM cart_items`, function(err, result, fields) {
        console.log(result.length);
        
        if (err)
        {
            return res.status(404).json({
                success: false,
                message: "No user found!"
            })
        } 
        if (result)
        {
            return res.status(200).json({
                success: true,
                message: "Users retrieved",
                data: result
            });
        } 
    });

});

app.delete('/cart/delete/:id', (req, res) => {
    console.log("about to delete id: "+req.params.id);
    let userID = req.params.id;
    con.query(`DELETE FROM cart_items WHERE item_id = '${userID}';`,function(err,result){
        
        console.log(result);

        if(err)
        {
            return res.status(500).json({
                success: false,
                message: "server error"
            })
        }
        else
        {
            return res.status(200).json({
                success: true,
                message: "User deleted",
            })
        }
                
    });

});

app.get('/cart/items/:id', (req, res) => {
    console.log("i am in GEt with ID");
    let userID = req.params.id;
    con.query(`SELECT * FROM cart_items WHERE item_id = '${userID}'`, function(err, result, fields) {
        console.log(result);
        var found=false;
        var quantity = 0;
        Object.keys(result).forEach(function(key) {
            var rowData = result[key];
            if (rowData.item_id == userID)
            {
                quantity = rowData.item_qty;
                found=true;
                console.log(rowData)
            }
            
          });

        if (found==false)
        {
            return res.status(404).json({
                success: false,
                message: "No user found!",
                item_qty: quantity
            })
        }

        else
        {
            if (err)
            {
                return res.status(500).json({
                    success: false,
                    message: "Server error"
                })
            } 
            if (result)
            {
                return res.status(200).json({
                    success: true,
                    message: "User retrieved",
                    data: result,
                    item_qty: quantity
                });
            } 
        }
    });
});

app.put('/cart/truncate', (req, res) => {

    con.query(`TRUNCATE TABLE cart_items;`,function(err,res){
        
        if(err) throw err;

        console.log(res);
    });

    return res.status(200).json({
        success: true,
        message: "Users Truncated",
    })
});

app.post('/cart/add', (req, res) => {

	var records = [[req.body.item_id, req.body.store_name, req.body.item_name, req.body.item_qty,req.body.item_price,req.body.item_desc,req.body.item_image]];
	
    if(records[0][0]!=null)
	{
        var quantity = 1;
        records = [[req.body.item_id, req.body.store_name, req.body.item_name, quantity,req.body.item_price,req.body.item_desc,req.body.item_image]];
        console.log("Trying to find data in Cart tables");
        
        con.query(`SELECT * FROM cart_items`, function(err, result, fields) {
            console.log("fetching data from Cart table");
            var found=false;
            Object.keys(result).forEach(function(key) {
                var row = result[key];
                console.log("Finding data : "+ row.item_id);
                console.log(row);
                if (row.item_id == req.body.item_id)
                {
                    quantity = row.item_qty + 1;
                    console.log("Found data from Cart table : Quantity = "+ quantity + " Boolean comparison : " + (quantity > 1));
            
                }
                console.log(row.id);
            });

            records = [[req.body.item_id, req.body.store_name, req.body.item_name, quantity,req.body.item_price,req.body.item_desc,req.body.item_image]];
            console.log("quantity ====== " + quantity);
            if(quantity == 1){
                if(quantity <= req.body.item_qty){
                    con.query("INSERT into cart_items (item_id, store_name, item_name, item_qty, item_price, item_desc, item_image) VALUES ?",[records],function(err,result,fields){

                        if(err)
                        {
                            console.log('Entering Data Failed with Error:');
                            console.log(err);
                            return res.status(500).json({
                                success: false,
                                message: "server error"
                            }); 
                        }
        
                        else
                        {
                            console.log('Entering Data Complete!!!');
                            return res.status(200).json({
                                success: true,
                                message: "Users Added",
                            });
                       }
        
                    });
                }
           }
        
            else{
                console.log("Trying to update!!!!!");
                if(quantity <= req.body.item_qty){
                    console.log("Updating!!!!!");
            
                    con.query(`UPDATE cart_items SET item_qty = '${quantity}' where item_id = '${req.body.item_id}'`,function(err,res){
    
                        if(err) 
                        {
                            console.log(err);
                        }
        
                        console.log(res);
                        console.log("Updated!!!!!");
                    });
                    return res.status(200).json({
                        success: true,
                        message: "Users quantity Updated",                    
                    });
                }
                else {
                    console.log('item quantity exceeded!!!');
                    return res.status(401).json({
                        success: false,
                        message: "quantity exceeded"
                    });
                }
            }
        });
    
    }
});

