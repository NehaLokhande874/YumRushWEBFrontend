import React from 'react'
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';
function CartItemCard({data}) {
    const dispatch=useDispatch()
    const handleIncrease=(id,currentQty)=>{
       dispatch(updateQuantity({id,quantity:currentQty+1}))
    }
      const handleDecrease=(id,currentQty)=>{
        if(currentQty>1){
  dispatch(updateQuantity({id,quantity:currentQty-1}))
        }
        
    }
  return (
    <div className='flex flex-col sm:flex-row sm:items-center justify-between bg-white py-4 border-b border-gray-100 last:border-0 group gap-3 sm:gap-0'>
      <div className='flex items-center gap-3 sm:gap-4 w-full sm:w-[60%]'>
        <div className="relative shrink-0">
          <img src={data.image} alt={data.name} className='w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl'/>
          {data.foodType === "veg" ? 
            <div className="absolute -top-1.5 -left-1.5 bg-white p-[2px] rounded-sm shadow-sm"><div className="border border-green-600 w-3 h-3 flex items-center justify-center"><div className="bg-green-600 rounded-full w-1.5 h-1.5"></div></div></div> 
            : 
            <div className="absolute -top-1.5 -left-1.5 bg-white p-[2px] rounded-sm shadow-sm"><div className="border border-red-600 w-3 h-3 flex items-center justify-center"><div className="bg-red-600 rounded-full w-1.5 h-1.5"></div></div></div>
          }
        </div>
        <div className="truncate">
            <h1 className='font-bold text-[#3d4152] truncate text-base md:text-lg mb-0.5'>{data.name}</h1>
            <p className='text-xs md:text-sm text-[#686b78]'>₹{data.price}</p>
        </div>
      </div>
      <div className='flex items-center gap-3 md:gap-6 justify-between sm:justify-end w-full sm:w-[40%] pl-[76px] sm:pl-0'>
        <div className="flex bg-white shadow-sm rounded-md overflow-hidden text-[#1ba672] font-bold border border-gray-200 h-[32px] items-center shrink-0">
            <button className='px-2.5 md:px-3 h-full hover:bg-gray-50 transition-colors' onClick={()=>handleDecrease(data.id,data.quantity)}>
               <FaMinus size={10}/>
            </button>
            <span className='px-1.5 md:px-2 text-sm min-w-[20px] text-center'>{data.quantity}</span>
            <button className='px-2.5 md:px-3 h-full hover:bg-gray-50 transition-colors' onClick={()=>handleIncrease(data.id,data.quantity)}>
               <FaPlus size={10}/>
            </button>
        </div>
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <p className="font-bold text-[#3d4152] text-sm md:text-base w-auto sm:w-[60px] text-right">₹{data.price * data.quantity}</p>
          <button className="text-gray-400 hover:text-red-500 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100" onClick={()=>dispatch(removeCartItem(data.id))}>
             <CiTrash size={22}/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartItemCard
