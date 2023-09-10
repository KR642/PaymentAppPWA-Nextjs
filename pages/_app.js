import { AuthContextProvider, UserAuthContextProvider } from '@/context/UserAuthContext'
import '@/styles/globals.css'
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {

  return (
  <UserAuthContextProvider>

  <div className='background-gradient'>
  <Component {...pageProps} />
  </div>
  
  </UserAuthContextProvider>
  )
}
