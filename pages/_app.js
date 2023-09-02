import { AuthContextProvider, UserAuthContextProvider } from '@/context/UserAuthContext'
import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
  <UserAuthContextProvider>

  
  <Component {...pageProps} />
  </UserAuthContextProvider>
  )
}
