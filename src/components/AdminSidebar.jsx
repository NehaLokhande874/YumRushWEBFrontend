import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "bg-orange-100 text-orange-600 font-semibold" : "text-gray-700 hover:bg-orange-50";

  return (
    <div className="w-64 bg-white border-r min-h-screen hidden md:block">
      <div className="p-4 font-bold text-2xl text-[#ff4d2d] border-b">YumRush Admin</div>
      <nav className="p-4 space-y-2">
        <Link to="/admin/dashboard" className={`block p-3 rounded ${isActive('/admin/dashboard')}`}>Dashboard</Link>
        <Link to="/admin/users" className={`block p-3 rounded ${isActive('/admin/users')}`}>Manage Users</Link>
        <Link to="/admin/shops" className={`block p-3 rounded ${isActive('/admin/shops')}`}>Manage Shops</Link>
        <Link to="/admin/orders" className={`block p-3 rounded ${isActive('/admin/orders')}`}>Manage Orders</Link>
        <Link to="/admin/offers" className={`block p-3 rounded ${isActive('/admin/offers')}`}>Manage Offers</Link>
        <Link to="/admin/delivery-partners" className={`block p-3 rounded ${isActive('/admin/delivery-partners')}`}>Delivery Partners</Link>
        <Link to="/admin/complaints" className={`block p-3 rounded ${isActive('/admin/complaints')}`}>Manage Complaints</Link>
        <Link to="/" className="block p-3 rounded text-red-500 hover:bg-red-50 mt-10">Exit Admin</Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;
