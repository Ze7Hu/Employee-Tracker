const mysql = require("mysql2")

const connection = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // TODO: Add MySQL password here
    password: 'hussein123',
    database: 'company_db'
  },
  console.log(`Connected to the company_db database.`)
);
connection.connect(function(err){
  if (err) throw err;
});

module.exports= connection;

