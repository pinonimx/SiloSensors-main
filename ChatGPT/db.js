// db.js
const sql = require('mssql');

// Configure the database connection
const config = {
    server: 'localhost/SQLEXPRESS01',
    authentication: {
        type: 'default',
        options: {
            userName: 'node',
            password: 'M1ghty4V3ng3rs!'
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: false,
        database: 'master'  //update me
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => console.log('Database connection failed: ', err));

module.exports = {
    sql, poolPromise
};
