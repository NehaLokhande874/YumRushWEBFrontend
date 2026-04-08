import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import AdminSidebar from "../../components/AdminSidebar";
import { serverUrl } from "../../App";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axios.get(serverUrl + "/api/admin/stats", {
          headers: { Authorization: "Bearer " + token }
        });
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex justify-center items-center"><ClipLoader color="#ff4d2d" size={50} /></div>
    </div>
  );

  const chartData = [
    { name: "Users", count: stats?.totalUsers || 0 },
    { name: "Owners", count: stats?.totalOwners || 0 },
    { name: "Delivery", count: stats?.totalDeliveryPartners || 0 },
    { name: "Shops", count: stats?.totalShops || 0 },
    { name: "Orders", count: stats?.totalOrders || 0 },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-medium">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">Rs.{stats?.totalRevenue || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-medium">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalOrders || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-orange-600">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-[400px]">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Platform Overview</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: "transparent"}} />
              <Legend />
              <Bar dataKey="count" fill="#ff4d2d" radius={[4, 4, 0, 0]} barSize={50} name="Total Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
