var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var async=require('async');
var router = express.Router();
var url = 'mongodb://127.0.0.1:27017';


//打开是到登陆页面
//location:3000/users
router.get('/', function (req, res, next) {
  //发送连接请求
  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, client) {
    if (err) {
      console.log('连接失败', err);
      res.render('error', {
        message: '连接数据库失败',
        error: err
      });
      return;
    }
    //连接数据库名
    var db = client.db('project');
    //查询集合，用数组的方式暴露出来
    db.collection('user').find().toArray(function (err, data) {
      //错误处理优先 
      if (err) {
        console.log('查询用户数据失败', err);
        res.render('error', {
          message: '查询用户数据失败',
          error: err
        })
      } else {
        console.log('查询数据库成功', data);
        //跳转到用户页面
        res.render('users', {
          list: data
        });
      }
      //关闭数据库
      client.close();
    })
  });
});



//点击注册跳转到注册页面
// router.get('/register.html', function (req, res, next) {
//   res.render('register');
// });

//登陆操作
router.post('/loging', function (req, res) {
  //1，获取前端传递过来的参数
  //console.log(req.body)
  var username = req.body.name;
  var password = req.body.password;
  //2.验证参数的有效性
  if (!username) {
    res.render('error', {
      message: '用户名不能为空',
      error: new Error('用户名不能为空')
    })
    return;
  }
  if (!password) {
    res.render('error', {
      message: '密码不能为空',
      error: new Error('密码不能为空')
    })
    return;
  }

  //3.连接数据库做验证，是否允许登陆
  MongoClient.connect(url, {useNewUrlParser: true}, function (err, client) {
    if (err) {
      console.log('连接失败');
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('project');
    //第一种写法：根据获取条数来验证登陆，有缺陷
    // db.collection('user').find({
    //   username: username,
    //   password: password
    // }).count(function (err, num) {
    //   if (err) {
    //     console.log('查询失败');
    //     res.render(err, {
    //       message: '查询失败',
    //       error: err
    //     })
    //   } else if (num > 0) {
    //     //登陆成功写入cookie
    //     res.nickname.cookie


    //     //登陆成功,跳转到localhost:3000
    //     res.redirect('/')
    //   } else {
    //     //登陆失败
    //     res.render('error', {
    //       message: '登陆失败',
    //       error: new Error('登陆失败 ')
    //     })
    //   }
    // })
      db.collection('user').find({
        username:username,
        password:password
      }).toArray(function(err,data){
          if(err){
            console.log('查询失败');
            res.render('error',{
              message:'查询失败',
              error:err
            })
          }else if(data.length<=0){
            //没找到数据登陆失败为一个空数组
          }else{
            res.cookie('nickname',data[0].nickname,{
              //cookie有效时间
              maxAge:60*60*1000
            })
            res.redirect('/');
          }
      })
    client.close();
  })


})


//注册操作
router.post('/register',function(req,res){
    var name=req.body.name;
    var pwd=req.body.password;
    var nickname=req.body.nickname;
    var age=parseInt(req.body.age);
    var sex=req.body.sex;
    var isAdmin=req.body.isAdmin==='是'?true:false;
    //检查输入要素是否成功获取
    //console.log(name,pwd,nickname,age,sex,isAdim);
    //res.send('');

    //用户非空验证
   if (!name) {
    res.render('error', {
      message: '用户名不能为空',
      error: new Error('用户名不能为空')
    })
    return;
  }
  if (!pwd) {
    res.render('error', {
      message: '密码不能为空',
      error: new Error('密码不能为空')
    })
    return;
  }
  
    //获取的数据存入数据库
    MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
      if(err){
        res.render('error',{
          message:'连接失败',
          error:err
        })
        return;
      }

      var db = client.db('project');
      //var db = client.db('project');
      //把验证的放在串行无关联中验证
      async.series([
        function(cd){
            //用用户唯一验证
          db.collection('user') .find({username:name}).count(function(err,num){
            if(err){
              cd(err);
            }else if(num>0){
              //账号已存在
              cd(new Error('已经注册过了'));
            }else{
              //账号未注册
              cd(null);
            }
          })
        },
        function(cd){
          //插入一条数据到注册信息当中
          db.collection('user').insertOne({
                    username:name,
                    password:pwd,
                    nickname:nickname,
                    sex:sex,
                    age:age,
                    isAdmin:isAdmin
          },function(err){
            if(err){
              cd(err)
            }else{
              cd(null)
            }
          })
        }
      ],function(err,result){
        if(err){
          res.render('error',{
            message:'错误',
            error:err
          })
        }else{
          res.redirect('/loging.html')
        }
        //不管成功还是失败都需要关闭数据库连接
        client.close();
      })
    })



    // MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
    //   if(err){
    //     res.render('error',{
    //       message:'连接失败',
    //       error:err
    //     })
    //     return;
    //   }
    //   var db=client.db('project');
    //   db.collection('user').insertOne({
    //     username:name,
    //     password:pwd,
    //     nickname:nickname,
    //     sex:sex,
    //     age:age,
    //     isAdmin:isAdmin
    //   },function(err){
    //     if(err){
    //       //注册失败
    //       console.log(err)
    //       res.render('error',{
    //         message:'注册失败',
    //         error:err
    //       })
    //     }else{
    //       //注册成功，跳转到登录页面
    //       res.redirect('/loging.html');
    //     }
    //     client.close();
    //   })
    // })



})

module.exports = router;