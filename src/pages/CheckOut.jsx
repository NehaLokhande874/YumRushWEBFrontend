import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";
import axios from 'axios';
import { FaMobileScreenButton } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { addMyOrder, setTotalAmount, clearCart } from '../redux/userSlice';

const DEFAULT_LOCATION = { lat: 20.5937, lon: 78.9629 }

function RecenterMap({ location }) {
  const map = useMap()
  useEffect(() => {
    if (location?.lat && location?.lon) {
      map.setView([location.lat, location.lon], 16, { animate: true })
    }
  }, [location?.lat, location?.lon])
  return null
}

export const calculateDeliveryFee = (totalAmount, totalPastOrders, currentHour) => {
  let baseFee = 39;
  let runningFee = baseFee;
  let discounts = [];
  let surcharges = [];
  let loyaltyLevel = 'New User';
  let badge = '🆕';

  if (totalPastOrders >= 50) {
    loyaltyLevel = 'Platinum User';
    badge = '💎';
  } else if (totalPastOrders >= 20) {
    loyaltyLevel = 'Gold User';
    badge = '🥇';
    discounts.push({ reason: '🥇 Gold member discount', amount: 20 });
    runningFee -= 20;
  } else if (totalPastOrders >= 5) {
    loyaltyLevel = 'Regular User';
    badge = '⭐';
    discounts.push({ reason: '⭐ Regular member discount', amount: 10 });
    runningFee -= 10;
  }

  if ((currentHour >= 12 && currentHour < 14) || (currentHour >= 19 && currentHour < 22)) {
    surcharges.push({ reason: '⚡ Peak hours surcharge', amount: 10 });
    runningFee += 10;
  } else if (currentHour >= 22 || currentHour < 6) {
    surcharges.push({ reason: '🌙 Late night surcharge', amount: 20 });
    runningFee += 20;
  } else {
    discounts.push({ reason: '⏰ Off-peak discount', amount: 10 });
    runningFee -= 10;
  }

  if (totalAmount > 499) {
    discounts.push({ reason: '🎉 Big order discount', amount: 20 });
    runningFee -= 20;
  } else if (totalAmount > 299) {
    discounts.push({ reason: '🛍️ Order over ₹299', amount: 10 });
    runningFee -= 10;
  }

  let finalFee;
  if (loyaltyLevel === 'Platinum User') {
    finalFee = 0;
    let currentFeeWithoutPlat = runningFee < 9 ? 9 : (runningFee > 79 ? 79 : runningFee);
    if (currentFeeWithoutPlat > 0) {
      discounts.unshift({ reason: '💎 Platinum free delivery', amount: currentFeeWithoutPlat });
    }
  } else {
    finalFee = Math.max(9, Math.min(79, runningFee));
  }

  const totalSurcharges = surcharges.reduce((sum, s) => sum + s.amount, 0);
  const potentialFee = baseFee + totalSurcharges;
  const savedAmount = potentialFee - finalFee;

  return { baseFee, discounts, surcharges, finalFee, savedAmount, loyaltyLevel, badge };
};

