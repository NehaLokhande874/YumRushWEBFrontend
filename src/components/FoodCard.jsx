import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'

import { FaLeaf, FaMinus, FaPlus } from "react-icons/fa";
import { FaDrumstickBite, FaStar } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';

function FoodCard({ data, onClick }) {
  const [quantity, setQuantity] = useState(0)
  const dispatch = useDispatch()
  const { cartItems } = useSelector(state => state.user)
  const [itemRating, setItemRating] = useState({ average: 0, count: 0 });

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/rating/item/${data._id}`);
        setItemRating(res.data);
      } catch (error) {
        console.error("Error fetching rating:", error);
      }
    };
    if (data._id) fetchRating();
  }, [data._id]);


  const handleIncrease = (e) => {
    if (e) e.stopPropagation();
    setQuantity(q => q + 1)
  }

  const handleDecrease = (e) => {
    if (e) e.stopPropagation();
    if (quantity > 0) setQuantity(q => q - 1)
  }

  const handleAddToCart = (e) => {
    if (e) e.stopPropagation();
    if (quantity > 0) {
      dispatch(addToCart({
        id: data._id?.toString(),         // ✅ ensure plain string
        name: data.name,
        price: data.price,
        image: data.image,
        shop: data.shop?._id?.toString() || data.shop?.toString(), // ✅ THE FIX: always a plain string ID
        quantity,
        foodType: data.foodType
      }))
      setQuantity(0) // ✅ reset counter after adding
    }
  }

  return (
    <div
      className='w-full rounded-2xl bg-white hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer p-4 group border border-gray-100 hover:border-orange-200'
      onClick={() => onClick && onClick(data)}
    >
      <div className='relative w-full h-[180px] rounded-2xl overflow-hidden shadow-sm'>
        <img src={data.image} alt={data.name} className='w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105' />

        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
          <span className="text-white font-black text-[22px] tracking-tighter shadow-sm">
            ₹{data.price} FOR ONE
          </span>
        </div>

        <div className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm'>
          {data.foodType === "veg"
            ? <FaLeaf className='text-green-600 text-[10px]' />
            : <FaDrumstickBite className='text-red-600 text-[10px]' />
          }
        </div>
      </div>

      <div className="mt-3 flex flex-col px-1">
        <h1 className='font-bold text-[#3d4152] text-[18px] truncate'>{data.name}</h1>
        <div className='flex items-center gap-1.5 mt-0.5 font-bold text-[15px]'>
          {itemRating.count > 0 ? (
            <>
              <div className="bg-green-700 rounded-full p-[3px] w-4 h-4 flex items-center justify-center">
                <FaStar className='text-white text-[9px]' />
              </div>
              <span className="text-[#3d4152]">{Number(itemRating.average).toFixed(1)}</span>
            </>
          ) : (
            <span className="text-green-600 text-[11px] font-black uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
              New
            </span>
          )}
        </div>
        <div className="text-[#686b78] text-[14px] truncate mt-0.5">
          {data.category || "North Indian, Chinese"}
        </div>
      </div>

      <div className='flex items-center justify-between mt-4 border-t border-dashed border-gray-300 pt-4 px-1'>
        {!cartItems.some(i => i.id === data._id?.toString()) ? (
          <div className="flex items-center w-full justify-between">
            <div className="flex bg-white shadow-sm rounded-md overflow-hidden text-[#1ba672] font-bold border border-gray-200">
              <button className='px-3 py-1.5 hover:bg-gray-50 transition-colors' onClick={handleDecrease}>
                <FaMinus size={12} />
              </button>
              <span className='px-2 py-1.5 text-sm'>{quantity}</span>
              <button className='px-3 py-1.5 hover:bg-gray-50 transition-colors' onClick={handleIncrease}>
                <FaPlus size={12} />
              </button>
            </div>
            <button
              className='text-[#1ba672] font-bold text-[15px] bg-white shadow-sm px-6 py-1.5 rounded-md hover:shadow-md transition-shadow uppercase tracking-wide border border-gray-200'
              onClick={handleAddToCart}
            >
              ADD
            </button>
          </div>
        ) : (
          <div className="w-full text-center text-sm font-bold text-white bg-[#60b246] py-2 rounded-md shadow-sm">
            ADDED TO CART ✓
          </div>
        )}
      </div>
    </div>
  )
}

export default FoodCard