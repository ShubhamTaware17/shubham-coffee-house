export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  stock: number;
  sku: string;
  featured: boolean;
  roast: string;
  origin: string;
  rating: number;
  active: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  tax: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  note: string;
  inventoryRestored: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  change: number;
  reason: string;
  orderId: string | null;
  createdAt: string;
}

export type EnquiryStatus = "new" | "in-progress" | "resolved";

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: EnquiryStatus;
  reply: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  salary: number;
  shift: string;
  status: "active" | "on-leave";
  joinedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  description: string;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  createdAt: string;
}

export interface Settings {
  shopName: string;
  tagline: string;
  currency: string;
  taxRate: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
  adminEmail: string;
  adminPassword: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  instagram: string;
}

export interface AdminSession {
  email: string;
  loggedInAt: string;
}

export interface DataSnapshot {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  logs: InventoryLog[];
  enquiries: Enquiry[];
  employees: Employee[];
  coupons: Coupon[];
  settings: Settings;
}

export interface CartLine {
  productId: string;
  qty: number;
}
