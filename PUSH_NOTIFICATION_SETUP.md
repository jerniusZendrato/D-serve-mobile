# Push Notification Setup - Monitoring Tambang

## Files Created

1. **Service**: `src/app/services/push-notification.service.ts`
2. **Component**: `src/app/components/push-notification/push-notification.component.ts`
3. **Service Worker**: `public/push-sw.js`
4. **Config**: Updated `capacitor.config.ts`

## Usage

### 1. Import Component di App Module/Component

```typescript
// Di component yang ingin menggunakan push notification
import { PushNotificationComponent } from './components/push-notification/push-notification.component';

@Component({
  imports: [PushNotificationComponent],
  template: '<app-push-notification></app-push-notification>'
})
```

### 2. Atau gunakan Service langsung

```typescript
import { PushNotificationService } from './services/push-notification.service';

constructor(private pushService: PushNotificationService) {}

async enableNotifications(userId: string) {
  await this.pushService.initialize(userId);
}
```

## Backend API yang Dibutuhkan

- `GET /api/notifications/vapid-public-key` - Return VAPID public key
- `POST /api/notifications/subscribe?userId=<id>` - Subscribe user
- `DELETE /api/notifications/subscribe?userId=<id>&endpoint=<endpoint>` - Unsubscribe
- `POST /api/notifications/test` - Send test notification

## Build & Deploy

```bash
# Build untuk web
ng build

# Build untuk mobile
npx cap sync
npx cap run android
npx cap run ios
```

## Features

- ✅ Cross-platform (Web, Android, iOS)
- ✅ User-based subscriptions dengan userId
- ✅ Background notifications
- ✅ Automatic platform detection
- ✅ Indonesian language support
- ✅ Test notification functionality
