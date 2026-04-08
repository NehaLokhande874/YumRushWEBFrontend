import React, { useState } from 'react';
import { FaTimes, FaLeaf, FaDrumstickBite, FaStar, FaMinus, FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';

function FoodItemModal({ item, onClose }) {
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.user);
  
  // If item is already in cart, we could sync it, but for simplicity we rely on Redux state
  const cartItem = cartItems.find((i) => i.id === item._id);

  if (!item) return null;

  const handleIncrease = (e) => {
    e.stopPropagation();
    setQuantity((q) => q + 1);
  };
  
  const handleDecrease = (e) => {
    e.stopPropagation();
    if (quantity > 0) setQuantity((q) => q - 1);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (quantity > 0) {
      dispatch(
        addToCart({
          id: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          shop: item.shop,
          quantity,
          foodType: item.foodType,
        })
      );
      onClose(); // Optional: close modal after adding to cart
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl md:rounded-[2rem] w-full max-w-[450px] md:max-w-[700px] max-h-[92vh] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row relative shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <button 
          className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white text-gray-800 rounded-full p-2 transition-colors shadow-sm"
          onClick={onClose}
        >
          <FaTimes size={18} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 h-[220px] sm:h-[250px] md:h-[400px] relative">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
            {item.foodType === "veg" ? (
              <FaLeaf className="text-green-600 text-sm" />
            ) : (
              <FaDrumstickBite className="text-red-600 text-sm" />
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
             <span className="text-white font-black text-3xl tracking-tighter shadow-sm mb-1">
               ₹{item.price}
             </span>
             <span className="text-white/90 font-medium text-sm">
               Special Offer Applied
             </span>
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-white">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#3d4152] mb-2 leading-tight">
              {item.name}
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-700 rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                <FaStar className="text-white text-[10px]" />
                <span className="text-white text-xs font-bold">{item.rating?.average || "4.2"}</span>
              </div>
              <span className="text-gray-500 font-medium text-sm">| {item.category || "Cuisine"}</span>
            </div>
            
            <p className="text-[#686b78] text-sm md:text-base leading-relaxed mb-6">
              {item.description || "A delicious and finely prepared dish, crafted with the freshest ingredients to give you the perfect taste in every bite. Enjoy this chef's special!"}
            </p>
          </div>

          <div className="mt-auto border-t border-gray-100 pt-6">
            {!cartItem ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Quantity</span>
                  <div className="flex bg-white shadow-sm rounded-lg overflow-hidden text-[#1ba672] font-bold border border-gray-200">
                    <button className="px-4 py-2 hover:bg-gray-50 transition-colors" onClick={handleDecrease}>
                      <FaMinus size={14} />
                    </button>
                    <span className="px-4 py-2 border-x border-gray-100 min-w-[3rem] text-center">{quantity}</span>
                    <button className="px-4 py-2 hover:bg-gray-50 transition-colors" onClick={handleIncrease}>
                      <FaPlus size={14} />
                    </button>
                  </div>
                </div>
                <button 
                  className={`w-full font-bold text-lg py-3 rounded-xl transition-all shadow-md ${
                    quantity > 0 
                      ? 'bg-[#1ba672] text-white hover:bg-[#158e60]' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={handleAddToCart}
                >
                  Add to Cart • ₹{quantity * item.price}
                </button>
              </div>
            ) : (
              <div className="w-full text-center text-lg font-bold text-white bg-[#60b246] py-3 rounded-xl shadow-md flex items-center justify-center gap-2">
                 ✓ Added to Cart
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodItemModal;
