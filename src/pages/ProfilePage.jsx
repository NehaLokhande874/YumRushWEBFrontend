import { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { setUserData } from "../redux/userSlice"
import { serverUrl } from "../App"

const ProfilePage = () => {
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({ fullName: "", mobile: "" })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" })
  const [preview, setPreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [extraStats, setExtraStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (userData) {
      setForm({ fullName: userData.fullName || "", mobile: userData.mobile || "" })
      setPreview(userData.profileImage || null)
    }
    fetchProfile()
  }, [userData?._id])

  const fetchProfile = async () => {
    try {
      const res = await axios.get(serverUrl + "/api/user/profile", { withCredentials: true })
      if (res.data.success) {
        setExtraStats({
          totalDeliveries: res.data.totalDeliveries,
          totalEarnings: res.data.totalEarnings,
          shop: res.data.shop
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("fullName", form.fullName)
      formData.append("mobile", form.mobile)
      if (imageFile) formData.append("profileImage", imageFile)
      const res = await axios.put(serverUrl + "/api/user/profile", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      })
      if (res.data.success) {
        dispatch(setUserData(res.data.user))
        showToast("Profile updated successfully!")
        setImageFile(null)
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Passwords do not match", "error")
      return
    }
    if (passwordForm.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error")
      return
    }
    setPwLoading(true)
    try {
      const res = await axios.put(
        serverUrl + "/api/user/change-password",
        { oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword },
        { withCredentials: true }
      )
      if (res.data.success) {
        showToast("Password changed successfully!")
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change password", "error")
    } finally {
      setPwLoading(false)
    }
  }

  const roleLabel = { user: "Customer", owner: "Restaurant Owner", deliveryBoy: "Delivery Partner", admin: "Admin" }
  const roleBadgeColor = { user: "bg-blue-100 text-blue-700", owner: "bg-orange-100 text-orange-700", deliveryBoy: "bg-green-100 text-green-700", admin: "bg-red-100 text-red-700" }

  return (
    <div className="min-h-screen bg-[#fff9f6]">
      {toast && (
        <div className={"fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium " + (toast.type === "error" ? "bg-red-500" : "bg-green-500")}>
          {toast.type === "success" ? "? " : "? "}{toast.msg}
        </div>
      )}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
      </div>
      <div className="max-w-2xl mx-auto p-4 pb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 mt-4">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {preview ? (
                  <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ff4d2d] to-[#ff8c00]">
                    <span className="text-white text-2xl font-bold">{userData?.fullName?.charAt(0)?.toUpperCase() || "U"}</span>
                  </div>
                )}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#ff4d2d] rounded-full flex items-center justify-center shadow-md hover:bg-[#e63e20] transition-colors">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{userData?.fullName}</h2>
              <p className="text-gray-500 text-sm">{userData?.email}</p>
              <span className={"inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-semibold " + (roleBadgeColor[userData?.role] || "bg-gray-100 text-gray-600")}>
                {roleLabel[userData?.role] || userData?.role}
              </span>
            </div>
          </div>
          {userData?.role === "deliveryBoy" && (
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600">Rs.{extraStats.totalEarnings || 0}</p>
                <p className="text-xs text-green-500 mt-0.5">Total Earnings</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{extraStats.totalDeliveries || 0}</p>
                <p className="text-xs text-blue-500 mt-0.5">Deliveries Done</p>
              </div>
            </div>
          )}
          {userData?.role === "owner" && extraStats.shop && (
            <div className="mt-5 bg-orange-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-xl">??</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{extraStats.shop.shopName}</p>
                <p className="text-sm text-gray-500">{extraStats.shop.city}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1 mb-4">
          {["profile", "password"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={"flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 " + (activeTab === tab ? "bg-[#ff4d2d] text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}>
              {tab === "profile" ? "Edit Profile" : "Change Password"}
            </button>
          ))}
        </div>
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#ff4d2d] transition-all" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" value={userData?.email || ""} disabled className="w-full border border-gray-100 rounded-xl px-4 py-3 text-gray-400 bg-gray-50 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
              <input type="tel" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#ff4d2d] transition-all" placeholder="Your mobile number" />
            </div>
            <button onClick={handleSaveProfile} disabled={loading} className="w-full bg-[#ff4d2d] hover:bg-[#e63e20] disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : "Save Changes"}
            </button>
          </div>
        )}
        {activeTab === "password" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            {[{key:"oldPassword",label:"Current Password",placeholder:"Enter current password"},{key:"newPassword",label:"New Password",placeholder:"Min 6 characters"},{key:"confirmPassword",label:"Confirm New Password",placeholder:"Re-enter new password"}].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                <input type="password" value={passwordForm[field.key]} onChange={e => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#ff4d2d] transition-all" placeholder={field.placeholder} />
              </div>
            ))}
            {passwordForm.confirmPassword && (
              <p className={"text-xs font-medium " + (passwordForm.newPassword === passwordForm.confirmPassword ? "text-green-500" : "text-red-500")}>
                {passwordForm.newPassword === passwordForm.confirmPassword ? "? Passwords match" : "? Passwords do not match"}
              </p>
            )}
            <button onClick={handleChangePassword} disabled={pwLoading} className="w-full bg-[#ff4d2d] hover:bg-[#e63e20] disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2">
              {pwLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</> : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
