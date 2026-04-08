import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';
function CartPage() {
    const navigate = useNavigate()
    const { cartItems, totalAmount } = useSelector(state => state.user)
    return (
        <div className='min-h-screen bg-[#f3f4f6] flex justify-center p-3 sm:p-4 md:p-8 pt-[84px] md:pt-[100px]'>
            <div className='w-full max-w-[1000px]'>
                <div className='flex items-center gap-3 sm:gap-5 mb-6 sm:mb-8 bg-white p-3 sm:p-4 rounded-2xl shadow-sm'>
                    <div className='z-[10] cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors' onClick={() => navigate("/")}>
                        <IoIosArrowRoundBack size={30} className='text-[#3d4152]' />
                    </div>
                    <h1 className='text-xl sm:text-2xl font-black text-[#3d4152] tracking-tight'>Secure Checkout</h1>
                </div>
                {cartItems?.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 sm:p-12 flex flex-col items-center justify-center shadow-sm">
                        <img src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/2xempty_cart_yfxml0" alt="empty cart" className="w-[180px] sm:w-[250px] mb-6 opacity-80" />
                        <h2 className="text-[#3d4152] font-black text-xl mb-2">Your cart is empty</h2>
                        <p className='text-[#686b78] text-sm mb-6'>You can go to home page to view more restaurants</p>
                        <button className="bg-[#fc8019] text-white px-6 py-2.5 font-bold uppercase text-[15px] cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/")}>See restaurants near you</button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Side: Items */}
                        <div className='flex-1 space-y-4'>
                            <div className="bg-white p-6 rounded-2xl shadow-sm">
                                <h2 className="text-xl font-bold text-[#3d4152] mb-6 border-b pb-4">Order Items</h2>
                                <div className="space-y-6">
                                    {cartItems?.map((item, index) => (
                                        <CartItemCard data={item} key={index} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Side: Bill Details */}
                        <div className="w-full lg:w-[350px]">
                            <div className='bg-white p-6 rounded-2xl shadow-sm sticky top-[100px]'>
                                <h1 className='text-lg font-bold text-[#3d4152] border-b pb-4 mb-4'>Bill Details</h1>
                                <div className="space-y-3 text-[#686b78] text-[15px] mb-4">
                                    <div className="flex justify-between">
                                        <span>Item Total</span>
                                        <span>₹{totalAmount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery Fee</span>
                                        <span className="text-[#1ba672]">Free</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-3 mt-3">
                                        <span className="font-bold text-[#3d4152]">To Pay</span>
                                        <span className='text-xl font-bold text-[#3d4152]'>₹{totalAmount}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    className='w-full bg-[#fc8019] text-white py-3.5 rounded-xl text-lg font-bold hover:bg-[#e47317] hover:shadow-lg transition-all cursor-pointer' 
                                    onClick={()=>navigate("/checkout")}
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartPage
