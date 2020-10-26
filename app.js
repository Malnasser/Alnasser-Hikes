const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Development loging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from thihs IP, Please Try again in an hour',
});
app.use('/api', limiter);

// Body Parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

// Data Sanitization again NoSQL Query Injection
app.use(mongoSanitize());

// Data sanitization against XXS
app.use(xss());

// clear up the query string
app.use(
  hpp({
    whihtelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Serving Static Files
app.use(express.static(`${__dirname}/public`));

// Serving Static File
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Test middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find  ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
