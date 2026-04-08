import React from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useMemo, useRef, useState } from 'react'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { IoChatbubblesOutline } from "react-icons/io5"
import { MdClose } from "react-icons/md"

function DeliveryBoy() {
    const { userData, socket } = useSelector(state => state.user)
    const [currentOrder, setCurrentOrder] = useState()
    const [showOtpBox, setShowOtpBox] = useState(false)
    const [availableAssignments, setAvailableAssignments] = useState(null)
    const [otp, setOtp] = useState("")
    const [todayDeliveries, setTodayDeliveries] = useState([])
    const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [isSimulating, setIsSimulating] = useState(false)
    const simulationRef = useRef(null)
    const [earningFlash, setEarningFlash] = useState(0)
    const [extraEarning, setExtraEarning] = useState(0)

    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatMessages, setChatMessages] = useState([])
    const [chatInput, setChatInput] = useState("")
    const [unreadCount, setUnreadCount] = useState(0)
    const chatEndRef = useRef(null)

    // FIX: ref to avoid stale closure in socket listener
    const isChatOpenRef = useRef(isChatOpen)
    useEffect(() => {
        isChatOpenRef.current = isChatOpen
    }, [isChatOpen])

    const emitLocation = (lat, lng, relatedOrderId) => {
        if (!socket || !userData?._id) return
        socket.emit('delivery-location-update', {
            orderId: relatedOrderId,
            deliveryBoyId: userData._id,
            lat,
            lng
        })
    }

    const startSimulation = () => {
        if (simulationRef.current || !currentOrder) return
        const baseLat = Number(
            deliveryBoyLocation?.lat ??
            userData?.location?.coordinates?.[1] ??
            currentOrder?.deliveryBoyLocation?.lat ?? 0
        )
        const baseLng = Number(
            deliveryBoyLocation?.lon ??
            userData?.location?.coordinates?.[0] ??
            currentOrder?.deliveryBoyLocation?.lon ?? 0
        )
        if (Number.isNaN(baseLat) || Number.isNaN(baseLng)) return

        setIsSimulating(true)
        let simLat = baseLat
        let simLng = baseLng
        simulationRef.current = window.setInterval(() => {
            const latStep = (Math.random() - 0.5) * 0.0009
            const lngStep = (Math.random() - 0.5) * 0.0009
            simLat += latStep
            simLng += lngStep
            setDeliveryBoyLocation({ lat: simLat, lon: simLng })
            emitLocation(simLat, simLng, currentOrder?._id)
        }, 2000)
    }

    const stopSimulation = () => {
        if (simulationRef.current) {
            window.clearInterval(simulationRef.current)
            simulationRef.current = null
        }
        setIsSimulating(false)
    }

    useEffect(() => {
        if (!socket || userData?.role !== "deliveryBoy") return
        let watchId
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const latitude = position.coords.latitude
                    const longitude = position.coords.longitude
                    setDeliveryBoyLocation({ lat: latitude, lon: longitude })
                    emitLocation(latitude, longitude, currentOrder?._id)
                },
                (error) => console.log(error),
                { enableHighAccuracy: true }
            )
        }
        return () => {
            stopSimulation()
            if (watchId) navigator.geolocation.clearWatch(watchId)
        }
    }, [socket, userData, currentOrder?._id])

    const ratePerDelivery = 50
    const totalEarning = todayDeliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0) + extraEarning

    const isOrderActive = useMemo(() => {
        return currentOrder?.shopOrder?.status &&
            !["delivered", "rejected"].includes(currentOrder.shopOrder.status)
    }, [currentOrder])

    const getAssignments = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-assignments`, { withCredentials: true })
            setAvailableAssignments(result.data)
        } catch (error) {
            console.log(error)
        }
    }

    const getCurrentOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true })
            setCurrentOrder(result.data)
        } catch (error) {
            console.log(error)
        }
    }

    const acceptOrder = async (assignmentId) => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, { withCredentials: true })
            console.log(result.data)
            await getCurrentOrder()
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (!socket) return
        socket.on('newAssignment', (data) => {
            setAvailableAssignments(prev => ([...(prev || []), data]))
        })
        const onEarningUpdate = ({ amount }) => {
            const add = Number(amount) || 40
            setExtraEarning(prev => prev + add)
            setEarningFlash(add)
            setTimeout(() => setEarningFlash(0), 1800)
            handleTodayDeliveries()
        }
        const onChatHistory = ({ orderId, messages }) => {
            if (String(orderId) !== String(currentOrder?._id)) return
            setChatMessages(Array.isArray(messages) ? messages : [])
        }
        const onChatMessage = (msg) => {
            if (String(msg?.orderId) !== String(currentOrder?._id)) return
            setChatMessages(prev => [...prev, msg])
            // FIX: use ref to avoid stale closure
            if (!isChatOpenRef.current && String(msg.senderId) !== String(userData?._id)) {
                setUnreadCount(prev => prev + 1)
            }
        }
        socket.on("earnings-update", onEarningUpdate)
        socket.on("chat-history", onChatHistory)
        socket.on("chat-message", onChatMessage)
        return () => {
            socket.off('newAssignment')
            socket.off("earnings-update", onEarningUpdate)
            socket.off("chat-history", onChatHistory)
            socket.off("chat-message", onChatMessage)
        }
    }, [socket, currentOrder?._id, userData?._id])

    useEffect(() => {
        if (!socket || !currentOrder?._id) return
        socket.emit("joinOrderRoom", { orderId: currentOrder._id })
        socket.emit("get-chat-history", { orderId: currentOrder._id })
    }, [socket, currentOrder?._id])

    useEffect(() => {
        if (!isChatOpen) return
        setUnreadCount(0)
    }, [isChatOpen])

    useEffect(() => {
        if (!chatEndRef.current) return
        chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }, [chatMessages, isChatOpen])

    const sendOtp = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/order/send-delivery-otp`, {
                orderId: currentOrder._id,
                shopOrderId: currentOrder.shopOrder._id
            }, { withCredentials: true })
            setLoading(false)
            setShowOtpBox(true)
            console.log(result.data)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    const verifyOtp = async () => {
        setMessage("")
        try {
            const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, {
                orderId: currentOrder._id,
                shopOrderId: currentOrder.shopOrder._id,
                otp
            }, { withCredentials: true })
            console.log(result.data)
            setMessage(result.data.message)
            location.reload()
        } catch (error) {
            console.log(error)
        }
    }

    const handleTodayDeliveries = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, { withCredentials: true })
            console.log(result.data)
            setTodayDeliveries(result.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getAssignments()
        getCurrentOrder()
        handleTodayDeliveries()
    }, [userData])

    const sendChatMessage = () => {
        if (!socket || !chatInput.trim() || !currentOrder?._id || !isOrderActive) return
        socket.emit("chat-message", {
            orderId: currentOrder._id,
            senderId: userData?._id,
            senderName: userData?.fullName || "Delivery Partner",
            senderRole: "deliveryBoy",
            message: chatInput.trim(),
            timestamp: new Date().toISOString()
        })
        setChatInput("")
    }

    return (
        <div className='w-full min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-x-hidden overflow-y-auto'>
            <Nav />
            <div className='w-full max-w-[800px] flex flex-col gap-5 items-center px-3 sm:px-4'>
                <div className='bg-white rounded-2xl shadow-md p-4 sm:p-5 flex flex-col justify-start items-center w-full border border-orange-100 text-center gap-2'>
                    <h1 className='text-xl font-bold text-[#ff4d2d]'>Welcome, {userData.fullName}</h1>
                    <p className='text-[#ff4d2d]'>
                        <span className='font-semibold'>Latitude:</span> {deliveryBoyLocation?.lat},{' '}
                        <span className='font-semibold'>Longitude:</span> {deliveryBoyLocation?.lon}
                    </p>
                </div>

                <div className='bg-white rounded-2xl shadow-md p-4 sm:p-5 w-full mb-6 border border-orange-100'>
                    <h1 className='text-lg font-bold mb-3 text-[#ff4d2d]'>Today Deliveries</h1>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={todayDeliveries}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
                            <YAxis allowDecimals={false} />
                            <Tooltip formatter={(value) => [value, "orders"]} labelFormatter={label => `${label}:00`} />
                            <Bar dataKey="count" fill='#ff4d2d' />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className='max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center'>
                        <h1 className='text-xl font-semibold text-gray-800 mb-2'>Today's Earning</h1>
                        <span className='text-3xl font-bold text-green-600'>₹{totalEarning}</span>
                        {earningFlash > 0 && (
                            <p className='text-green-500 font-bold mt-2 animate-bounce'>+₹{earningFlash}</p>
                        )}
                    </div>
                </div>

                {!currentOrder && (
                    <div className='bg-white rounded-2xl p-4 sm:p-5 shadow-md w-full border border-orange-100'>
                        <h1 className='text-lg font-bold mb-4 flex items-center gap-2'>Available Orders</h1>
                        <div className='space-y-4'>
                            {availableAssignments?.length > 0 ? (
                                availableAssignments.map((a, index) => (
                                    <div className='border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between sm:items-center' key={index}>
                                        <div>
                                            <p className='text-sm font-semibold'>{a?.shopName}</p>
                                            <p className='text-sm text-gray-500'>
                                                <span className='font-semibold'>Delivery Address:</span> {a?.deliveryAddress.text}
                                            </p>
                                            <p className='text-xs text-gray-400'>{a.items.length} items | {a.subtotal}</p>
                                        </div>
                                        <button
                                            className='bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600'
                                            onClick={() => acceptOrder(a.assignmentId)}
                                        >
                                            Accept
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className='text-gray-400 text-sm'>No Available Orders</p>
                            )}
                        </div>
                    </div>
                )}

                {currentOrder && (
                    <div className='bg-white rounded-2xl p-4 sm:p-5 shadow-md w-full border border-orange-100'>
                        <h2 className='text-lg font-bold mb-3'>📦 Current Order</h2>
                        <div className='border rounded-lg p-4 mb-3'>
                            <p className='font-semibold text-sm'>{currentOrder?.shopOrder.shop.shopName}</p>
                            <p className='text-sm text-gray-500'>{currentOrder.deliveryAddress.text}</p>
                            <p className='text-xs text-gray-400'>
                                {currentOrder.shopOrder.shopOrderItems.length} items | ₹{currentOrder.shopOrder.subtotal}
                            </p>
                        </div>

                        {/* FIX: restaurantLocation pass केलं */}
                        <DeliveryBoyTracking data={{
                            deliveryBoyLocation: deliveryBoyLocation || {
                                lat: userData?.location?.coordinates?.[1],
                                lon: userData?.location?.coordinates?.[0]
                            },
                            customerLocation: {
                                lat: currentOrder.deliveryAddress.latitude,
                                lon: currentOrder.deliveryAddress.longitude
                            },
                            restaurantLocation: {
                                lat: currentOrder.shopOrder?.shop?.location?.coordinates?.[1],
                                lon: currentOrder.shopOrder?.shop?.location?.coordinates?.[0]
                            }
                        }} />

                        <div className='flex gap-2 mt-3'>
                            <button
                                className='flex-1 bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-blue-600 disabled:opacity-60'
                                onClick={startSimulation}
                                disabled={!isOrderActive || isSimulating}
                            >
                                ▶ Simulate Delivery
                            </button>
                            <button
                                className='flex-1 bg-gray-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-gray-800 disabled:opacity-60'
                                onClick={stopSimulation}
                                disabled={!isSimulating}
                            >
                                ⏹ Stop
                            </button>
                        </div>

                        {!showOtpBox ? (
                            <button
                                className='mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200'
                                onClick={sendOtp}
                                disabled={loading}
                            >
                                {loading ? <ClipLoader size={20} color='white' /> : "Mark As Delivered"}
                            </button>
                        ) : (
                            <div className='mt-4 p-4 border rounded-xl bg-gray-50'>
                                <p className='text-sm font-semibold mb-2'>
                                    Enter OTP sent to <span className='text-orange-500'>{currentOrder.user.fullName}</span>
                                </p>
                                <input
                                    type="text"
                                    className='w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400'
                                    placeholder='Enter OTP'
                                    onChange={(e) => setOtp(e.target.value)}
                                    value={otp}
                                />
                                {message && <p className='text-center text-green-400 text-2xl mb-4'>{message}</p>}
                                <button
                                    className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all"
                                    onClick={verifyOtp}
                                >
                                    Submit OTP
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button
                className='fixed bottom-6 right-6 bg-[#fc8019] text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 font-semibold z-[1200]'
                onClick={() => setIsChatOpen(true)}
                disabled={!isOrderActive}
            >
                <IoChatbubblesOutline size={20} />
                Chat
                {unreadCount > 0 && (
                    <span className='bg-red-600 text-white text-xs font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center'>
                        {unreadCount}
                    </span>
                )}
            </button>

            <div className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white shadow-2xl border-l z-[1300] transform transition-transform duration-300 ${isChatOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className='p-4 border-b flex items-center justify-between'>
                    <h3 className='font-bold text-lg'>Order Chat</h3>
                    <button className='p-1 rounded hover:bg-gray-100' onClick={() => setIsChatOpen(false)}>
                        <MdClose size={22} />
                    </button>
                </div>
                <div className='h-[calc(100%-130px)] overflow-y-auto p-3 flex flex-col gap-2 bg-gray-50'>
                    {chatMessages.length === 0 ? (
                        <p className='text-sm text-gray-500'>No messages yet.</p>
                    ) : chatMessages.map((msg) => {
                        const mine = String(msg.senderId) === String(userData?._id)
                        return (
                            <div
                                key={msg.id}
                                className={`max-w-[85%] rounded-xl px-3 py-2 ${mine ? "ml-auto bg-[#fc8019] text-white" : "mr-auto bg-white border"}`}
                            >
                                <p className='text-xs font-semibold opacity-80'>{msg.senderName}</p>
                                <p className='text-sm'>{msg.message}</p>
                                <p className='text-[11px] opacity-80 mt-1'>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        )
                    })}
                    <div ref={chatEndRef} />
                </div>
                <div className='p-3 border-t flex gap-2'>
                    <input
                        type='text'
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                        disabled={!isOrderActive}
                        placeholder={isOrderActive ? "Type message..." : "Chat available for active orders only"}
                        className='flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'
                    />
                    <button
                        className='bg-[#fc8019] text-white px-4 rounded-lg disabled:opacity-60'
                        onClick={sendChatMessage}
                        disabled={!isOrderActive || !chatInput.trim()}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeliveryBoy