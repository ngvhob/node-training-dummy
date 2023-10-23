const Tour = require('./../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handleFactory');
const AppError = require('../utils/AppError');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[0] === 'image') {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file! Only images allowed.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadImage = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// upload.array('images', 3)

exports.resizeTourPhotos = catchAsync(async (req, res, next) => {
  console.log(req.params);
  if (!req.files && !req.files.imageCover && !req.files.images) {
    return next();
  }
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  // COVER
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({
      quality: 90
    })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  // IMAGES
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({
          quality: 90
        })
        .toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    })
  );

  next();
});

exports.aliasGetTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingAverage';
  req.query.fields = 'ratingAverage,name,duration,price';
  next();
};

exports.getAllTours = Factory.getAll(Tour);

exports.createTour = Factory.createOne(Tour, 'Tour not created!');

exports.getTourByPara = Factory.getOne(Tour, {
  path: 'reviews',
  select: 'review'
});

exports.updateTour = Factory.updateOne(Tour);

exports.deleteTour = Factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res) => {
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
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
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
    }
    // {
    //   $limit: 1
    // }
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
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, lonlat, unit } = req.params;
  const [lat, lon] = lonlat.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lon || !lat) {
    next(
      new AppError(
        'Please provide longitude and latitude in the format lon,lat',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lon, lat], radius] } }
  });
  res.status(201).json({
    Status: 'success',
    Results: tours.length,
    Document: tours
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { lonlat, unit } = req.params;
  const [lat, lng] = lonlat.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lng || !lat) {
    next(
      new AppError(
        'Please provide longitude and latitude in the format lon,lat',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);
  res.status(200).json({
    Status: 'success',
    Results: distances.length,
    Document: distances
  });
});

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
