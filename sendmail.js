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
    service:process.env.SMTP_HOST||'smtp.qq.com',
    port:process.env.SMTP_PORT||465, 
    secureConnection: true, // 使用 SSL
    auth: {
        user: process.env.SMTP_USER||'fangfeng335@qq.com',
        //这里密码不是qq密码，是你设置的smtp密码
        pass: process.env.SMTP_PASSWORD||'yourSmtpPassword'
    }
});

/**
 * mailOptions:{to:"",subject:"",content:"",attachments:""}
 * callback:function(error,info)
*/
const sendMail = async (req, res) => {
    try {
        let to, subject, content, attachments;

        // 处理 GET 请求
        if (req.method === 'GET') {
            to = req.query.to;
            subject = req.query.subject;
            content = req.query.content;
            attachments = req.query.attachments ? req.query.attachments.split(',') : [];
        }
        // 处理 POST 请求
        else if (req.method === 'POST') {
            const body = req.body;
            to = body.to;
            subject = body.subject;
            content = body.content;
            attachments = Array.isArray(body.attachments) ? body.attachments : [];
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // 验证必填参数
        if (!to || !subject || !content) {
            return res.status(400).json({
                error: 'Missing required parameters: to, subject, content'
            });
        }

        // 配置邮件选项
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: to,
            subject: subject,
            html: content,
            attachments: attachments.map(path => ({
                path: path
            }))
        };

        // 发送邮件
        const info = await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            error: 'Failed to send email',
            details: error.message
        });
    }
};


// index and example
app.get('/',function (req,res) {
    var str = '<h1>mail send service worked!</h1>'
    str += '<h2>Usage:</h2>'
    str += '<h2>/sendMail?to=mail@mail.com&subject=subject&content=emailContent</h2>'
    res.end(str)
})
// send mail    
app.post('/sendMail', function (req, res) {
    sendMail(req,res)
})
// send mail
app.get('/sendMail', function (req, res) {
    sendMail(req,res)
});



