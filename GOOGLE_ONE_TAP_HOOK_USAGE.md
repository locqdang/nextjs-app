# Using the Google One Tap Hook Across Pages

The `useGoogleOneTap` hook has been extracted into a reusable module that you can now use on any page in your Next.js application.

## Basic Usage

To add Google One Tap to any page, simply import the hook and call it in your component:

```javascript
import { useGoogleOneTap } from '../hooks/useGoogleOneTap';

export default function YourPage() {
  const [error, setError] = useState('');

  // Initialize Google One Tap with default settings
  useGoogleOneTap({
    onError: (errorMessage) => {
      setError(errorMessage);
    },
  });

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {/* Your button will appear here */}
      <div id="google-signin-button"></div>
    </div>
  );
}
```

## Advanced Usage

You can customize the button appearance and behavior:

```javascript
useGoogleOneTap({
  buttonId: 'custom-button-id',  // Default: 'google-signin-button'
  buttonConfig: {
    theme: 'filled_blue',         // 'outline' or 'filled_blue'
    size: 'large',                // 'large', 'medium', or 'small'
    width: 300,
  },
  showPrompt: false,              // Hide the automatic One Tap prompt
  onSuccess: (data) => {
    console.log('Login successful:', data);
    // Handle success (redirect happens automatically)
  },
  onError: (errorMessage) => {
    console.log('Login failed:', errorMessage);
    // Handle error
  },
});
```

## Hook Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `buttonId` | string | `'google-signin-button'` | The DOM element ID where the button will be rendered |
| `buttonConfig` | object | `{ theme: 'outline', size: 'large', width: 320 }` | Google button configuration |
| `showPrompt` | boolean | `true` | Whether to show the One Tap prompt |
| `onSuccess` | function | `undefined` | Callback on successful login |
| `onError` | function | `undefined` | Callback on login error |

## What the Hook Does

1. **Initializes Google One Tap** with your client ID from environment variables
2. **Renders the Google Sign-In button** in the specified DOM element
3. **Shows the One Tap prompt** (optional automatic popup)
4. **Handles authentication** - Sends credentials to `/api/auth/google`
5. **Manages user session** - Stores token via auth context
6. **Redirects user** - Takes them to the original requested page or home

## Example: Adding to a Protected Page

```javascript
import { useGoogleOneTap } from '../hooks/useGoogleOneTap';
import { useAuth } from '../lib/auth';

export default function ProtectedPage() {
  const { user } = useAuth();
  const [error, setError] = useState('');

  useGoogleOneTap({
    showPrompt: false,  // Don't show automatic prompt on protected pages
    onError: (errorMessage) => {
      setError(errorMessage);
    },
  });

  if (!user) {
    return (
      <div>
        <h1>Please Log In</h1>
        <div id="google-signin-button"></div>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  return <div>Welcome, {user.email}!</div>;
}
```

## Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

The `_document.js` file loads the Google SDK globally, so the hook can use `window.google` on any page.
