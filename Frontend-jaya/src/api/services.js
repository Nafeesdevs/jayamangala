import api, { toFormData } from "./client";

const data = (p) => p.then((r) => r.data);

export const AuthAPI = {
  login: (b) => data(api.post("/login", b)),
  register: (b) => data(api.post("/register", b)),
  logout: () => data(api.get("/logout")),
  profile: () => data(api.get("/profile")),
  updateProfile: (b) => data(api.put("/profile", b)),
};

export const CategoryAPI = {
  list: () => data(api.get("/category")),
  create: (o) => data(api.post("/category", toFormData(o))),
  update: (id, o) => data(api.put(`/category/${id}`, toFormData(o))),
  remove: (id) => data(api.delete(`/category/${id}`)),
};

export const BrandAPI = {
  list: () => data(api.get("/brand")),
  create: (o) => data(api.post("/brand", toFormData(o))),
  update: (id, o) => data(api.put(`/brand/${id}`, toFormData(o))),
  remove: (id) => data(api.delete(`/brand/${id}`)),
};

export const ProductAPI = {
  list: (params) => data(api.get("/products", { params })),
  get: (id) => data(api.get(`/product/${id}`)),
  create: (o) => data(api.post("/products", toFormData(o))),
  update: (id, o) => data(api.put(`/product/${id}`, toFormData(o))),
  remove: (id) => data(api.delete(`/product/${id}`)),
};

export const CartAPI = {
  get: () => data(api.get("/cart")),
  add: (productId, quantity = 1) => data(api.post("/cart", { productId, quantity })),
  update: (productId, quantity) => data(api.put("/cart/update", { productId, quantity })),
  remove: (productId) => data(api.post("/cart/remove", { productId })),
  clear: () => data(api.delete("/cart")),
};

export const WishlistAPI = {
  list: () => data(api.get("/whislist")),
  toggle: (productId) => data(api.post("/whislist", { productId })),
  remove: (productId) => data(api.delete(`/whislist/item/${productId}`)),
  clear: () => data(api.delete("/whislist")),
  moveToCart: (productId) => data(api.post("/whislist/move-to-cart", productId ? { productId } : {})),
};

export const PaymentAPI = {
  qr: () => data(api.get("/payment/qr")),
  upload: ({ amount, transactionId, screenshot }) =>
    data(api.post("/payment/upload", toFormData({ amount, transactionId, screenshot }))),
  mine: () => data(api.get("/payment/my")),
  all: (params) => data(api.get("/payments", { params })),
  setStatus: (id, status, remark) => data(api.put(`/payment/status/${id}`, { status, remark })),
};

export const OrderAPI = {
  create: (b) => data(api.post("/order", b)),
  mine: () => data(api.get("/orders/my")),
  get: (id) => data(api.get(`/order/${id}`)),
  track: (id) => data(api.get(`/order/track/${id}`)),
  cancel: (id, reason) => data(api.put(`/order/cancel/${id}`, { reason })),
  // admin
  all: (params) => data(api.get("/orders", { params })),
  stats: () => data(api.get("/orders/stats")),
  setStatus: (id, status, note) => data(api.put(`/order/status/${id}`, { status, note })),
  update: (id, b) => data(api.put(`/order/${id}`, b)),
  remove: (id) => data(api.delete(`/order/${id}`)),
};

export const UserAPI = {
  list: (params) => data(api.get("/users", { params })),
  get: (id) => data(api.get(`/user/${id}`)),
  create: (b) => data(api.post("/users", b)),
  update: (id, b) => data(api.put(`/user/${id}`, b)),
  remove: (id) => data(api.delete(`/user/${id}`)),
  orders: (id) => data(api.get(`/orders/user/${id}`)),
};
