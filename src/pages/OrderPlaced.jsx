import React, { useEffect, useState } from 'react'
import { FaCheckCircle } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { ClipLoader } from 'react-spinners';

function OrderPlaced() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true })
        .then(res => {
           setOrder(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (!orderId) {
     return (
        <div className='min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center'>
            <p>No active order found.</p>
            <button className='mt-4 bg-[#fc8019] text-white px-6 py-2 rounded-lg' onClick={() => navigate("/")}>Go Home</button>
        </div>
     )
  }

  if (loading || !order) {
     return (
        <div className='min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center'>
            <ClipLoader size={50} color='#fc8019' />
        </div>
     )
  }

  return (
    <div className='min-h-screen bg-[#fff9f6] flex flex-col items-center py-10 px-4 mt-8'>
      <div className='w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center text-center transform transition-all hover:scale-[1.01]'>
        <div className='bg-green-100 p-4 rounded-full mb-4 animate-bounce'>
           <FaCheckCircle className='text-green-500 text-6xl shadow-sm rounded-full' />
        </div>
        <h1 className='text-3xl font-black text-gray-800 mb-2'>Order Placed Successfully! 🎉</h1>
        <p className='text-gray-500 font-medium mb-6'>Order ID: <span className="text-gray-800 font-bold">#{order._id.substring(0, 8).toUpperCase()}</span></p>

        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 w-full mb-6 shadow-sm">
           <p className="text-[#fc8019] font-bold flex items-center justify-center gap-2">
              <span className="text-xl">🕐</span> Estimated delivery time: 30 to 45 minutes
           </p>
        </div>

        <div className='w-full text-left bg-gray-50 border border-gray-100 rounded-xl p-6 mb-8 space-y-4'>
           <h2 className='font-bold text-gray-800 border-b border-gray-200 pb-3'>Order Summary</h2>
           <div className='space-y-4 max-h-64 overflow-y-auto pr-2'>
              {order.shopOrders.map((shopOrder) => (
                  shopOrder.shopOrderItems.map((item, idx) => (
                      <div key={idx} className='flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-50 shadow-sm'>
                         <img src={item.item?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} alt={item.name} className='w-14 h-14 object-cover rounded-lg' />
                         <div className='flex-1'>
                             <p className='text-sm font-bold text-gray-800 line-clamp-1'>{item.name}</p>
                             <p className='text-xs text-gray-500 mt-1 font-medium'>Qty: {item.quantity}</p>
                         </div>
                         <p className='font-black text-gray-700'>₹{item.price * item.quantity}</p>
                      </div>
                  ))
              ))}
           </div>
           
           <div className='border-t border-gray-200 pt-4 space-y-3 text-sm'>
              <div className='flex justify-between'>
                 <span className='text-gray-600 font-medium'>Payment Method:</span>
                 <span className='font-bold uppercase text-gray-800 bg-gray-200 px-2 py-0.5 rounded'>{order.paymentMethod}</span>
              </div>
              <div className='flex justify-between'>
                 <span className='text-gray-600 font-medium'>Delivery Address:</span>
                 <span className='font-bold text-right text-gray-800 max-w-[220px] truncate'>{order.deliveryAddress?.text}</span>
              </div>
              <div className='flex justify-between items-center text-lg pt-3 border-t border-gray-200'>
                 <span className='font-bold text-gray-800'>Total Paid:</span>
                 <span className='font-black text-[#fc8019] text-2xl'>₹{order.totalAmount}</span>
              </div>
           </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 w-full'>
           <button 
             className='flex-1 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-6 py-4 rounded-xl font-bold transition-all shadow-sm' 
             onClick={() => navigate("/")}
           >
              Back to Home
           </button>
           <button 
             className='flex-1 bg-[#fc8019] hover:bg-[#e47317] text-white px-6 py-4 rounded-xl font-black shadow-lg shadow-orange-200 transition-all flex justify-center items-center gap-2' 
             onClick={() => navigate(`/track-order/${order._id}`)}
           >
              <span>📍</span> Track Order
           </button>
        </div>

      </div>
    </div>
  )
}

export default OrderPlaced

