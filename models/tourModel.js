const moongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new moongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, 'A tour most have a name'],
    maxlength: [40, 'A tour name must have less or equal then 40 charachers'],
    minlength: [10, 'A tour name must have more or equal then 10 charachers'],
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a maxGroupSize'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Diffucility is either: easy, medium, difficult.',
    }
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should below regular price',
    },
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    min: [5, 'Rating must be below 5.0'],
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour most have a price'],
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false,
  }
}, 
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {lower: true});
  next();
})

tourSchema.pre(/^find/, function(next) {
  this.find({secretTour: {$ne: true}});
  next();
})

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({$match: { secretTour: {$ne: true} } });
  next();
})

const Tour = moongoose.model('Tour', tourSchema);

module.exports = Tour;