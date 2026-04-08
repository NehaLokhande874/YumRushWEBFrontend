import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import {  setCurrentAddress, setCurrentCity, setCurrentState, setUserData } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'

function useUpdateLocation() {
    const dispatch=useDispatch()
    const {userData,socket}=useSelector(state=>state.user)
 
    useEffect(()=>{
      if (!navigator.geolocation) return

      const watchId = navigator.geolocation.watchPosition(async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude

        try {
          await axios.post(`${serverUrl}/api/user/update-location`, { lat, lon }, { withCredentials: true })
        } catch (err) {
          console.warn('update-location API error', err)
        }

        if (userData?.role === 'deliveryBoy' && socket?.emit) {
          const orderId = localStorage.getItem('currentOrderId') || null
          socket.emit('updateLocation', {
            userId: userData._id,
            orderId,
            lat,
            lng: lon
          })

          if (orderId) {
            socket.emit('joinOrderRoom', { orderId })
          }
        }
      },
      (err) => {
        console.error('watchPosition error', err)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 })

      return () => {
        navigator.geolocation.clearWatch(watchId)
      }
    }, [userData, socket])
}

export default useUpdateLocation
