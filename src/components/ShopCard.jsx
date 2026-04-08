import React from 'react'
import { FaStar } from "react-icons/fa6";

function ShopCard({shop, onClick}) {
  return (
    <div 
      className='w-[280px] md:w-[320px] shrink-0 cursor-pointer flex flex-col group transition-transform duration-300 hover:scale-[0.98]' 
      onClick={onClick}
    >
       <div className='w-full h-[180px] md:h-[200px] rounded-[1.5rem] overflow-hidden mb-3 relative shadow-sm'>
           <img 
             src={shop.image} 
             alt={shop.shopName} 
             className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' 
           />
           {/* Dark gradient for text visibility */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
           
           {/* Offer text mimicking Swiggy/Zomato styling */}
           <div className="absolute bottom-3 left-4 flex flex-col">
             <span className="text-white font-black text-xl tracking-tighter drop-shadow-md">
               ITEMS AT ₹99
             </span>
             <span className="text-white/90 font-bold text-sm drop-shadow-md">
               Up to 20% OFF
             </span>
           </div>
       </div>
       
       <div className='px-2'>
         <h1 className='text-lg md:text-xl font-bold text-[#3d4152] truncate mb-0.5 tracking-tight'>
           {shop.shopName}
         </h1>
         
         <div className='flex items-center gap-1.5 text-[#3d4152] font-semibold text-sm md:text-[15px] tracking-tight'>
           <div className="bg-[#1ba672] rounded-full p-[3px] w-[18px] h-[18px] flex items-center justify-center shadow-sm">
             <FaStar className='text-white text-[10px]'/>
           </div>
           <span>{shop.rating?.average || "4.3"} • 25-30 mins</span>
         </div>
         
         <div className="text-[#686b78] text-sm truncate mt-1">
           {shop.cuisines?.join(", ") || "Pizzas, Fast Food, Beverages"}
         </div>
         <div className="text-[#686b78] text-sm truncate mt-0.5">
           {shop.location || "Shegaon • 2.5 km"}
         </div>
       </div>
    </div>
  )
}

export default ShopCard
