import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { io } from "socket.io-client"
import { serverUrl } from "../../App"
import { ClipLoader } from "react-spinners"

export default function ManageComplaints() {
    const [complaints, setComplaints] = useState([])
    const [filter, setFilter] = useState("all")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expandedId, setExpandedId] = useState(null)
    const token = localStorage.getItem("adminToken") // Verified admin token key
    const socketRef = useRef(null)

    const fetchComplaints = async () => {
        setLoading(true)
        setError(null)
        try {
            console.log("Fetching complaints with token:", token ? "Exist" : "Missing")
            const res = await axios.get(`${serverUrl}/api/complaint/all`, {
                headers: { Authorization: "Bearer " + token }
            })
            
            // DEBUG LOG
            console.log("Data:", res.data)
            
            if (Array.isArray(res.data)) {
                setComplaints(res.data)
            } else {
                console.warn("Expected array but got:", typeof res.data)
                setComplaints([])
            }
        } catch (err) {
            console.error("Fetch Error:", err)
            setError(err.response?.data?.message || "Failed to connect to server")
            toast.error("Failed to fetch complaints")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComplaints()

        socketRef.current = io(serverUrl, { withCredentials: true })

        socketRef.current.on("newComplaint", (complaint) => {
            console.log("New Real-time Complaint:", complaint)
            setComplaints(prev => [complaint, ...prev])
            toast.info(`New complaint from ${complaint?.userId?.fullName || "a user"}!`, {
                position: "top-right"
            })
        })

        return () => {
            socketRef.current?.disconnect()
        }
    }, [])

    const handleResolve = async (id) => {
        try {
            await axios.put(`${serverUrl}/api/complaint/resolve/${id}`, {}, {
                headers: { Authorization: "Bearer " + token }
            })
            toast.success("Complaint marked as resolved")
            setComplaints(prev =>
                prev.map(c => c?._id === id ? { ...c, status: "resolved" } : c)
            )
        } catch (err) {
            console.error("Resolve Error:", err)
            toast.error("Failed to resolve complaint")
        }
    }

    const filtered = complaints.filter(c => {
        if (!c) return false
        if (filter === "all") return true
        return c?.status === filter
    })

    const totalCount = complaints?.length || 0
    const pendingCount = complaints?.filter(c => c?.status === "pending")?.length || 0
    const resolvedCount = complaints?.filter(c => c?.status === "resolved")?.length || 0

    const formatDate = (date) => {
        if (!date) return "N/A"
        try {
            return new Date(date).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric"
            })
        } catch (e) {
            return "Invalid Date"
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <ClipLoader color="#ff4d2d" size={50} />
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading Complaints...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md shadow-sm">
                    <h3 className="text-xl font-bold mb-2">Connection Error</h3>
                    <p className="mb-4 text-sm opacity-90">{error}</p>
                    <button 
                        onClick={fetchComplaints}
                        className="bg-red-500 text-white px-6 py-2 rounded-full font-bold hover:bg-red-600 transition-all shadow-md"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <h1 className="text-3xl font-black text-gray-800 mb-8 tracking-tight">Complaint Management</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Received</p>
                    <p className="text-3xl font-black text-gray-800">{totalCount}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 border-l-4 border-l-orange-400">
                    <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">Pending Action</p>
                    <p className="text-3xl font-black text-orange-600">{pendingCount}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-50 border-l-4 border-l-green-400">
                    <p className="text-green-400 text-xs font-bold uppercase tracking-wider mb-1">Resolved</p>
                    <p className="text-3xl font-black text-green-600">{resolvedCount}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex gap-2">
                    {["all", "pending", "resolved"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-6 py-2 rounded-full text-sm font-bold capitalize transition-all transform active:scale-95 ${filter === tab
                                    ? "bg-gray-900 text-white shadow-lg"
                                    : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-100"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={fetchComplaints}
                    className="text-xs font-bold text-[#ff4d2d] underline hover:opacity-80"
                >
                    Refresh List
                </button>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-lg font-medium">No complaints match your selection. ✨</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Restaurant</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Details</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Incident</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(c => (
                                    <tr key={c?._id} className="hover:bg-gray-50/50 transition-colors">
                                        
                                        {/* Customer */}
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800 text-sm">
                                                {c?.userId?.fullName || "Unknown User"}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium">{c?.userId?.email || "No email"}</div>
                                        </td>

                                        {/* Restaurant */}
                                        <td className="p-4">
                                            <div className="font-bold text-gray-700 text-sm">
                                                {c?.restaurantId?.shopName || "N/A"}
                                            </div>
                                        </td>

                                        {/* Order */}
                                        <td className="p-4">
                                            {c?.orderId ? (
                                                <div className="space-y-0.5">
                                                    <div className="font-bold text-xs text-gray-800">
                                                        #{c?.orderId?._id?.slice(-6).toUpperCase()}
                                                    </div>
                                                    <div className="text-[10px] text-orange-500 font-bold">
                                                        ₹{c?.orderId?.totalAmount}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-300 italic">No linked order</span>
                                            )}
                                        </td>

                                        {/* Incident (Subject + Message) */}
                                        <td className="p-4 min-w-[250px]">
                                            <div className="font-bold text-gray-800 text-sm mb-1">{c?.subject || "No Subject"}</div>
                                            <div className="text-[11px] text-gray-500 leading-relaxed">
                                                <span
                                                    className="cursor-pointer hover:text-gray-800 transition-colors"
                                                    onClick={() => setExpandedId(expandedId === c?._id ? null : c?._id)}
                                                >
                                                    {expandedId === c?._id
                                                        ? c?.message
                                                        : (c?.message?.length > 60
                                                            ? c?.message?.slice(0, 60) + "..."
                                                            : c?.message)}
                                                    
                                                    {(c?.message?.length || 0) > 60 && (
                                                        <span className="text-[#ff4d2d] font-bold ml-1 uppercase text-[9px]">
                                                            {expandedId === c?._id ? " [Collapse]" : " [Read More]"}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="text-[11px] font-bold text-gray-600">
                                                {formatDate(c?.createdAt)}
                                            </div>
                                        </td>

                                        {/* Status Tag */}
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${c?.status === "pending"
                                                    ? "bg-orange-50 text-orange-500 border border-orange-100"
                                                    : "bg-green-50 text-green-500 border border-green-100"
                                                }`}>
                                                {c?.status || "UNKNOWN"}
                                            </span>
                                        </td>

                                        {/* Action Button */}
                                        <td className="p-4">
                                            <div className="flex justify-center">
                                                {c?.status === "pending" ? (
                                                    <button
                                                        onClick={() => handleResolve(c?._id)}
                                                        className="bg-gray-900 border border-gray-900 text-white px-4 py-1.5 rounded-full hover:bg-black transition-all text-[10px] font-black shadow-sm active:scale-95 whitespace-nowrap"
                                                    >
                                                        RESOLVE NOW
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-green-600 font-bold uppercase italic opacity-50">Done ✅</span>
                                                )}
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
