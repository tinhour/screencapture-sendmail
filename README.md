# Web Screenshot & Email Service 📸 ✉️

一个简单但功能强大的 Web API 服务，提供网页截图和邮件发送功能。

[English](./README_EN.md) | 简体中文

## ✨ 功能特点

- 🖼️ **网页截图**
  - 支持完整网页截图
  - 支持多种返回格式（下载、预览、Base64）
  - 支持等待页面加载完成后截图
  
- 📧 **邮件发送**
  - 支持 HTML 格式邮件
  - 支持添加多个附件
  - 支持自定义发件人信息

## 🚀 快速开始

### 前置要求

- Node.js >= 14
- Chrome/Chromium (用于网页截图)
- SMTP 服务器配置

### 安装

```bash
# 克隆项目
git clone https://github.com/tinhour/screencapture-sendmail.git

# 进入项目目录
cd screencapture-sendmail

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动服务
npm start
```

## 📚 API 文档

### 截图服务

```http
GET /capturePageDownload?url=https://example.com
# 将网页截图作为文件下载

GET /capturePageShow?url=https://example.com
# 直接在浏览器中显示截图

GET /capturePageBase64JSON?url=https://example.com
# 返回 Base64 编码的截图数据
```

请求参数：
- `url`: 必填，要截图的网页地址
- `width`: 可选，截图宽度（默认：1920）
- `height`: 可选，截图高度（默认：1080）
- `fullPage`: 可选，是否截取完整页面（默认：false）

### 邮件服务

```http
# GET 方式
GET /sendMail?to=recipient@example.com&subject=Test&content=HelloWorld

# POST 方式
POST /sendMail
Content-Type: application/json

{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "content": "Hello World",
    "attachments": [
        "/path/to/file1.pdf",
        "/path/to/file2.jpg"
    ]
}
```

请求参数：
- `to`: 必填，收件人邮箱地址，多个收件人用逗号分隔
- `subject`: 必填，邮件主题
- `content`: 必填，邮件内容（支持 HTML）
- `attachments`: 可选，附件路径，多个附件用数组形式传递（仅 POST 方式支持）

## ⚙️ 配置说明

在项目根目录创建 `.env` 文件，配置以下环境变量：

```env
# 服务器配置
PORT=3000

# SMTP 配置
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# 截图配置
SCREENSHOT_TIMEOUT=30000
```

## 📝 使用示例

```javascript
// 获取网页截图
const response = await fetch('http://localhost:3000/capturePageBase64JSON?url=https://example.com');
const data = await response.json();
const base64Image = data.image;

// GET 方式发送邮件
const mailResponse = await fetch(
    'http://localhost:3001/sendMail?to=test@example.com&subject=Test&content=Hello'
);
const result = await mailResponse.json();

// POST 方式发送邮件
const postResponse = await fetch('http://localhost:3001/sendMail', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test Email',
        content: '<h1>Hello World</h1>',
        attachments: ['/path/to/file.pdf']
    })
});
const postResult = await postResponse.json();
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建新的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目采用 MIT 协议 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

tinhour - [@tinhour](https://github.com/tinhour)

