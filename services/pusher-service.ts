import Pusher from 'pusher-js';

let pusher: Pusher;

export function getPusherInstance() {
  if (!pusher) {
    const appKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    if (!appKey) {
      throw new Error('Pusher app key is not defined in environment variables');
    }
    pusher = new Pusher(appKey, {
      cluster: 'ap3', // Make sure this matches your Pusher cluster
    });
  }
  return pusher;
}

export function subscribeToChannel(channelName: string, eventName: string, callback: (data: any) => void) {
  const pusher = getPusherInstance();
  const channel = pusher.subscribe(channelName);
  channel.bind(eventName, callback);

  return () => {
    channel.unbind(eventName, callback);
    pusher.unsubscribe(channelName);
  };
}

export function getUserCount() {
  // This is a placeholder. In a real application, you'd need to implement
  // a way to track the actual user count, possibly using Pusher's presence channels.
  return Math.floor(Math.random() * 100) + 1;
}

