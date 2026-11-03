import { round2 } from "./format";
import type {
  Coupon,
  Customer,
  DataSnapshot,
  InventoryLog,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  Settings,
} from "./types";

/** Pure business rules — no React, no storage. The context layers call these. */

export interface Totals {
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  couponError: string | null;
}

export function validateCoupon(
  coupon: Coupon | undefined,
  subtotal: number,
  now: Date = new Date(),
): string | null {
  if (!coupon) return "Coupon code not found";
  if (!coupon.active) return "This coupon is no longer active";
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now.getTime())
    return "This coupon has expired";
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
    return "This coupon has reached its usage limit";
  if (subtotal < coupon.minOrder)
    return `Minimum order of ₹${coupon.minOrder} required for this coupon`;
  return null;
}

export function computeTotals(input: {
  items: { productId: string; qty: number }[];
  products: Product[];
  coupon: Coupon | undefined;
  settings: Settings;
  now?: Date;
}): Totals {
  const { items, products, coupon, settings } = input;
  const subtotal = round2(
    items.reduce((sum, line) => {
      const product = products.find((p) => p.id === line.productId);
      return product ? sum + product.price * line.qty : sum;
    }, 0),
  );

  let discount = 0;
  let couponError: string | null = null;
  if (coupon) {
    couponError = validateCoupon(coupon, subtotal, input.now);
    if (!couponError) {
      discount = coupon.type === "percent" ? round2((subtotal * coupon.value) / 100) : coupon.value;
      discount = Math.min(discount, subtotal);
    }
  }

  const tax = round2(((subtotal - discount) * settings.taxRate) / 100);
  const deliveryFee = subtotal - discount >= settings.freeDeliveryAbove ? 0 : settings.deliveryFee;
  const total = round2(subtotal - discount + tax + deliveryFee);
  return { subtotal, discount, tax, deliveryFee, total, couponError };
}

