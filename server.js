'use strict'

const express    = require('express');
const helmet     = require('helmet');
const bodyParser = require('body-parser');
const mongo      = require('mongodb').MongoClient;
const mongoose   = require('mongoose');
const route      = require('./app/route.js');

const app = express();
const http = require('http').Server(app);

app.use((req, res, next) => {
  console.log(req.method + " " + req.path + " - " + req.ip);
  next();
});

app.use(helmet());
app.set('view engine', 'pug');
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

mongo.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err, database) => {
  if (err) console.log("Error: " + err);
  else {
    route(database.db('fcc_challenges_db'), app);
    
    http.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port: " + process.env.PORT);
    });
  }
});
