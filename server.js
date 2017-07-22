/**
 * Created by Hasidi on 18/06/2017.
 */

let express = require('express');
let bodyParser = require('body-parser');
let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var cors = require('cors');
app.use(cors());

var moment = require('moment');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var dbUtils = require('./DBUtils');
var Promise = require('promise');

//-------------------------------------------------------------------------------------------------------------------
app.use(express.static(__dirname + '/public'));
//-------------------------------------------------------------------------------------------------------------------
app.locals.users = {};

//-------------------------------------------------------------------------------------------------------------------
let port = 4000;
app.listen(port, function () {
    console.log('listening on port ' + port);
});
//-------------------------------------------------------------------------------------------------------------------


var config = {
    userName: 'elinor',
    password: 'Aa123456',
    server: 'elinorserver.database.windows.net',
    requestTimeout: 30000,
    options: { encrypt: true, database: 'elinorDB' }
};

var connection = new Connection(config);

connection.on('connect', function (err) {
    if (err) {
        console.error('error connecting; ' + err.stack);
        return;
    }
    console.log("connected Azure");

});


//-------------------------------------------------------------------------------------------------------------------------------




//-------------------------------------------------------------------------------------------------------------------
// app.post('/login', function (req,res) {
//     let username = req.body.username;
//     let password = req.body.password;
//     if (username == '123' && password == '123'){
//         let token = 12345;
//         app.locals.users[username] = token;
//         res.json(token);
//     }
//     else {
//         res.status(403).send("username or password incorrect");
//     }
//
// });
//-------------------------------------------------------------------------------------------------------------------
function checkLogin(req) {
    return new Promise(function (resolve, reject) {
        let token = req.headers["usertoken"];
        let user = req.headers["username"];
        if (!token || !user)
            resolve(true);
        let validToken = app.locals.users[user];
        if (validToken == token)
            resolve(true);
        else
            resolve(true);
    });
}
//-------------------------------------------------------------------------------------------------------------------------------

////----------------------------------------------------From Ass 3---------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------

app.post('/login', function (req, res) {
    var username = req.body.username;
    var pass = req.body.password;
    var token = req.body.usertoken;

    console.log('req.body is :'+JSON.stringify(req.body));
    let validToken = app.locals.users[username];
    console.log('username is :'+username);
    console.log('pass is :'+pass);
    console.log('token is :'+token);
    console.log('app.locals.users is :'+JSON.stringify(app.locals.users));
    if (token && validToken == token)
        res.json(validToken);
    else if (!username || !pass ) {
        //res.send("faild to login");
        res.send({ "login": false });
        res.end();
    }
    else {
        console.log('in here');
        var loginQuery = "SELECT Password FROM Users WHERE UserName = '" + username + "' and Password='" + pass + "'";
        dbUtils.Select(connection, loginQuery, function (result) {
            console.log('result is: '+JSON.stringify(result));
            if (result && result.length == 1) {
                let token = Date.now();
                app.locals.users[username] = token;
                console.log('token is: '+token);
                res.json(token);
            }
            else {
                res.status(403).send({"login": false});
            }
        });
    }
});

//-------------------------------------------------------------------------------------------------------------------------------

