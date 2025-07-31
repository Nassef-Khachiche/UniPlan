const { createServer } = require("http");
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const path = require('path');

const port = 8080;
const app = express();

// Create app
const server = createServer(app);

app.use(
    session({
        secret: "secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
        }
    })
);

//sets up a middleware function so the server can use the JSON from requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Static files to be used in memory for example files
app.use(express.static("."));

// Set view engine
app.set("view engine", "ejs");
app.set('views', 'views');

// It sets up all the routes with the correct controller
app.use('/', require('./router'));

server.listen(port, () => {
    console.log(`Dropsyncr is live on port ${port}`);
});