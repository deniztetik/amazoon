var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
var csv = require("csv");

//
// `params` reads options from the command line (via minimist).
//
// Try console logging it when experimenting with different
// command line options.
//
var params = require("minimist")(process.argv.slice(2));

var ORDERS_FILENAME		 = (params.from || "data/orders.csv");
var DB_FILENAME 			 = (params.to || "data/amazoon.db");
var DB_SCHEMA_FILENAME = "amazoon.sql";

var dbSchema = fs.readFileSync(DB_SCHEMA_FILENAME,{ encoding: "utf-8" });
var db = new sqlite3.Database(DB_FILENAME,onConnected);
// var utils = require('./helpers.js')

//
// TODO: print some help text to let the CLI user know how to
//       use this tool


// ************************************

function onConnected(err) {
	var orders = [];

	if (err) {
		console.log("Database connection error.",err.toString());
		return;
	}

	db.serialize();
	db.exec( dbSchema );

  parseCSV(function(order) {

		addOrder(order);
		addCustomer(order);
		addProduct(order);

	});



	// 3. Insert the data into your SQL database.
	//    Tips:
	//
	//    // To INSERT:
	//    db.run( " ..SQL.. ", function(err){
	//
	//    })
	//
	//    // to SELECT:
	//    db.get( " ..SQL.. ", function(err){
	//
	//    })
	//
	//    // to SELECT and iterate:
	//    db.each( " .. SQL.. ", function(err, row){
	//
	//    })
}

function parseCSV(cb) {
	var file = fs.createReadStream(ORDERS_FILENAME);
	var parser = csv.parse({
		columns: true,
		auto_parse: true
	});

	file.pipe(parser);
	parser.on("readable",function(){
		var record;

		while (record = parser.read()) {
			cb(record);
		}
	});
}

function addCustomer (order){
  db.run("INSERT OR IGNORE into customers (customer_id, customer_name, customer_email) values($customer_id, $customer_name, $customer_email)",
  {
    $customer_id: order["Customer ID"],
    $customer_name: order["Customer Name"],
    $customer_email: order["Customer Email"]
  },
  function(err){
    if (err) console.error(err);
  });
}

function addOrder (order){
  var total = 0;
  for (var i = 1; i <= 3; i++) {
    total +=
    order[`Product ${i} Unit Price`] *
    order[`Product ${i} Qty`]
  }


  db.run("INSERT into orders (customer_id,order_id,order_date,order_status,order_total) values ($customer_id,$orderId,$orderDate,$orderStatus,$orderTotal)",
  {
    // $customer_id: order['Customer ID'],
    $orderId: order['Order ID'],
    $orderDate: order['Order Date'],
    $orderStatus: order['Order Status'],
    $orderTotal: total

  }, function(err) {
    if (err) console.error(err);
    // console.log("woohoo!");
  });

}

function addProduct (order){
  for (var i = 1; i <= 3; i++) {
    db.run("INSERT OR IGNORE into products (product_id, product_label, unit_price) values ($product_id, $product_label, $unit_price)",
    {
      $product_id: order[`Product ${i} ID`],
      $product_label: order[`Product ${i} Label`],
      $unit_price: order[`Product ${i} Unit Price`]
    }), function(err) {
      if (err) console.error(err);
    }
  }
}
