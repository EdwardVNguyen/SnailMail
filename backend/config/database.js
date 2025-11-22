import mysql from 'mysql2';

const dbConfig = {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "password",
    database: "post_office_db",
    multipleStatements: true
};

const connection = mysql.createConnection(dbConfig);

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log("Connected to MySQL database!");
});

export default connection;