const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./../../models/userModel');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');

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

// READ JSON FILE
const users = fs.readFileSync(`${__dirname}/users.json`, 'utf-8');
const tours = fs.readFileSync(`${__dirname}/tours.json`, 'utf-8');
const reviews = fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8');
// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await User.create(JSON.parse(users, { validateBeforeSave: false }));
    await Tour.create(JSON.parse(tours));
    await Review.create(JSON.parse(reviews));
    console.log('Data Successfullly Seeded !');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Tour.deleteMany();
    await Review.deleteMany();
    console.log('Data Successfullly Deleted !');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
