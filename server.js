require('dotenv').config();
const express = require ('express');
const { appendFile } = require('fs');

const path  = require ('path');
const cors = require('cors');
const app = express () ;
const apiRouter = require('./api/routes/apiRouter');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use ('/app', express.static (path.join (__dirname, '/public')));
app.use('/api', apiRouter)

let port = process.env.PORT || 3000;
app.listen(port);