const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT REJECTION Shutting down...');
  console.log(err.name, err.message);

  process.exit(1); //0 - ok, 1 - exception
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    //локальная
    //.connect(process.env.DATABASE_LOCAL, {
    //без объяснений, надо юзать всегда
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(con => {
    //console.log(con.connections);
    console.log('connection db success');
  });

//console.log(process.env);

console.log(process.env.NODE_ENV);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running..`);
});

//async, ex: connection to db
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION Shutting down...');
  server.close(() => {
    process.exit(1); //0 - ok, 1 - exception
  });
});

// shut down - сигнал который приведет к отрубанию, heroku
process.on('SIGTERM', () => {
  console.log('😃 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    //
    console.log('😆 process terminated!');
  });
});
