const fs = require('fs');

const user = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'Success',
    data: { users: user },
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Server Error',
    message: 'Route Not defined',
  });
};

exports.getUserByPara = (req, res) => {
  res.status(500).json({
    status: 'Server Error',
    message: 'Route Not defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'Server Error',
    message: 'Route Not defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'Server Error',
    message: 'Route Not defined',
  });
};
