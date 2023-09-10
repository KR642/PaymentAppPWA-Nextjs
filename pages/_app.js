import { AuthContextProvider, UserAuthContextProvider } from '@/context/UserAuthContext'
import '@/styles/globals.css'
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      } else {
        console.log('Unable to get permission to notify.');
      }
    });
  }, []);
  return (
  <UserAuthContextProvider>

  <div className='background-gradient'>
  <Component {...pageProps} />
  </div>
  
  </UserAuthContextProvider>
  )
}
