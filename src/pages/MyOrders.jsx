import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import ComplaintForm from '../components/ComplaintForm';
import RatingModal from '../components/RatingModal';
import { setMyOrders, updateOrderStatus, updateRealtimeOrderStatus } from '../redux/userSlice';


function MyOrders() {
  const { userData, myOrders, socket } = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ratedOrderIds, setRatedOrderIds] = useState(new Set());

  useEffect(() => {
    socket?.on('newOrder', (data) => {
      if (data.shopOrders?.owner._id == userData._id) {
        dispatch(setMyOrders([data, ...myOrders]))
      }
    })

    socket?.on('update-status', ({ orderId, shopId, status, userId }) => {
      if (userId == userData._id) {
        dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }))
      }
    })

    return () => {
      socket?.off('newOrder')
      socket?.off('update-status')
    }
  }, [socket])


  return (
    <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
      <div className='w-full max-w-[800px] p-4 pb-20'>

        <div className='flex items-center gap-[20px] mb-6 '>
          <div className=' z-[10] cursor-pointer' onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
          </div>
          <h1 className='text-2xl font-bold  text-start'>My Orders</h1>
        </div>
        <div className='space-y-6'>
          {myOrders?.map((order, index) => (
            <div key={index} className='space-y-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100'>
              {userData.role == "user" ?
                <UserOrderCard data={order} />
                : userData.role == "owner" ?
                  <OwnerOrderCard data={order} />
                  : null
              }

              {userData.role === "user" && (
                <div className='space-y-2 mt-4'>
                  {order.shopOrders?.status === "delivered" && (
                    <div className='flex flex-col gap-2'>
                        {ratedOrderIds.has(order._id) ? (
                            <div className="w-full py-2 bg-green-50 text-green-600 font-bold rounded-xl text-center border border-green-100 italic">
                                Rated ✓
                            </div>
                        ) : (
                            <button 
                                onClick={() => {
                                    setSelectedOrder(order);
                                    setShowRatingModal(true);
                                }}
                                className="w-full bg-[#fc8019] text-white py-2.5 rounded-xl font-bold hover:bg-[#e67316] transition-all shadow-md active:scale-95"
                            >
                                Rate Items
                            </button>
                        )}
                      <ComplaintForm orderId={order._id} shopId={order.shopOrders.shop?._id || order.shopOrders.shop} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {showRatingModal && selectedOrder && (
            <RatingModal 
                order={selectedOrder} 
                onClose={() => setShowRatingModal(false)} 
                onRefresh={() => setRatedOrderIds(prev => new Set(prev).add(selectedOrder._id))}
            />
        )}
      </div>
    </div>
  )
}

export default MyOrders
