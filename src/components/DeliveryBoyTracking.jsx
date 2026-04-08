import React, { useEffect } from 'react'
import scooter from "../assets/scooter.png"
import home from "../assets/home.png"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'

const deliveryBoyIcon = new L.Icon({
    iconUrl: scooter,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
})

const customerIcon = new L.Icon({
    iconUrl: home,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
})

const restaurantIcon = L.divIcon({
    html: `<div style="font-size:32px;line-height:1">🍽️</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    className: ''
})

function AutoFitMap({ positions }) {
    const map = useMap()
    useEffect(() => {
        const valid = positions.filter(p => p && !isNaN(p[0]) && !isNaN(p[1]))
        if (valid.length === 0) return
        if (valid.length === 1) {
            map.setView(valid[0], 16, { animate: true })
        } else {
            const bounds = L.latLngBounds(valid)
            map.fitBounds(bounds, { padding: [60, 60], animate: true })
        }
    }, [positions[0]?.[0], positions[0]?.[1]])
    return null
}

function DeliveryBoyTracking({ data }) {
    const deliveryBoyLat = Number(data?.deliveryBoyLocation?.lat)
    const deliveryBoyLon = Number(data?.deliveryBoyLocation?.lon)
    const customerLat = Number(data?.customerLocation?.lat)
    const customerLon = Number(data?.customerLocation?.lon)
    const restaurantLat = Number(data?.restaurantLocation?.lat)
    const restaurantLon = Number(data?.restaurantLocation?.lon)

    const hasDelivery = !isNaN(deliveryBoyLat) && !isNaN(deliveryBoyLon) && deliveryBoyLat !== 0
    const hasCustomer = !isNaN(customerLat) && !isNaN(customerLon) && customerLat !== 0
    const hasRestaurant = !isNaN(restaurantLat) && !isNaN(restaurantLon) && restaurantLat !== 0

    const center = hasDelivery
        ? [deliveryBoyLat, deliveryBoyLon]
        : hasCustomer
        ? [customerLat, customerLon]
        : [20.5937, 78.9629]

    const path = []
    if (hasRestaurant) path.push([restaurantLat, restaurantLon])
    if (hasDelivery) path.push([deliveryBoyLat, deliveryBoyLon])
    if (hasCustomer) path.push([customerLat, customerLon])

    const allPositions = []
    if (hasDelivery) allPositions.push([deliveryBoyLat, deliveryBoyLon])
    if (hasCustomer) allPositions.push([customerLat, customerLon])
    if (hasRestaurant) allPositions.push([restaurantLat, restaurantLon])

    return (
        <div className='w-full h-[280px] sm:h-[340px] md:h-[400px] mt-3 rounded-xl overflow-hidden shadow-md'>
            <MapContainer
                className="w-full h-full"
                center={center}
                zoom={14}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <AutoFitMap positions={allPositions} />

                {hasDelivery && (
                    <Marker position={[deliveryBoyLat, deliveryBoyLon]} icon={deliveryBoyIcon}>
                        <Popup>🛵 Delivery Partner</Popup>
                    </Marker>
                )}

                {hasCustomer && (
                    <Marker position={[customerLat, customerLon]} icon={customerIcon}>
                        <Popup>🏠 Delivery Location</Popup>
                    </Marker>
                )}

                {hasRestaurant && (
                    <Marker position={[restaurantLat, restaurantLon]} icon={restaurantIcon}>
                        <Popup>🍽️ Restaurant</Popup>
                    </Marker>
                )}

                {path.length >= 2 && (
                    <Polyline
                        positions={path}
                        color='#fc8019'
                        weight={4}
                        dashArray='10,6'
                    />
                )}
            </MapContainer>
        </div>
    )
}

export default DeliveryBoyTracking