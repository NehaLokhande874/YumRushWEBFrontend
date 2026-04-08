import React, { useEffect, useState } from 'react'
import { FaLocationDot, FaPlus } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { TbReceipt2, TbDiscount } from "react-icons/tb";
import { HiOutlineUser, HiOutlineLifebuoy } from "react-icons/hi2";
import { RxCross2 } from "react-icons/rx";
import { FaChevronDown, FaLeaf, FaRobot } from "react-icons/fa"; // ✅ Added FaRobot
import { FaDrumstickBite } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import { setSearchItems, setUserData, setCurrentCity } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';

function Nav() {
  const { userData, currentCity, cartItems, searchItems } = useSelector(state => state.user)
  const { myShopData } = useSelector(state => state.owner)
  const [showInfo, setShowInfo] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [query, setQuery] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const cities = ["Khamgaon", "Shegaon"]

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
      dispatch(setUserData(null))
      navigate("/signin")
    } catch (error) {
      console.log(error)
    }
  }

  const handleSearchItems = async (searchQuery) => {
    try {
      if (!searchQuery.trim()) {
        dispatch(setSearchItems(null))
        return
      }
      const city = (!currentCity || currentCity === "All") ? "All" : currentCity
      const result = await axios.get(
        `${serverUrl}/api/item/search-items?query=${searchQuery}&city=${city}`,
        { withCredentials: true }
      )
      dispatch(setSearchItems(result.data))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query) {
        handleSearchItems(query)
      } else {
        dispatch(setSearchItems(null))
      }
    }, 400)
    return () => clearTimeout(debounce)
  }, [query])

  const handleClearSearch = () => {
    setQuery("")
    dispatch(setSearchItems(null))
    setShowSearch(false)
  }

  return (
    <header className="w-full fixed top-0 z-[9999] bg-white shadow-sm h-[68px] md:h-[80px] transition-all duration-300">
      <div className="max-w-[1200px] h-full mx-auto px-3 md:px-4 flex items-center justify-between gap-2">

        {/* Left Section: Logo & Location */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-0">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer transition-transform hover:scale-105"
            onClick={() => navigate("/")}
          >
            <div className="bg-[#fc8019] text-white p-2 rounded-xl rounded-tr-none font-bold text-2xl tracking-tighter shadow-md hover:bg-[#e47317] transition-colors">
              YR
            </div>
            <span className="text-lg sm:text-2xl font-black text-[#3d4152] ml-2 tracking-tight">YumRush</span>
          </div>

          {/* Location Picker with Dropdown */}
          {userData?.role === "user" && (
            <div className="hidden md:flex items-center gap-2 cursor-pointer group mt-1 relative">
              <FaLocationDot className="text-[#fc8019] text-sm" />
              <div
                className="flex items-center gap-1"
                onClick={() => setShowCityDropdown(!showCityDropdown)}
              >
                <span className="font-bold text-[#3d4152] text-sm group-hover:text-[#fc8019] transition-colors">
                  {!currentCity || currentCity === "All" ? "All Cities" : currentCity}
                </span>
                <FaChevronDown className="text-[#fc8019] text-xs font-bold mt-[2px]" />
              </div>

              {/* City Dropdown */}
              {showCityDropdown && (
                <div className="absolute top-[30px] left-0 w-[170px] sm:w-[200px] bg-white border border-gray-200 shadow-2xl rounded-lg z-[9999] overflow-hidden">
                  <div
                    className={`px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-orange-50 hover:text-[#fc8019] transition-colors flex items-center gap-2 ${!currentCity || currentCity === "All" ? "text-[#fc8019] bg-orange-50" : "text-[#3d4152]"}`}
                    onClick={() => { dispatch(setCurrentCity("All")); setShowCityDropdown(false) }}
                  >
                    🌍 All Cities
                  </div>
                  <div className="border-t border-gray-100" />
                  {cities.map((city, index) => (
                    <div
                      key={index}
                      className={`px-4 py-3 text-sm cursor-pointer hover:bg-orange-50 hover:text-[#fc8019] transition-colors flex items-center gap-2 ${currentCity === city ? "text-[#fc8019] font-semibold bg-orange-50" : "text-[#3d4152]"}`}
                      onClick={() => { dispatch(setCurrentCity(city)); setShowCityDropdown(false) }}
                    >
                      📍 {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Full width search bar when active on desktop */}
        {showSearch && userData?.role === "user" && (
          <div className="hidden md:flex absolute left-0 top-0 w-full h-[80px] bg-white px-4 lg:px-6 items-center gap-3 lg:gap-4 z-[99999] shadow-md">
            <div className="flex bg-white items-center rounded-lg border-2 border-[#fc8019] w-full overflow-hidden shadow-sm">
              <IoIosSearch className="text-[#fc8019] ml-4 shrink-0" size={22} />
              <input
                type="text"
                placeholder="Search for restaurant, cuisine or a dish..."
                className="w-full py-3 px-3 outline-none text-sm text-gray-700 font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery("")} className="px-3 text-gray-400 hover:text-gray-600">
                  <RxCross2 size={18} />
                </button>
              )}
            </div>
            <button
              onClick={handleClearSearch}
              className="text-[#fc8019] font-bold text-sm whitespace-nowrap hover:underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Mobile Search Bar */}
        {showSearch && userData?.role === "user" && (
          <div className="absolute top-full left-0 w-full bg-white p-4 shadow-md md:hidden flex gap-2 border-t z-50">
            <div className="flex bg-white items-center rounded-md border-2 border-[#fc8019] w-full overflow-hidden">
              <IoIosSearch className="text-[#fc8019] ml-3 shrink-0" size={20} />
              <input
                type="text"
                placeholder="Search for food..."
                className="w-full py-3 px-3 outline-none text-sm text-gray-700 font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery("")} className="px-3 text-gray-400">
                  <RxCross2 size={16} />
                </button>
              )}
            </div>
            <button onClick={handleClearSearch} className="px-2 text-[#fc8019] font-bold text-sm">
              Cancel
            </button>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center h-full min-w-0">
          <ul className="flex items-center gap-1 sm:gap-2 lg:gap-8 h-full">

            {/* Desktop Search Button */}
            {userData?.role === "user" && (
              <li className="hidden md:flex h-full items-center">
                <div
                  className="flex items-center gap-2 text-[#3d4152] font-semibold hover:text-[#fc8019] transition-colors cursor-pointer group"
                  onClick={() => setShowSearch(true)}
                >
                  <IoIosSearch size={22} className="text-[#3d4152] group-hover:text-[#fc8019] stroke-2" />
                  <span className="text-[16px]">Search</span>
                </div>
              </li>
            )}

            {/* ✅ AI Meal Planner Button - NEW */}
            {userData?.role === "user" && (
              <li className="hidden md:flex h-full items-center">
                <div
                  className="flex items-center gap-2 text-[#3d4152] font-semibold hover:text-[#fc8019] transition-colors cursor-pointer group"
                  onClick={() => navigate("/ai-meal-planner")}
                >
                  <FaRobot size={20} className="text-[#3d4152] group-hover:text-[#fc8019]" />
                  <span className="text-[16px]">AI Planner</span>
                </div>
              </li>
            )}

            {/* Offers */}
            {userData?.role === "user" && (
              <li className="hidden md:flex h-full items-center">
                <div className="flex items-center gap-2 text-[#3d4152] font-semibold hover:text-[#fc8019] transition-colors cursor-pointer group">
                  <TbDiscount size={22} className="text-[#3d4152] group-hover:text-[#fc8019]" />
                  <span className="text-[16px]">Offers <sup className="text-[#fc8019] font-bold text-[10px] ml-[2px]">NEW</sup></span>
                </div>
              </li>
            )}

            {/* Help */}
            {userData?.role === "user" && (
              <li className="hidden lg:flex h-full items-center">
                <div 
                  className="flex items-center gap-2 text-[#3d4152] font-semibold hover:text-[#fc8019] transition-colors cursor-pointer group"
                  onClick={() => navigate("/help")}
                >
                  <HiOutlineLifebuoy size={22} className="text-[#3d4152] group-hover:text-[#fc8019]" />
                  <span className="text-[16px]">Help</span>
                </div>
              </li>
            )}

            {/* Owner specific menus */}
            {userData?.role === "owner" && (
              <>
                {myShopData && (
                  <li className="hidden md:flex h-full items-center">
                    <button
                      className="flex items-center gap-2 bg-[#fc8019] text-white px-5 py-2.5 rounded hover:bg-[#e47317] transition-all shadow-md font-bold text-sm"
                      onClick={() => navigate("/add-item")}
                    >
                      <FaPlus size={16} />
                      <span>Add Item</span>
                    </button>
                  </li>
                )}
                <li className="hidden md:flex h-full items-center pl-4">
                  <div
                    className="flex items-center gap-2 text-[#3d4152] font-semibold hover:text-[#fc8019] transition-colors cursor-pointer group"
                    onClick={() => navigate("/my-orders")}
                  >
                    <TbReceipt2 size={22} className="text-[#3d4152] group-hover:text-[#fc8019]" />
                    <span className="text-[16px]">My Orders</span>
                  </div>
                </li>
              </>
            )}

            {/* Mobile Owner Buttons */}
            {userData?.role === "owner" && (
              <div className="md:hidden flex gap-2 mr-1 sm:mr-2">
                {myShopData && (
                  <button className="text-white p-2.5 bg-[#fc8019] rounded-full shadow-md" onClick={() => navigate("/add-item")}>
                    <FaPlus size={18} />
                  </button>
                )}
                <button className="text-[#3d4152] p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors" onClick={() => navigate("/my-orders")}>
                  <TbReceipt2 size={18} />
                </button>
              </div>
            )}

            {/* Mobile User Search Toggle */}
            {userData?.role === "user" && !showSearch && (
              <li className="md:hidden flex h-full items-center mr-1">
                <button className="text-[#3d4152] p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setShowSearch(true)}>
                  <IoIosSearch size={24} />
                </button>
              </li>
            )}

            {/* ✅ Mobile AI Planner Button */}
            {userData?.role === "user" && (
              <li className="md:hidden flex h-full items-center mr-1">
                <button
                  className="text-[#3d4152] p-2 hover:bg-orange-50 rounded-full transition-colors"
                  onClick={() => navigate("/ai-meal-planner")}
                >
                  <FaRobot size={22} className="text-[#fc8019]" />
                </button>
              </li>
            )}

            {/* User Profile */}
            <li className="h-full items-center flex relative ml-1 sm:ml-2 lg:ml-0">
              {userData ? (
                <div
                  className="flex flex-col justify-center h-full relative"
                  onMouseEnter={() => setShowInfo(true)}
                  onMouseLeave={() => setShowInfo(false)}
                >
                  <div className="flex items-center gap-2 text-[#3d4152] font-semibold hover:text-[#fc8019] transition-colors cursor-pointer group">
                    <HiOutlineUser size={22} className="text-[#3d4152] group-hover:text-[#fc8019]" />
                    <span className="text-[16px] hidden sm:block truncate max-w-[120px]">{userData.fullName.split(' ')[0]}</span>
                  </div>

                  {showInfo && (
                    <div className="absolute top-[68px] md:top-[80px] -right-2 sm:-right-4 w-[min(260px,92vw)] bg-white border-t-[3px] border-[#fc8019] shadow-2xl text-left py-2 font-medium z-[9999] rounded-sm">
                      <div className="px-6 py-4 border-b border-gray-100 mb-2">
                        <div className="font-bold text-[#3d4152] text-lg truncate mb-1">{userData.fullName}</div>
                        <div className="text-xs text-gray-500 font-medium">{userData.email || "user@example.com"}</div>
                      </div>
                      <ul className="py-1 text-[15px] text-[#3d4152]">
                        {userData.role === "user" && (
                          <li
                            className="px-6 py-2.5 hover:text-[#fc8019] cursor-pointer hover:font-semibold transition-colors"
                            onClick={() => navigate("/my-orders")}
                          >
                            Orders
                          </li>
                        )}
                        {/* ✅ AI Planner in dropdown menu too */}
                        {userData.role === "user" && (
                          <li
                            className="px-6 py-2.5 hover:text-[#fc8019] cursor-pointer hover:font-semibold transition-colors flex items-center gap-2"
                            onClick={() => navigate("/ai-meal-planner")}
                          >
                            <FaRobot className="text-[#fc8019]" /> AI Meal Planner
                          </li>
                        )}
                        <li className="px-6 py-2.5 hover:text-[#fc8019] cursor-pointer hover:font-semibold transition-colors">
                          YumRush One
                        </li>
                        <li className="px-6 py-2.5 hover:text-[#fc8019] cursor-pointer hover:font-semibold transition-colors">
                          Favourites
                        </li>
                        <li 
                          className="px-6 py-2.5 hover:text-[#fc8019] cursor-pointer hover:font-semibold transition-colors"
                          onClick={() => navigate("/profile")}
                        >
                          Profile
                        </li>
                        <li
                          className="px-6 py-2.5 text-red-500 hover:text-red-600 font-bold cursor-pointer transition-colors mt-2 border-t border-gray-100 pt-3"
                          onClick={handleLogOut}
                        >
                          Logout
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 text-[#3d4152] font-semibold hover:text-[#fc8019] transition-colors cursor-pointer group"
                  onClick={() => navigate("/signin")}
                >
                  <HiOutlineUser size={22} className="text-[#3d4152] group-hover:text-[#fc8019]" />
                  <span className="text-[16px]">Sign In</span>
                </div>
              )}
            </li>

            {/* Cart */}
            {userData?.role === "user" && (
              <li className="h-full items-center flex ml-2 lg:ml-4">
                <div
                  className="flex items-center gap-2 text-[#3d4152] font-semibold hover:text-[#fc8019] transition-colors cursor-pointer group relative"
                  onClick={() => navigate("/cart")}
                >
                  <div className="relative flex items-center justify-center">
                    <FiShoppingCart size={22} className="text-[#3d4152] group-hover:text-[#fc8019]" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#60b246] text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-sm leading-none border border-white">
                        {cartItems.length}
                      </span>
                    )}
                  </div>
                  <span className="text-[16px] hidden sm:block">Cart</span>
                </div>
              </li>
            )}

          </ul>
        </div>
      </div>
    </header>
  )
}

export default Nav