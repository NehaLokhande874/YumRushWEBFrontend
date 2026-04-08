import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { addToCart } from '../redux/userSlice';
import { FaLeaf, FaRobot, FaSyncAlt, FaTimes, FaShoppingCart, FaCheckCircle, FaStar } from "react-icons/fa";
import { FaDrumstickBite } from "react-icons/fa6";
import { IoIosArrowRoundBack } from "react-icons/io";
import Nav from '../components/Nav';
import { ClipLoader } from 'react-spinners';

function AIMealPlanner() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState(300);
  const [customBudget, setCustomBudget] = useState("");
  const [mood, setMood] = useState("Happy");
  const [diet, setDiet] = useState("Both");
  const [hunger, setHunger] = useState("Medium");
  const [results, setResults] = useState([]);
  const [previousComboIds, setPreviousComboIds] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePlanMeal = async (replaceItemId = null) => {
    setLoading(true);
    try {
      const activeBudget = customBudget ? Number(customBudget) : budget;
      const payload = {
        budget: activeBudget,
        mood,
        diet,
        hunger,
        previousComboIds
      };

      if (replaceItemId) {
        payload.replaceItemId = replaceItemId;
        payload.currentComboIds = results.map(item => item._id);
      }

      const res = await axios.post(`${serverUrl}/api/item/ai-meal-plan`, payload, { withCredentials: true });
      if (res.data) {
        setResults(res.data);
        setStep(2);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to plan meal. " + (error.response?.data?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleTryDifferentCombo = () => {
    const currentIds = results.map(item => item._id);
    setPreviousComboIds(prev => [...prev, ...currentIds]);
    setStep(1);
  };

  const handleRemove = (itemId) => {
    setResults(prev => prev.filter(item => item._id !== itemId));
  };

  const handleAddAllToCart = () => {
    results.forEach(item => {
      dispatch(addToCart({
        id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        shop: item.shop,
        quantity: 1,
        foodType: item.foodType
      }));
    });
    navigate('/cart');
  };

  const currentTotal = results.reduce((acc, item) => acc + item.price, 0);
  const activeBudget = customBudget ? Number(customBudget) : budget;
  const savedAmount = activeBudget - currentTotal;
  const totalCalories = results.length * 250; // mock calories calculation

  return (
    <div className='min-h-screen bg-[#fff9f6] flex flex-col items-center overflow-y-auto pb-10 relative'>
      <div 
        onClick={() => navigate("/")} 
        className="absolute top-[20px] left-[20px] cursor-pointer hover:bg-orange-50 rounded-full p-1 transition-colors z-50"
      >
        <IoIosArrowRoundBack size={35} color="#fc8019" />
      </div>
      <Nav />

      <div className="w-full max-w-2xl mt-10 px-4">
        {step === 1 ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-orange-100">
            <div className="flex flex-col items-center mb-8 border-b pb-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaRobot className="text-[#fc8019] text-3xl" />
              </div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">AI Meal Planner</h1>
              <p className="text-gray-500 font-medium mt-1">"Let AI plan your perfect meal!"</p>
            </div>

            <div className="space-y-8">
              {/* Budget */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3">What's your budget?</h2>
                <div className="flex flex-wrap gap-3 mb-3">
                  {[100, 200, 300, 500].map(val => (
                    <button
                      key={val}
                      onClick={() => { setBudget(val); setCustomBudget(""); }}
                      className={`px-5 py-2.5 rounded-full font-bold border transition-all shadow-sm ${budget === val && !customBudget ? 'bg-[#fc8019] text-white border-[#fc8019]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#fc8019]'}`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Custom input"
                  value={customBudget}
                  onChange={(e) => { setCustomBudget(e.target.value); setBudget(null); }}
                  className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fc8019] focus:outline-none"
                />
              </div>

              {/* Mood */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3">How are you feeling?</h2>
                <div className="flex flex-wrap gap-3">
                  {['😢 Sad', '😊 Happy', '😤 Stressed', '🥳 Party', '🏋️ Fitness'].map(m => (
                    <button
                      key={m}
                      onClick={() => setMood(m.split(' ')[1])}
                      className={`px-5 py-2.5 rounded-full font-bold border transition-all shadow-sm ${mood === m.split(' ')[1] ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-200'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diet */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3">Diet Preference?</h2>
                <div className="flex flex-wrap gap-3">
                  {['🌿 Veg', '🍗 Non-Veg', 'Both'].map(d => {
                    const cleanD = d.replace(/[^\w-]/g, '').trim();
                    return (
                      <button
                        key={cleanD}
                        onClick={() => setDiet(cleanD)}
                        className={`px-5 py-2.5 rounded-full font-bold border transition-all shadow-sm ${diet === cleanD ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-200 hover:border-green-200'}`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hunger */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3">Hunger Level?</h2>
                <div className="flex flex-wrap gap-3">
                  {['🥗 Light', '🍽️ Medium', '🍱 Heavy'].map(h => {
                    const cleanH = h.replace(/[^\w-]/g, '').trim();
                    return (
                      <button
                        key={cleanH}
                        onClick={() => setHunger(cleanH)}
                        className={`px-5 py-2.5 rounded-full font-bold border transition-all shadow-sm ${hunger === cleanH ? 'bg-orange-50 text-[#fc8019] border-orange-200' : 'bg-white text-gray-700 border-gray-200 hover:border-orange-200'}`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePlanMeal(null)}
              disabled={loading}
              className="w-full mt-10 bg-[#fc8019] hover:bg-[#e47317] text-white font-black text-lg py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? <ClipLoader size={24} color="#fff" /> : <>✨ Plan My Meal</>}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-orange-100">
            <div className="flex items-center gap-4 mb-8 border-b pb-6">
              <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center shrink-0">
                <FaRobot className="text-[#fc8019] text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-800">AI Recommends:</h1>
                <p className="text-gray-500 font-medium italic">"Perfect meal for your {mood.toLowerCase()} mood!"</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {results.map(item => (
                <div key={item._id} className="border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                  <img src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} alt={item.name} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shrink-0 flex-none" />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start">
                        <h2 className="font-bold text-lg text-gray-800 line-clamp-1 truncate">{item.name}</h2>
                        <span className="font-black text-[#fc8019] text-lg shrink-0 ml-2">₹{item.price}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-sm mt-1 text-gray-600 font-medium">
                        <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-bold text-xs"><FaStar size={10} /> {item.rating?.average || "4.2"}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">{item.foodType === 'veg' ? <FaLeaf className="text-green-600" /> : <FaDrumstickBite className="text-red-500" />} {item.foodType === 'veg' ? 'Veg' : 'Non-Veg'}</span>
                      </div>

                      <div className="text-sm font-semibold text-gray-700 mt-1.5 truncate">
                        {item.category || "General"}
                      </div>

                      <div className="text-xs text-gray-500 mt-0.5 truncate">
                        from <span className="font-bold text-gray-700">{item.shop?.name || "YumRush Partner"}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-3 pt-2">
                      <button
                        onClick={() => handlePlanMeal(item._id)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 py-2 border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl font-bold text-sm transition-colors"
                      >
                        {loading ? <ClipLoader size={12} color="#2563eb" /> : <><FaSyncAlt /> Replace</>}
                      </button>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors"
                      >
                        <FaTimes /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {results.length === 0 && (
                <div className="text-center py-12 px-6 bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col items-center justify-center w-full">
                  <span className="text-5xl mb-4">😔</span>
                  <h2 className="text-2xl font-black text-gray-800 mb-2">Sorry!</h2>
                  <p className="text-gray-600 font-medium mb-1 text-center">We could not find any meal matching your preferences.</p>
                  <p className="text-gray-500 text-sm mb-8 text-center">Please try with a different budget, mood or diet preference.</p>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 sm:flex-none justify-center bg-[#fc8019] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#e47317] transition-colors shadow-md"
                    >
                      <span>🔄</span> Try Again
                    </button>
                    <button 
                      onClick={() => navigate("/")}
                      className="flex-1 sm:flex-none justify-center bg-white text-gray-700 border-2 border-gray-200 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <span>🏠</span> Go to Home
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 space-y-2">
              <div className="flex justify-between text-gray-600 font-bold">
                <span>Budget:</span>
                <span>₹{activeBudget}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-gray-800">
                <span>Total:</span>
                <span className="flex items-center gap-1">₹{currentTotal} {currentTotal <= activeBudget && <FaCheckCircle className="text-green-500 text-sm" />}</span>
              </div>
              {savedAmount >= 0 && (
                <div className="flex justify-between text-green-600 font-bold text-sm pt-2 border-t border-gray-200 mt-2">
                  <span>You save:</span>
                  <span>₹{savedAmount} 💰</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 font-bold text-sm">
                <span>Est. Calories:</span>
                <span>~{totalCalories} cal</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleTryDifferentCombo}
                className="flex-1 py-3.5 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <FaSyncAlt /> Try Different Combo
              </button>
              <button
                onClick={handleAddAllToCart}
                disabled={results.length === 0}
                className="flex-1 py-3.5 bg-[#fc8019] hover:bg-[#e47317] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <FaShoppingCart /> Add All to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIMealPlanner;
