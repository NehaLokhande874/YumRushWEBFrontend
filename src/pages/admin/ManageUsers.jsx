import { useEffect, useState } from "react"
import axios from "axios"

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const token = localStorage.getItem("adminToken")

  useEffect(() => {
    axios.get("http://localhost:8000/api/admin/users", { headers: { Authorization: "Bearer " + token } })
      .then(res => setUsers(res.data.users))
  }, [])

  const deleteUser = async (id) => {
    await axios.delete("http://localhost:8000/api/admin/user/" + id, { headers: { Authorization: "Bearer " + token } })
    setUsers(users.filter(u => u._id !== id))
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} className="border-t">
              <td className="p-3">{u.fullName}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3">
                <button onClick={() => deleteUser(u._id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
