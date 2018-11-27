var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//引入暴露出来的arr
var ignoreRouter=require('./config/ignoreRouter')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//自己实现中间件，用来判断登录
app.use(function(req,res,next){
  //需要排除登陆页面与注册页面,可以把一些不需要锁定的页面可以直接忽略，创建一个ignoreRouter.js文件
  //排除登陆和注册 页面
  if(ignoreRouter.indexOf(req.url) > -1){
    next();
    return;
  }
  //请求时获取cookie req.cookies，可以直接得到具体的值
  var nickname = req.cookies.nickname;
  //console.log(req.cookies.nickname)
  if(nickname){
    //如果存在就执行下一个页面
    next();
  }else{
    //如果不存在就直接跳转回登录页面
    res.redirect('/loging.html');
  }
  //中间件向下执行
  //next();
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
