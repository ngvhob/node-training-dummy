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
  })
  .catch(err => {
    console.log(err);
    console.log(DB);  
  });

const app = require(`./app`);
const port = process.env.PORT;

// console.log(process.env);
app.listen(port, () => {
  console.log(`App Running On Port ${port}....`);
});
