import '../styles/globals.css'
import type { AppProps } from 'next/app'
import axios from 'axios'

const REACT_APP_STATUS = "dev"


function MyApp({ Component, pageProps }: AppProps) {
  // if(process.env.REACT_APP_STATUS == "dev") {
  if(REACT_APP_STATUS == "dev") {
    console.log("dev")
    axios.defaults.baseURL = "http://localhost:3001";
  } else if(process.env.REACT_APP_STATUS == "prod") {
    console.log("prod")
    axios.defaults.baseURL = "http://api.opweg26031971.nl";
  }
  
  return <Component {...pageProps} />
}

export default MyApp
