import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import Welcome from './components/Welcome'
import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  // useEffect(() => {
  //   if ('serviceWorker' in navigator) {
  //     navigator.serviceWorker.register('/sw.js')
  //     .then(function() {
  //       console.log("Service Worker Registered");
  //     });
  //   }
  // })

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
    <>
      <Welcome />
    </>
  )
}