function nextOrderNumber(orders: Order[]): string {
  const max = orders.reduce((m, ord) => {
    const n = parseInt(ord.orderNumber.replace(/\D/g, ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 1000);
  return `SC-${max + 1}`;
}

function upsertCustomer(
  customers: Customer[],
  input: { name: string; email: string; phone: string; address: string },
): { customers: Customer[]; customerId: string | null } {
  const email = input.email.trim().toLowerCase();
  const existing = customers.find((c) => c.email.toLowerCase() === email);
  if (existing) {
    const updated = customers.map((c) =>
      c.id === existing.id
        ? { ...c, name: input.name.trim(), phone: input.phone.trim(), address: input.address.trim() }
        : c,
    );
    return { customers: updated, customerId: existing.id };
  }
  const customer: Customer = {
    id: `cust-${Date.now().toString(36)}-${customers.length + 1}`,
    name: input.name.trim(),
    email: email,
    phone: input.phone.trim(),
    address: input.address.trim(),
    notes: "Created from online order.",
    createdAt: new Date().toISOString(),
  };
  return { customers: [...customers, customer], customerId: customer.id };
}

export interface PlaceOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: { productId: string; qty: number }[];
  couponCode: string | null;
  paymentMethod: string;
  note: string;
}

export function placeOrder(
  data: DataSnapshot,
  input: PlaceOrderInput,
  now: Date = new Date(),
): { data: DataSnapshot; order: Order } | { error: string } {
  if (!input.items.length) return { error: "Your cart is empty" };

  const coupon = input.couponCode
    ? data.coupons.find((c) => c.code.toUpperCase() === input.couponCode?.toUpperCase())
    : undefined;

  const totals = computeTotals({ ...input, products: data.products, coupon, settings: data.settings, now });
  if (totals.couponError) return { error: totals.couponError };

  for (const line of input.items) {
    const product = data.products.find((p) => p.id === line.productId);
    if (!product) return { error: "A product in your cart no longer exists" };
    if (!product.active) return { error: `${product.name} is no longer available` };
    if (product.stock < line.qty) return { error: `Only ${product.stock} × ${product.name} left in stock` };
  }

  const orderItems: OrderItem[] = input.items.map((line) => {
    const product = data.products.find((p) => p.id === line.productId)!;
    return { productId: product.id, name: product.name, price: product.price, qty: line.qty };
  });

  const { customers, customerId } = upsertCustomer(data.customers, {
    name: input.customerName,
    email: input.customerEmail,
    phone: input.customerPhone,
    address: input.address,
  });

  const orderNumber = nextOrderNumber(data.orders);
  const createdAt = now.toISOString();
  const order: Order = {
    id: `ord-${now.getTime().toString(36)}`,
    orderNumber,
    customerId,
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim().toLowerCase(),
    customerPhone: input.customerPhone.trim(),
    address: input.address.trim(),
    items: orderItems,
    subtotal: totals.subtotal,
    discount: totals.discount,
    couponCode: totals.discount > 0 && coupon ? coupon.code : null,
    tax: totals.tax,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    status: "pending",
    paymentMethod: input.paymentMethod,
    note: input.note.trim(),
    inventoryRestored: false,
    createdAt,
    updatedAt: createdAt,
  };

  const products = data.products.map((p) => {
    const sold = orderItems.find((i) => i.productId === p.id);
    return sold ? { ...p, stock: p.stock - sold.qty } : p;
  });

  const newLogs: InventoryLog[] = orderItems.map((it) => ({
    id: `log-${order.id}-${it.productId}`,
    productId: it.productId,
    productName: it.name,
    change: -it.qty,
    reason: `Order ${orderNumber}`,
    orderId: order.id,
    createdAt,
  }));

  const coupons = coupon
    ? data.coupons.map((c) => (c.id === coupon.id ? { ...c, usedCount: c.usedCount + 1 } : c))
    : data.coupons;

  return {
    data: { ...data, products, customers, coupons, orders: [...data.orders, order], logs: [...data.logs, ...newLogs] },
    order,
  };
}

/** Cancel an order and restore its stock — exactly once. */
export function cancelOrder(data: DataSnapshot, orderId: string, now: Date = new Date()): { data: DataSnapshot; changed: boolean } {
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) return { data, changed: false };
  if (order.status === "cancelled" || order.inventoryRestored) return { data, changed: false };

  const products = data.products.map((p) => {
    const back = order.items.find((i) => i.productId === p.id);
    return back ? { ...p, stock: p.stock + back.qty } : p;
  });

  const createdAt = now.toISOString();
  const newLogs: InventoryLog[] = order.items.map((it) => ({
    id: `log-rest-${order.id}-${it.productId}-${now.getTime().toString(36)}`,
    productId: it.productId,
    productName: it.name,
    change: it.qty,
    reason: `Order ${order.orderNumber} cancelled — stock restored`,
    orderId: order.id,
    createdAt,
  }));

  const orders = data.orders.map((o) =>
    o.id === orderId
      ? { ...o, status: "cancelled" as OrderStatus, inventoryRestored: true, updatedAt: createdAt }
      : o,
  );

  return { data: { ...data, products, orders, logs: [...data.logs, ...newLogs] }, changed: true };
}

/** Un-cancelling re-deducts stock only if it was restored. */
export function restoreCancelledOrder(
  data: DataSnapshot,
  orderId: string,
  status: OrderStatus,
  now: Date = new Date(),
): { data: DataSnapshot; error?: string } {
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) return { data, error: "Order not found" };
  if (order.status !== "cancelled") return { data, error: "Order is not cancelled" };
  if (status === "cancelled") return { data };

  for (const line of order.items) {
    const product = data.products.find((p) => p.id === line.productId);
    if (!product || product.stock < line.qty)
      return { data, error: `Cannot reopen: not enough stock for ${line.name}` };
  }

  const products = data.products.map((p) => {
    const sold = order.items.find((i) => i.productId === p.id);
    return sold ? { ...p, stock: p.stock - sold.qty } : p;
  });

  const createdAt = now.toISOString();
  const newLogs: InventoryLog[] = order.items.map((it) => ({
    id: `log-redo-${order.id}-${it.productId}-${now.getTime().toString(36)}`,
    productId: it.productId,
    productName: it.name,
    change: -it.qty,
    reason: `Order ${order.orderNumber} reopened`,
    orderId: order.id,
    createdAt,
  }));

  const orders = data.orders.map((o) =>
    o.id === orderId ? { ...o, status, inventoryRestored: false, updatedAt: createdAt } : o,
  );

  return { data: { ...data, products, orders, logs: [...data.logs, ...newLogs] } };
}

export function setOrderStatus(
  data: DataSnapshot,
  orderId: string,
  status: OrderStatus,
  now: Date = new Date(),
): { data: DataSnapshot; error?: string } {
  if (status === "cancelled") {
    const res = cancelOrder(data, orderId, now);
    return { data: res.data };
  }
  if (status !== "pending") {
    const res = restoreCancelledOrder(data, orderId, status, now);
    if (res.error) return res;
    return { data: res.data };
  }
  const orders = data.orders.map((o) =>
    o.id === orderId ? { ...o, status, updatedAt: now.toISOString() } : o,
  );
  return { data: { ...data, orders } };
}

/** Delete an order entirely — returns its stock if it was never restored. */
export function deleteOrder(data: DataSnapshot, orderId: string, now: Date = new Date()): DataSnapshot {
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) return data;
  let next = data;
  if (order.status !== "cancelled" && !order.inventoryRestored) {
    next = cancelOrder(data, orderId, now).data;
  }
  return { ...next, orders: next.orders.filter((o) => o.id !== orderId) };
}

// ---------- Analytics ----------

