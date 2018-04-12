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
  startManager();
});

function startManager() {
  inquirer
    .prompt([
      {
        name: "manager",
        type: "rawlist",
        message: "Hey Manager, what would you like to do?",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product"
        ]
      }
    ])
    .then(function(answer) {
      var newAnswer = JSON.stringify(answer);
      console.log("You Chose " + newAnswer);
      var action = answer.manager;
      console.log("var Action: " + action);

      if (action == "View Products for Sale") {
        viewProducts();
      } else if (action == "View Low Inventory") {
        viewLow();
      } else if (action == "Add to Inventory") {
        addInventory();
      } else if (action == "Add New Product") {
        addProduct();
      } else {
        console.log("Please select an available number");
        startManager();
      }
    });
}

function viewProducts() {
  console.log("You want to view All proudcts for sale");
  connection.query(
    "SELECT item_id, product_name, price, stock_quantity FROM products",
    function(err, results) {
      if (err) throw err;
      console.log("All Products:");
      for (var j = 0; j < results.length; j++) {
        console.log("Item ID: " + results[j].item_id);
        console.log("Product: " + results[j].product_name);
        console.log("Price: " + results[j].price);
        console.log("Stock Quantity: " + results[j].stock_quantity);
        console.log("- - - - - - - - - -");
      }
    }
  );
}

function viewLow() {
  console.log("You want to view Low inventory");
  connection.query(
    "SELECT item_id, product_name, price, stock_quantity FROM products",
    function(err, results) {
      if (err) throw err;
      console.log("All Products:");
      for (var j = 0; j < results.length; j++) {
        if (results[j].stock_quantity < 5) {
          console.log("Item ID: " + results[j].item_id);
          console.log("Product: " + results[j].product_name);
          console.log("LOW QUANTITY: " + results[j].stock_quantity);
          console.log("- - - - - - - - - -");
        }
      }
    }
  );
}

function addInventory() {
  console.log("You want to ADD inventory to products");

  inquirer
    .prompt([
      {
        name: "item",
        message: "Which Item ID would you like to update?"
      },
      {
        name: "quantity",
        message: "How much inventory would you like to add?"
      }
    ])
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      console.log(answer.item);
      console.log(answer.quantity);
      var itemParse = parseInt(answer.item);
      var qParse = parseInt(answer.quantity);
      var updatedQuantity = "";

      connection.query(
        "SELECT * FROM products WHERE item_id=?",
        [itemParse],
        function(err, res) {
          if (err) throw err;
          // Log all results of the SELECT statement
          console.log(res);
          updatedQuantity = res[0].stock_quantity + qParse;
          updatedQuantity = parseInt(updatedQuantity);
        }
      );

      connection.query(
        "UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: updatedQuantity
          },
          {
            item_id: itemParse
          }
        ],
        function(err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " products updated!\n");
          var newRes = JSON.stringify(res);
          connection.query(
            "SELECT * FROM products WHERE item_id=?",
            [itemParse],
            function(err, res) {
              if (err) throw err;
              // Log all results of the SELECT statement
              console.log(res);
              var finalQuantiy = res[0].stock_quantity;
              console.log("Your new Quantiy is: " + finalQuantiy);
            }
          );
        }
      );
    });
}

function addProduct() {
  console.log("You want to add new Products");
}
