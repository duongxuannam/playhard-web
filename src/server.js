import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import path from 'path';

const app = express();



const port = process.env.PORT || 3000;

const http = require('http');
const server = http.Server(app);

//trigger auto build

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/frontend/build'));



server.listen(port, () => console.log(`> Ready on port ${port}`));




