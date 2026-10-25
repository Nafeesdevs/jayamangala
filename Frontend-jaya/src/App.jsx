import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import { CustomerOnly, AdminOnly } from "./components/common/Guards";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import TrackOrder from "./pages/TrackOrder";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { About, Contact, Terms, Privacy, NotFound } from "./pages/Static";
import Wholesale from "./pages/Wholesale";

import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import Brands from "./pages/admin/Brands";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminLeads from "./pages/admin/Leads";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="wholesale" element={<Wholesale />} />

        <Route path="cart" element={<CustomerOnly><Cart /></CustomerOnly>} />
        <Route path="wishlist" element={<CustomerOnly><Wishlist /></CustomerOnly>} />
        <Route path="checkout" element={<CustomerOnly><Checkout /></CustomerOnly>} />
        <Route path="orders" element={<CustomerOnly><MyOrders /></CustomerOnly>} />
        <Route path="track" element={<CustomerOnly><TrackOrder /></CustomerOnly>} />
        <Route path="track/:id" element={<CustomerOnly><TrackOrder /></CustomerOnly>} />
        <Route path="profile" element={<CustomerOnly><Profile /></CustomerOnly>} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin" element={<AdminOnly><AdminLayout /></AdminOnly>}>
        <Route index element={<Dashboard />} />
        <Route path="categories" element={<Categories />} />
        <Route path="brands" element={<Brands />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="leads" element={<AdminLeads />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
