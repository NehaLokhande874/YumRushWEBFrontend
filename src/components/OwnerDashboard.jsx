import React, { useState } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import { FaUtensils, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaPen } from "react-icons/fa";
import OwnerItemCard from './ownerItemCard';

function OwnerDashboard() {
  const { myShopData } = useSelector(state => state.owner)
  const navigate = useNavigate()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = () => {
    // ✅ Show success popup
    setShowSuccess(true)
    // ✅ Hide popup after 2.5 seconds
    setTimeout(() => {
      setShowSuccess(false)
    }, 2500)
  }

  return (
    <div className='w-full min-h-screen bg-[#fff9f6] flex flex-col items-center'>
      <Nav />

      {/* ✅ Success Popup */}
      {showSuccess && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999]'>
          <div className='bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm w-full mx-4'>
            <div className='bg-green-100 p-4 rounded-full'>
              <FaCheckCircle className='text-green-500 w-16 h-16' />
            </div>
            <h2 className='text-2xl font-black text-gray-800'>Saved Successfully!</h2>
            <p className='text-gray-500 text-center'>
              Your menu items have been saved successfully! 🎉
            </p>
            {/* ✅ Progress bar */}
            <div className='w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden'>
              <div
                className='bg-green-500 h-1.5 rounded-full'
                style={{ width: '100%', transition: 'width 2.5s linear' }}
              />
            </div>
            <button
              className='mt-2 bg-[#ff4d2d] text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600 transition-colors'
              onClick={() => setShowSuccess(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* No shop yet */}
      {!myShopData && (
        <div className='flex justify-center items-center p-4 sm:p-6'>
          <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
            <div className='flex flex-col items-center text-center'>
              <FaUtensils className='text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4' />
              <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>Add Your Restaurant</h2>
              <p className='text-gray-600 mb-4 text-sm sm:text-base'>
                Join our food delivery platform and reach thousands of hungry customers every day.
              </p>
              <button
                className='bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200'
                onClick={() => navigate("/create-edit-shop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shop exists */}
      {myShopData && (
        <div className='w-full flex flex-col items-center gap-6 px-4 sm:px-6 pb-16'>

          {/* Shop Header */}
          <h1 className='text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center'>
            <FaUtensils className='text-[#ff4d2d] w-14 h-14' />
            Welcome to {myShopData.name}
          </h1>

          {/* Shop Card */}
          <div className='bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative'>
            <div
              className='absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors cursor-pointer'
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPen size={20} />
            </div>
            <img src={myShopData.image} alt={myShopData.name} className='w-full h-48 sm:h-64 object-cover' />
            <div className='p-4 sm:p-6'>
              <h1 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>{myShopData.name}</h1>
              <p className='text-gray-500'>{myShopData.city}, {myShopData.state}</p>
              <p className='text-gray-500 mb-4'>{myShopData.address}</p>
            </div>
          </div>

          {/* No items yet */}
          {myShopData.items.length === 0 && (
            <div className='flex justify-center items-center p-4 sm:p-6'>
              <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
                <div className='flex flex-col items-center text-center'>
                  <FaUtensils className='text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4' />
                  <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>Add Your Food Item</h2>
                  <p className='text-gray-600 mb-4 text-sm sm:text-base'>
                    Share your delicious creations with our customers by adding them to the menu.
                  </p>
                  <button
                    className='bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200'
                    onClick={() => navigate("/add-item")}
                  >
                    Add Food
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items list */}
          {myShopData.items.length > 0 && (
            <div className='flex flex-col items-center gap-4 w-full max-w-3xl'>

              {/* Items */}
              {myShopData.items.map((item, index) => (
                <OwnerItemCard data={item} key={index} />
              ))}

              {/* ✅ Save Button at bottom of item list */}
              <button
                className='w-full mt-6 bg-[#ff4d2d] text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-orange-600 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2'
                onClick={handleSave}
              >
                💾 Save Menu
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  )
}

export default OwnerDashboard