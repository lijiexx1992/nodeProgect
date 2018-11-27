var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'express' });
});

// //打开是到登陆页面
router.get('/loging.html', function(req, res) {
  res.render('loging');
});

// //点击注册跳转到注册页面 localhost:3000/register.html
router.get('/register.html', function(req, res, next) {
  res.render('register');
});

// router.get('/users.html',function(req,res){
//   res.render('users');
// }); 

router.get('/brand.html',function(req,res){
  res.render('brand');
});

router.get('/phone.html',function(req,res){
  res.render('phone');
})

module.exports = router;
