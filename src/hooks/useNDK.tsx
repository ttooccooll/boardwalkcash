import React, { useEffect } from 'react';
import NDK, {
   NDKEvent,
   NDKFilter,
   NDKPrivateKeySigner,
   NDKSubscriptionOptions,
   NostrEvent,
} from '@nostr-dev-kit/ndk';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Find relays at https://nostr.watch
const defaultRelays = [
   'wss://relay.getalby.com/v1',
   'wss://nostr.mutinywallet.com/',
   'wss://relay.mutinywallet.com',
   'wss://relay.damus.io',
   'wss://relay.snort.social',
   'wss://relay.primal.net',
];

// Define the data that will be returned by useNDK();
type NDKContextType = {
   ndk: NDK;
   subscribeAndHandle: (
      filter: NDKFilter,
      handler: (event: NDKEvent) => void,
      opts?: NDKSubscriptionOptions,
   ) => void;
   publishNostrEvent: (event: NostrEvent) => Promise<void>;
};

// define this outside of the below NDKProvider component so that it is in scope for useNDK()
let NDKContext: React.Context<NDKContextType>;

export const NDKProvider = ({ children }: { children: React.ReactNode }) => {
   const seenEventIds = new Set<string>();
   const privkey = useSelector((state: RootState) => state.user.privkey);
   // create a new NDK instance to be used throughout the app
   const ndkLocal = new NDK({ explicitRelayUrls: defaultRelays });

   // use a ref to keep the NDK instance in scope for the lifetime of the component
   const ndk = React.useRef(ndkLocal);

   // Normally ndk.connect should be called asynchrounously, but in this case the instance will connect to the relays soon after the app loads
   ndk.current
      .connect() // connect to the NDK
      // .then(() => console.log('Connected to NDK')) // log success
      .catch(() => console.log('Failed to connect to NDK')); // log failure

   useEffect(() => {
      if (!privkey) return;
      // console.log('Setting signer');
      const signer = new NDKPrivateKeySigner(privkey);
      ndk.current.signer = signer;
   }, [privkey]);

   /**
    *
    * @param filter An NDKFilter for specific events
    * @param handler A function that accepts an NDKEvent and does something with it
    * @param opts Optional NDKSubscriptionOptions. Set `{closeOnEose: false}` to keep subscriptions open after eose
    */
   const subscribeAndHandle = (
      filter: NDKFilter,
      handler: (event: NDKEvent) => void,
      opts?: NDKSubscriptionOptions,
   ) => {
      // subscribe to the filter
      const sub = ndk.current.subscribe(filter, opts);

      // `sub` emits 'event' events when a new nostr event is received
      // our handler then processes the event
      sub.on('event', (e: NDKEvent) => {
         // console.log('Received event:', e.id);
         // if (seenEventIds.has(e.id)) return;
         // seenEventIds.add(e.id);
         handler(e);
      });
   };

   const publishNostrEvent = async (event: NostrEvent) => {
      ndk.current.assertSigner();

      const e = new NDKEvent(ndk.current, event);

      await e.publish();
   };

   // Define what will be returned by useNDK();
   const contextValue = {
      ndk: ndk.current,
      subscribeAndHandle,
      publishNostrEvent,
   };

   // create a new context with the contextValue
   NDKContext = React.createContext(contextValue);

   // Return our new provider with `children` as components that will be wrapped by the provider
   return <NDKContext.Provider value={contextValue}>{children}</NDKContext.Provider>;
};

// This is the hook that will be used in other components to access the NDK instance
export const useNDK = () => React.useContext(NDKContext);
