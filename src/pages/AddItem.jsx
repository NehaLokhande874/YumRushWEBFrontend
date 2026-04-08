import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';

function AddItem() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { myShopData } = useSelector(state => state.owner)

    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [frontendImage, setFrontendImage] = useState(null)
    const [backendImage, setBackendImage] = useState(null)
    const [category, setCategory] = useState("")
    const [foodType, setFoodType] = useState("veg")
    const [error, setError] = useState("")

    // ✅ Matches EXACTLY with item.model.js enum
    const categories = [
        "Snacks", "Main Course", "Desserts", "Pizza", "Burgers",
        "Sandwiches", "South Indian", "North Indian", "Chinese",
        "Fast Food", "Punjabi Tadka", "Others"  // ✅ Added Punjabi Tadka
    ]

    const handleImage = (e) => {
        const file = e.target.files[0]
        if (file) {
            setBackendImage(file)
            setFrontendImage(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!name.trim()) {
            setError("Please enter food name!")
            return
        }
        if (!backendImage) {
            setError("Please select a food image!")
            return
        }
        if (!category) {
            setError("Please select a category!")
            return
        }
        if (!price || Number(price) <= 0) {
            setError("Please enter a valid price!")
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", name.trim())
            formData.append("category", category)
            formData.append("foodType", foodType)
            formData.append("price", price)
            formData.append("image", backendImage)

            const result = await axios.post(
                `${serverUrl}/api/item/add-item`,
                formData,
                { withCredentials: true }
            )
            dispatch(setMyShopData(result.data))
            setLoading(false)
            navigate("/")
        } catch (err) {
            console.log(err)
            setError(err?.response?.data?.message || "Something went wrong! Please try again.")
            setLoading(false)
        }
    }

    return (
        <div className='flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 to-white relative min-h-screen'>

            {/* Back Button */}
            <div
                className='absolute top-[20px] left-[20px] z-[10] cursor-pointer'
                onClick={() => navigate("/")}
            >
                <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
            </div>

            <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100'>

                {/* Header */}
                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-orange-100 p-4 rounded-full mb-4'>
                        <FaUtensils className='text-[#ff4d2d] w-16 h-16' />
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900">Add Food</div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center'>
                        ⚠️ {error}
                    </div>
                )}

                <form className='space-y-5' onSubmit={handleSubmit}>

                    {/* Name */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Food Name <span className='text-red-500'>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder='Enter Food Name'
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Food Image <span className='text-red-500'>*</span>
                        </label>
                        <input
                            type="file"
                            accept='image/*'
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={handleImage}
                        />
                        {frontendImage && (
                            <div className='mt-4'>
                                <img
                                    src={frontendImage}
                                    alt="Preview"
                                    className='w-full h-48 object-cover rounded-lg border'
                                />
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Price (₹) <span className='text-red-500'>*</span>
                        </label>
                        <input
                            type="number"
                            placeholder='Enter Price'
                            min="1"
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Category <span className='text-red-500'>*</span>
                        </label>
                        <select
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setCategory(e.target.value)}
                            value={category}
                        >
                            <option value="">Select Category</option>
                            {categories.map((cate, index) => (
                                <option value={cate} key={index}>{cate}</option>
                            ))}
                        </select>
                    </div>

                    {/* Food Type */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Food Type</label>
                        <select
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setFoodType(e.target.value)}
                            value={foodType}
                        >
                            <option value="veg">Veg</option>
                            <option value="non veg">Non Veg</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className='w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60'
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={20} color='white' /> : "Save Item"}
                    </button>

                </form>
            </div>
        </div>
    )
}

export default AddItem