app.post('/register', function (req, res) {
    var username = req.body.username;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var pass = req.body.pass;
    var email = req.body.mail;
    var country = req.body.country;
    var restoreQ = req.body.restoreQ;
    var restoreAns = req.body.restoreAns;
    var favCategories = req.body.favs;

    //input checking is done in the client

    var userid = -1;
    if (!username || !fname || !lname || !pass || !email || !country) {
        console.log("one of the mandatory fields is missing");
        console.log('username '+username);
        console.log('fname '+fname);
        console.log('lname '+lname);
        console.log('pass '+pass);
        console.log('email '+email);
        console.log('country '+country);
        res.send({ "register": false , "error":"one of the mandatory fields is missing"});
        res.end();
        return;
    }
    if (!restoreQ || !restoreAns) {
        restoreQ = null;
        restoreAns = null;
    }
    var dt = new Date();
    var itemProcces = 0;
    var mydate = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
    var insertQuery = "INSERT INTO [dbo].[Users] VALUES ('" + username + "','" + fname + "','" + lname + "','" + pass + "','" + email + "','" + country + "','" + mydate + "','" + restoreQ + "','" + restoreAns + "')";
    var myPromise = dbUtils.InsertPromise(connection, insertQuery);
    var productsIds = [];
    var itemproccess1 = 0;
    var itemproccess2 = 0;

    myPromise.then(function () {
        var getIDquery = "SELECT TOP (1) UserID FROM Users order by UserID DESC";
        var userIDPromise = dbUtils.SelectPromise(connection, getIDquery);
        userIDPromise.then(function (newUserID) {
            userid = newUserID[0].UserID;
            console.log("the new user id is: " + userid);
            if(favCategories && favCategories.length>0){
                for (var i = 0; i < favCategories.length; i++) {
                    var getIDsQuery = "SELECT CategoryID FROM Categories WHERE CategoryName= '" + favCategories[i] + "'";
                    dbUtils.SingleSelect(config, getIDsQuery, function (result) {
                        productsIds.push(result[0]['CategoryID']);
                        itemproccess1++;
                        if (itemproccess1 == favCategories.length) {
                            for (var j = 0; j < productsIds.length; j++) {
                                var insertFav = "INSERT INTO [dbo].[UsersCategories] VALUES ('" + userid + "' , '" + productsIds[j] + "')";
                                dbUtils.SingleInsert(insertFav, config, function (insertResult) {
                                    itemproccess2++;
                                    if (itemproccess2 == productsIds.length) {
                                        res.send({"register": true});
                                        console.log('register send true');
                                    }
                                });
                            }
                        }
                    });
                }
            }
            else{
                console.log('no fav categories, send true');
                res.send({"register": true});
            }
        }).catch(function (err) {
            console.log('ERROR1! ' +err);
            res.send({ "register": false , "error":"error in connection"});
        });
    }).catch(function (err) {
        console.log('ERROR2! ' + err);
        res.send({ "register": false , "error":"error in connection"});
    });

});

//-------------------------------------------------------------------------------------------------------------------------------

