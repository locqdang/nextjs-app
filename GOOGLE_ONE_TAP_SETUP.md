# Google One Tap Implementation Guide

This guide explains how to set up and use Google One Tap authentication in your Next.js application.

## Overview

Google One Tap is a frictionless authentication method that lets users sign in with their Google account without redirecting to a sign-in page. The implementation includes:

- **Google One Tap button** on the login page
- **One Tap prompt** (optional automatic popup)
- **Backend authentication** via Google OAuth
- **Automatic user creation** for new Google accounts
- **JWT token generation** for session management

## Setup Instructions

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID (Web Application)
5. Add authorized origins: `http://localhost:3000` (for development)
6. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
7. Copy your **Client ID** and **Client Secret**

### 2. Install Dependencies

The following packages have been added to `package.json`:

- `google-auth-library` - For verifying Google ID tokens
- `passport-google-oauth20` - For Google OAuth strategy

Install them:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with your Google credentials:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
```

**Important Notes:**

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
- `GOOGLE_CLIENT_SECRET` is server-side only and should never be exposed to the client
- Generate a secure `JWT_SECRET` (at least 32 characters)

### 4. Implementation Details

#### Updated Files:

**`src/pages/_document.js`**

- Loads Google Identity Services SDK globally

**`src/pages/login.js`**

- Initializes Google One Tap on component mount
- Renders the Google Sign-In button
- Handles Google authentication responses
- Sends credentials to `/api/auth/google` endpoint

**`src/pages/api/auth/google.js` (New)**

- Verifies Google ID tokens
- Creates or retrieves user from database
- Generates JWT token for session management
- Handles errors appropriately

**`src/lib/passport.js`**

- Added Google OAuth Strategy (for future use with OAuth flow)
- Configured user creation and retrieval for Google accounts

**`package.json`**

- Added `google-auth-library` and `passport-google-oauth20`

## How It Works

### User Flow:

1. User visits the login page
2. Google One Tap initializes and may show an automatic prompt
3. User can:
   - Click the Google Sign-In button
   - Use the One Tap prompt (if shown)
   - Continue with email/password login (traditional method)
4. Google returns a signed JWT credential
5. Frontend sends credential to `/api/auth/google` endpoint
6. Backend verifies the token with Google
7. User is created or retrieved from database
8. App-level JWT token is generated
9. User is redirected to their original destination

### Database Schema:

Google-authenticated users are stored with:

```javascript
{
  googleId: "Google's unique user ID",
  email: "user@example.com",
  name: "User Name",
  picture: "https://example.com/photo.jpg",
  provider: "google",
  createdAt: Date
}
```

## Features

### Google One Tap Features Implemented:

- **One Tap Button**: Styled with Google's recommended design
- **One Tap Prompt**: Automatic popup (can be disabled)
- **Session Management**: Uses JWT tokens stored in local storage
- **User Auto-creation**: New Google users are automatically added to database
- **Error Handling**: Proper error messages and logging

### Customization Options:

**Theme and Size:**

```javascript
// In src/pages/login.js, line 24
window.google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
  theme: 'outline',
  size: 'large',
  width: '100%',
});
```

Options:

- `theme`: 'outline' | 'filled_blue' | 'filled_black'
- `size`: 'large' | 'medium' | 'small'

**Disable Auto-Prompt:**

```javascript
// Remove or comment out this line to disable One Tap prompt
window.google.accounts.id.prompt();
```

## Testing

1. Start your development server:

```bash
npm run dev
```

2. Go to `http://localhost:3000/login`

3. Test with:
   - **Google One Tap button** - Click the button
   - **One Tap prompt** - If shown automatically
   - **Traditional login** - Email/password form

4. Check browser console for any errors
5. Check server logs for authentication details

## Security Considerations

1. **Never expose `GOOGLE_CLIENT_SECRET`** - Keep it server-side only
2. **Validate tokens on backend** - Always verify Google ID tokens
3. **Use HTTPS in production** - Google One Tap requires HTTPS for production
4. **Secure storage** - Tokens are stored in localStorage (consider moving to httpOnly cookies for better security)
5. **CORS configuration** - Ensure your domain is authorized in Google Cloud Console

## Troubleshooting

### "Google SDK not loaded"

- Ensure `_document.js` has the Google SDK script
- Check network tab for script loading errors
- Verify `https://accounts.google.com/gsi/client` is accessible

### "Invalid credential"

- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local`
- Check Google Cloud Console authorized origins
- Ensure token hasn't expired (Google tokens are typically valid for ~1 hour)

### "User creation failed"

- Check MongoDB connection
- Verify `insertOne` function in `lib/data/mongodb.js`
- Check database permissions

### "Token verification failed"

- Verify `GOOGLE_CLIENT_SECRET` is correct
- Check token hasn't been tampered with
- Ensure `GOOGLE_CLIENT_ID` matches the one in Google Cloud Console

## Advanced Configuration

### Using OAuth Flow Instead of One Tap:

If you prefer the traditional OAuth flow with redirect:

```javascript
import passport from 'passport';

app.get(
  '/api/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

app.get(
  '/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);
```

### Custom User Profile Fields:

Extend the user schema in `src/pages/api/auth/google.js`:

```javascript
const newUser = {
  googleId,
  email: email.toLowerCase(),
  name,
  picture,
  customField: value, // Add your custom fields
  createdAt: new Date(),
  provider: 'google',
};
```

## Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google One Tap Documentation](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)
- [Google Auth Library for Node.js](https://github.com/googleapis/google-auth-library-nodejs)
- [Passport Google OAuth Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
