const express = require('express');

const Router = require('./routers/bird.js');
const adminRouter = require('./routers/admin.js');
const requestLogger = require('./middleware/request-logger.js');
const errorHandler = require('./middleware/error-handler.js');
const login_check = require('./middleware/login_check.js');
const limiter = require('./middleware/limiter.js');
const auth = require('./routers/auth.js');
const cors = require('cors');
const bearerToken = require('express-bearer-token');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const helmet = require('helmet');
const expressSanitizer = require('express-sanitizer');
const bodyParser = require('body-parser');
const { xss } = require('express-xss-sanitizer');
const app = express();
app.use(bodyParser.json({limit:'1kb'}));
app.use(bodyParser.urlencoded({extended: true, limit:'1kb'}));
app.use(xss());
app.use(expressSanitizer());
// security
app.use(helmet.frameguard());

//swagger
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument));

// cors
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:8080'],
}))

// csrf
// app.use(cookieParser())
// app.use(express.urlencoded({ extended: false }))
// app.use(cookieParser())
// app.use(csurf({ cookie: true }))
// app.get('/api/csrfToken',function(req, res, next){
//   res.cookie('XSRF-TOKEN', req.csrfToken())
//   res.json({
//     "status":"success",
//     "CSRF-Token":req.csrfToken()
//   });
// });

// frontend
app.use(
  express.static('dist', {
    setHeaders: (res, path, stat) => {
      res.set('Cache-Control', 'public, s-maxage=86400');
    },
  })
);
app.use('/resetPassword', express.static('resetPassword'));
//session setting
// const sessionDBaccess = new sessionPool({
//     user: process.env.PG_USERNAME,
//     password: process.env.PG_PASSWORD,
//     host: process.env.PG_HOSTNAME,
//     port: process.env.PG_PORT,
//     database: process.env.PG_DB_NAME
// });

// const sessionConfig = {
//   store: new pgSession({
//         pool: sessionDBaccess,
//         tableName: 'session'
//   }),
//   name: 'SID',
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//         maxAge: 1000 * 60 * 60 * 24 * 7,
//         aameSite: true,
//         secure: false // ENABLE ONLY ON HTTPS
// }}
// app.set('trust proxy', true);
// app.use(session(sessionConfig))

//router and middleware
app.use(limiter)
app.use(bearerToken({
  bodyKey: 'access_token',
  queryKey: 'access_token',
  headerKey: 'Bearer',
  reqKey: 'token',
  cookie: false, 
}))

app.use(requestLogger)
app.use('/api', auth.router_nonLogin);
app.use(login_check);
app.use('/api', auth.router_Login);
app.use('/api', Router);
app.use('/api', adminRouter);
app.use(errorHandler);

const port = 8080;
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}...`);
});
