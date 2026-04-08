import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { toast } from 'react-toastify'
import { FaTrash, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa'

function ManageOffers() {
  const token = localStorage.getItem("adminToken")
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    totalUsageLimit: '',
    isFirstOrderOnly: false,
    expiryDate: ''
  })

  useEffect(() => {
    fetchOffers()
  }, [])

    const fetchOffers = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/offer/all`, { 
        headers: { Authorization: "Bearer " + token } 
      })
      setOffers(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching offers")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${serverUrl}/api/offer/create`, formData, { 
        headers: { Authorization: "Bearer " + token } 
      })
      toast.success("Offer created successfully")
      setShowForm(false)
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        maxDiscount: '',
        totalUsageLimit: '',
        isFirstOrderOnly: false,
        expiryDate: ''
      })
      fetchOffers()
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating offer")
    }
  }

  const toggleOffer = async (id) => {
    try {
      await axios.put(`${serverUrl}/api/offer/toggle/${id}`, {}, { 
        headers: { Authorization: "Bearer " + token } 
      })
      toast.success("Offer updated")
      fetchOffers()
    } catch (err) {
      toast.error("Error toggling offer")
    }
  }

  const deleteOffer = async (id) => {
    if (!window.confirm("Delete this offer?")) return
    try {
      await axios.delete(`${serverUrl}/api/offer/delete/${id}`, { 
        headers: { Authorization: "Bearer " + token } 
      })
      toast.success("Offer deleted")
      fetchOffers()
    } catch (err) {
      toast.error("Error deleting offer")
    }
  }

  return (
    <div className='p-4 sm:p-8 bg-gray-50 min-h-screen'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <h1 className='text-3xl font-black text-gray-800 tracking-tight'>Manage Offers</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className='w-full sm:w-auto bg-[#fc8019] text-white px-6 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95'
        >
          {showForm ? "Close Form" : <><FaPlus /> Create New Offer</>}
        </button>
      </div>

      {showForm && (
        <div className='bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300'>
          <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-bold text-gray-500 uppercase ml-1'>Coupon Code</label>
              <input 
                type="text" 
                placeholder="e.g. YUMRUSH50"
                className='border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8019] font-bold uppercase'
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                required
              />
            </div>
            <div className='flex flex-col gap-1 md:col-span-2'>
              <label className='text-xs font-bold text-gray-500 uppercase ml-1'>Description</label>
              <input 
                type="text" 
                placeholder="Description of the offer"
                className='border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8019]'
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-bold text-gray-500 uppercase ml-1'>Discount Type</label>
              <select 
                className='border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8019] bg-white'
                value={formData.discountType}
                onChange={(e) => setFormData({...formData, discountType: e.target.value})}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-bold text-gray-500 uppercase ml-1'>Discount Value</label>
              <input 
                type="number" 
                placeholder="e.g. 50"
                className='border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8019]'
                value={formData.discountValue}
                onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                required
                min="1"
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-bold text-gray-500 uppercase ml-1'>Min Order Amount</label>
              <input 
                type="number" 
                placeholder="e.g. 299"
                className='border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8019]'
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-bold text-gray-500 uppercase ml-1'>Max Discount (for % Only)</label>
              <input 
                type="number" 
                placeholder="e.g. 100"
                className='border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8019]'
                value={formData.maxDiscount}
                onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                disabled={formData.discountType === 'flat'}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-bold text-gray-500 uppercase ml-1'>Total Usage Limit (Total Coupons)</label>
              <input 
                type="number" 
                placeholder="e.g. 1000"
                className='border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8019]'
                value={formData.totalUsageLimit}
                onChange={(e) => setFormData({...formData, totalUsageLimit: e.target.value})}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-bold text-gray-500 uppercase ml-1'>Expiry Date</label>
              <input 
                type="date" 
                className='border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8019]'
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                required
              />
            </div>
            <div className='flex items-center gap-2 mt-4'>
              <input 
                type="checkbox" 
                id="firstOrder"
                className='w-5 h-5 text-[#fc8019] border-gray-300 rounded focus:ring-[#fc8019]'
                checked={formData.isFirstOrderOnly}
                onChange={(e) => setFormData({...formData, isFirstOrderOnly: e.target.checked})}
              />
              <label htmlFor="firstOrder" className='text-sm font-bold text-gray-700'>First Order Only</label>
            </div>
            <div className='md:col-span-3'>
              <button 
                type="submit"
                className='w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-black transition-all transform active:scale-[0.99]'
              >
                CREATE OFFER
              </button>
            </div>
          </form>
        </div>
      )}

      <div className='bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-100'>
                <th className='p-4 text-xs font-black text-gray-500 uppercase'>Coupon Code</th>
                <th className='p-4 text-xs font-black text-gray-500 uppercase'>Details</th>
                <th className='p-4 text-xs font-black text-gray-500 uppercase'>Usage</th>
                <th className='p-4 text-xs font-black text-gray-500 uppercase'>Expiry</th>
                <th className='p-4 text-xs font-black text-gray-500 uppercase'>Status</th>
                <th className='p-4 text-xs font-black text-gray-500 uppercase text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center p-10 font-bold text-gray-400">Loading Offers...</td></tr>
              ) : offers.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-10 font-bold text-gray-400">No offers found. Create one above!</td></tr>
              ) : offers.map((offer) => (
                <tr key={offer._id} className='border-b border-gray-50 hover:bg-gray-50/50 transition-colors'>
                  <td className='p-4'>
                    <span className='font-black text-gray-800 uppercase'>{offer.code}</span>
                    {offer.isFirstOrderOnly && <div className='text-[10px] text-red-500 font-bold tracking-tight uppercase'>New User Only</div>}
                  </td>
                  <td className='p-4 space-y-1'>
                    <div className='text-sm font-bold text-gray-800'>
                      {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`} OFF
                    </div>
                    <div className='text-xs text-gray-500'>{offer.description}</div>
                  </td>
                  <td className='p-4'>
                    <div className='text-sm font-bold text-gray-800'>{offer.usedCount} used</div>
                    {offer.totalUsageLimit && (
                      <div className='text-xs text-gray-400 font-semibold'>Limit: {offer.totalUsageLimit}</div>
                    )}
                  </td>
                  <td className='p-4 text-sm text-gray-600 font-medium'>
                    {new Date(offer.expiryDate).toLocaleDateString()}
                  </td>
                  <td className='p-4'>
                    <button 
                      onClick={() => toggleOffer(offer._id)}
                      className={`text-3xl transition-colors outline-none focus:outline-none ${offer.isActive ? 'text-green-500' : 'text-gray-200'}`}
                    >
                      {offer.isActive ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </td>
                  <td className='p-4'>
                    <div className='flex justify-center'>
                      <button 
                        onClick={() => deleteOffer(offer._id)}
                        className='text-gray-200 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all'
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ManageOffers
