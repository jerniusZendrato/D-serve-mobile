# Push Notifications - Simple Implementation

## Implementasi Sederhana

✅ **Auto-Subscribe** - Otomatis subscribe setelah login berdasarkan userId
✅ **Cross-Platform** - Web (VAPID) dan Mobile (FCM)
✅ **Storage-Based** - Ambil userId dari localStorage/Preferences
✅ **No Manual Testing** - Hanya subscribe otomatis, tidak ada UI test

## Cara Kerja

### 1. Login Process
```typescript
// Di login.component.ts setelah login berhasil
await this.pushNotificationService.initialize();
```

### 2. Auto-Subscribe
- Service otomatis ambil `userId` dari storage
- Web: Subscribe dengan VAPID key
- Mobile: Subscribe dengan FCM token
- Kirim subscription ke backend dengan `userId`

### 3. Backend Integration
```
POST /api/notifications/subscribe?userId=USER_ID
Body: Subscription object (web) atau FCM token (mobile)
```

## File yang Dibutuhkan

```
src/app/service/push-notification.service.ts  # Main service
src/push-sw.js                              # Service worker
public/push-sw.js                           # Service worker copy
```

## Backend Endpoints

### VAPID Public Key (Web only)
```
GET /api/notifications/vapid-public-key
Response: { "publicKey": "VAPID_KEY" }
```

### Subscribe
```
POST /api/notifications/subscribe?userId=USER_ID
Body: Subscription object atau FCM token
```

## Testing

1. **Login** ke aplikasi
2. **Grant permission** saat diminta
3. **Check console** untuk log subscription
4. **Backend** bisa kirim push ke userId

## Notification Payload

### Web Push
```json
{
  "notification": {
    "title": "Ada Pesanan Baru",
    "body": "Unit A membutuhkan bantuan",
    "data": { "url": "/home/support/123" }
  }
}
```

### Mobile Push (FCM)
```json
{
  "to": "FCM_TOKEN",
  "notification": {
    "title": "Ada Pesanan Baru",
    "body": "Unit A membutuhkan bantuan"
  },
  "data": {
    "supportId": "123",
    "url": "/home/support/123"
  }
}
```

## Key Features

- 🔐 **UserID Based** - Subscribe berdasarkan userId dari authData
- 🚀 **Auto-Subscribe** - Tidak perlu manual action dari user
- 📱 **Deep Linking** - Tap notification buka halaman terkait
- 🌐 **Cross-Platform** - Satu service untuk web dan mobile
- ⚡ **Real-time** - Notifikasi muncul bahkan saat app ditutup

Implementasi sekarang lebih sederhana dan fokus pada auto-subscribe setelah login!