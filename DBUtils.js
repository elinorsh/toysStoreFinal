var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Promise = require('promise');


//-------------------------------------------------------------------------------------------------------------------------------

exports.Update = function (updateQuery, config) {
    var connectionForUpdate = new Connection(config);
    connectionForUpdate.on('connect', function (err) {
        if (err) {
            console.log(err);
        } else {
            var request = new Request(updateQuery, function (err2, rowCount, rows) {
                if (err2)
                    console.log(err2);
            });
            connectionForUpdate.execSql(request);
        }
    });
};

//-------------------------------------------------------------------------------------------------------------------------------

exports.Select = function (connection, selectQuery, callback) {
    var req = new Request(selectQuery, function (err, rowCount) {
        if (err) {
            console.log(err);
            return;
        }
    });
    var res = [];
    var properties = [];
    req.on('columnMetadata', function (columns) {
        columns.forEach(function (column) {
            if (column.colName != null)
                properties.push(column.colName);
        });
    });
    req.on('row', function (row) {
        var item = {};
        for (i = 0; i < row.length; i++) {
            item[properties[i]] = row[i].value;
        }
        res.push(item);
    });

    req.on('requestCompleted', function () {
        console.log('request Completed: ' + req.rowCount + ' row(s) returned');
        callback(res);
    });
    connection.execSql(req); 
};

//-------------------------------------------------------------------------------------------------------------------------------

exports.SelectPromise = function (connection, selectQuery) {
    return new Promise(function (resolve, reject) {
        var req = new Request(selectQuery, function (err, rowCount) {
            if (err) {
                console.log(err);
                reject(err);
            }
        });
        var res = [];
        var properties = [];
        req.on('columnMetadata', function (columns) {
            columns.forEach(function (column) {
                if (column.colName != null)
                    properties.push(column.colName);
            });
        });
        req.on('row', function (row) {
            var item = {};
            for (i = 0; i < row.length; i++) {
                item[properties[i]] = row[i].value;
            }
            res.push(item);
        });

        req.on('requestCompleted', function () {
            console.log('request Completed: ' + req.rowCount + ' row(s) returned');
            resolve(res);
        });
        connection.execSql(req);
    });

};

//-------------------------------------------------------------------------------------------------------------------------------

//select that open new connection each time
exports.SingleSelect = function (config, selectQuery, callback) {
    var connectionSingleSelect = new Connection(config);
    connectionSingleSelect.on('connect', function (err) {
        var req = new Request(selectQuery, function (err, rowCount) {
            if (err) {
                console.log(err);
                return;
            }
        });
        var res = [];
        var properties = [];
        req.on('columnMetadata', function (columns) {
            columns.forEach(function (column) {
                if (column.colName != null)
                    properties.push(column.colName);
            });
        });
        req.on('row', function (row) {
            var item = {};
            for (i = 0; i < row.length; i++) {
                item[properties[i]] = row[i].value;
            }
            res.push(item);
        });

        req.on('requestCompleted', function () {
            console.log('request Completed: ' + req.rowCount + ' row(s) returned');
            callback(res);
        });
        connectionSingleSelect.execSql(req);

    });
};

//-------------------------------------------------------------------------------------------------------------------------------

exports.Insert = function (insertQuery, config) {
    var connectionForInsert = new Connection(config);
    connectionForInsert.on('connect', function (err) {
        if (err) {
            console.log(err);
        } else {
            var request = new Request(insertQuery, function (err2, rowCount, rows) {
                if (err2)
                    console.log(err2);
            });
            connectionForInsert.execSql(request);
        }
    });

};

//-------------------------------------------------------------------------------------------------------------------------------

exports.InsertPromise = function (connection, InsertQuery) {
    return new Promise(function (resolve, reject) {
            var req = new Request(InsertQuery, function (err, res) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(res);
                }
            });
            connection.execSql(req);
        });
};

//-------------------------------------------------------------------------------------------------------------------------------

exports.SingleInsert = function (selectQuery, config, callback) {
    var connectionSingleInsert = new Connection(config);
    connectionSingleInsert.on('connect', function (err) {
        var req = new Request(selectQuery, function (err, rowCount) {
            if (err) {
                console.log(err);
                return;
            }
        });
        var res = [];
        var properties = [];
        req.on('columnMetadata', function (columns) {
            columns.forEach(function (column) {
                if (column.colName != null)
                    properties.push(column.colName);
            });
        });
        req.on('row', function (row) {
            var item = {};
            for (i = 0; i < row.length; i++) {
                item[properties[i]] = row[i].value;
            }
            res.push(item);
        });

        req.on('requestCompleted', function () {
            console.log('request Completed: ' + req.rowCount + ' row(s) returned');
            callback(res);
        });
        connectionSingleInsert.execSql(req);

    });
};

//-------------------------------------------------------------------------------------------------------------------------------

