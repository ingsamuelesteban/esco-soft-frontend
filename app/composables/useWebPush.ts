import { ref } from 'vue';
import { useRuntimeConfig } from '#app';
import { api } from '~/utils/api';
import Swal from 'sweetalert2';

const PUSH_ENDPOINT = '/api/push-subscriptions';

export const useWebPush = () => {
  const config = useRuntimeConfig();
  const isSubscribed = ref(false);
  const isSupported = ref(false);

  /** Convierte una clave VAPID base64url (o base64) a Uint8Array de forma segura. */
  const urlB64ToUint8Array = (base64String: string) => {
    const clean = base64String.trim().replace(/^["']|["']$/g, '');
    const padding = '='.repeat((4 - (clean.length % 4)) % 4);
    const base64 = (clean + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const getVapidKey = (): string => {
    const key = (config.public.vapidPublicKey as string) || '';
    if (!key) {
      console.error(
        '[useWebPush] runtimeConfig.public.vapidPublicKey está vacío. ' +
        'Define NUXT_PUBLIC_VAPID_PUBLIC_KEY (o VAPID_PUBLIC_KEY) en el entorno donde se ejecuta el build/servidor del frontend y vuelve a compilar.'
      );
    }
    return key;
  };

  /** Envía la suscripción al backend (idempotente: updatePushSubscription). */
  const syncSubscription = async (subscription: PushSubscription) => {
    await api.post(PUSH_ENDPOINT, subscription.toJSON());
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      isSupported.value = 'PushManager' in window;
      try {
        await navigator.serviceWorker.register('/sw.js');
        await checkSubscription();
      } catch (error) {
        console.error('SW Registration failed', error);
      }
    }
  };

  /**
   * Verifica la suscripción del navegador y, si existe, la re-sincroniza con el
   * backend para reparar suscripciones huérfanas (BD purgada o fallo previo).
   */
  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();
    isSubscribed.value = !!existingSubscription;

    if (existingSubscription && Notification.permission === 'granted') {
      try {
        await syncSubscription(existingSubscription);
      } catch (e) {
        console.warn('[useWebPush] No se pudo sincronizar la suscripción existente', e);
      }
    }
  };

  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await syncSubscription(existingSubscription);
        isSubscribed.value = true;
        return;
      }

      const vapidKey = getVapidKey();
      if (!vapidKey) {
        Swal.fire({
          icon: 'error',
          title: 'Error de Configuración',
          text: 'Falta la VAPID_PUBLIC_KEY (NUXT_PUBLIC_VAPID_PUBLIC_KEY) en el entorno del frontend.'
        });
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(vapidKey)
      });

      await syncSubscription(subscription);
      isSubscribed.value = true;
    } catch (e: any) {
      console.error('Failed to subscribe the user: ', e);
      Swal.fire({
        icon: 'error',
        title: 'Error de Suscripción',
        text: e?.response?.data?.message || e?.message || 'Error desconocido al suscribir.'
      });
    }
  };

  const unsubscribeUser = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await api.delete(PUSH_ENDPOINT, { data: { endpoint } });
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
