var process=require('process')
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
var nodemailer = require('nodemailer');
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
        pass: 'yourSmtpPassword'
    }
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

app.use(function (req, res, next) {
  console.log(req.method,req.url);
  next();
})
app.get('/',function (req,res) {
    var str='<h1>Usage:</h1>'
    str+='<h2>/sendMail?form=mail@mail.com&to=mail@mail.com&subject=subject&content=emailContent</h2>'
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