export interface DashboardStats {
  revenue: number;
  revenueChange: number;
  orderCount: number;
  orderChange: number;
  customerCount: number;
  pendingCount: number;
  lowStock: { id: string; name: string; stock: number }[];
  revenueByDay: { day: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  recentOrders: Order[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeDashboardStats(data: DataSnapshot, now: Date = new Date()): DashboardStats {
  const active = (o: Order) => o.status !== "cancelled";
  const revenue = round2(data.orders.filter(active).reduce((s, o) => s + o.total, 0));

  const nowMs = now.getTime();
  const thisWeek = data.orders.filter(
    (o) => active(o) && nowMs - new Date(o.createdAt).getTime() <= 7 * DAY_MS,
  );
  const prevWeek = data.orders.filter((o) => {
    if (!active(o)) return false;
    const age = nowMs - new Date(o.createdAt).getTime();
    return age > 7 * DAY_MS && age <= 14 * DAY_MS;
  });
  const weekRevenue = round2(thisWeek.reduce((s, o) => s + o.total, 0));
  const prevRevenue = round2(prevWeek.reduce((s, o) => s + o.total, 0));
  const revenueChange = prevRevenue > 0 ? Math.round(((weekRevenue - prevRevenue) / prevRevenue) * 100) : weekRevenue > 0 ? 100 : 0;
  const orderChange = prevWeek.length > 0 ? Math.round(((thisWeek.length - prevWeek.length) / prevWeek.length) * 100) : thisWeek.length > 0 ? 100 : 0;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const revenueByDay: DashboardStats["revenueByDay"] = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(nowMs - i * DAY_MS);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + DAY_MS);
    const dayOrders = data.orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return active(o) && t >= start.getTime() && t < end.getTime();
    });
    revenueByDay.push({
      day: dayNames[start.getDay()] ?? "",
      revenue: round2(dayOrders.reduce((s, o) => s + o.total, 0)),
      orders: dayOrders.length,
    });
  }

  const statuses: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];
  const ordersByStatus = statuses.map((status) => ({
    status,
    count: data.orders.filter((o) => o.status === status).length,
  }));

  const qtyByProduct = new Map<string, { qty: number; revenue: number }>();
  data.orders.filter(active).forEach((o) =>
    o.items.forEach((it) => {
      const cur = qtyByProduct.get(it.name) ?? { qty: 0, revenue: 0 };
      cur.qty += it.qty;
      cur.revenue = round2(cur.revenue + it.qty * it.price);
      qtyByProduct.set(it.name, cur);
    }),
  );
  const topProducts = [...qtyByProduct.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    revenue,
    revenueChange,
    orderCount: data.orders.length,
    orderChange,
    customerCount: data.customers.length,
    pendingCount: data.orders.filter((o) => ["pending", "confirmed", "preparing"].includes(o.status)).length,
    lowStock: data.products
      .filter((p) => p.active && p.stock <= 5)
      .map((p) => ({ id: p.id, name: p.name, stock: p.stock }))
      .sort((a, b) => a.stock - b.stock),
    revenueByDay,
    ordersByStatus,
    topProducts,
    recentOrders: [...data.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
  };
}

export interface ReportStats {
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  categoryShare: { name: string; revenue: number }[];
  couponUsage: { code: string; used: number }[];
  customerRepeat: { repeat: number; oneTime: number };
  averageOrderValue: number;
  totalDiscounts: number;
}

export function computeReportStats(data: DataSnapshot, now: Date = new Date()): ReportStats {
  const active = data.orders.filter((o) => o.status !== "cancelled");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueByMonth: ReportStats["revenueByMonth"] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const orders = active.filter((o) => {
      const c = new Date(o.createdAt);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    });
    revenueByMonth.push({
      month: monthNames[d.getMonth()] ?? "",
      revenue: round2(orders.reduce((s, o) => s + o.total, 0)),
      orders: orders.length,
    });
  }

  const categoryShare = data.categories.map((cat) => {
    const productIds = data.products.filter((p) => p.categoryId === cat.id).map((p) => p.id);
    const revenue = round2(
      active.reduce(
        (s, o) => s + o.items.filter((i) => productIds.includes(i.productId)).reduce((s2, i) => s2 + i.qty * i.price, 0),
        0,
      ),
    );
    return { name: cat.name, revenue };
  }).filter((c) => c.revenue > 0);

  const couponUsage = data.coupons.map((c) => ({ code: c.code, used: c.usedCount })).sort((a, b) => b.used - a.used);

  const ordersPerCustomer = new Map<string, number>();
  active.forEach((o) => {
    if (o.customerId) ordersPerCustomer.set(o.customerId, (ordersPerCustomer.get(o.customerId) ?? 0) + 1);
  });
  const repeat = [...ordersPerCustomer.values()].filter((n) => n > 1).length;
  const oneTime = ordersPerCustomer.size - repeat;

  return {
    revenueByMonth,
    categoryShare,
    couponUsage,
    customerRepeat: { repeat, oneTime },
    averageOrderValue: active.length ? round2(active.reduce((s, o) => s + o.total, 0) / active.length) : 0,
    totalDiscounts: round2(active.reduce((s, o) => s + o.discount, 0)),
  };
}
