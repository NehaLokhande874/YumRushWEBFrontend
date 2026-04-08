import React, { useEffect } from 'react'
import { ClipLoader } from 'react-spinners'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import OwnerDashboard from './pages/OwnerDashboard'
import useGetCity from './hooks/useGetCity'
import useGetMyshop from './hooks/useGetMyShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import useGetShopByCity from './hooks/useGetShopByCity'
import useGetItemsByCity from './hooks/useGetItemsByCity'
import CartPage from './pages/CartPage'
import CheckOut from './pages/CheckOut'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import useGetMyOrders from './hooks/useGetMyOrders'
import useUpdateLocation from './hooks/useUpdateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import Shop from './pages/Shop'
import AIMealPlanner from './pages/AIMealPlanner'
import ProfilePage from './pages/ProfilePage'
import HelpPage from './pages/HelpPage'
import ManageComplaints from './pages/admin/ManageComplaints'
import Offers from './pages/Offers'
import ManageOffers from './pages/admin/ManageOffers'

import { io } from 'socket.io-client'
import { setSocket } from './redux/userSlice'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageShops from './pages/admin/ManageShops'
import ManageOrders from './pages/admin/ManageOrders'
import ManageDeliveryPartners from './pages/admin/ManageDeliveryPartners'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const serverUrl = "http://localhost:8000"

function App() {
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()

  const isAuthLoading = useGetCurrentUser()
  useUpdateLocation()
  useGetCity()
  useGetMyshop()
  useGetShopByCity()
  useGetItemsByCity()
  useGetMyOrders()

  useEffect(() => {
    const socketInstance = io(serverUrl, { withCredentials: true })
    dispatch(setSocket(socketInstance))
    socketInstance.on('connect', () => {
      if (userData) {
        socketInstance.emit('identity', { userId: userData._id })
      }
    })
    return () => {
      socketInstance.disconnect()
    }
  }, [userData?._id])

  const isUser = userData?.role === "user"
  const isOwner = userData?.role === "owner"
  const isAdmin = userData?.role === "admin"
  const isLoggedIn = !!userData

  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#fff9f6]">
        <ClipLoader size={50} color='#ff4d2d' />
      </div>
    )
  }

  return (
    <>
      <Routes>
        {/* Auth routes */}
        <Route path='/signup' element={!isLoggedIn ? <SignUp /> : <Navigate to={"/"} />} />
        <Route path='/signin' element={!isLoggedIn ? <SignIn /> : <Navigate to={"/"} />} />
        <Route path='/forgot-password' element={!isLoggedIn ? <ForgotPassword /> : <Navigate to={"/"} />} />

        {/* Home */}
        <Route path='/' element={isLoggedIn ? <Home /> : <Navigate to={"/signin"} />} />

        {/* Owner only routes */}
        <Route path='/create-edit-shop' element={isOwner ? <CreateEditShop /> : <Navigate to={"/"} />} />
        <Route path='/add-item' element={isOwner ? <AddItem /> : <Navigate to={"/"} />} />
        <Route path='/edit-item/:itemId' element={isOwner ? <EditItem /> : <Navigate to={"/"} />} />
        <Route path='/owner-panel' element={isOwner ? <OwnerDashboard /> : <Navigate to={"/"} />} />

        {/* User only routes */}
        <Route path='/cart' element={isUser ? <CartPage /> : <Navigate to={"/"} />} />
        <Route path='/checkout' element={isUser ? <CheckOut /> : <Navigate to={"/"} />} />
        <Route path='/order-placed' element={isUser ? <OrderPlaced /> : <Navigate to={"/"} />} />
        <Route path='/shop/:shopId' element={isUser ? <Shop /> : <Navigate to={"/"} />} />
        <Route path='/admin/complaints' element={isAdmin ? <ManageComplaints /> : <Navigate to={"/"} />} />
        <Route path='/admin/offers' element={<ManageOffers />} />

        <Route path='/help' element={isLoggedIn ? <HelpPage /> : <Navigate to={"/signin"} />} />
        <Route path='/offers' element={isLoggedIn ? <Offers /> : <Navigate to={"/signin"} />} />


        {/* Shared routes */}
        <Route path='/profile' element={isLoggedIn ? <ProfilePage /> : <Navigate to={'/signin'} />} />
        <Route path='/my-orders' element={isLoggedIn ? <MyOrders /> : <Navigate to={"/signin"} />} />
        <Route path='/track-order/:orderId' element={isLoggedIn ? <TrackOrderPage /> : <Navigate to={"/signin"} />} />

        {/* Admin routes */}
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        <Route path='/admin/users' element={<ManageUsers />} />
        <Route path='/admin/shops' element={<ManageShops />} />
        <Route path='/admin/delivery-partners' element={<ManageDeliveryPartners />} />
        <Route path='/admin/orders' element={<ManageOrders />} />
        <Route path='/admin/complaints' element={<ManageComplaints />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App