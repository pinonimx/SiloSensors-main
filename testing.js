var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var config = {
    server: 'localhost/SQLEXPRESS01',
    authentication: {
        type: 'default',
        options: {
            userName: 'node',
            password: '********'
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: false,
        database: 'master'  //update me
    }
};
var connection = new Connection(config);

let result = [];

function executeStatement() {
    
    var request = new Request("SELECT IPAddress FROM TankData;", function(err) {
        if (err) {
            console.log(err);
        }  
    });
    
    request.on('row', function(columns) {
        columns.forEach(function(column) {
          if (column.value === null) {
            console.log('NULL');
          } else {
            result.push(column.value);
          }
        });
    });
        

    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        connection.close();
    });
    
    connection.execSql(request);
}

connection.on('connect', function(err) {
    
    console.log("Connected");
    executeStatement();
    
    
});


//connection.connect();

//function delay(ms) {
//    return new Promise(resolve => setTimeout(resolve, ms));
//}
//
//async function logAfterDelay() {
//    await delay(5000);
//    console.log(result)
//}
//
//logAfterDelay()


async function webScrapAll () {
    await connection.connect();
    console.log(result)
}

webScrapAll()
