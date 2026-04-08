import React, { useState } from 'react';
import axios from 'axios';
import { FaStar, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { serverUrl } from '../App';

const RatingModal = ({ order, onClose, onRefresh }) => {
    const [ratings, setRatings] = useState({});
    const [loading, setLoading] = useState(false);
    
    // Extract items from all shopOrders in the order
    const items = order.shopOrders.shopOrderItems || [];

    const handleRatingChange = (itemId, rating) => {
        setRatings(prev => ({ ...prev, [itemId]: rating }));
    };

    const handleSubmit = async () => {
        const ratingEntries = Object.entries(ratings);
        if (ratingEntries.length === 0) {
            return toast.warn("Please select at least one rating");
        }

        setLoading(true);
        try {
            const promises = ratingEntries.map(([itemId, rating]) => 
                axios.post(`${serverUrl}/api/rating/submit`, {
                    itemId,
                    orderId: order._id,
                    rating
                }, { withCredentials: true })
            );

            await Promise.all(promises);
            toast.success("Ratings submitted successfully!");
            if (onRefresh) onRefresh();
            onClose();
        } catch (error) {
            console.error("Submit rating error:", error);
            toast.error(error.response?.data?.message || "Failed to submit some ratings. They might be already rated.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in py-2">
                <div className="bg-[#fc8019] p-4 flex justify-between items-center mx-2 rounded-xl">
                    <h2 className="text-white font-bold text-lg">Rate Your Items</h2>
                    <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded-full transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {items.length === 0 ? (
                        <p className="text-center text-gray-500">No items found to rate.</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.item || item._id} className="flex flex-col gap-2 pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-800">{item.name}</span>
                                    <span className="text-xs text-gray-400 font-medium tracking-tight">Q: {item.quantity}</span>
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRatingChange(item.item || item._id, star)}
                                            className="transition-transform active:scale-90 hover:scale-110"
                                        >
                                            <FaStar
                                                size={32}
                                                className={ratings[item.item || item._id] >= star ? "text-[#fc8019]" : "text-gray-200"}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-gray-50 flex gap-3 mx-4 mb-2 rounded-xl border border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || items.length === 0}
                        className="flex-1 px-4 py-3 bg-[#fc8019] text-white rounded-xl font-bold hover:bg-[#e67316] transition-colors disabled:opacity-50 shadow-md active:scale-95 transition-all"
                    >
                        {loading ? "Saving..." : "Submit Ratings"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
