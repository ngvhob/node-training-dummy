# MangoDB Connection To Shell

> 1. Open Termainal and Run Command ie.
>    ./mongosh.exe mongosh "mongodb+srv://cluster0.yxks0vb.mongodb.net/natours" --apiVersion 1 --username vaibhav_singhTM

# MangoDB Connection To Mongoose

> 1. npm i mongooose to install nongoose package
> 2. const mongoose = require('mongsoose')
> 3. mongoose.connect(DB, {options}); // DB => connetion string for node, option's for example are useNewUrlParser: true,
>    useCreateIndex: true,useFindAndModify: false in key and boolean value format.

# MangoDB Creating Schema and more

> 1. Using method Scema over Mongoose object we can do various schema related operations.
>    ie. const tourSchema = new mongoose.Schema({name: {

    type: String,  //Number, Boolean
    required: true, // false/true
    default: Test // if this key remains unfilled of request does not contain data related to name than a default value will be assigned.

}})

> 2. Creating new model out of a created Schema

# Modifying File Structure Into MVC Pattern

> 1. Defining folders :-
>    > 1. Controllers -> [tourController.js , userController.js] -- C
>    > 2. Model -> [tourModel.js , userModel.js] -- M
>    > 3. Routes -> [tourRouters.js , userRouters.js] -- R

> 2. Changing APP starting process by shifting DB Connection and Start Server Method Into One File And Importinmg Express App After DB Connection Has been Established.

# Creating API To Do CRUD Operations

> 1. Creating Routes :-
>    > 1. Using express.Router() method

    const Router = express.Router();
    Router.route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour);
    // getAllTours,createTour method comes from importing tourController

> > 2. Using app.use() middler wale to add prefix to the route URI i.e.

        app.use('/api/v1/tours', tourRouter)
    // where tourRouter is an import from tourRoutes.

> > 3.  Using mongoose method to Add, Delete, Update, Read Data : -
> >     > 1. Tour.find() to read all data.
> >     > 2. Tour.create(headers) to create data.
> >     > 3. Tour.findById(query) to read by query or id.
> >     > 4. Tour.findByIdAndUpdate(query, req.body, {new: true,runValidators: true}) to update data which can take diffrent options such as retuning new Data as new: true, runValidators to check new data being feeded for validation errors and etc.
> >     > 5. Tour.findByIdAndDelete(query) to delete data by params or id.
> >     > 6. Headers = req.body, Query Params = req.params [req.params.id]

# Modified Tour Schema

Following fields Added

> duration: Number {Required},
> maxGroupSize: Number {Required},
> difficulty: String {Required},
> ratingAverage: Number {Def},
> ratingQuantity: Number {Def},
> priceDiscount: Number,
> summary: String {Required},
> description: String {Trim: True},
> imageCover: Array of String [String],{Required},
> images: Array of String [String],
> createdAt: Timestamp Date.now(),
> updatedAt: Timestamp Date.now(),
> startDates: Array of Date [Date]

# Seeding Tour Model Via "process.argv"

1. Importing fs, dotenv, mongoose & Tour Model.
2. Using mongoose method to insert data via a UDF importData = async()=>{
   try{
   await Tour.create(JSON.parse(tours));
   console.log('Data Successfullly Seeded !');
   }catch(err){
   console.log(err.message);
   }
   };
3. UDF deleteData to delete data
   const deleteData = async()=>{
   try{
   await Tour.deleteMany();
   console.log('Data Successfullly Deleted !');
   }catch(err){
   console.log(err.message);
   }
   }

4. Using process.argv to call method via terminal using extra option

if(process.argv[2] === '--import'){
importData();
} else if(process.argv[2] === '--delete'){
deleteData();
}
console.log(process.argv);

5. Commands used
   > > 1. To Import Data, node dev-data/data/import-dev-data.js --import
   > > 2. To delete data, node dev-data/data/import-dev-data.js --delete

# Filtering & Sorting data using queryStrings.

1.  To access Query String Inside Node We Can Use The query Method on req Object. i.e. req.query.
    Which will return all the params passed as query string in the URL itself.

2.  Using spread syntax to copy data from variable containing arraay/object of query strings key and values. And Filter them as per logic using delete operator delete el of query variable if values matches from the excludeFields array.

3.  Advanced filtering/sorting using mongoDb and regex gte => greater then or equal, gt => greater then, le => less than & lte => less then or equal.
    queryObjStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

4.  Multiple sorting via mongoDb using req.query.sort and js methods to replace strings passed as params to mongoDb readable sorting format. i.e. price,-ratingAverage becomes price -ratingAverage by using
    ('price,-ratingAverage').split(',').join(' ');

5.  Paginate using mongoDb skip and limit method i.e. newTour.skip(2).limit(5);
    _Using if statment to check weather the Total count of the Model is not less than the value inside skip i.e. Tour.countDocuments() returns 10 and in skip we have 20 hence throw New Error('Page Does Not Exists')_

