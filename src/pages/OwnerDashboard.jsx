import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { serverUrl } from '../App'
import { setMyShopData } from '../redux/ownerSlice'
import LiveMap from '../components/LiveMap'

function OwnerDashboard() {
  const dispatch = useDispatch()
  const { myShopData } = useSelector(state => state.owner)
  const { userData, socket } = useSelector(state => state.user)

  const [activeTab, setActiveTab] = useState('menu') // 'menu' or 'orders'
  const [orders, setOrders] = useState([])
  const [newOrderCount, setNewOrderCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [highlightOrderId, setHighlightOrderId] = useState(null)
  const [ownerLiveLocations, setOwnerLiveLocations] = useState({})

  const [shopForm, setShopForm] = useState({ name: '', city: '', state: '', address: '', image: null })
  const [itemForm, setItemForm] = useState({ name: '', category: 'Snacks', foodType: 'veg', price: '', image: null })
  const [editingItem, setEditingItem] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (myShopData) {
      setShopForm({
        name: myShopData.name || '',
        city: myShopData.city || '',
        state: myShopData.state || '',
        address: myShopData.address || '',
        image: null
      })
    }
  }, [myShopData])

  const fetchMyShop = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/shop/get-my`, { withCredentials: true })
      dispatch(setMyShopData(data))
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/order/my-orders`, { withCredentials: true })
      setOrders(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchMyOrders()
  }, [])

  useEffect(() => {
     if (!socket) return;
     const playNotificationSound = () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()
        osc.type = "sine"
        osc.frequency.value = 880
        osc.connect(gainNode)
        gainNode.connect(ctx.destination)
        gainNode.gain.value = 0.08
        osc.start()
        osc.stop(ctx.currentTime + 0.15)
      } catch (e) {
        console.log(e)
      }
     }

     const handleNewOrder = (order) => {
         setOrders(prev => [order, ...prev])
         setNewOrderCount(c => c + 1)
         setNotifications(prev => [{
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            orderId: order._id,
            title: "🔔 New Order Received!",
            customerName: order?.user?.name || order?.user?.fullName || "Customer",
            total: order?.shopOrders?.subtotal || 0,
            createdAt: new Date().toISOString()
         }, ...prev].slice(0, 8))
         playNotificationSound()
     }

     const onDeliveryLocation = ({ orderId, lat, lng, latitude, longitude }) => {
      const nextLat = Number(lat ?? latitude)
      const nextLng = Number(lng ?? longitude)
      if (!orderId || Number.isNaN(nextLat) || Number.isNaN(nextLng)) return
      setOwnerLiveLocations(prev => ({
        ...prev,
        [orderId]: { lat: nextLat, lng: nextLng }
      }))
     }

     const onOrderStatus = ({ orderId, status }) => {
      if (!orderId || !status) return
      setOrders(prev => prev.map(order => {
        if (String(order._id) !== String(orderId)) return order
        return {
          ...order,
          shopOrders: {
            ...order.shopOrders,
            status
          }
        }
      }))
     }

     socket.on('newOrder', handleNewOrder)
     socket.on('new-order', handleNewOrder)
     socket.on('delivery-location-update', onDeliveryLocation)
     socket.on('order-status-update', onOrderStatus)
     socket.on('update-status', onOrderStatus)

     return () => {
      socket.off('newOrder', handleNewOrder)
      socket.off('new-order', handleNewOrder)
      socket.off('delivery-location-update', onDeliveryLocation)
      socket.off('order-status-update', onOrderStatus)
      socket.off('update-status', onOrderStatus)
     }
  }, [socket, activeTab])

  // Clear badge when switching to orders tab
  useEffect(() => {
     if (activeTab === 'orders') {
         setNewOrderCount(0)
     }
  }, [activeTab])

  const openOrderFromNotification = (orderId) => {
    setActiveTab("orders")
    setHighlightOrderId(orderId)
    setTimeout(() => setHighlightOrderId(null), 2800)
  }

  const onSubmitShop = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!shopForm.name || !shopForm.city || !shopForm.state || !shopForm.address) {
      setError('Please fill all shop fields')
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', shopForm.name)
      formData.append('city', shopForm.city)
      formData.append('state', shopForm.state)
      formData.append('address', shopForm.address)
      if (shopForm.image) formData.append('image', shopForm.image)

      const url = myShopData ? `${serverUrl}/api/shop/create-edit` : `${serverUrl}/api/shop/register`
      const method = 'post'

      const { data } = await axios({ url, method, data: formData, withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } })

      dispatch(setMyShopData(data))
      setSuccess('Shop saved successfully')
    } catch (err) {
      console.error(err)
      setError('Unable to save shop. Please try again.')
    }
  }

  const onSubmitItem = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!itemForm.name || !itemForm.price) {
      setError('Please fill item name and price')
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', itemForm.name)
      formData.append('category', itemForm.category)
      formData.append('foodType', itemForm.foodType)
      formData.append('price', itemForm.price)
      if (itemForm.image) formData.append('image', itemForm.image)

      let url = `${serverUrl}/api/item/add-item`
      if (editingItem) {
        url = `${serverUrl}/api/item/update-item/${editingItem._id}`
      }

      const { data } = await axios.post(url, formData, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } })

      dispatch(setMyShopData(data))
      setItemForm({ name: '', category: 'Snacks', foodType: 'veg', price: '', image: null })
      setEditingItem(null)
      setSuccess(editingItem ? 'Item updated' : 'Item added')
    } catch (err) {
      console.error(err)
      setError('Unable to add/update item')
    }
  }

  const onEditItem = (item) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      category: item.category,
      foodType: item.foodType,
      price: item.price,
      image: null
    })
  }

  const onDeleteItem = async (itemId) => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/item/delete/${itemId}`, { withCredentials: true })
      dispatch(setMyShopData(data))
    } catch (err) {
      console.error(err)
      setError('Unable to delete item')
    }
  }

  const handleUpdateStatus = async (orderId, shopId, newStatus) => {
    try {
        const { data } = await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`, { status: newStatus }, { withCredentials: true })
        setOrders(prev => prev.map(o => {
            if (o._id === orderId) {
                const updated = { ...o };
                if (updated.shopOrders) {
                    updated.shopOrders.status = data.shopOrder.status;
                }
                return updated;
            }
            return o;
        }))
    } catch (err) {
        console.error(err)
        alert('Failed to update status')
    }
  }

  const renderActionButtons = (order) => {
    const status = order.shopOrders?.status;
    const orderId = order._id;
    // The backend `getMyOrders` normalizes shopOrders to a single object populated or unpopulated
    const shopId = typeof order.shopOrders?.shop === 'object' ? order.shopOrders.shop._id : order.shopOrders?.shop;

    if (!shopId) return null;

    if (status === 'pending') return (
        <div className="flex gap-2">
           <button onClick={() => handleUpdateStatus(orderId, shopId, 'accepted')} className='bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded font-bold shadow-sm transition-all'>Accept</button>
           <button onClick={() => handleUpdateStatus(orderId, shopId, 'rejected')} className='bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded font-bold shadow-sm transition-all'>Reject</button>
        </div>
    );
    if (status === 'accepted') return (
        <button onClick={() => handleUpdateStatus(orderId, shopId, 'preparing')} className='bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded font-bold shadow-sm transition-all'>Mark as Preparing</button>
    );
    if (status === 'preparing') return (
        <button onClick={() => handleUpdateStatus(orderId, shopId, 'out of delivery')} className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded font-bold shadow-sm transition-all'>Mark as Out for Delivery</button>
    );
    if (status === 'out of delivery') return (
        <button onClick={() => handleUpdateStatus(orderId, shopId, 'delivered')} className='bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded font-bold shadow-sm transition-all'>Mark as Delivered</button>
    );
    return null;
  }

  return (
    <div className='w-full min-h-screen bg-[#fff9f6] p-3 sm:p-4 text-gray-800 overflow-x-hidden'>
      <div className='max-w-5xl mx-auto space-y-6'>
        
        {/* Custom Tab Navigation */}
        <div className='flex gap-2 sm:gap-4 p-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto'>
           <button 
             className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'menu' ? 'bg-[#fc8019] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
             onClick={() => setActiveTab('menu')}
           >
              🍔 Menu Manager
           </button>
           <button 
             className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'orders' ? 'bg-[#fc8019] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
             onClick={() => setActiveTab('orders')}
           >
              <span>📋</span> Orders
              {newOrderCount > 0 && (
                 <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce shadow-sm">
                    {newOrderCount}
                 </span>
              )}
           </button>
        </div>

        {notifications.length > 0 && (
          <div className='bg-white border border-orange-100 rounded-2xl shadow-sm p-4'>
            <h3 className='font-bold mb-3 text-[#fc8019]'>Live Notifications</h3>
            <div className='space-y-2'>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className='w-full text-left border rounded-xl p-3 hover:bg-orange-50 transition-all'
                  onClick={() => openOrderFromNotification(n.orderId)}
                >
                  <p className='font-semibold'>{n.title}</p>
                  <p className='text-sm text-gray-600'>{n.customerName} • ₹{n.total}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
            <>
                <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
                  <h2 className='text-2xl font-bold mb-4'>Restaurant Onboarding</h2>
                  <form onSubmit={onSubmitShop} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <input type='text' placeholder='Restaurant Name' value={shopForm.name} onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })} className='input input-bordered w-full' />
                    <input type='text' placeholder='City' value={shopForm.city} onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })} className='input input-bordered w-full' />
                    <input type='text' placeholder='State' value={shopForm.state} onChange={(e) => setShopForm({ ...shopForm, state: e.target.value })} className='input input-bordered w-full' />
                    <input type='text' placeholder='Address' value={shopForm.address} onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })} className='input input-bordered w-full' />
                    <input type='file' accept='image/*' onChange={(e) => setShopForm({ ...shopForm, image: e.target.files?.[0] })} className='w-full' />
                    <button className='bg-[#fc8019] text-white py-2 rounded-lg font-bold shadow-md hover:bg-[#e47317]' type='submit'>{myShopData ? 'Update Restaurant' : 'Register Restaurant'}</button>
                  </form>
                  {error && <p className='text-sm text-red-600 mt-2'>{error}</p>}
                  {success && <p className='text-sm text-green-600 mt-2'>{success}</p>}
                </div>

                <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
                  <h2 className='text-2xl font-bold mb-4'>Menu Builder</h2>
                  {!myShopData && <p className='text-sm text-gray-500 mb-2 font-medium'>Register your restaurant first to start building your menu.</p>}
                  {myShopData && (
                    <>
                      <form onSubmit={onSubmitItem} className='grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-6 mb-6'>
                        <input type='text' placeholder='Item Name' value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} className='input input-bordered w-full col-span-1 md:col-span-1' />
                        <select value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} className='input input-bordered w-full'>
                          {['Snacks', 'Main Course', 'Desserts', 'Pizza', 'Burgers', 'Sandwiches', 'South Indian', 'North Indian', 'Chinese', 'Fast Food', 'Others'].map(c => (<option key={c} value={c}>{c}</option>))}
                        </select>
                        <select value={itemForm.foodType} onChange={(e) => setItemForm({ ...itemForm, foodType: e.target.value })} className='input input-bordered w-full'>
                          <option value='veg'>Veg</option>
                          <option value='non veg'>Non Veg</option>
                        </select>
                        <input type='number' min='0' placeholder='Price' value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} className='input input-bordered w-full' />
                        <input type='file' accept='image/*' onChange={(e) => setItemForm({ ...itemForm, image: e.target.files?.[0] })} className='w-full' />
                        <button className='bg-[#fc8019] hover:bg-[#e47317] text-white py-2 rounded-lg font-bold shadow-md' type='submit'>{editingItem ? 'Save Item Changes' : 'Publish Item'}</button>
                      </form>

                      {myShopData.items?.length > 0 && (
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                          {myShopData.items.map(item => (
                            <div key={item._id} className='bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm'>
                              <div>
                                <p className='font-bold text-gray-800 line-clamp-1'>{item.name}</p>
                                <p className='text-xs font-semibold text-gray-500 mt-0.5'>{item.category} • <span className={item.foodType === 'veg' ? "text-green-600" : "text-red-500"}>{item.foodType}</span></p>
                                <p className='text-sm font-black text-[#fc8019] mt-1'>₹{item.price}</p>
                              </div>
                              <div className='flex flex-col gap-2'>
                                <button className='text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded shadow-sm hover:bg-gray-100 font-semibold transition-all' onClick={() => onEditItem(item)}>Edit</button>
                                <button className='text-sm bg-red-50 border border-red-100 text-red-600 px-3 py-1 rounded shadow-sm hover:bg-red-100 font-semibold transition-all' onClick={() => onDeleteItem(item._id)}>Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {error && <p className='text-sm text-red-600 mt-2'>{error}</p>}
                      {success && <p className='text-sm text-green-600 mt-2'>{success}</p>}
                    </>
                  )}
                </div>
            </>
        )}

        {activeTab === 'orders' && (
            <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
               <h2 className='text-2xl font-bold mb-6'>Live Orders Hub</h2>
               {orders.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100 text-gray-400 font-medium">
                      No active orders yet. Keep pushing!
                  </div>
               ) : (
                  <div className="space-y-4">
                     {orders.map(order => (
                         <div key={order._id} className={`border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow bg-gray-50/50 ${String(highlightOrderId) === String(order._id) ? "border-orange-400 ring-2 ring-orange-200" : "border-gray-200"}`}>
                             
                             {/* Top Header */}
                             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-200 pb-4 mb-4">
                                 <div>
                                     <p className="font-black text-gray-800 text-lg">Order #{order._id.substring(0, 8).toUpperCase()}</p>
                                     <p className="text-xs text-gray-500 font-medium mt-1">
                                         {new Date(order.createdAt).toLocaleString()}
                                     </p>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <span className="bg-white border border-gray-200 px-3 py-1 shadow-sm rounded-lg text-sm font-semibold text-gray-600">
                                         Total: <span className="text-[#fc8019] font-black">₹{order.shopOrders?.subtotal}</span>
                                     </span>
                                     <span className={`px-3 py-1 rounded-lg text-sm font-black uppercase ${
                                          order.shopOrders?.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                          order.shopOrders?.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                          'bg-orange-100 text-[#fc8019]'
                                     }`}>
                                         {order.shopOrders?.status}
                                     </span>
                                 </div>
                             </div>

                             {/* Inner Grid */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {/* Left: Customer Info */}
                                 <div className="space-y-3">
                                     <div>
                                         <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Customer Details</p>
                                         <p className="font-bold text-gray-800 mt-1">{order.user?.name || order.user?.fullName || "Guest User"}</p>
                                         <p className="text-sm text-gray-600 line-clamp-2">{order.deliveryAddress?.text}</p>
                                     </div>
                                     <div>
                                         <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Order Items</p>
                                         <ul className="mt-2 space-y-1">
                                             {order.shopOrders?.shopOrderItems?.map((item, i) => (
                                                 <li key={i} className="text-sm font-medium text-gray-700 flex justify-between bg-white px-2 py-1 rounded border border-gray-100">
                                                     <span>{item.quantity}x {item.name}</span>
                                                     <span className="text-gray-400">₹{item.price}</span>
                                                 </li>
                                             ))}
                                         </ul>
                                     </div>
                                 </div>

                                 {/* Right: Actions */}
                                 <div className="flex flex-col justify-end items-start md:items-end gap-3 rounded-xl bg-white p-4 border border-gray-100 shadow-sm">
                                     <div className="w-full">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-3 md:text-right">Action Available</p>
                                        <div className="flex flex-col md:items-end gap-2 w-full">
                                            {renderActionButtons(order) || (
                                                <p className="text-gray-400 text-sm font-medium italic">Terminal Status reached</p>
                                            )}
                                        </div>
                                     </div>
                                 </div>
                             </div>

                             {order.shopOrders?.status === "out of delivery" && (
                              <div className='mt-4 border rounded-xl p-3 bg-white'>
                                <p className='text-sm font-semibold text-gray-700 mb-2'>Live Delivery View</p>
                                <LiveMap
                                  deliveryLocation={
                                    ownerLiveLocations[order._id] || {
                                      lat: order?.shopOrders?.assignedDeliveryBoy?.location?.coordinates?.[1],
                                      lng: order?.shopOrders?.assignedDeliveryBoy?.location?.coordinates?.[0]
                                    }
                                  }
                                  customerLocation={{
                                    lat: order?.deliveryAddress?.latitude,
                                    lon: order?.deliveryAddress?.longitude
                                  }}
                                  restaurantLocation={{
                                    lat: order?.shopOrders?.shop?.location?.coordinates?.[1] ?? order?.deliveryAddress?.latitude,
                                    lon: order?.shopOrders?.shop?.location?.coordinates?.[0] ?? order?.deliveryAddress?.longitude
                                  }}
                                />
                              </div>
                             )}

                         </div>
                     ))}
                  </div>
               )}
            </div>
        )}
      </div>
    </div>
  )
}

export default OwnerDashboard
