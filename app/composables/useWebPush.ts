import { ref, onMounted } from 'vue';
import { useNuxtApp, useRuntimeConfig } from '#app';
import { useApi } from '~/composables/useApi'; // Assuming useApi exists or $fetch

export const useWebPush = () => {
  const config = useRuntimeConfig();
  const api = useApi(); // Replace with your standard api fetcher if different
  const isSubscribed = ref(false);
  const isSupported = ref(false);

  const urlB64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      isSupported.value = true;
      try {
        await navigator.serviceWorker.register('/sw.js');
        checkSubscription();
      } catch (error) {
        console.error('SW Registration failed', error);
      }
    }
  };

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();
    isSubscribed.value = !!existingSubscription;
  };

  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        isSubscribed.value = true;
        return;
      }

      const vapidKey = config.public.vapidPublicKey;
      if (!vapidKey) {
        console.error('No VAPID key configured');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(vapidKey)
      });

      // Assuming api wrapper handles Sanctum CSRF and headers properly
      await api.post('/api/push-subscriptions', subscription.toJSON());
      isSubscribed.value = true;
    } catch (e) {
      console.error('Failed to subscribe the user: ', e);
    }
  };

  const unsubscribeUser = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        // Unsubscribe from browser
        await subscription.unsubscribe();
        
        // Notify backend to remove the endpoint
        const endpoint = subscription.endpoint;
        await api.delete('/api/push-subscriptions', { data: { endpoint } });
      }
      isSubscribed.value = false;
    } catch (e) {
      console.error('Failed to unsubscribe', e);
    }
  };

  return {
    isSupported,
    isSubscribed,
    registerServiceWorker,
    subscribeUser,
    unsubscribeUser,
    checkSubscription
  };
};
