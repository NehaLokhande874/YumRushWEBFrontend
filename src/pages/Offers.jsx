import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Offers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/offer/active`)
        setOffers(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOffers()
  }, [])

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`Code ${code} copied!`)
  }

  return (
    <div className='min-h-screen bg-[#fff9f6] p-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex items-center gap-4 mb-8'>
          <IoIosArrowRoundBack size={35} className='text-[#fc8019] cursor-pointer' onClick={() => navigate("/")} />
          <h1 className='text-3xl font-black text-gray-800 tracking-tight'>Available Offers</h1>
        </div>

        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fc8019]'></div>
          </div>
        ) : offers.length === 0 ? (
          <div className='text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100'>
            <p className='text-gray-500 text-lg font-medium'>No active offers available at the moment. 🛍️</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {offers.map((offer) => (
              <div key={offer._id} className='bg-white rounded-3xl p-6 shadow-sm border border-orange-50 relative overflow-hidden group hover:shadow-md transition-shadow'>
                {/* Decorative background element */}
                <div className='absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:scale-125 transition-transform'></div>
                
                <div className='relative z-10'>
                  <div className='flex justify-between items-start mb-4'>
                    <span className='bg-orange-100 text-[#fc8019] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider'>
                      {offer.discountType === "percentage" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} FLAT OFF`}
                    </span>
                    <p className='text-[10px] font-bold text-gray-400'>EXP: {new Date(offer.expiryDate).toLocaleDateString()}</p>
                  </div>

                  <div className='mb-6'>
                    <h3 className='text-2xl font-black text-gray-800 mb-2 uppercase'>{offer.code}</h3>
                    <p className='text-sm text-gray-600 font-medium leading-relaxed'>{offer.description}</p>
                    <div className='flex flex-wrap gap-2 mt-3'>
                        {offer.minOrderAmount > 0 && (
                        <span className='text-[10px] bg-gray-50 text-gray-500 font-bold px-2 py-0.5 rounded border border-gray-100'>
                            MIN ORDER: ₹{offer.minOrderAmount}
                        </span>
                        )}
                        {offer.maxDiscount && (
                        <span className='text-[10px] bg-gray-50 text-gray-500 font-bold px-2 py-0.5 rounded border border-gray-100'>
                            MAX DISC: ₹{offer.maxDiscount}
                        </span>
                        )}
                         {offer.isFirstOrderOnly && (
                        <span className='text-[10px] bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded border border-red-100'>
                            NEW USERS ONLY
                        </span>
                        )}
                    </div>
                  </div>

                  <button 
                    onClick={() => copyCode(offer.code)}
                    className='w-full py-3 bg-[#fc8019] text-white font-black rounded-xl hover:bg-[#e47317] transition-colors shadow-md active:scale-95 transform'
                  >
                    COPY CODE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Offers