app.post('/getRestoreQA', function (req, res) {
    var username = req.body.username;
    console.log('username is: '+username);
    var query = "SELECT RestoreQues, RestoreAns, Password FROM Users WHERE UserName = '" + username + "'";
    dbUtils.Select(connection, query, function (result) {
        if (result.length > 0) {
            res.send({ "getRestoreQA": true , "results":result});
        }
        else {
            res.send({ "getRestoreQA": false });
        }
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

app.get('/getTop5Prod', function (req, res) {
    var now = moment();
    console.log('now: ' + now);
    var lastWeek = now.subtract(1, 'weeks').format("YYYY-MM-DD");
    console.log('last week: ' + lastWeek);

    //all the orders that date>=lastWeek.
    //all the products from OrderProducts
    //sum all the same products in that table
    //sort by the DESC
    //get top 5

    var query = "SELECT TOP (5) ProductID, COUNT(ProductID) as sumToys FROM (SELECT ProductID FROM OrderProducts WHERE OrderID in \
                    (SELECT OrderID FROM Orders WHERE OrderDate >= '"+ lastWeek + "')) as aux \
                    GROUP BY aux.ProductID ORDER BY sumToys DESC";
    var myPromise = dbUtils.SelectPromise(connection, query);
    var hotIDs;
    var itemsProcessed = 0;
    var allresults = [];
    myPromise.then(function (hotProducts) {
        console.log('hotProducts: '+JSON.stringify(hotProducts));
        hotIDs = hotProducts;
        console.log('hotIDs: '+JSON.stringify(hotIDs));
        console.log('len: '+hotIDs.length);
    }).then(function () {
        if (hotIDs.length > 0) {
            for (var i = 0; i < hotIDs.length; i++) {
                query = "SELECT Products.ProductID,Products.ProductName, Products.Category, Products.PicturePath, Products.Price, Products.Manufacture, Products.Description FROM Products WHERE Products.ProductID='" + hotIDs[i].ProductID + "'";
                dbUtils.SingleSelect(config, query, function (result) {
                    if (result.length > 0) {
                        allresults.push(result);
                        itemsProcessed++;
                        if (itemsProcessed == hotIDs.length) { //if this call was the last and we excute all the functions
                            res.send(allresults);
                        }
                    }
                });
            }
        }
        else{
            res.send({ "getTop5Prod": false });
        }
    }).catch(function (err) {
        console.log(err);
        res.send({ "getTop5Prod": false });
    });

});

//-------------------------------------------------------------------------------------------------------------------------------

app.get('/getNewProd', function (req, res) {
    var now = moment();
    console.log('now: ' + now);
    var lastMonth = now.subtract(1, 'months').format("YYYY-MM-DD");
    console.log("Last month: " + lastMonth);
    var selectQuery = "SELECT Products.ProductID,Products.ProductName, Products.Category, Products.PicturePath, Products.Price, Products.Manufacture, Products.Description FROM Products WHERE Products.DateUploaded>='" + lastMonth + "'";
    dbUtils.Select(connection, selectQuery, function (result) {
        if (result.length > 0) {
            res.send(result);
        }
        else {
            res.send({ "getNewProd": false });
        }
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

app.get('/getAllProducts', function (req, res) {
    var query = "SELECT Products.ProductID,Products.ProductName, Products.Category, Products.PicturePath, Products.Price, Products.Manufacture, Products.Description FROM Products";
    dbUtils.Select(connection, query, function (result) {
        if (result.length > 0) {
            res.send(result);
        }
        else {
            res.send({ "getAllProducts": false });
        }
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

app.get('/getAllCategories', function (req, res) {

    var query = "SELECT * FROM Categories";
    dbUtils.Select(connection, query, function (result) {
        if (result.length > 0) {
            res.send(result);
        }
        else {
            res.send({ "getAllCategories": false });
        }
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

app.post('/getProductsByCategory', function (req, res) {
    var category = req.body.category; //one category
    var query = "SELECT Products.ProductID,Products.ProductName, Products.Category, Products.PicturePath, Products.Price, Products.Manufacture, Products.Description FROM Products INNER JOIN Categories on Products.Category=Categories.CategoryName WHERE Categories.CategoryName='" + category + "'";
    dbUtils.Select(connection, query, function (result) {
        if (result.length > 0) {
            res.send(result);
        }
        else {
            res.send({ "getProductsByCategory": false });

        }
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

app.post('/findProducts', function (req, res) {
    var search = req.body.search; //string
    var arr = search.split(" "); //convert to array
    var itemsProcessed = 0;
    var allresults = [];

    /*
     [1, 2, 3].forEach((item, index, array) => {
     asyncFunction(item, () => {
     itemsProcessed++;
     if (itemsProcessed === array.length) {
     callback();
     }
     });
     });
     */
    //search in the product name or/and in the product description
    for (var i = 0; i < arr.length; i++) {
        var searchWord = "%" + arr[i] + "%";
        var query = "SELECT Products.ProductID,Products.ProductName, Products.Category, Products.PicturePath, Products.Price, Products.Manufacture, Products.Description FROM Products WHERE Products.ProductName like '" + searchWord + "' or Products.Description like '" + searchWord + "'";
        dbUtils.SingleSelect(config, query, function (result) {
            itemsProcessed++;
            if (result.length > 0) {
                allresults.push(result);
                if (itemsProcessed == arr.length) //if this call was the last and we excute all the functions
                    res.send(allresults[0]);
            }
            else {
                if (itemsProcessed == arr.length)
                    res.send({ "getProductDetailsCustomer": false });
            }
        });

    }
});

//-------------------------------------------------------------------------------------------------------------------------------

app.post('/getProductDetailsCustomer', function (req, res) {
    var pid = req.body.pid;
    var query = "SELECT Products.ProductName, Products.Category, Products.Price, Products.PicturePath, Products.Manufacture, Products.Description FROM Products WHERE Products.ProductID='" + pid + "'";
    dbUtils.Select(connection, query, function (result) {
        if (result.length > 0) {
            res.send(result);
        }
        else {
            res.send({ "getProductDetailsCustomer": false });

        }
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

app.post('/isProductInStock', function (req, res) {
    var pid = req.body.pid;
    var amount = req.body.amount;

    var query = "SELECT Products.AmountInStock FROM Products WHERE Products.ProductID='" + pid + "'";
    dbUtils.Select(connection, query, function (result) {
        if (result.length > 0) {
            if (parseInt(result[0]['AmountInStock']) >= amount)
                res.send({ "isProductInStock": true });
            else
                res.send({"isProductInStock":false});
        }
        else {
            res.send({ "getProductDetailsCustomer": false });

        }
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

app.post('/isUserNameExist', function (req, res) {
    var username = req.body.username;


    //we dont care from upper/lower case letters
    var query = "SELECT Users.UserName FROM Users WHERE Users.UserName='" + username + "'";
    dbUtils.Select(connection, query, function (result) {
        if (result.length > 0) {
            res.send({ "isUserNameExist": true });
        }
        else {
            console.log('send isUserNameExist false');
            res.send({ "isUserNameExist": false });

        }
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

app.post('/getAllOrders', function (req, res) {
    var username = req.body.username;

    var query = "SELECT Orders.OrderID, Orders.OrderDate, Orders.DeliveryDate, Orders.TotalPrice, Orders.Currency, Orders.Description FROM Orders, Users WHERE Users.UserName = '" + username + "' and Orders.UserID = Users.UserID";
    dbUtils.Select(connection, query, function (result) {
        if (result.length > 0) {
            result.forEach(function (row) {
                row.OrderDate = moment(row.OrderDate).format("YYYY-MM-DD");
                row.DeliveryDate = moment(row.DeliveryDate).format("YYYY-MM-DD");
            });
            res.send({"getAllOrders": true, "result":result});
        }
        else {
            res.send({"getAllOrders": false});
        }
    });
});

//-------------------------------------------------------------------------------------------------------------------------------

app.post('/getOrderDetails', function (req, res) {
    var username = req.body.username;
    var orderid = req.body.orderID;

    //get the order details
    /*
     var query = "SELECT Orders.OrderID, Orders.OrderDate, Orders.DeliveryDate, Orders.TotalPrice, Orders.Currency, Orders.Description, OrderProducts.ProductName, OrderProducts.Amount, OrderProducts.Price, OrderProducts.Category, OrderProducts.Manufacture, OrderProducts.Description FROM Orders, Users, OrderProducts WHERE Users.UserName='" + username + "' and Orders.UserID = Users.UserID and Orders.OrderID ='" + orderid + "' and OrderProducts.OrderID='" + orderid + "'";
     dbUtils.Select(connection, query, function (result) {
     if (result.length > 0) {
     result.forEach(function (row) {
     row.OrderDate = moment(row.OrderDate).format("YYYY-MM-DD HH:MM:SS");
     row.DeliveryDate = moment(row.DeliveryDate).format("YYYY-MM-DD");
     });
     //allresults = JSON.stringify(result);
     res.send(result);
     }
     else {
     res.send({ "getOrderDetails": false });
     }
     });
     */
    var allResults = [];
    var query = "SELECT Orders.OrderID, Orders.OrderDate, Orders.DeliveryDate, Orders.TotalPrice, Orders.Currency, Orders.Description FROM Orders, Users WHERE Users.UserName='" + username + "' and Orders.UserID = Users.UserID and Orders.OrderID = '" + orderid + "'";
    var myPromise = dbUtils.SelectPromise(connection, query);
    myPromise.then(function (OrderResults) {
        allResults.push(OrderResults);
    }).then(function () {
        var productsQuery = "SELECT OrderProducts.ProductName, OrderProducts.Amount, OrderProducts.Price, OrderProducts.Category, OrderProducts.Manufacture, OrderProducts.Description FROM OrderProducts WHERE OrderProducts.OrderID = '" + orderid + "'";
        dbUtils.Select(connection, productsQuery, function (productsDetails) {
            allResults.push(productsDetails);
            res.send(allResults);
        });
    }).catch(function (err) {
        console.log(err);
        res.send({ "getOrderDetails": true });
    });

});

//-------------------------------------------------------------------------------------------------------------------------------

app.post('/executeOrder', function (req, res) {
    var username = req.body.username;
    var delivery = req.body.delivery;
    var pList = req.body.products; //sends with the amount: List<product, amount>
    var total = req.body.total;
    var currency = req.body.currency;
    var description = req.body.description;

    var orderid = -1;
    var dt = new Date();
    var dateToInsert = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    var orderQuery = "INSERT INTO [dbo].[Orders] VALUES ((SELECT UserID FROM USERS WHERE UserName = '" + username + "'), '" +dateToInsert+ "', '" + delivery + "', '" + total + "', '" + currency + "', '" + description + "')";
    var insertOrderPromise = dbUtils.InsertPromise(connection, orderQuery);

    insertOrderPromise.then(function () {
        var getIDquery = "SELECT TOP (1) OrderID FROM Orders order by OrderID DESC";
        var orderIDPromise = dbUtils.SelectPromise(connection, getIDquery);
        orderIDPromise.then(function (newOrderID) {
            orderid = newOrderID[0].OrderID;
            console.log("the new order id is: " + orderid);
        }).then(function () { //insert products in order to the OrderProducts table
            for (var i = 0; i < pList.length; i++) {
                var insertQuery = "INSERT INTO [dbo].[OrderProducts] VALUES ('" + orderid + "','" + pList[i].ProductID + "','" + pList[i].Amount + "','" + pList[i].ProductName + "','" + pList[i].Category + "','" + pList[i].PicturePath + "','" + pList[i].Price + "','" + pList[i].Manufacture + "','" + pList[i].Description + "')";
                dbUtils.Insert(insertQuery, config);
            }
            /*}).then(function () { //update the products inventory
             for (var i = 0; i < pList.length; i++) {
             var updateQuery = "UPDATE [dbo].[Products] SET AmountInStock = AmountInStock - '" + pList[i].Amount + "', AmountSold = AmountSold + '" + pList[i].Amount +"' WHERE ProductID = '" + pList[i].ProductID + "'";
             dbUtils.Update(updateQuery, config);
             }*/
        }).catch(function (err) {
            console.log(err);
        });
    }).catch(function (err) {
        console.log(err);
        res.send({ "executeOrder": false });
    });
    res.send({ "executeOrder": true });
});

//-------------------------------------------------------------------------------------------------------------------------------

app.post('/getPriceInNis', function (req, res) {
    var dollarPrice = req.body.price;
    var priceInNis = dollarPrice * 3.55;
    res.send({ "price in NIS": priceInNis });
});

//-------------------------------------------------------------------------------------------------------------------------------

app.post('/getRecommendedProd', function (req, res) {
    var username = req.body.username;
    var query = "SELECT ProductID, COUNT(ProductID) as sumToys FROM (SELECT ProductID FROM OrderProducts WHERE OrderID in \
        (SELECT OrderID FROM Orders WHERE Category in ( \
    SELECT Categories.CategoryName FROM Categories, UsersCategories, Users \
    WHERE UsersCategories.CategoryID = Categories.CategoryID and UsersCategories.UserID = Users.UserID and Users.UserName = '"+ username +"'))) \
        as aux GROUP BY aux.ProductID ORDER BY sumToys DESC";
    var myPromise = dbUtils.SelectPromise(connection, query);
    var recommendedIDs;
    var itemsProcessed = 0;
    var allresults = [];
    myPromise.then(function (recProducts) {
        recommendedIDs = recProducts;
    }).then(function () {
        if (recommendedIDs.length > 0) {
            for (var i = 0; i < recommendedIDs.length; i++) {
                var query = "SELECT Products.ProductID,Products.ProductName, Products.Category, Products.PicturePath, Products.Price, Products.Manufacture, Products.Description FROM Products WHERE Products.ProductID='" + recommendedIDs[i].ProductID + "'";
                dbUtils.SingleSelect(config, query, function (result) {
                    if (result.length > 0) {
                        allresults.push(result);
                        itemsProcessed++;
                        if (itemsProcessed == recommendedIDs.length) { //if this call was the last and we excute all the functions
                            res.send(allresults);
                        }
                    }
                });
            }
        }
        else{
            res.send({ "getRecommendedProd": false });
        }
    }).catch(function (err) {
        console.log(err);
        res.send({ "getRecommendedProd": false });
    });

});