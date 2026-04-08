import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const phrases = [
    "Late night at office?",
    "Hungry?",
    "Unexpected guests?",
    "Cooking gone wrong?",
    "Movie marathon?",
    "Game night?"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row w-full h-auto lg:min-h-[540px]">
        {/* Left Side */}
        <div className="w-full lg:w-[55%] flex flex-col justify-start px-4 sm:px-8 lg:px-20 pt-8 sm:pt-10 pb-12 sm:pb-16 relative">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-12 sm:mb-16 lg:mb-24 gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-[#fc8019] text-white p-2 rounded-xl rounded-tr-none font-bold text-2xl tracking-tighter shadow-md">
                YR
              </div>
              <span className="text-2xl font-black text-[#3d4152] tracking-tight">YumRush</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-6 font-bold">
              <button 
                onClick={() => navigate('/signin')}
                className="text-black hover:text-[#fc8019] transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-black text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded hover:bg-[#fc8019] transition-colors"
              >
                Sign up
              </button>
            </div>
          </div>

          {/* Dynamic Headline */}
          <div className="min-h-[52px] sm:min-h-[60px] mb-2">
            <h1 className="text-[30px] sm:text-[38px] font-bold text-[#3d4152] transition-opacity duration-500 ease-in-out tracking-tight">
              {phrases[currentPhrase]}
            </h1>
          </div>
          <h2 className="text-[#686b78] text-lg sm:text-[22px] font-medium tracking-tight mb-8">
            Order food from favourite restaurants near you.
          </h2>

          {/* Location Input (Visual Only for Landing) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full max-w-[600px] border border-[#fc8019] hover:border-[#fc8019] rounded shadow-md overflow-hidden relative transition-all bg-white min-h-14">
             <input 
               type="text" 
               placeholder="Enter your delivery location" 
               className="w-full h-14 sm:h-full px-4 sm:px-5 outline-none font-medium text-gray-700"
               onKeyDown={(e) => {
                 if (e.key === 'Enter') navigate('/signin');
               }}
             />
             <button 
                onClick={() => navigate('/signin')}
                className="bg-[#fc8019] text-white h-12 sm:h-full px-6 sm:px-8 font-bold text-[15px] hover:bg-[#e47317] transition-colors flex items-center justify-center uppercase"
              >
               Find Food
             </button>
          </div>

          {/* Popular cities */}
          <div className="mt-8">
            <p className="text-[#a9abb2] uppercase text-xs font-bold tracking-wider mb-2">Popular cities in India</p>
            <div className="flex flex-wrap gap-2 text-[#686b78] text-[15px] font-semibold">
              <span className="cursor-pointer hover:text-[#fc8019]">Ahmedabad</span>
              <span className="text-gray-300">•</span>
              <span className="cursor-pointer hover:text-[#fc8019]">Bangalore</span>
              <span className="text-gray-300">•</span>
              <span className="cursor-pointer hover:text-[#fc8019]">Chennai</span>
              <span className="text-gray-300">•</span>
              <span className="cursor-pointer hover:text-[#fc8019]">Delhi</span>
              <span className="text-gray-300">•</span>
              <span className="cursor-pointer hover:text-[#fc8019]">Hyderabad</span>
              <span className="text-gray-300">•</span>
              <span className="cursor-pointer hover:text-[#fc8019]">Kolkata</span>
              <span className="text-gray-300">•</span>
              <span className="cursor-pointer hover:text-[#fc8019]">Mumbai</span>
              <span className="text-gray-300">•</span>
              <span className="cursor-pointer hover:text-[#fc8019]">Pune</span>
            </div>
          </div>

        </div>

        {/* Right Side (Image Area) */}
        <div className="hidden lg:block w-[45%] bg-center bg-cover relative" style={{backgroundImage: `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')`}}>
          {/* Overlay to blend image slightly if needed, or keeping it raw */}
          <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent w-32"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#2b1e16] w-full py-12 sm:py-16 px-4 sm:px-8 lg:px-20 text-white flex flex-col md:flex-row justify-between items-center md:items-start gap-12 md:gap-4 relative z-10">
         
         <div className="flex flex-col items-center text-center max-w-[280px]">
            <img src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_210,h_398/4x_-_No_min_order_x0bxuf" className="h-[200px] mb-8" alt="No Min Order" />
            <h3 className="text-[20px] font-semibold mb-2">No Minimum Order</h3>
            <p className="text-[#a9abb2] text-[15px]">Order in for yourself or for the group, with no restrictions on order value</p>
         </div>

         <div className="flex flex-col items-center text-center max-w-[280px]">
            <img src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_224,h_412/4x_Live_order_zzkugf" className="h-[200px] mb-8" alt="Live Tracking" />
            <h3 className="text-[20px] font-semibold mb-2">Live Order Tracking</h3>
            <p className="text-[#a9abb2] text-[15px]">Know where your order is at all times, from the restaurant to your doorstep</p>
         </div>

         <div className="flex flex-col items-center text-center max-w-[280px]">
            <img src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_248,h_376/4x_-_Super_fast_delivery_awv7sn" className="h-[200px] mb-8" alt="Lightning Fast" />
            <h3 className="text-[20px] font-semibold mb-2">Lightning-Fast Delivery</h3>
            <p className="text-[#a9abb2] text-[15px]">Experience YumRush's superfast delivery for food delivered fresh & on time</p>
         </div>

      </div>

    </div>
  );
}

export default LandingPage;
