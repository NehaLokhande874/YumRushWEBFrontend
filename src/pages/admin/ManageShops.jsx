import { useEffect, useState } from "react"
import axios from "axios"

export default function ManageShops() {
  const [shops, setShops] = useState([])
  const token = localStorage.getItem("adminToken")

  useEffect(() => {
    const t = localStorage.getItem("adminToken")
    axios.get("http://localhost:8000/api/admin/shops", { headers: { Authorization: "Bearer " + t } })
      .then(res => setShops(res.data.shops))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Shops</h2>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Shop Name</th>
            <th className="p-3 text-left">Owner</th>
            <th className="p-3 text-left">City</th>
          </tr>
        </thead>
        <tbody>
          {shops.map(s => (
            <tr key={s._id} className="border-t">
              <td className="p-3">{s.name}</td>
              <td className="p-3">{s.owner?.fullName || "N/A"}</td>
              <td className="p-3">{s.city || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
