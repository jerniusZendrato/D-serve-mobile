# Push Notifications - Firebase Implementation

## Updated Implementation

✅ **Firebase Messaging** - Cross-platform FCM token generation
✅ **JWT Authentication** - Backend registration with Bearer token
✅ **Deep Linking** - Notification tap navigation
✅ **Token Refresh** - Automatic token rotation handling
✅ **Cleanup on Logout** - Token removal from backend

## Architecture

### Plugins Used
- `@capacitor/push-notifications` - OS-level permissions & events
- `@capacitor-firebase/messaging` - Cross-platform FCM tokens
- `@capacitor-firebase/app` - Firebase initialization
- `@capacitor/app` - Deep linking support

### Flow
1. **Login** → `pushService.init(jwt)` called
2. **Permissions** → Request notification permissions
3. **FCM Token** → Get cross-platform token via Firebase
4. **Register** → POST token to `/api/notifications/device-token`
5. **Listen** → Handle foreground/background notifications
6. **Logout** → DELETE token from backend

## Backend Endpoints

### Register Device Token
```
POST /api/notifications/device-token
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "token": "FCM_TOKEN",
  "platform": "ANDROID|IOS|WEB", 
  "deviceModel": "User-Agent",
  "appVersion": "1.0.0",
  "userId": "USER_ID"
}
```

### Remove Device Token
```
DELETE /api/notifications/device-token?token=FCM_TOKEN
Authorization: Bearer JWT_TOKEN
```

## Notification Payload

Backend should send FCM payload with this structure:

```json
{
  "message": {
    "token": "DEVICE_FCM_TOKEN",
    "notification": {
      "title": "Support Baru",
      "body": "Unit A meminta bantuan"
    },
    "android": {
      "priority": "HIGH",
      "notification": {
        "channel_id": "support-alerts",
        "click_action": "OPEN_SUPPORT"
      }
    },
    "apns": {
      "payload": {
        "aps": {
          "content-available": 1,
          "sound": "default"
        }
      }
    },
    "data": {
      "type": "SUPPORT_CREATED",
      "supportId": "UUID",
      "url": "/home/support/UUID"
    }
  }
}
```

## Deep Linking

Notification data is used for navigation:

- `data.url` → Direct navigation
- `data.supportId` → Navigate to `/home/support/{id}`
- `data.type === "SUPPORT_CREATED"` → Support detail page
- Default → `/home`

## Android Setup

### 1. Notification Channel
Create in `MainActivity.kt`:

```kotlin
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
  override fun onStart() {
    super.onStart()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        "support-alerts",
        "Support Alerts", 
        NotificationManager.IMPORTANCE_HIGH
      )
      val mgr = getSystemService(NotificationManager::class.java)
      mgr.createNotificationChannel(channel)
    }
  }
}
```

### 2. Firebase Config
- `google-services.json` in `android/app/`
- Google Services plugin applied in `build.gradle`

## iOS Setup

### 1. Capabilities
Enable in Xcode:
- Push Notifications
- Background Modes → Remote notifications

### 2. Firebase Config
- `GoogleService-Info.plist` in `ios/App/App/`
- APNs Auth Key uploaded to Firebase Console

## Testing

### 1. Login & Check Logs
```
🚀 Initializing push notifications...
📱 Platform: android
🎩 FCM Token received: eFGHij1234...
🚀 Registering device token to backend...
🎉 ✅ DEVICE TOKEN REGISTERED SUCCESSFULLY!
```

### 2. Manual Test
```javascript
// In browser console after login
const pushService = window.ng.getComponent(document.body).injector.get('PushNotificationService');
console.log(pushService.getStatus());
```

### 3. Status Check
```json
{
  "userId": "user123",
  "platform": "android",
  "isInitialized": true,
  "hasToken": true,
  "tokenPreview": "eFGHij1234..."
}
```

## Key Features

- 🔐 **JWT Authentication** - Secure token registration
- 🔄 **Auto Token Refresh** - Handles token rotation
- 📱 **Cross-Platform** - Same code for Android/iOS
- 🎯 **Deep Linking** - Smart navigation from notifications
- 🧹 **Cleanup** - Token removal on logout
- 🔔 **Background Support** - Works when app is closed

## Troubleshooting

- **No FCM Token**: Check `google-services.json` placement
- **Permission Denied**: User must grant notification permission
- **Backend 401**: Check JWT token validity
- **No Deep Link**: Verify notification data structure
- **iOS Issues**: Check APNs configuration in Firebase

Implementation now follows Firebase best practices with proper JWT authentication and cross-platform token management!