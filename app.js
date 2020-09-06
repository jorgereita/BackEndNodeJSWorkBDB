var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const fs = require('fs');
// const msg_error = JSON.parse(fs.readFileSync('msg_error.json'));
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '120mb'}));
app.use(bodyParser.urlencoded({limit: '120mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//-----------------------Aquise adicionan las paginas con riesgo de seguridad--------------------//

var routes = require('./routes/login');
app.use('/', routes);
app.use('/pageError',routes);
app.use('/olvidoContrasenia',routes);

var users = require('./routes/users');
app.use('/users', users);

var index = require('./routes/index');
app.use('/integrity', index);

var cambioContrasena = require('./routes/cambioContrasena');
app.use('/cambioContrasena', cambioContrasena);


//-----------------------////////////////////////////////////////////////////--------------------//
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log(err);
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log(err);
        res.status(err.status || 500);
        res.render('/pageError', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.render('/pageError', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
