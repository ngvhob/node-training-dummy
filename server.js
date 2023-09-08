// process.on('uncaughtException', error => {
//   console.log(error.name);
//   console.log('Uncaught Exception , Application Stopped.');
//   process.exit(1);
// });


const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB Connected.');
  });

const app = require(`./app`);
const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`App Running In ${process.env.NODE_ENV} On Port ${port}....`);
});

process.on('unhandledRejection', error => {
  console.log(error.name);
  console.log('Unhandled Rejection, Application Stopped.');
  server.close(() => {
    process.exit(1);
  });
});
