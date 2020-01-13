var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test')
const session = require('express-session')
//import等语法要用到babel支持
require('babel-register')

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser('self-blog-node-cookie'));
app.use(session({
    secret: 'self-blog-node-cookie',
    name: 'session_id',//# 在浏览器中生成cookie的名称key，默认是connect.sid
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 60 * 1000 * 30, httpOnly: true} //过期时间
}))

const mongodb = require('./core/mongodb')
mongodb.connect()
const route = require('./routes')
route(app) // 初始化所有路由

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
