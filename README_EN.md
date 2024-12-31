# Web Screenshot & Email Service 📸 ✉️

A simple yet powerful Web API service that provides webpage screenshot and email sending functionality.

[简体中文](./README.md) | English

## ✨ Features

- 🖼️ **Web Screenshot**
  - Support full webpage capture
  - Multiple output formats (download, preview, Base64)
  - Wait for page load completion before capture
  
- 📧 **Email Service**
  - Support HTML format emails
  - Support multiple attachments
  - Custom sender information

## 🚀 Quick Start

### Prerequisites

- Node.js >= 14
- Chrome/Chromium (for screenshots)
- SMTP server configuration

### Installation

```bash
# Clone the repository
git clone https://github.com/tinhour/screencapture-sendmail.git

# Enter project directory
cd screencapture-sendmail

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start screenshot service
npm run screencaptureService
# Start email service
npm run sendmailService
```

## 📚 API Documentation

### Screenshot Service

```http
GET /capturePageDownload?url=https://example.com
# Download webpage screenshot as a file

GET /capturePageShow?url=https://example.com
# Display screenshot directly in browser

GET /capturePageBase64JSON?url=https://example.com
# Return Base64 encoded screenshot data
```

Parameters:
- `url`: Required, webpage URL to capture
- `waitTime`: Wait time (default: 6000ms)
- `fileName`: Download filename (default: generated from URL)

### Email Service

```http
# GET Method
GET /sendMail?to=recipient@example.com&subject=Test&content=HelloWorld

# POST Method
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

Parameters:
- `to`: Required, recipient email address(es), multiple recipients separated by commas
- `subject`: Required, email subject
- `content`: Required, email content (HTML supported)
- `attachments`: Optional, attachment paths, passed as array (POST method only)

## ⚙️ Configuration

Create a `.env` file in the project root directory with the following variables:

```env
# Server Configuration
# Screenshot service port
SCREENCAPTURE_PORT=3000
# Email service port
MAIL_PORT=3001

# SMTP Configuration
# Email service host
SMTP_HOST=smtp.qq.com
# Email service port
SMTP_PORT=465
# Email service username
SMTP_USER=your-email@example.com
# Email service password
SMTP_PASS=your-password

# Screenshot Configuration
# Default wait time for screenshot completion
SCREENSHOT_TIMEOUT=6000
```

## 📝 Usage Examples

```javascript
// Get webpage screenshot
const response = await fetch('http://localhost:3000/capturePageBase64JSON?url=https://example.com');
const data = await response.json();
const base64Image = data.image;

// Send email using GET method
const mailResponse = await fetch(
    'http://localhost:3001/sendMail?to=test@example.com&subject=Test&content=Hello'
);
const result = await mailResponse.json();

// Send email using POST method
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

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 👨‍💻 Author

[@tinhour](https://github.com/tinhour) 