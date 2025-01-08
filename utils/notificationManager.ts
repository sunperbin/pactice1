export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported in this browser');
  }

  const registration = await navigator.serviceWorker.ready;
  const vapidPublicKey = 'BAIAmhflNGqFNhpjRkGSAYWQqHPztPJ3RvT7aar5FJ7pU-7d85AAryyEUKDZRW_ohGJ8YjUPUNXT-hH-M66A1sA';

  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    });

    // Here you would typically send the subscription to your server
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    throw error;
  }
}

export function requestNotificationPermission() {
  return new Promise(function(resolve, reject) {
    const permissionResult = Notification.requestPermission(function(result) {
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  });
}

export async function sendNotification(title: string, options: NotificationOptions) {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
    return;
  }

  if (Notification.permission === "granted") {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, options);
  } else if (Notification.permission !== "denied") {
    const permission = await requestNotificationPermission();
    if (permission === "granted") {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, options);
    }
  }

  // 알림 히스토리에 추가
  const notificationHistory = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
  notificationHistory.push({ title, ...options, timestamp: new Date().toISOString() });
  localStorage.setItem('notificationHistory', JSON.stringify(notificationHistory));
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

