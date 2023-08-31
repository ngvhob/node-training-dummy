const Tour = require('./../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasGetTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingAverage';
  req.query.fields = 'ratingAverage,name,duration,price';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    let features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const Tours = await features.query;
    res.status(200).json({
      status: 'success',
      requestedAt: requestedAt,
      count: Tours.length,
      data: {
        Tour: Tours
      }
    });
  } catch (err) {
    res.status(404).json({
      message: {
        status: ['fail'],
        message: err.message
      }
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const headers = req.body;
    const newTour = await Tour.create(headers);
    res.status(201).json({
      status: 'Success',
      message: 'New Tour Created',
      data: {
        Tour: newTour
      }
    });
  } catch (err) {
    res.status(500).json({
      message: {
        status: ['fail', 'Invalid Data sent !'],
        message: err.message
      }
    });
  }
};

exports.getTourByPara = async (req, res) => {
  try {
    const query = req.params.id;
    const newTour = await Tour.findById(query);
    res.status(200).json({
      status: 'success',
      requestedAt: requestedAt,
      data: {
        Tour: newTour
      }
      // results: tours.length,
      // data: { tours: tours }
    });
  } catch (err) {
    res.status(404).json({
      message: {
        status: ['fail'],
        message: err.message
      }
    });
  }
  // const data = tours.find(el => el.id === query);
  // if(query > tours.length){return  res.status(404).json({status: "Fail",message: "Not Found"})}console.log(req.params);
  // res.status(201).json({
  //   status: 'successfull'
  //   // data: { tour: data }
  // });
};

exports.updateTour = async (req, res) => {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(500).json({
      message: {
        status: ['fail'],
        message: 'No data Given'
      }
    });
    return;
  } // Check If No Data Given For Update
  try {
    const query = req.params.id;
    const newTour = await Tour.findByIdAndUpdate(query, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      requestedAt: requestedAt,
      data: {
        Tour: newTour
      }
      // results: tours.length,
      // data: { tours: tours }
    });
  } catch (err) {
    res.status(404).json({
      message: {
        status: ['fail'],
        message: err.message
      }
    });
  }
  // const find = tours.find(el => el.id === query);
  // res.send(find);
};

exports.deleteTour = async (req, res) => {
  // const query = parseInt(req.params.id);
  // const find = tours.find(el => el.id === query);
  try {
    const query = req.params.id;
    const newTour = await Tour.findByIdAndDelete(query);
    res.status(204).json({
      status: 'success',
      requestedAt: requestedAt,
      data: {
        message: `${query} Deleted`
      }
    });
  } catch (err) {
    res.status(500).json({
      message: {
        status: ['fail'],
        message: err.message
      }
    });
  }
  // return res.status(204).json({
  //   data: null
  // message: `Ready to delete ${find.id}`
  // });
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: `$difficulty` },
          numTours: { $sum: 1 },
          numRating: { $sum: `$ratingsQuantity` },
          avgRating: { $avg: `$ratingAverage` },
          avgPrice: { $avg: `$price` },
          minPrice: { $min: `$price` },
          maxPrice: { $max: `$price` }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match : { _id: {$ne: 'DIFFICULT'}}
      // }
    ]);

    res.status(200).json({
      status: 'success',
      requestedAt: requestedAt,
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(500).json({
      message: {
        status: ['fail'],
        message: err.message
      }
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const monthNames = [
      ,
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          Tours: {
            $push: '$name'
          }
        }
      },
      {
        $addFields: {
          month: '$_id'
        }
      },
      {
        $addFields: {
          monthName: {
            $let: {
              vars: {
                monthsInString: monthNames
              },
              in: {
                $arrayElemAt: ['$$monthsInString', '$month']
              }
            }
          }
        }
      },
      {
        $project: { _id: 0 }
      },
      {
        $sort: {
          numTourStarts: -1
        }
      },
      {
        $limit: 1
      }
      // }
      // {
      //   $project: { startDates: 1 }
      // },
      // {
      //   $sort: {
      //     startDates: 1
      //   }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      requestedAt: requestedAt,
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(500).json({
      message: {
        status: ['fail'],
        message: err.message
      }
    });
  }
};

// exports.getAllTours = async (req, res) => {
//   try {
// let newTour = Tour.find(JSON.parse(queryObjStr));
// // SORT RESULTS
// if(req.query.sort){
//   const sortBy = req.query.sort.split(',').join(' ');
//   newTour = newTour.sort(sortBy);
// }else{
//   newTour = newTour.sort('-createdAt');
// }
// // LIMIT FIELDS
// if(req.query.fields){
//   // const fields = req.query.fields.split(',').join(' ');
//   const fields = req.query.fields.replace(/\b(,)\b/g, ` `);
//   console.log(fields);
//   newTour = newTour.select(fields);
// }else{
//   newTour = newTour.select('-__v');
// }0
// // PAGINATE AND LIMIT
// const paginate = {
//   // skip: parseInt(req.query.page) || '',
//   // limit:  parseInt(req.query.limit) || ''
//   skip: ((req.query.page*1 || 1)-1)*req.query.limit,
//   limit:  req.query.limit*1 || 100
// }
// if(req.query.page || req.query.limit){
//   const tourCount = await Tour.countDocuments();
//   if(paginate.skip >= tourCount) throw Error('This Page Does Not Exist.');
//   // const skipLog = (paginate.skip - 1)*paginate.limit;
//   console.log(paginate);
//   newTour = newTour.skip(paginate.skip).limit(paginate.limit);
// }else{
//   newTour = newTour.select('-__v');
// }

// const Tours = await newTour;
// res.status(200).json({
//   status: 'success',
//   requestedAt: requestedAt,
//   count: Tours.length,
//   data: {
//     Tour: Tours
//   }
// results: tours.length,
// data: { tours: tours }
//     });
//   } catch (err) {
//     res.status(404).json({
//       message: {
//         status: ['fail'],
//         message: err.message
//       }
//     });
//   }
// };

// exports.checkId = (req, res, next, val) => {
//   // console.log(`This is the ${val}`);
//   const data = tours.find(el => el.id === parseInt(val));
//   if (!data) {
//     return res.status(404).json({
//       status: 'Fail',
//       message: 'Not Found'
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 400,
//       message: 'Bad Request ! Missing Price Or Name'
//     });
//   }
//   next();
// };

// exports.createTour = (req, res) => { // OLD Method For FS
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/../dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     error => {
//       res.status(201).json({
//         status: 'successfull',
//         data: { tour: error }
//       });
//     }
//   );
// };