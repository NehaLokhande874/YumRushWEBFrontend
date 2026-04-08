import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { serverUrl } from "../App";
import { FiPlus, FiChevronDown, FiChevronUp, FiMail, FiPhone, FiClock, FiShoppingBag, FiInfo } from "react-icons/fi";
import useGetMyOrders from "../hooks/useGetMyOrders";

const HelpPage = () => {
    const { userData, myOrders } = useSelector((state) => state.user);
    const [complaints, setComplaints] = useState([]);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
    const [selectedOrderId, setSelectedOrderId] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);

    useGetMyOrders();

    // Extract unique restaurants from all orders
    const uniqueRestaurants = useMemo(() => {
        const restaurantsMap = new Map();
        myOrders?.forEach(order => {
            order.shopOrders?.forEach(so => {
                if (so.shop && !restaurantsMap.has(so.shop._id)) {
                    restaurantsMap.set(so.shop._id, so.shop.shopName);
                }
            });
        });
        return Array.from(restaurantsMap.entries()).map(([id, name]) => ({ id, name }));
    }, [myOrders]);

    // Filter orders for the selected restaurant
    const filteredOrders = useMemo(() => {
        if (!selectedRestaurantId) return [];
        return myOrders?.filter(order =>
            order.shopOrders?.some(so => so.shop._id === selectedRestaurantId)
        ) || [];
    }, [selectedRestaurantId, myOrders]);

    const faqData = [
        {
            q: "How do I track my order?",
            a: "Go to My Orders and click the 'Track Order' button to see real-time updates."
        },
        {
            q: "How do I cancel an order?",
            a: "Orders can be cancelled within 2 minutes of placement. After that, the restaurant begins preparation."
        },
        {
            q: "When will I get my refund?",
            a: "Refunds are usually processed within 5-7 business days depending on your bank."
        },
        {
            q: "How do I change my delivery address?",
            a: "The delivery address is automatically detected from your GPS location at checkout."
        },
        {
            q: "How do I contact support?",
            a: "Email us at support@yumrush.com or call our toll-free number 1800-XXX-XXXX."
        }
    ];

    const fetchMyComplaints = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/complaint/my-complaints`, { withCredentials: true });
            setComplaints(response.data);
        } catch (error) {
            console.error("Error fetching complaints:", error);
        }
    };

    useEffect(() => {
        fetchMyComplaints();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject || !message) return toast.error("Please fill in subject and message");
        if (!selectedRestaurantId || !selectedOrderId) return toast.error("Please select a restaurant and order");

        setLoading(true);
        try {
            await axios.post(
                `${serverUrl}/api/complaint/create`,
                {
                    subject,
                    message,
                    restaurantId: selectedRestaurantId,
                    orderId: selectedOrderId
                },
                { withCredentials: true }
            );
            toast.success("Complaint submitted successfully");
            setSubject("");
            setMessage("");
            setSelectedRestaurantId("");
            setSelectedOrderId("");
            fetchMyComplaints();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit complaint");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    return (
        <div className="min-h-screen bg-[#fff9f6] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">How can we help?</h1>
                    <p className="mt-4 text-lg text-gray-600">We're here to assist you with any issues or questions.</p>
                </div>

                {/* Section 1: File a Complaint */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl">
                    <div className="bg-[#fc8019] px-6 py-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FiPlus className="text-white" /> File a Complaint
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Restaurant</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#fc8019] focus:border-transparent transition-all outline-none"
                                    value={selectedRestaurantId}
                                    onChange={(e) => {
                                        setSelectedRestaurantId(e.target.value);
                                        setSelectedOrderId("");
                                    }}
                                >
                                    <option value="">Which restaurant?</option>
                                    {uniqueRestaurants.map(res => (
                                        <option key={res.id} value={res.id}>{res.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Order</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#fc8019] focus:border-transparent transition-all outline-none disabled:bg-gray-50"
                                    value={selectedOrderId}
                                    onChange={(e) => setSelectedOrderId(e.target.value)}
                                    disabled={!selectedRestaurantId}
                                >
                                    <option value="">Which order?</option>
                                    {filteredOrders.map(order => (
                                        <option key={order._id} value={order._id}>
                                            Order #{order._id.slice(-6).toUpperCase()} - ₹{order.totalAmount} - {formatDate(order.createdAt)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Issue Category</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#fc8019] focus:border-transparent transition-all outline-none"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            >
                                <option value="">Select a subject</option>
                                <option value="Order not delivered">Order not delivered</option>
                                <option value="Wrong item delivered">Wrong item delivered</option>
                                <option value="Payment issue">Payment issue</option>
                                <option value="Bad food quality">Bad food quality</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                            <textarea
                                rows="4"
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#fc8019] focus:border-transparent transition-all outline-none resize-none"
                                placeholder="Describe your issue in detail..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#fc8019] hover:bg-[#e47317] text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Submitting..." : "Submit Complaint"}
                        </button>
                    </form>
                </div>

                {/* Section 2: My Complaints */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gray-800 px-6 py-4">
                        <h2 className="text-xl font-bold text-white">My Complaints History</h2>
                    </div>
                    <div className="p-6">
                        {complaints.length === 0 ? (
                            <p className="text-center text-gray-500 py-8 italic font-medium">No complaints filed yet.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Restaurant / Order</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Issue</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {complaints.map((c) => (
                                            <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                                            <FiShoppingBag className="text-gray-400" /> {c.restaurantId?.shopName || "N/A"}
                                                        </span>
                                                        <span className="text-xs text-[#fc8019] font-medium">
                                                            Order: #{c.orderId?._id?.slice(-6).toUpperCase() || "N/A"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-sm font-bold text-gray-800 uppercase text-xs tracking-tight">{c.subject}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[150px]">{c.message}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(c.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${c.status === "pending" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                                                        {c.status.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 3: FAQ Accordion */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Frequently Asked Questions</h2>
                    {faqData.map((faq, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transform transition hover:scale-[1.01]">
                            <button
                                className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                            >
                                <span className="font-bold text-gray-800">{faq.q}</span>
                                {activeFaq === index ? <FiChevronUp className="text-[#fc8019]" /> : <FiChevronDown className="text-gray-400" />}
                            </button>
                            <div className={`px-6 py-4 bg-gray-50 text-gray-600 text-sm leading-relaxed border-t border-gray-100 transition-all ${activeFaq === index ? "block animate-fadeIn" : "hidden"}`}>
                                {faq.a}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Section 4: Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                    <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center text-center border border-gray-100 transition-transform hover:-translate-y-2">
                        <div className="bg-blue-100 p-4 rounded-full mb-4">
                            <FiMail className="text-blue-600 text-2xl" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">Email Us</h3>
                        <p className="text-sm text-gray-600">support@yumrush.com</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center text-center border border-gray-100 transition-transform hover:-translate-y-2">
                        <div className="bg-green-100 p-4 rounded-full mb-4">
                            <FiPhone className="text-green-600 text-2xl" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">Call Support</h3>
                        <p className="text-sm text-gray-600">1800-XXX-XXXX</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center text-center border border-gray-100 transition-transform hover:-translate-y-2">
                        <div className="bg-purple-100 p-4 rounded-full mb-4">
                            <FiClock className="text-purple-600 text-2xl" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">Support Hours</h3>
                        <p className="text-sm text-gray-600">9AM - 9PM (Mon-Sun)</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HelpPage;