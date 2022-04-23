import React, { useEffect, useState } from "react"
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import axios from 'axios'
import io from "socket.io-client"
import { Nav } from "../Components"

const MessageReciever = (socket: any) => {
  useEffect(() => {
    socket.socket.emit('getName', null, (response: any) => {
      console.log(response)
    })
  }, [])

  return (
    <div>

    </div>
  )
}

const Home: NextPage = () => {
  const [socket, setSocket] = useState<any>()

  useEffect(() => {
    const socket = io(`http://${window.location.hostname}:3001`)
    setSocket(socket)

    return () => { socket.close() }
  }, [setSocket])

  return (
    <div>
      <Nav />
      {socket ? <MessageReciever socket={socket} /> : <></>}
    </div>
  )
}

export default Home
