# Push Notifications Implementation - Updated

## Perbaikan yang Sudah Dilakukan

✅ **UserID dari Storage** - Service mengambil userId dari localStorage (web) atau Preferences (mobile)
✅ **Cross-Platform Support** - Web Push (VAPID) dan Mobile Push (FCM)
✅ **Service Worker** - Dibuat untuk handle web push notifications
✅ **Auto-Initialize** - Push notifications di-initialize setelah login berhasil
✅ **Error Handling** - Proper error handling dan logging
✅ **Test Component** - Component untuk testing push notifications

## Cara Kerja

### 1. Login Process
```typescript
// Setelah login berhasil
await this.pushNotificationService.initialize();
```

### 2. Get UserID from Storage
```typescript
// Web
const authData = JSON.parse(localStorage.getItem('authData'));
const userId = authData.user?.id;

// Mobile
const result = await Preferences.get({ key: 'authData' });
const authData = JSON.parse(result.value);
const userId = authData.user?.id;
```

### 3. Subscribe to Backend
```typescript
// Web Push (VAPID)
POST /api/notifications/subscribe?userId=USER_ID
Body: PushSubscription object

// Mobile Push (FCM)
POST /api/notifications/subscribe?userId=USER_ID
Body: { token: "FCM_TOKEN", platform: "android", userId: "USER_ID" }
```

## Backend Endpoints Required

### 1. VAPID Public Key (Web)
```
GET /api/notifications/vapid-public-key
Response: { "publicKey": "VAPID_PUBLIC_KEY" }
```

### 2. Subscribe
```
POST /api/notifications/subscribe?userId=USER_ID
Body: Subscription object atau FCM token
```

### 3. Test Notification
```
POST /api/notifications/test
Body: {
  "userId": "USER_ID",
  "title": "Test Title",
  "body": "Test Body",
  "data": { "url": "/home" }
}
```

## File Structure

```
src/
├── app/
│   ├── service/
│   │   └── push-notification.service.ts    # Main service
│   ├── pages/
│   │   ├── login/
│   │   │   └── login.component.ts          # Initialize after login
│   │   └── push-test/
│   │       └── push-test.component.ts      # Test component
│   └── app.component.ts                    # App initialization
├── push-sw.js                             # Service worker for web
└── public/
    └── push-sw.js                         # Copied service worker
```

## Testing

### 1. Web Testing
1. Login ke aplikasi
2. Browser akan request permission
3. Grant permission
4. Check console: "✅ Push notifications initialized"
5. Test dengan: `pushService.sendTestNotification()`

### 2. Mobile Testing
1. Build: `npm run build && npx cap sync android`
2. Open Android Studio: `npx cap open android`
3. Install di real device
4. Login → Permission dialog
5. Grant permission → Token sent to backend

### 3. Test Component
Navigate to `/push-test` untuk testing interface

## Payload Format

### Web Push (VAPID)
```json
{
  "notification": {
    "title": "Support Update",
    "body": "Ada pesanan baru",
    "icon": "/assets/icons/icon-192x192.png",
    "data": { "url": "/home/support/123" }
  }
}
```

### Mobile Push (FCM)
```json
{
  "to": "FCM_TOKEN",
  "notification": {
    "title": "Support Update", 
    "body": "Ada pesanan baru"
  },
  "data": {
    "type": "support_update",
    "supportId": "123",
    "url": "/home/support/123"
  }
}
```

## Key Features

- 🔐 **UserID Based** - Subscribe berdasarkan userId dari authData
- 🌐 **Cross-Platform** - Web (VAPID) dan Mobile (FCM)
- 💾 **Storage Aware** - localStorage (web) vs Preferences (mobile)
- 🔄 **Auto-Initialize** - Setelah login berhasil
- 🧪 **Testable** - Test component untuk debugging
- 📱 **Deep Linking** - Notification tap buka halaman spesifik
- ⚡ **Real-time** - Notifikasi muncul bahkan saat app ditutup

## Next Steps

1. **Backend Implementation** - Implement endpoints yang dibutuhkan
2. **VAPID Keys** - Generate VAPID keys untuk web push
3. **FCM Setup** - Configure FCM server key
4. **Testing** - Test dengan real notifications dari backend