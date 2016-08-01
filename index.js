var process=require('process')
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
var os=require('os');
var nodemailer = require('nodemailer');
var Camera = require('webcamera');
var fs = require('fs');
var crypto = require('crypto');
var express = require('express');
var app = express();
var server = app.listen(3001, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});
var transporter = nodemailer.createTransport({
    service:'qq',
    port:465, 
    secureConnection: true, // 使用 SSL
    auth: {
        user: 'fangfeng335@qq.com',
        //这里密码不是qq密码，是你设置的smtp密码
        pass: 'myPassForSmtp'
    }
});
var phantomPath = "./node_modules/phantomjs/bin/phantomjs";
phantomPath += /window/i.test(os.type()) ? ".exe" : "";
var camera = Camera.create({
    timeout: 1000 * 30,
    phantom: phantomPath
});

/**
 * mailOptions:{form:"",to:"",subject:"",html:"",text:""}
 * callback:function(error,info)
*/
function sendMail(mailOptions, callabck) {
    if (!(mailOptions.from || mailOptions.to)) {
        callabck({error:'params error',message:'no sendMail or ReceivMail'})
    } else {
        console.log('mailOptions',JSON.stringify(mailOptions))
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                callabck({error:'send fail',message:error})
                return console.log('send fail:', error);
            }
            callabck({message:info.response,status:'mail sent'})
            console.log('Mail sent: ' + info.response);
        });
    }
}

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
    str+='<h2>/sendMail?form=mail@mail.com&to=mail@mail.com&subject=subject&content=emailContent</h2>'
    str+='<h2>/capturePage?url=encodeURIComponent("http://www.qq.com")&fileName=qq.png</h2>'
    res.end(str)
})
app.get('/sendMail', function (req, res) {
    var from=req.query.from;
    var to=req.query.to;
    var subject=req.query.subject;
    var html=req.query.content;
    var mailOptions={from:req.query.from,to:req.query.to,subject:req.query.subject,html:req.query.content}
    sendMail(mailOptions,function(msg) {
        res.json(msg);
    })
});

app.get('/capturePage', function(req, res) {
    var captureStart=new Date();
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
                    console.log('get pictrue %s ok cost %s s', fileName,(new Date()-captureStart)/1000);
                });
            }
        });
    }
});




