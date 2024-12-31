var Camera = require('webcamera');
var fs = require('fs');
var os=require('os')
var express = require("express");
var crypto = require('crypto');

var phantomPath = "./node_modules/phantomjs/bin/phantomjs";
phantomPath += /window/i.test(os.type()) ? ".exe" : "";
var camera = Camera.create({
  phantom : phantomPath
});

// 当处理速度比调用速度低时会触发此事件
camera.on('overload', function(listLength) {
  //listLength为排队等待处理的长度
  console.log('['+formatTime()+']',"overload", listLength)
});
function validateUrl(url) {
  var regexp = new RegExp("((http[s]{0,1}|ftp)://)?[a-zA-Z0-9\\.\\-]+\\.([a-zA-Z]{2,4})(:\\d+)?(/[a-zA-Z0-9\\.\\-~!@#$%^&*+?:_/=<>]*)?", "gi");
  return regexp.test(url)
}
function analyseName(url) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(url);
  return md5sum.digest('hex') + '.png';
}
function pad(num, n) {  
    var len = num.toString().length;  
    while(len < n) {  
        num = "0" + num;  
        len++;  
    }  
    return num;  
}  
function formatTime(t){
  var t=t||new Date();
  var ts=t.getFullYear()+"-"+(t.getMonth()+1)+"-"+t.getDate()+" "+pad(t.getHours(),2)+":"+pad(t.getMinutes(),2)+":"+pad(t.getSeconds(), 2)+":"+pad(t.getMilliseconds(), 3);
  return ts;
}
var startTime = new Date();
var app = express();

app.set('jsonp callback name', 'cb');
app.use(function(req, res, next) {
  console.log('['+formatTime()+']',req.method, req.url);
  next();
});
// 首页和使用示例
app.get('/', function(req, res) {
  var str = '<html><head><title>Usage</title></head><body><h1>Usage:</h1>'
  str += '<h4><a href="/capturePageDownload?url=https%3A%2F%2Flogin-beta.huawei.com%2Flogin%2F">/capturePageDownload?url=encodeURIComponent("https://login-beta.huawei.com/login/")</a></h4>'
  str += '<h4><a href="/capturePageDownload?url=http%3A%2F%2Fw3m.huawei.com%2Fm%2Fservlet%2Findex&fileName=w3m-huawei.png">/capturePageDownload?url=encodeURIComponent("http://w3m.huawei.com/m/servlet/index")&fileName=baidu.png</a></h4>'
  str += '<h4><a href="/capturePageShow?url=http%3A%2F%2Fw3m.huawei.com%2Fm%2Fservlet%2Findex">/capturePageShow?url=encodeURIComponent("http://w3m.huawei.com/m/servlet/index")</a></h4>'
  str += '<h4><a href="/capturePageShow?url=http%3A%2F%2Fwww.baidu.com&waitTime=8000">/capturePageShow?url=encodeURIComponent("http://www.baidu.com")&waitTime=8000</a></h4>'
  str += '<h4><a href="/capturePageBase64JSON?url=http%3A%2F%2Fwww.baidu.com">/capturePageBase64JSON?url=encodeURIComponent("http://www.baidu.com")</a></h4>'
  str += '<h4><a href="/capturePageBase64JSON?url=http%3A%2F%2Fw3m.huawei.com%2Fm%2Fservlet%2Findex&waitTime=8000">/capturePageBase64JSON?url=encodeURIComponent("http://w3m.huawei.com/m/servlet/index")&waitTime=8000</a></h4></body></html>'
  res.end(str)
})
// 获取截图并下载图片文件 
app.get('/capturePageDownload', function(req, res) {
  var url = req.query.url;
  var startTime=new Date();
  if (!validateUrl(url)) {
    console.log('[%s] url format error  [%s] not validated',formatTime(),url);
    res.json({
       error: 'url format error',
            message:  'url ['+url + '] not validated'
    })
  } else {
    camera.shotStream(url, {
      renderDelay: 6000
    }, function(err, s) {
      s.on('error',function (err) {
        console.log('[%s] get ScreenShot fail',formatTime(),err)
        res.send('error:get ScreenShot fail'+err).end()
      })
        var fileName = req.query.fileName || analyseName(url);
        res.attachment(fileName);
        s.pipe(res)
        s.on('end', function() {
          res.end();
          console.log('[%s] "%s" => %s cost %ss size %skb',formatTime(),url,fileName,(new Date()-captureStart)/1000,responseMsg.length/1024);
        });
    });
  }
});
// 获取截图并显示图片
app.get('/capturePageShow', function(req, res) {
    var captureStart=new Date();
    var url = req.query.url;
    var waitTime=req.query.waitTime||process.env.SCREENSHOT_TIMEOUT||6000;
    if (!validateUrl(url)) {
      console.log('[%s] url format error  [%s] not validated',formatTime(),url);
        res.json({
            error: 'url format error',
            message:  'url ['+url + '] not validated'
        })
    } else {
        camera.shotStream(url, {
          renderDelay: waitTime
         }, function(err, s,pid) {
            var responseMsg="";
            s.on('error',function (err) {
               console.log('[%s] get ScreenShot fail',formatTime(),err)
                res.json({
                    error: 'get ScreenShot fail',
                    message: err
                })
            })
            s.on('data',function (data) {
                responseMsg+=data.toString('base64');
            })
            s.on('end', function() {
                var fileName = req.query.fileName||analyseName(url);
                var img='<img src="data:image/png;base64,'+responseMsg+'" />'
                res.send(img)
                res.end()
                console.log('[%s] "%s" => %s cost %ss size %skb',formatTime(),url,fileName,(new Date()-captureStart)/1000,responseMsg.length/1024);
            });
        });
    }
});
// 获取截图并返回base64编码的json
app.get('/capturePageBase64JSON', function(req, res) {
    var captureStart=new Date();
    var url = req.query.url;
    var waitTime=req.query.waitTime||process.env.SCREENSHOT_TIMEOUT||6000;
    if (!validateUrl(url)) {
        console.log('[%s] url format error  [%s] not validated',formatTime(),url);
        res.json({
            "error": "url format error",
            "message":  "url ["+url + "] not validated"
        })
    } else {
        camera.shotStream(url, {
          renderDelay: waitTime
         }, function(err, s,pid) {
            var responseMsg="";
            s.on('error',function (err) {
                console.log('[%s] get ScreenShot fail',formatTime(),err)
                res.json({
                    error: 'get ScreenShot fail',
                    message: err
                })
            })
            s.on('data',function (data) {
                responseMsg+=data.toString('base64');
            })
            s.on('end', function() {
                var fileName = req.query.fileName||analyseName(url);
                res.json({base64Code:responseMsg})
                console.log('[%s] "%s" => %s cost %ss size %skb',formatTime(),url,fileName,(new Date()-captureStart)/1000,responseMsg.length/1024);
            });
        });
    }
});
// 启动服务
var service = app.listen(3000, function() {
  var port = service.address().port;
  console.log('[%s] Service listening at port %s cost Time %ds',formatTime(),port, (new Date() - startTime) / 1000);
  console.log('[%s] double press Ctrl+C to stop service',formatTime())
})