function CheckOut() {
  const { location, address } = useSelector(state => state.map)
  const { cartItems, totalAmount, userData, myOrders } = useSelector(state => state.user)
  const [addressInput, setAddressInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const apiKey = import.meta.env.VITE_GEOAPIKEY

  const currentHour = new Date().getHours()
  const totalPastOrders = myOrders?.length || 0;
  const feeData = calculateDeliveryFee(totalAmount, totalPastOrders, currentHour)

  let deliveryFee = feeData.finalFee;
  let subtotal = totalAmount;

  if (appliedCoupon) {
    if (appliedCoupon.type === "subtotal") {
      subtotal = Math.max(0, totalAmount - appliedCoupon.discount);
    } else if (appliedCoupon.type === "delivery") {
      deliveryFee = 0;
    }
  }

  const AmountWithDeliveryFee = subtotal + deliveryFee;

  let loyaltyMessage = "";
  let loyaltyPercent = 0;

  if (totalPastOrders >= 50) {
    loyaltyMessage = "You are a Platinum member! Free delivery always 💎";
    loyaltyPercent = 100;
  } else if (totalPastOrders >= 20) {
    let needed = 50 - totalPastOrders;
    loyaltyMessage = `${needed} more orders to become Platinum 💎`;
    loyaltyPercent = ((totalPastOrders - 20) / 30) * 100;
  } else if (totalPastOrders >= 5) {
    let needed = 20 - totalPastOrders;
    loyaltyMessage = `${needed} more orders to become Gold 🥇`;
    loyaltyPercent = ((totalPastOrders - 5) / 15) * 100;
  } else {
    let needed = 5 - totalPastOrders;
    loyaltyMessage = `${needed} more orders to become Regular ⭐`;
    loyaltyPercent = (totalPastOrders / 5) * 100;
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    try {
      const res = await axios.post(`${serverUrl}/api/offer/validate`, {
        code: couponInput.toUpperCase().trim(),
        orderAmount: totalAmount
      }, { withCredentials: true });

      if (res.data.valid) {
        setAppliedCoupon({
          code: res.data.code,
          discount: res.data.discount,
          type: "subtotal" // Keeping it compatible with existing UI logic
        });
        toast.success(res.data.message);
      } else {
        setCouponError(res.data.message);
        toast.error(res.data.message);
      }
    } catch (err) {
      setCouponError("Error validating coupon");
      toast.error("Error validating coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat, lon: lng }))
    getAddressByLatLng(lat, lng)
  }

  const getCurrentLocation = () => {
    const coords = userData?.location?.coordinates
    if (!coords) return
    const latitude = coords[1]
    const longitude = coords[0]
    dispatch(setLocation({ lat: latitude, lon: longitude }))
    getAddressByLatLng(latitude, longitude)
  }

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
      )
      dispatch(setAddress(result?.data?.results[0].address_line2))
    } catch (error) {
      console.log(error)
    }
  }

  const getLatLngByAddress = async () => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`
      )
      const { lat, lon } = result.data.features[0].properties
      dispatch(setLocation({ lat, lon }))
    } catch (error) {
      console.log(error)
    }
  }

  const handlePlaceOrder = async () => {
    try {
      // FIX: Normalize cartItems to ensure 'shop' field is always present
      // regardless of how it's stored in Redux (shop / shopId / shopID)
      const formattedCartItems = cartItems.map(item => ({
        id: item.id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        shop: item.shop || item.shopId || item.shopID
      }))

      // FIX: Guard — if any item is missing a shop, abort early
      const missingShop = formattedCartItems.some(item => !item.shop)
      if (missingShop) {
        console.error("One or more cart items are missing a shop reference:", formattedCartItems)
        alert("Something went wrong with your cart. Please clear your cart and try again.")
        return
      }

      const result = await axios.post(`${serverUrl}/api/order/place-order`, {
        paymentMethod,
        deliveryAddress: {
          text: addressInput,
          latitude: location?.lat,
          longitude: location?.lon
        },
        deliveryFee,
        totalAmount: AmountWithDeliveryFee,
        cartItems: formattedCartItems,
        orderNote,
        couponCode: appliedCoupon ? appliedCoupon.code : "",
        discountAmount: appliedCoupon ? appliedCoupon.discount : 0
      }, { withCredentials: true })

      if (paymentMethod === "cod") {
        dispatch(addMyOrder(result.data))
        dispatch(clearCart())
        navigate("/order-placed", { state: { orderId: result.data._id } })
      } else {
        const orderId = result.data.orderId
        const razorOrder = result.data.razorOrder
        openRazorpayWindow(orderId, razorOrder)
      }
    } catch (error) {
      console.error("Place order error:", error?.response?.data || error)
    }
  }

  const openRazorpayWindow = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: 'INR',
      name: "YumRush",
      description: "Food Delivery Website",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          const result = await axios.post(`${serverUrl}/api/order/verify-payment`, {
            razorpay_payment_id: response.razorpay_payment_id,
            orderId
          }, { withCredentials: true })
          dispatch(addMyOrder(result.data))
          dispatch(clearCart())
          navigate("/order-placed", { state: { orderId: result.data._id } })
        } catch (error) {
          console.error("Payment verify error:", error?.response?.data || error)
        }
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  useEffect(() => {
    setAddressInput(address)
  }, [address])

  const mapCenter = (location?.lat && location?.lon)
    ? [location.lat, location.lon]
    : [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon]

  return (
    <div className='min-h-screen bg-[#fff9f6] flex items-center justify-center p-6'>
      <div className='absolute top-[20px] left-[20px] z-[10]' onClick={() => navigate("/")}>
        <IoIosArrowRoundBack size={35} className='text-[#fc8019] cursor-pointer' />
      </div>
      <div className='w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Checkout</h1>

        <section>
          <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>
            <IoLocationSharp className='text-[#fc8019]' /> Delivery Location
          </h2>
          <div className='flex gap-2 mb-3'>
            <input
              type="text"
              className='flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#fc8019]'
              placeholder='Enter Your Delivery Address..'
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
            <button
              className='bg-[#fc8019] hover:bg-[#e47317] text-white px-3 py-2 rounded-lg flex items-center justify-center'
              onClick={getLatLngByAddress}
            >
              <IoSearchOutline size={17} />
            </button>
            <button
              className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center'
              onClick={getCurrentLocation}
            >
              <TbCurrentLocation size={17} />
            </button>
          </div>
          <div className='rounded-xl border overflow-hidden'>
            <div className='h-64 w-full flex items-center justify-center'>
              <MapContainer className={"w-full h-full"} center={mapCenter} zoom={16}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location || DEFAULT_LOCATION} />
                {location?.lat && location?.lon && (
                  <Marker
                    position={[location.lat, location.lon]}
                    draggable
                    eventHandlers={{ dragend: onDragEnd }}
                  />
                )}
              </MapContainer>
            </div>
          </div>
          <div className="mt-3 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm flex items-center gap-2 border border-gray-100">
            <span className="text-lg">🕐</span> Estimated delivery time: 30-45 mins
          </div>
        </section>

        <section>
          <h2 className='text-lg font-semibold mb-3 text-gray-800'>Payment Method</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left cursor-pointer transition ${paymentMethod === "cod" ? "border-[#fc8019] bg-[#fff9f6] shadow" : "border-gray-200 hover:border-gray-300"}`}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100'>
                <MdDeliveryDining className='text-green-600 text-xl' />
              </span>
              <div>
                <p className='font-medium text-gray-800'>Cash On Delivery</p>
                <p className='text-xs text-gray-500'>Pay when your food arrives</p>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left cursor-pointer transition ${paymentMethod === "online" ? "border-[#fc8019] bg-[#fff9f6] shadow" : "border-gray-200 hover:border-gray-300"}`}
              onClick={() => setPaymentMethod("online")}
            >
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100'>
                <FaMobileScreenButton className='text-purple-700 text-lg' />
              </span>
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'>
                <FaCreditCard className='text-blue-700 text-lg' />
              </span>
              <div>
                <p className='font-medium text-gray-800'>UPI / Credit / Debit Card</p>
                <p className='text-xs text-gray-500'>Pay Securely Online</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-lg font-semibold mb-2 text-gray-800'>Offers & Benefits</h2>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className='flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#fc8019]'
              placeholder='Enter promo code'
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              disabled={!!appliedCoupon}
            />
            {!appliedCoupon ? (
              <button
                className='bg-[#fc8019] hover:bg-[#e47317] text-white px-5 py-2 rounded-lg font-semibold transition-colors'
                onClick={handleApplyCoupon}
              >
                Apply
              </button>
            ) : (
              <button
                className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold transition-colors'
                onClick={handleRemoveCoupon}
              >
                Remove
              </button>
            )}
          </div>
          {appliedCoupon && (
            <p className="text-green-600 text-sm font-bold mt-1">
              ✅ Coupon applied! You saved ₹{appliedCoupon.discount}
            </p>
          )}
          {couponError && (
            <p className="text-red-500 text-sm font-bold mt-1">{couponError}</p>
          )}
          <textarea
            className="w-full mt-4 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#fc8019] resize-none"
            rows="2"
            placeholder="Add special instructions for your order (optional)"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
          ></textarea>
        </section>

        <section>
          <div className="flex flex-col mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className='text-lg font-semibold text-gray-800'>Order Summary</h2>
              <span className="text-sm font-semibold text-[#fc8019] bg-orange-50 border border-orange-100 px-3 py-1 rounded-full shadow-sm">
                {feeData.badge} {feeData.loyaltyLevel}
              </span>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100 w-full mb-1">
              <p className="text-xs text-gray-700 font-semibold mb-1.5">{loyaltyMessage}</p>
              <div className="w-full bg-orange-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#fc8019] h-1.5 rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, loyaltyPercent))}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className='rounded-xl border bg-gray-50 p-4 space-y-2'>
            {cartItems.map((item, index) => (
              <div key={index} className='flex justify-between text-sm text-gray-700'>
                <span>{item.name} x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <hr className='border-gray-200 my-2' />
            <div className='flex justify-between font-medium text-gray-800'>
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            {appliedCoupon?.type === "subtotal" && (
              <div className='flex justify-between font-medium text-green-600'>
                <span>Coupon ({appliedCoupon.code})</span>
                <span>-₹{appliedCoupon.discount}</span>
              </div>
            )}
            <div className='flex flex-col gap-1 border-y border-gray-200 py-3 my-2'>
              <div className='flex justify-between text-gray-700 text-sm font-medium'>
                <span>Base Delivery Fee</span>
                <span>₹{feeData.baseFee}</span>
              </div>
              {feeData.surcharges.map((s, idx) => (
                <div key={idx} className='flex justify-between text-red-500 text-xs italic ml-2'>
                  <span>{s.reason}</span>
                  <span>+₹{s.amount}</span>
                </div>
              ))}
              {feeData.discounts.map((d, idx) => (
                <div key={idx} className='flex justify-between text-green-500 text-xs italic ml-2'>
                  <span>{d.reason}</span>
                  <span>-₹{d.amount}</span>
                </div>
              ))}
              {appliedCoupon?.type === "delivery" && (
                <div className='flex justify-between text-green-600 text-xs italic ml-2 font-bold'>
                  <span>FREEDEL Coupon Applied</span>
                  <span>-₹{appliedCoupon.discount}</span>
                </div>
              )}
              <div className='flex justify-between text-gray-800 font-bold text-sm pt-2 mt-1 border-t border-gray-100'>
                <div className='flex items-center gap-1 group relative cursor-help'>
                  <span>Final Delivery Fee</span>
                  <span className="text-[10px] text-white bg-gray-400 rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm">i</span>
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 bg-white shadow-xl border border-gray-200 rounded-lg p-3 z-50 text-xs text-gray-600 font-normal">
                    Delivery fees are calculated dynamically based on your loyalty level, time of day, and order amount. Min fee is ₹9, Max fee is ₹79.
                  </div>
                </div>
                <span className={deliveryFee === 0 ? "text-green-600" : "text-[#fc8019]"}>
                  {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                </span>
              </div>
              {feeData.savedAmount > 0 ? (
                <div className="text-green-600 text-xs font-bold text-right pt-2">
                  🎉 You saved ₹{feeData.savedAmount} on delivery!
                </div>
              ) : feeData.surcharges.some(s => s.reason.includes('Peak hours')) ? (
                <div className="text-[#fc8019] text-xs font-bold text-right pt-2">
                  ⚡ Peak hours surcharge applied. Order later for cheaper delivery!
                </div>
              ) : null}
            </div>
            <div className='flex justify-between text-lg font-bold text-[#fc8019] pt-2'>
              <span>Total</span>
              <span>₹{AmountWithDeliveryFee}</span>
            </div>
          </div>
        </section>

        <button
          className='w-full bg-[#fc8019] hover:bg-[#e47317] text-white py-3 rounded-xl font-semibold'
          onClick={handlePlaceOrder}
        >
          {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
        </button>
      </div>
    </div>
  )
}

export default CheckOut