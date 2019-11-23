const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy'); //heroku

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.example.com, front-end example.com
// app.use(cors({
//   origin: 'https://www.example.com'
// }));

//preflight phase for non-simple (get, post) requests (put, patch, delete)
app.options('*', cors());
app.options('/api/v1/tours/:id', cors());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Serving static files
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP Headers
app.use(helmet());

//Liimit 100 reqs for same ip in 1 hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
); //body must to be raw, must to be before we called body parser

// Development logging
if (process.env.NODE_ENV === 'development') {
  //хоть и инициализация в файле сервер.жс, но доступ к переменным процесса может быть везде
  app.use(morgan('dev'));
}

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //parses data from body to json
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //parses data from url encoded form //in our case for router.post('/submit-user-data', viewsController.updateUserData);

app.use(cookieParser()); //parses data from cookies

//Data sanitization against NoSQL query injection (in json send for ex: $gt: "")
app.use(mongoSanitize());

//Data sanitization against XSS (ex: name: <div id='bad'></div>)
app.use(xss());

//Prevent parameter pollution for ex: sort=price&sort=duration
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression()); //for compress responses (json, text)

// Test middleware
app.use((req, res, next) => {
  //console.log('middleware');
  req.myRequestTime = new Date().toISOString();
  //console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// 3) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl}`, 404)); //если некст с параметром - значит в параметре указывается ошибка
});

app.use(globalErrorHandler);

//sendgrid doesnt work without this (self signed certificate in certificate chain)
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

module.exports = app; //чтобы в server.js прописать, и с него стартовать
