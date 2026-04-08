import React from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'

const createEmojiIcon = (emoji, size = 36) => L.divIcon({
  html: `<div style="font-size:${size}px;line-height:1">${emoji}</div>`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size],
  className: ''
})

const deliveryIcon = createEmojiIcon('🛵')
const customerIcon = createEmojiIcon('🏠')
const restaurantIcon = createEmojiIcon('🍽️')

// ✅ Safe check for valid coordinates
const isValid = (loc, latKey = 'lat', lonKey = 'lon') => {
  const lat = loc?.[latKey]
  const lon = loc?.[lonKey]
  return lat != null && lon != null && !isNaN(Number(lat)) && !isNaN(Number(lon))
}

function LiveMap({ restaurantLocation, customerLocation, deliveryLocation }) {

  // ✅ Safe center - defaults to India if no valid location
  let center = [20.5937, 78.9629]
  if (isValid(deliveryLocation, 'lat', 'lng')) {
    center = [Number(deliveryLocation.lat), Number(deliveryLocation.lng)]
  } else if (isValid(customerLocation)) {
    center = [Number(customerLocation.lat), Number(customerLocation.lon)]
  } else if (isValid(restaurantLocation)) {
    center = [Number(restaurantLocation.lat), Number(restaurantLocation.lon)]
  }

  // ✅ Safe path
  const path = []
  if (isValid(restaurantLocation)) path.push([Number(restaurantLocation.lat), Number(restaurantLocation.lon)])
  if (isValid(deliveryLocation, 'lat', 'lng')) path.push([Number(deliveryLocation.lat), Number(deliveryLocation.lng)])
  if (isValid(customerLocation)) path.push([Number(customerLocation.lat), Number(customerLocation.lon)])

  return (
    <div className='w-full h-[380px] rounded-2xl overflow-hidden shadow-lg'>
      <MapContainer center={center} zoom={14} className='w-full h-full'>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {isValid(restaurantLocation) && (
          <Marker position={[Number(restaurantLocation.lat), Number(restaurantLocation.lon)]} icon={restaurantIcon}>
            <Popup><div className='font-bold text-sm'>🍽️ Restaurant</div></Popup>
          </Marker>
        )}

        {isValid(customerLocation) && (
          <Marker position={[Number(customerLocation.lat), Number(customerLocation.lon)]} icon={customerIcon}>
            <Popup><div className='font-bold text-sm'>🏠 Your Location</div></Popup>
          </Marker>
        )}

        {isValid(deliveryLocation, 'lat', 'lng') && (
          <Marker position={[Number(deliveryLocation.lat), Number(deliveryLocation.lng)]} icon={deliveryIcon}>
            <Popup><div className='font-bold text-sm'>🛵 Delivery Partner</div></Popup>
          </Marker>
        )}

        {path.length >= 2 && (
          <Polyline positions={path} color='rgba(252,128,25,0.8)' weight={4} dashArray='10,5' />
        )}
      </MapContainer>
    </div>
  )
}

export default LiveMap