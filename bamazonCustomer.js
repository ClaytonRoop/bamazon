var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  startBamazon();
});

function startBamazon() {
  // query the database for all items being auctioned
  connection.query(
    "SELECT item_id, product_name, price FROM products",
    function(err, results) {
      if (err) throw err;
      console.log("Which Item Would You Like To Purchase?");
      for (var j = 0; j < results.length; j++) {
        console.log("Item ID: " + results[j].item_id);
        console.log("Product: " + results[j].product_name);
        console.log("Price: " + results[j].price);
        console.log("- - - - - - - - - -");
      }
      inquirer
        .prompt([
          {
            name: "item",
            message: "Which Item ID would you like to purchase?"
          },
          {
            name: "quantity",
            message: "How many would you like to purchase?"
          }
        ])
        .then(function(answer) {
          // based on their answer, either call the bid or the post functions
          var itemParse = parseInt(answer.item);
          var quantityParse = parseInt(answer.quantity);
          if (Number.isInteger(itemParse) && Number.isInteger(quantityParse)) {
            quantityCheck(itemParse, quantityParse);
          } else {
            console.log("Please enter a numeric value");
            startBamazon();
          }
        });
    }
  );
}

function quantityCheck(item, quantity) {
  connection.query("SELECT * FROM products WHERE item_id=?", [item], function(
    err,
    res
  ) {
    if (err) throw err;
    // Log all results of the SELECT statement
    var finalPrice = "";
    if (quantity >= res[0].stock_quantity) {
      console.log("----------------------");
      console.log("Insufficient Quantity");
      console.log("----------------------");
      setTimeout(startBamazon, 4000);
    } else {
      var stockParse = parseInt(res[0].stock_quantity);
      var newQuantity = stockParse - quantity;
      finalPrice = res[0].price * quantity;

      connection.query(
        "UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: newQuantity
          },
          {
            item_id: res[0].item_id
          }
        ],
        function(err, res) {
          var newRes = JSON.stringify(res);
          console.log("Your Final price was: $" + finalPrice);
          console.log("-----------------------");
          // Call deleteProduct AFTER the UPDATE completes
          // deleteProduct();
        }
      );
    }
  });
}
