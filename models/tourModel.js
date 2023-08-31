const mongoose = require('mongoose');
const slugify =  require('slugify');
const validator = require('validator');
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A Tour Must Have A Name.'],
    unique: true,
    trim: true,
    minlength: [10, 'A Tour name must hame atleast 10 characters'],
    maxlength: [40, 'A Tour name must not be more then 40 characters'],
    // validate: [validator.isAlpha, 'Tour Name Must Contain Only Characters']
  },slug: {
    type: String,
    default: function(){
      return slugify( this.name, {lower : true});
    }
  }
  ,duration: {
    type: Number,
    required: [true, 'A Tour Must Have Duration.']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A Tour Must Have A Group Size.']
  },
  difficulty: {
    type: String,
    required: [true, 'A Tour Must Have A Difficulty'],
    enum: {
    values : ['easy', 'medium', 'difficult'],
    message: 'Difficulty can only be easy, medium and difficult'
  }
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Ratings cannot be less then 1.0'],
    max: [5, 'Ratings cannot be more then 5.0']
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A Tour Must Have Price.']
  },
  priceDiscount: {
    type:Number,
    validate: {
      validator: function(){
        return this.priceDiscount < this.price // 100 < 200 -> true
      },
      message: 'Discount Value Can Not Be More Then Tour Price!'
    }

  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A Tour Must Have Summary.']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A Tour Must Have A Image.']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  }
},{toJSON: {virtuals: true}});

tourSchema.virtual('durationWeeks').get(function(){
  return Math.round(this.duration/7);
});

// DOCUMENT MIDDLEWARE //
// tourSchema.pre('save', function(next){
//   this.slug = slugify(this.name, {lower : true});
//   next();
// })

// tourSchema.pre('save', function(next){
//   console.log("Something is about to be saved");
//   next();
// })

// tourSchema.post('save', function(doc,next){
//   console.log(doc);
//   next();
// })

// QUERY MIDDLEWARE
// tourSchema.pre(/^find/, function(next) {
//   this.find({secretTour: {$ne : true}});
//   this.start = Date.now();
//   next();
// });

// tourSchema.post(/^find/, function(doc,next) {
//   console.log(`Time Taken = ${Date.now() - this.start} ms`); 
//   console.log(doc); 
//   next();
// });

// // AGGREGATION MIDDLEWARE
// tourSchema.post('aggregate', function(doc,next) {
//   this.pipeline().unshift({$match : {secretTour: {$ne : true}}});
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
