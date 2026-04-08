import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { serverUrl } from '../App'
import { addToCart } from '../redux/userSlice'
import { FaStar } from 'react-icons/fa'

function UserOrderCard({ data }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [selectedRating, setSelectedRating] = useState({})//itemId:rating

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-GB', {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleRating = async (itemId, rating) => {
        try {
            await axios.post(`${serverUrl}/api/item/rating`, { itemId, rating }, { withCredentials: true })
            setSelectedRating(prev => ({
                ...prev, [itemId]: rating
            }))
        } catch (error) {
            console.log(error)
        }
    }

    const handleReorder = () => {
        data.shopOrders.forEach(so => {
            so.shopOrderItems.forEach(item => {
                dispatch(addToCart({
                    id: item.item._id || item.item,
                    name: item.name,
                    price: item.price,
                    image: item.item.image || item.image,
                    quantity: item.quantity,
                    shop: so.shop
                }))
            })
        })
        navigate('/check-out')
    }

    const isOngoing = data.shopOrders?.some(so => so.status !== 'delivered' && so.status !== 'rejected')
    const isDelivered = data.shopOrders?.every(so => so.status === 'delivered')

    return (
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5 transition-shadow hover:shadow-md'>
            <div className='flex justify-between items-center border-b border-gray-100 pb-3'>
                <div>
                    <h3 className='font-black text-lg text-gray-800 tracking-tight'>
                        Order #{data._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className='text-xs font-semibold text-gray-500 mt-0.5'>
                        {formatDate(data.createdAt)}
                    </p>
                </div>
                <div className='text-right flex flex-col items-end gap-1'>
                    <span className='text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded'>
                        {data.paymentMethod === "cod" ? "CASH ON DELIVERY" : "ONLINE PAYMENT"}
                    </span>
                    <span className={`text-sm font-black uppercase tracking-wide ${
                        isDelivered ? 'text-green-600' : 'text-[#fc8019]'
                    }`}>
                        {data.shopOrders?.[0]?.status}
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                {data.shopOrders?.map((shopOrder, index) => (
                    <div className='border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-3' key={index}>
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-gray-800">{shopOrder.shop.shopName}</p>
                            <span className="text-sm font-black text-gray-800">₹{shopOrder.subtotal}</span>
                        </div>

                        <div className='flex flex-col gap-3'>
                            {shopOrder.shopOrderItems.map((item, idx) => (
                                <div key={idx} className='flex items-center justify-between bg-white border border-gray-100 rounded-lg p-3 shadow-sm'>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img src={item.item?.image || item.image} alt={item.name} className='w-full h-full object-cover' />
                                        </div>
                                        <div>
                                            <p className='text-sm font-bold text-gray-800'>{item.name}</p>
                                            <p className='text-xs font-semibold text-gray-500'>Qty: {item.quantity} × ₹{item.price}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-800">₹{item.quantity * item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Rating System for Delivered Orders */}
            {isDelivered && (
                <div className="bg-[#fff9f6] border border-orange-100 rounded-xl p-4 mt-4">
                    <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Rate Your Items</h4>
                    <div className="space-y-3">
                        {data.shopOrders?.map(so => 
                            so.shopOrderItems.map((item, idx) => {
                                const itemId = item.item?._id || item.item;
                                const currentRating = selectedRating[itemId] || 0;
                                return (
                                <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-orange-50 shadow-sm">
                                    <p className="text-sm font-semibold text-gray-700 truncate max-w-[50%]">{item.name}</p>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star}
                                                className={`text-xl transition-all ${currentRating >= star ? 'text-yellow-400 scale-110 drop-shadow-sm' : 'text-gray-300 hover:text-yellow-200'}`} 
                                                onClick={() => handleRating(itemId, star)}
                                            >
                                                <FaStar />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )})
                        )}
                    </div>
                </div>
            )}

            <div className='flex justify-between items-center border-t border-gray-100 pt-4 mt-2'>
                <p className='font-black text-lg text-gray-800'>Total: <span className="text-[#fc8019]">₹{data.totalAmount}</span></p>
                <div className='flex gap-3'>
                    <button 
                        className='bg-white border-2 border-[#fc8019] text-[#fc8019] px-5 py-2 rounded-xl text-sm font-black hover:bg-orange-50 transition-colors shadow-sm' 
                        onClick={handleReorder}
                    >
                        Reorder
                    </button>
                    {isOngoing && (
                        <button 
                            className='bg-[#fc8019] hover:bg-[#e47317] text-white px-5 py-2 rounded-xl text-sm font-black transition-colors shadow-sm' 
                            onClick={() => navigate(`/track-order/${data._id}`)}
                        >
                            Track Order
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserOrderCard
