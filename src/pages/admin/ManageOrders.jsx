import { useEffect, useState } from "react"
import axios from "axios"

export default function ManageOrders() {
  const [orders, setOrders] = useState([])
  const token = localStorage.getItem("adminToken")

  useEffect(() => {
    axios.get("http://localhost:8000/api/admin/orders", { headers: { Authorization: "Bearer " + token } })
      .then(res => setOrders(res.data.orders))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Order ID</th>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id} className="border-t">
              <td className="p-3">{o._id.slice(-6)}</td>
              <td className="p-3">{o.user?.fullName || "N/A"}</td>
              <td className="p-3">Rs.{o.totalAmount}</td>
              <td className="p-3">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