6.  Refactoring API Features into one class APIFeatures and importing it as a module inside Tour controller

    > > class APIFeatures {

        constructor(query, queryString) {
          this.query = query;
          this.queryString = queryString;
        }

        filter() {
          const queryObj = { ...this.queryString };
          const excludeFields = ['limit', 'sort', 'page', 'fields'];
          excludeFields.forEach(el => delete queryObj[el]);
          let queryObjStr = JSON.stringify(queryObj);
          queryObjStr = queryObjStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            match => `$${match}`
          ); // \b to match exact value in regex

          this.query = this.query.find(JSON.parse(queryObjStr));
          return this;
        }

        sort() {
          if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
          } else {
            this.query = this.query.sort('-createdAt');
          }
          return this;
        }

        limitFields() {
          if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            // const fields = this.queryString.fields.replace(/\b(,)\b/g, ` `);
            this.query = this.query.select(fields);
          } else {
            this.query = this.query.select('-__v');
          }
          return this;
        }

        paginate() {
          const paginate = {
            // skip: parseInt(req.query.page) || '',
            // limit:  parseInt(req.query.limit) || ''
            skip: ((this.queryString.page * 1 || 1) - 1) * this.queryString.limit,
            limit: this.queryString.limit * 1 || 100
          };

          if (this.queryString.page || this.queryString.limit) {
            // const skipLog = (paginate.skip - 1)*paginate.limit;
            this.query = this.query.skip(paginate.skip).limit(paginate.limit);
          } else {
            // this.query = this.query.skip(paginate.skip).limit(paginate.limit);
          }
          return this;
        }

    }

> > Inside method :-

    let features = new APIFeatures(Tour.find(), req.query)

      .filter()
      .sort()
      .limitFields()
      .paginate();

7.  Using Aggregation Pipeline method on model to process data in stages.
    > > Stages
    1. $match => Matches data as per requirement i.e. $match: { ratingAverage: { $gte: 4.5 } }
    2. $group => It separates documents into groups according to a "group key _id". 
    The output is one document for each unique group key i.e. $group: {
       _id: { $toUpper: `$difficulty` },
       numRating: { $sum: `$ratingsQuantity` },
       avgRating: { $avg: `$ratingAverage` },
       }
    3. $sort => Sort data as per column name key name i.e. $sort: { avgPrice: 1 }
    4. $unwind => Distribute data as per the array provided, each element of array gets individual object. i.e. $unwind: '$startDates'
    5. $addFields => Add a perticular field to the Aggregation Pipeline result. 
    i.e. $addFields: {month: '$id'}
    6. $project: It works like limit field and limits the field visiblity. 
    i.e.  $project: { _id: 0 }
    7. $limit: 1 => limits the number of results. i.e. $limit: 12
    8. Example :-
       const plan=await Tour.aggregate([{$unwind:"$startDates"},{$match:{startDates:{$gte:new Date(`${year}-01-01`),\$lte:new Date(`${year}-12-31`)}}},{$group:{_id:{$month:"$startDates"},numTourStarts:{$sum:1},Tours:{$push:"$name"}}},{$addFields:{month:"$\_id"}},{$addFields:{monthName:{$let:{vars:{monthsInString:monthNames},in:{$arrayElemAt:["$$monthsInString","$month"]}}}}},{$project:{_id:0}},{$sort:{numTourStarts:-1}},{\$limit:1}]);

# Virtual properties

> When we don't want to save a type of data but might require for some operation we use virtual properties feature of MongoDb.
> To use virtual properties on model we can define it usinf Schema object inside model i.e.  
     tourSchema.virtual('durationWeeks').get(function(){
        return Math.round(this.duration/7);
     });
> To enable visiblity of virtual properties we have to add scema properties at the end of scema structure i.e. {toJSON: {virtuals: true}}

# MongoDb Middleware properties
> Pre middleware.hooks works before the event is fullfilled and has access to next method just like express next() that continues the flow to next middleware or piece of normal execution code. 

Types of MondoDb Middlewares/hooks
1. Document 

> i.e. tourSchema.pre('save', function(next){
      this.slug = slugify(this.name, {lower : true});
      next();
    })
> Post middleware.hooks works after the event is fullfilled access to next method just like pre method & doc method which consist the created document. 
note: post method does not have access to this keyword. 
i.e. tourSchema.post('save', function(doc,next){
      console.log(doc);
      next();
    })

2. Query

> PRE 
tourSchema.pre(/^find/, function(next) {
  this.find({secretTour: {$ne : true}});
    this.start = Date.now();
  next();
});

>POST
tourSchema.post(/^find/, function(doc,next) {
  console.log(`Time Taken = ${Date.now() - this.start} ms`); 
  console.log(doc); 
  next();
 });

3. Aggregation

> PRE 
tourSchema.post('aggregate', function(doc,next) {
   this.pipeline().unshift({$match : {secretTour: {$ne : true}}});
   console.log(this.pipeline());
   next();
});

>POST
tourSchema.post(/^find/, function(doc,next) {
  console.log(`Time Taken = ${Date.now() - this.start} ms`); 
  console.log(doc); 
  next();
 });

# Validation MongoDb/3rd Party Library
> minlength & maxlength => used to check length full fills a set value for strings.
> min & max => used to check value entered full fills a set value for int and date.
> enum => checks if the value entered is one the values entered as acceptable values.
> custom validator using validate field 
i.e 
validate: {
  validator: function(){
    return this.discount < this.price;
  },
  message: 'Test Message'
}
> Using 3rd party lib. like Validator. i.e validator.inAlpha, validator.isEmail