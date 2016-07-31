var webcamera = require('webcamera');
var fs = require('fs');
var crypto = require('crypto');
var express = require('express');
var app = express();
var server = app.listen(3001, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});

var camera = webcamera.create({
    timeout: 1000 * 30,
    phantom:"./node_modules/phantomjs/bin/phantomjs"
});

function analyseName(url) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(url);
    return md5sum.digest('hex')+'.png';
}

function validateUrl(url) {
    return /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/.test(url)
}
app.use(function (req, res, next) {
  console.log(req.method,req.url);
  next();
})
app.get('/',function (req,res) {
    var str='<h1>Usage:</h1>'
    str+='<h2>/capturePage?url=decodeURIComponet("http://www.baidu.com")</h2>'
    str+='<h2>/capturePage?url=decodeURIComponet("http://www.baidu.com")&fileName=baidu.png</h2>'
    res.end(str)
})

app.get('/capturePage', function(req, res) {
    var url = req.query.url;
    if (!validateUrl(url)) {
        res.json({
            error: 'url format error',
            message: url + ' not validated'
        })
    } else {
        camera.shotStream(url, function(err, s) {
            if (err) {
                res.status(500).json({
                    error: 'capture url fail',
                    message: err
                })
            } else {
                var fileName = req.query.fileName||analyseName(url);
                res.attachment(fileName);
                s.on('data', function(data) {
                    res.write(data);
                });
                s.on('end', function() {
                    res.end();
                    console.log('get pictrue ok', fileName);
                });
            }
        });
    }
});




