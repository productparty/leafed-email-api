# Leafed Email API

Vercel serverless function for sending contact form emails via SMTP using Nodemailer.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file (for local testing) or set in Vercel dashboard:

```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-smtp-password
SMTP_FROM=leafedapp@mikewatson.us
SMTP_FROM_NAME=Leafed App
SMTP_TO=mike@watsonconsultingandadvisory.com
```

### 3. Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/productparty/leafed-email-api.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repo: `productparty/leafed-email-api`
   - Add environment variables (see `.env.example`)
   - Deploy

3. **Get Your Endpoint URL**:
   - After deployment, Vercel will provide: `https://your-project.vercel.app/api/send-email`
   - Use this URL in your React Native app

## API Usage

### Endpoint
```
POST /api/send-email
```

### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about the app",
  "message": "I have a question..."
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "..."
}
```

### Error Response (400/500)
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Testing Locally

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel dev`
3. Test with curl:
   ```bash
   curl -X POST http://localhost:3000/api/send-email \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "subject": "Test",
       "message": "This is a test"
     }'
   ```

## React Native Integration

Use this endpoint URL in your React Native app:

```javascript
const response = await fetch('https://your-project.vercel.app/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: formData.name,
    email: formData.email,
    subject: formData.subject,
    message: formData.message,
  }),
});

const result = await response.json();
```

## SMTP Configuration

Common SMTP settings:

- **Port 587**: TLS (STARTTLS) - Recommended
- **Port 465**: SSL - Alternative
- **Port 25**: Unencrypted - Not recommended

For `leafedapp@mikewatson.us`, check with your email provider for:
- SMTP server hostname
- Correct port (usually 587)
- Username (usually full email address)
- Password (may need app-specific password)

## License

MIT

