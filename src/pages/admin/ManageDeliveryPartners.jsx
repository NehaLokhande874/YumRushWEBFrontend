import { useEffect, useState } from "react"
import axios from "axios"

export default function ManageDeliveryPartners() {
  const [partners, setPartners] = useState([])

  useEffect(() => {
    const t = localStorage.getItem("adminToken")
    axios.get("http://localhost:8000/api/admin/users", { headers: { Authorization: "Bearer " + t } })
      .then(res => setPartners(res.data.users.filter(u => u.role === "deliveryBoy")))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Delivery Partners</h2>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Mobile</th>
          </tr>
        </thead>
        <tbody>
          {partners.length === 0 && (
            <tr><td colSpan="3" className="p-3 text-center text-gray-400">No delivery partners found</td></tr>
          )}
          {partners.map(p => (
            <tr key={p._id} className="border-t">
              <td className="p-3">{p.fullName}</td>
              <td className="p-3">{p.email}</td>
              <td className="p-3">{p.mobile || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
