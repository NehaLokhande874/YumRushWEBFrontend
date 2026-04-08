import axios from 'axios'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaCheckCircle, FaCircle } from "react-icons/fa";
import LiveMap from '../components/LiveMap'
import { useSelector } from 'react-redux'
import { IoChatbubblesOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";

const orderSteps = [
    { id: "pending", label: "Order Placed" },
    { id: "accepted", label: "Order Accepted" },
    { id: "preparing", label: "Preparing Your Food" },
    { id: "out of delivery", label: "Out for Delivery" },
    { id: "delivered", label: "Delivered" }
];

function TrackOrderPage() {
    const { orderId } = useParams()
    const [currentOrder, setCurrentOrder] = useState(null)
    const navigate = useNavigate()
    const { socket, userData } = useSelector(state => state.user)
    const [liveLocations, setLiveLocations] = useState({})
    const targetLocationsRef = useRef({})
    const animationRef = useRef(null)
    const [toasts, setToasts] = useState([])
    const [showAssignedPopup, setShowAssignedPopup] = useState(false)

    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatMessages, setChatMessages] = useState([])
    const [chatInput, setChatInput] = useState("")
    const [unreadCount, setUnreadCount] = useState(0)
    const chatEndRef = useRef(null)

    // FIX: Use a ref to track isChatOpen inside socket callbacks
    // to avoid re-registering listeners every time chat opens/closes
    const isChatOpenRef = useRef(isChatOpen)
    useEffect(() => {
        isChatOpenRef.current = isChatOpen
    }, [isChatOpen])

    // FIX: Wrapped in useCallback so it has a stable reference for useEffect deps
    const handleGetOrder = useCallback(async () => {
        try {
            const result = await axios.get(
                `${serverUrl}/api/order/get-order-by-id/${orderId}`,
                { withCredentials: true }
            )
            setCurrentOrder(result.data)
        } catch (error) {
            console.log(error)
        }
    }, [orderId])

    const addToast = (text) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        setToasts(prev => [...prev, { id, text }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3500)
    }

    useEffect(() => {
        animationRef.current = window.setInterval(() => {
            setLiveLocations(prev => {
                const keys = Object.keys(targetLocationsRef.current)
                if (!keys.length) return prev
                const next = { ...prev }
                keys.forEach((key) => {
                    const target = targetLocationsRef.current[key]
                    const curr = next[key]
                    if (!curr) {
                        next[key] = target
                        return
                    }
                    next[key] = {
                        lat: curr.lat + (target.lat - curr.lat) * 0.25,
                        lng: curr.lng + (target.lng - curr.lng) * 0.25
                    }
                })
                return next
            })
        }, 120)

        return () => {
            if (animationRef.current) {
                window.clearInterval(animationRef.current)
                animationRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (!socket) return;
        socket.emit("joinOrderRoom", { orderId })
        socket.emit("get-chat-history", { orderId })

        const handleLiveLocation = ({ deliveryBoyId, lat, lng, latitude, longitude }) => {
            const nextLat = Number(lat ?? latitude)
            const nextLng = Number(lng ?? longitude)
            if (!deliveryBoyId || Number.isNaN(nextLat) || Number.isNaN(nextLng)) return
            targetLocationsRef.current[deliveryBoyId] = { lat: nextLat, lng: nextLng }
            setLiveLocations(prev => {
                if (prev[deliveryBoyId]) return prev
                return { ...prev, [deliveryBoyId]: { lat: nextLat, lng: nextLng } }
            })
        }

        const handleStatusUpdate = ({ orderId: incomingOrderId, status }) => {
            if (String(incomingOrderId) !== String(orderId)) return
            handleGetOrder()
            addToast(`Order status updated: ${status}`)
        }

        const handleDeliveryAssigned = ({ orderId: incomingOrderId, deliveryBoy }) => {
            if (String(incomingOrderId) !== String(orderId)) return
            setShowAssignedPopup(true)
            addToast("🛵 Delivery Partner Assigned! Agent is on the way!")
            setCurrentOrder((prev) => {
                if (!prev) return prev
                const updatedShopOrders = (prev.shopOrders || []).map((shopOrder) => {
                    if (shopOrder.assignedDeliveryBoy) return shopOrder
                    return { ...shopOrder, assignedDeliveryBoy: deliveryBoy }
                })
                return { ...prev, shopOrders: updatedShopOrders }
            })
            setTimeout(() => setShowAssignedPopup(false), 3500)
        }

        const handleChatHistory = ({ orderId: incomingOrderId, messages }) => {
            if (String(incomingOrderId) !== String(orderId)) return
            setChatMessages(Array.isArray(messages) ? messages : [])
        }

        const handleChatMessage = (message) => {
            if (String(message?.orderId) !== String(orderId)) return
            setChatMessages(prev => [...prev, message])
            // FIX: Use ref instead of stale closure over isChatOpen
            if (!isChatOpenRef.current && String(message.senderId) !== String(userData?._id)) {
                setUnreadCount(prev => prev + 1)
            }
        }

        socket.on('delivery-location-update', handleLiveLocation)
        socket.on('updateDeliveryLocation', handleLiveLocation)
        socket.on('order-status-update', handleStatusUpdate)
        socket.on('update-status', handleStatusUpdate)
        socket.on('delivery-boy-assigned', handleDeliveryAssigned)
        socket.on('chat-history', handleChatHistory)
        socket.on('chat-message', handleChatMessage)

        return () => {
            socket.off('delivery-location-update', handleLiveLocation)
            socket.off('updateDeliveryLocation', handleLiveLocation)
            socket.off('order-status-update', handleStatusUpdate)
            socket.off('update-status', handleStatusUpdate)
            socket.off('delivery-boy-assigned', handleDeliveryAssigned)
            socket.off('chat-history', handleChatHistory)
            socket.off('chat-message', handleChatMessage)
        }
        // FIX: Removed isChatOpen from deps (now uses ref). Added userData?._id and handleGetOrder.
    }, [socket, orderId, userData?._id, handleGetOrder])

    useEffect(() => {
        if (!isChatOpen) return
        setUnreadCount(0)
    }, [isChatOpen])

    useEffect(() => {
        if (!chatEndRef.current) return
        chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }, [chatMessages, isChatOpen])

    useEffect(() => {
        localStorage.setItem('currentOrderId', orderId)
        handleGetOrder()
        return () => {
            localStorage.removeItem('currentOrderId')
        }
        // FIX: Was missing the closing ')' for useEffect — this was a syntax error
    }, [orderId, handleGetOrder])

    const isOrderActive = useMemo(() => {
        if (!currentOrder?.shopOrders?.length) return false
        return currentOrder.shopOrders.some(
            (shopOrder) => !["delivered", "rejected"].includes(shopOrder.status)
        )
    }, [currentOrder])

    const handleSendMessage = () => {
        if (!socket || !chatInput.trim() || !isOrderActive) return
        socket.emit("chat-message", {
            orderId,
            senderId: userData?._id,
            senderName: userData?.fullName || userData?.name || "Customer",
            senderRole: userData?.role || "user",
            message: chatInput.trim(),
            timestamp: new Date().toISOString()
        })
        setChatInput("")
    }

    if (!currentOrder) {
        return (
            <div className='max-w-4xl mx-auto p-4 flex items-center justify-center min-h-[60vh]'>
                <p className='text-gray-500 text-lg font-medium'>Loading order details...</p>
            </div>
        )
    }

    return (
        <div className='max-w-4xl mx-auto p-3 sm:p-4 flex flex-col gap-6 md:my-6 relative'>
            <div
                className='flex items-center gap-3 cursor-pointer select-none mb-2'
                onClick={() => navigate(-1)}
            >
                <IoIosArrowRoundBack size={35} className='text-[#fc8019]' />
                <h1 className='text-2xl sm:text-3xl font-black text-gray-800 tracking-tight'>Track Order</h1>
            </div>

            {showAssignedPopup && (
                <div className='fixed top-4 right-3 sm:right-5 z-[1200] max-w-[92vw] bg-white border border-green-200 text-green-700 shadow-lg rounded-xl px-3 sm:px-4 py-3 font-semibold text-sm sm:text-base'>
                    🛵 Delivery Partner Assigned! Agent is on the way!
                </div>
            )}

            <div className='fixed top-4 left-1/2 -translate-x-1/2 z-[1200] flex flex-col gap-2 w-[92vw] sm:w-auto'>
                {toasts.map((toast) => (
                    <div key={toast.id} className='bg-gray-900 text-white px-3 sm:px-4 py-2 rounded-lg text-sm shadow-lg text-center'>
                        {toast.text}
                    </div>
                ))}
            </div>

            {currentOrder?.shopOrders?.map((shopOrder, index) => {
                const currentStatus = shopOrder.status;
                const isRejected = currentStatus === "rejected";
                const currentStepIndex = isRejected
                    ? -1
                    : orderSteps.findIndex(s => s.id === currentStatus);

                return (
                    <div
                        className='bg-white p-4 sm:p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col gap-6 sm:gap-8'
                        key={index}
                    >
                        <div className='flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between sm:items-center bg-orange-50/50 p-4 rounded-xl border border-orange-100/50'>
                            <p className='text-lg sm:text-xl font-bold text-gray-800'>{shopOrder.shop?.name}</p>
                            {isRejected ? (
                                <span className="bg-red-100 text-red-600 px-4 py-1.5 rounded-full font-bold shadow-sm">
                                    Order Rejected ❌
                                </span>
                            ) : (
                                <span className="bg-[#fc8019] text-white px-4 py-1.5 rounded-full font-bold shadow-md shadow-orange-200 capitalize">
                                    {currentStatus === "out of delivery" ? "Out for Delivery" : currentStatus}
                                </span>
                            )}
                        </div>

                        {!isRejected && (
                            <div className="relative flex flex-col md:flex-row justify-between w-full md:items-center py-6 px-2 md:px-8 gap-8 md:gap-0">
                                <div className="hidden md:block absolute top-[45%] left-10 right-10 h-1.5 bg-gray-100 z-0 rounded-full"></div>
                                <div
                                    className="hidden md:block absolute top-[45%] left-10 h-1.5 bg-[#fc8019] z-0 rounded-full transition-all duration-700"
                                    style={{
                                        width: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%`
                                    }}
                                ></div>

                                {orderSteps.map((step, idx) => {
                                    const isCompleted = idx < currentStepIndex || currentStatus === "delivered";
                                    const isActive = idx === currentStepIndex && currentStatus !== "delivered";
                                    const isPending = idx > currentStepIndex;

                                    return (
                                        <div
                                            key={idx}
                                            className="relative z-10 flex md:flex-col items-center gap-4 md:gap-3 w-full md:w-auto"
                                        >
                                            {idx !== orderSteps.length - 1 && (
                                                <div className="md:hidden absolute left-5 top-12 bottom-[-24px] w-0.5 bg-gray-100 -z-10"></div>
                                            )}
                                            {idx !== orderSteps.length - 1 && !isPending && (
                                                <div className="md:hidden absolute left-5 top-12 bottom-[-24px] w-0.5 bg-[#fc8019] -z-10 transition-all"></div>
                                            )}

                                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-full relative">
                                                {isCompleted ? (
                                                    <FaCheckCircle className="text-3xl text-green-500 scale-110 drop-shadow-sm transition-all" />
                                                ) : isActive ? (
                                                    <div className="relative flex items-center justify-center w-8 h-8">
                                                        <div className="absolute inset-0 bg-[#fc8019] rounded-full animate-ping opacity-75"></div>
                                                        <FaCircle className="text-[#fc8019] text-xl relative z-10" />
                                                    </div>
                                                ) : (
                                                    <FaCircle className="text-gray-200 text-xl" />
                                                )}
                                            </div>

                                            <div className="flex flex-col md:items-center">
                                                <p className={`font-bold text-sm md:text-xs text-center ${isActive ? 'text-[#fc8019]' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </p>
                                                {(isCompleted || isActive) && (
                                                    <span className="text-[10px] text-gray-500 font-medium">
                                                        {new Date(shopOrder.updatedAt).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 text-lg border-b pb-2">Order Summary</h3>
                                <div className="space-y-3">
                                    {shopOrder.shopOrderItems?.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <img
                                                src={item.item?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                                                alt={item.name}
                                                className="w-12 h-12 object-cover rounded-lg shadow-sm"
                                            />
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-gray-700">₹{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-3 border-t flex justify-between items-center text-lg">
                                    <span className="font-bold text-gray-600">Total</span>
                                    <span className="font-black text-[#fc8019]">₹{currentOrder?.totalAmount}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 text-lg border-b pb-2">Delivery Details</h3>
                                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <p className="font-semibold text-gray-800 text-sm">Address</p>
                                    <p className="text-gray-500 text-sm mt-1 leading-snug">
                                        {currentOrder?.deliveryAddress?.text}
                                    </p>
                                </div>
                                {shopOrder.assignedDeliveryBoy ? (
                                    <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                                        <p className="font-semibold text-[#fc8019] text-sm">Delivery Partner</p>
                                        <p className="text-gray-800 text-sm font-bold mt-1">
                                            {shopOrder.assignedDeliveryBoy.fullName}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            📞 {shopOrder.assignedDeliveryBoy.mobile}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm opacity-60">
                                        <p className="text-gray-500 text-sm font-medium italic">
                                            Partner assigning soon...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {(shopOrder.assignedDeliveryBoy &&
                            currentStatus !== "delivered" &&
                            currentStatus !== "rejected") && (
                                <div className="h-[280px] sm:h-[350px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white mt-2 relative">
                                    <div className="absolute top-4 left-4 z-[1000] bg-white px-4 py-2 rounded-xl shadow-md font-bold text-sm text-gray-700 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Live GPS Tracking
                                    </div>
                                    <LiveMap
                                        deliveryLocation={
                                            liveLocations[shopOrder.assignedDeliveryBoy._id] || {
                                                lat: shopOrder.assignedDeliveryBoy?.location?.coordinates?.[1],
                                                lng: shopOrder.assignedDeliveryBoy?.location?.coordinates?.[0]
                                            }
                                        }
                                        customerLocation={{
                                            lat: currentOrder?.deliveryAddress?.latitude,
                                            lon: currentOrder?.deliveryAddress?.longitude
                                        }}
                                        restaurantLocation={{
                                            lat: shopOrder.shop?.location?.coordinates?.[1] ?? currentOrder?.deliveryAddress?.latitude,
                                            lon: shopOrder.shop?.location?.coordinates?.[0] ?? currentOrder?.deliveryAddress?.longitude
                                        }}
                                    />
                                </div>
                            )}
                    </div>
                )
            })}

            <button
                className='fixed bottom-4 right-3 sm:bottom-6 sm:right-6 bg-[#fc8019] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-lg flex items-center gap-2 font-semibold z-[1200]'
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
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
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
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        disabled={!isOrderActive}
                        placeholder={isOrderActive ? "Type message..." : "Chat available for active orders only"}
                        className='flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'
                    />
                    <button
                        className='bg-[#fc8019] text-white px-4 rounded-lg disabled:opacity-60'
                        onClick={handleSendMessage}
                        disabled={!isOrderActive || !chatInput.trim()}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TrackOrderPage