import type {
  Category,
  Coupon,
  Customer,
  Employee,
  Enquiry,
  InventoryLog,
  Order,
  Product,
  Settings,
} from "./types";

/**
 * Realistic demo data for SHUBHAM COFFEE SHOP. All dates are fixed ISO
 * strings so the seed is identical on server and client.
 */

export const seedCategories: Category[] = [
  { id: "cat-esp", name: "Espresso Bar", description: "Hand-pulled classics from our brass Italian machine.", createdAt: "2025-06-01T09:00:00.000Z" },
  { id: "cat-hot", name: "Hot Coffee", description: "Slow-brewed comfort in a warm cup.", createdAt: "2025-06-01T09:00:00.000Z" },
  { id: "cat-cold", name: "Cold Coffee", description: "Chilled, bold and refreshing — brewed 18 hours.", createdAt: "2025-06-01T09:00:00.000Z" },
  { id: "cat-bakery", name: "Bakery", description: "Baked fresh every morning in-house.", createdAt: "2025-06-01T09:00:00.000Z" },
  { id: "cat-beans", name: "Beans & Merch", description: "Take our roast home with you.", createdAt: "2025-06-01T09:00:00.000Z" },
];

export const seedProducts: Product[] = [
  { id: "prod-01", name: "Espresso Doppio", description: "Double shot of our single-origin Arabica — thick crema, notes of dark chocolate and toasted hazelnut.", price: 180, categoryId: "cat-esp", image: "/img/espresso.jpg", stock: 40, sku: "SC-ESP-001", featured: true, roast: "Dark", origin: "Chikmagalur, India", rating: 4.9, active: true, createdAt: "2025-06-10T09:00:00.000Z" },
  { id: "prod-02", name: "Classic Cappuccino", description: "Velvety micro-foam over a double espresso, dusted with cocoa. Our best-seller since day one.", price: 240, categoryId: "cat-esp", image: "/img/cappuccino.jpg", stock: 35, sku: "SC-ESP-002", featured: true, roast: "Medium", origin: "House Blend", rating: 4.8, active: true, createdAt: "2025-06-10T09:00:00.000Z" },
  { id: "prod-03", name: "Caramel Macchiato", description: "Vanilla-kissed steamed milk marked with espresso and finished with house-made caramel drizzle.", price: 280, categoryId: "cat-esp", image: "/img/caramel-macchiato.jpg", stock: 28, sku: "SC-ESP-003", featured: true, roast: "Medium", origin: "House Blend", rating: 4.7, active: true, createdAt: "2025-06-10T09:00:00.000Z" },
  { id: "prod-04", name: "Mocha Bliss", description: "Espresso, Belgian dark chocolate and steamed milk, crowned with whipped cream and chocolate shavings.", price: 295, categoryId: "cat-esp", image: "/img/cappuccino.jpg", stock: 24, sku: "SC-ESP-004", featured: false, roast: "Dark", origin: "Coorg, India", rating: 4.8, active: true, createdAt: "2025-06-10T09:00:00.000Z" },
  { id: "prod-05", name: "18-Hour Cold Brew", description: "Steeped for 18 hours for a smooth, low-acid punch. Served over crystal-clear ice.", price: 265, categoryId: "cat-cold", image: "/img/cold-brew.jpg", stock: 30, sku: "SC-CLD-001", featured: true, roast: "Dark", origin: "Chikmagalur, India", rating: 4.9, active: true, createdAt: "2025-06-10T09:00:00.000Z" },
  { id: "prod-06", name: "Iced Caramel Latte", description: "Cold milk, double espresso and our salted caramel swirl over ice.", price: 285, categoryId: "cat-cold", image: "/img/caramel-macchiato.jpg", stock: 26, sku: "SC-CLD-002", featured: false, roast: "Medium", origin: "House Blend", rating: 4.6, active: true, createdAt: "2025-06-10T09:00:00.000Z" },
  { id: "prod-07", name: "French Press Ritual", description: "A full press to share — coarse-ground, four-minute steep, served with tasting notes on the side.", price: 340, categoryId: "cat-hot", image: "/img/french-press.jpg", stock: 18, sku: "SC-HOT-001", featured: false, roast: "Medium", origin: "Araku Valley, India", rating: 4.7, active: true, createdAt: "2025-06-10T09:00:00.000Z" },
  { id: "prod-08", name: "Honey Cinnamon Latte", description: "Wildflower honey and Ceylon cinnamon folded into silky steamed milk and espresso.", price: 275, categoryId: "cat-hot", image: "/img/cappuccino.jpg", stock: 22, sku: "SC-HOT-002", featured: false, roast: "Medium", origin: "House Blend", rating: 4.6, active: true, createdAt: "2025-06-10T09:00:00.000Z" },
  { id: "prod-09", name: "Butter Croissant", description: "72-hour laminated dough, 24 golden layers, baked at dawn. Flaky outside, tender inside.", price: 195, categoryId: "cat-bakery", image: "/img/croissant.jpg", stock: 20, sku: "SC-BAK-001", featured: true, roast: "—", origin: "In-house bakery", rating: 4.8, active: true, createdAt: "2025-06-10T09:00:00.000Z" },
  { id: "prod-10", name: "Chocolate Chip Cookies", description: "Chewy centre, crisp edge, 60% dark chocolate chunks. Baked in small batches.", price: 175, categoryId: "cat-bakery", image: "/img/cookies.jpg", stock: 25, sku: "SC-BAK-002", featured: false, roast: "—", origin: "In-house bakery", rating: 4.7, active: true, createdAt: "2025-06-10T09:00:00.000Z" },
  { id: "prod-11", name: "Blueberry Muffin", description: "Domed, golden and bursting with blueberries — pairs beautifully with the cold brew.", price: 185, categoryId: "cat-bakery", image: "/img/cookies.jpg", stock: 16, sku: "SC-BAK-003", featured: false, roast: "—", origin: "In-house bakery", rating: 4.5, active: true, createdAt: "2025-06-10T09:00:00.000Z" },
  { id: "prod-12", name: "Signature Blend Beans · 250g", description: "Our house blend — rich, smooth, balanced. Whole beans, roasted this week, valve-sealed for freshness.", price: 750, categoryId: "cat-beans", image: "/img/beans-bag.jpg", stock: 14, sku: "SC-BNS-001", featured: true, roast: "Medium-Dark", origin: "Chikmagalur & Araku blend", rating: 4.9, active: true, createdAt: "2025-06-10T09:00:00.000Z" },
];

export const seedCustomers: Customer[] = [
  { id: "cust-01", name: "Aarav Mehta", email: "aarav.mehta@example.com", phone: "+91 98200 11223", address: "12 Marine Drive, Mumbai", notes: "Prefers oat milk in cappuccinos.", createdAt: "2026-02-14T10:00:00.000Z" },
  { id: "cust-02", name: "Priya Sharma", email: "priya.sharma@example.com", phone: "+91 98450 54321", address: "304 Indiranagar, Bengaluru", notes: "Regular weekend customer.", createdAt: "2026-03-02T10:00:00.000Z" },
  { id: "cust-03", name: "Rohan Deshpande", email: "rohan.d@example.com", phone: "+91 99201 76545", address: "77 Koregaon Park, Pune", notes: "Bulk orders for office.", createdAt: "2026-04-18T10:00:00.000Z" },
  { id: "cust-04", name: "Sneha Kulkarni", email: "sneha.k@example.com", phone: "+91 90876 33412", address: "5 Banjara Hills, Hyderabad", notes: "Loves the blueberry muffin.", createdAt: "2026-05-25T10:00:00.000Z" },
  { id: "cust-05", name: "Vikram Singh", email: "vikram.singh@example.com", phone: "+91 98110 44556", address: "221 Connaught Place, New Delhi", notes: "", createdAt: "2026-07-11T10:00:00.000Z" },
  { id: "cust-06", name: "Ananya Iyer", email: "ananya.iyer@example.com", phone: "+91 91760 88991", address: "14 Anna Nagar, Chennai", notes: "Gift orders around Diwali.", createdAt: "2026-08-30T10:00:00.000Z" },
];

const o = (
  orderNumber: string,
  customer: Customer,
  items: { productId: string; name: string; price: number; qty: number }[],
  createdAt: string,
  status: Order["status"],
  couponCode: string | null = null,
  discount = 0,
): Order => {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100;
  const deliveryFee = subtotal >= 500 ? 0 : 40;
  return {
    id: `ord-${orderNumber.toLowerCase()}`,
    orderNumber,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    address: customer.address,
    items,
    subtotal,
    discount,
    couponCode,
    tax,
    deliveryFee,
    total: Math.round((subtotal - discount + tax + deliveryFee) * 100) / 100,
    status,
    paymentMethod: "Cash on Delivery",
    note: "",
    inventoryRestored: status === "cancelled",
    createdAt,
    updatedAt: createdAt,
  };
};

export const seedOrders: Order[] = [
  o("SC-1031", seedCustomers[0], [{ productId: "prod-02", name: "Classic Cappuccino", price: 240, qty: 2 }, { productId: "prod-09", name: "Butter Croissant", price: 195, qty: 1 }], "2026-10-06T09:14:00.000Z", "completed"),
  o("SC-1032", seedCustomers[1], [{ productId: "prod-05", name: "18-Hour Cold Brew", price: 265, qty: 1 }, { productId: "prod-11", name: "Blueberry Muffin", price: 185, qty: 1 }], "2026-10-09T15:40:00.000Z", "completed"),
  o("SC-1033", seedCustomers[2], [{ productId: "prod-02", name: "Classic Cappuccino", price: 240, qty: 4 }, { productId: "prod-10", name: "Chocolate Chip Cookies", price: 175, qty: 4 }], "2026-10-14T11:05:00.000Z", "completed", "WELCOME10", 131.6),
  o("SC-1034", seedCustomers[3], [{ productId: "prod-01", name: "Espresso Doppio", price: 180, qty: 2 }], "2026-10-19T08:22:00.000Z", "cancelled"),
  o("SC-1035", seedCustomers[0], [{ productId: "prod-12", name: "Signature Blend Beans · 250g", price: 750, qty: 1 }], "2026-10-23T18:30:00.000Z", "completed"),
  o("SC-1036", seedCustomers[4], [{ productId: "prod-03", name: "Caramel Macchiato", price: 280, qty: 2 }, { productId: "prod-06", name: "Iced Caramel Latte", price: 285, qty: 1 }], "2026-10-27T13:48:00.000Z", "completed", "FIRSTCUP", 50),
  o("SC-1037", seedCustomers[5], [{ productId: "prod-04", name: "Mocha Bliss", price: 295, qty: 2 }, { productId: "prod-09", name: "Butter Croissant", price: 195, qty: 2 }], "2026-10-30T10:12:00.000Z", "completed"),
  o("SC-1038", seedCustomers[1], [{ productId: "prod-07", name: "French Press Ritual", price: 340, qty: 1 }, { productId: "prod-08", name: "Honey Cinnamon Latte", price: 275, qty: 1 }], "2026-11-01T16:02:00.000Z", "ready"),
  o("SC-1039", seedCustomers[2], [{ productId: "prod-05", name: "18-Hour Cold Brew", price: 265, qty: 3 }], "2026-11-02T09:35:00.000Z", "preparing"),
  o("SC-1040", seedCustomers[3], [{ productId: "prod-02", name: "Classic Cappuccino", price: 240, qty: 1 }, { productId: "prod-11", name: "Blueberry Muffin", price: 185, qty: 2 }], "2026-11-03T08:05:00.000Z", "pending"),
];

export const seedLogs: InventoryLog[] = seedOrders
  .filter((ord) => ord.status !== "cancelled")
  .flatMap((ord) =>
    ord.items.map((it, idx) => ({
      id: `log-${ord.orderNumber.toLowerCase()}-${idx}`,
      productId: it.productId,
      productName: it.name,
      change: -it.qty,
      reason: `Order ${ord.orderNumber}`,
      orderId: ord.id,
      createdAt: ord.createdAt,
    })),
  )
  .concat(
    seedOrders
      .filter((ord) => ord.status === "cancelled")
      .flatMap((ord) =>
        ord.items.map((it, idx) => ({
          id: `log-${ord.orderNumber.toLowerCase()}-rest-${idx}`,
          productId: it.productId,
          productName: it.name,
          change: it.qty,
          reason: `Order ${ord.orderNumber} cancelled — stock restored`,
          orderId: ord.id,
          createdAt: ord.updatedAt,
        })),
      ),
  );

export const seedCoupons: Coupon[] = [
  { id: "cpn-01", code: "WELCOME10", type: "percent", value: 10, minOrder: 300, description: "10% off your first order above ₹300", expiresAt: "2026-12-31T23:59:59.000Z", usageLimit: 500, usedCount: 2, active: true, createdAt: "2026-01-15T09:00:00.000Z" },
  { id: "cpn-02", code: "FIRSTCUP", type: "fixed", value: 50, minOrder: 200, description: "Flat ₹50 off orders above ₹200", expiresAt: "2026-12-31T23:59:59.000Z", usageLimit: null, usedCount: 1, active: true, createdAt: "2026-02-01T09:00:00.000Z" },
  { id: "cpn-03", code: "DIWALI20", type: "percent", value: 20, minOrder: 800, description: "Festive 20% off orders above ₹800", expiresAt: "2026-11-30T23:59:59.000Z", usageLimit: 200, usedCount: 0, active: true, createdAt: "2026-10-10T09:00:00.000Z" },
  { id: "cpn-04", code: "MONDAYBLUES", type: "fixed", value: 100, minOrder: 600, description: "Flat ₹100 off Monday orders above ₹600", expiresAt: "2026-10-15T23:59:59.000Z", usageLimit: 100, usedCount: 0, active: false, createdAt: "2026-09-01T09:00:00.000Z" },
];

export const seedEmployees: Employee[] = [
  { id: "emp-01", name: "Shubham Taware", role: "Owner & Head Barista", email: "shubham@shubhamcoffee.com", phone: "+91 90040 12345", salary: 85000, shift: "Morning", status: "active", joinedAt: "2025-06-01T09:00:00.000Z" },
  { id: "emp-02", name: "Maya Fernandes", role: "Pastry Chef", email: "maya@shubhamcoffee.com", phone: "+91 90040 23456", salary: 42000, shift: "Morning", status: "active", joinedAt: "2025-08-12T09:00:00.000Z" },
  { id: "emp-03", name: "Karan Malhotra", role: "Barista", email: "karan@shubhamcoffee.com", phone: "+91 90040 34567", salary: 28000, shift: "Evening", status: "active", joinedAt: "2026-01-20T09:00:00.000Z" },
  { id: "emp-04", name: "Divya Nair", role: "Floor Manager", email: "divya@shubhamcoffee.com", phone: "+91 90040 45678", salary: 38000, shift: "Evening", status: "on-leave", joinedAt: "2026-03-05T09:00:00.000Z" },
];

export const seedEnquiries: Enquiry[] = [
  { id: "enq-01", name: "Neha Gupta", email: "neha.gupta@example.com", phone: "+91 98765 43210", subject: "Birthday party booking", message: "Hi! I'd like to book your mezzanine for a birthday party of 15 people on Nov 15th, evening. Do you offer custom cakes from your bakery?", status: "new", reply: "", createdAt: "2026-11-01T12:20:00.000Z" },
  { id: "enq-02", name: "Arjun Rao", email: "arjun.rao@example.com", phone: "+91 97654 32109", subject: "Corporate coffee supply", message: "We're a 40-person startup in Andheri and would love a weekly bean + machine service quote. Who should I speak with?", status: "in-progress", reply: "Thanks Arjun — our B2B desk will send a quote within 2 working days.", createdAt: "2026-10-28T09:45:00.000Z" },
  { id: "enq-03", name: "Fatima Sheikh", email: "fatima.s@example.com", phone: "+91 96543 21098", subject: "Lost loyalty card", message: "I lost my punch card with 8 stamps. Is there any way to recover the stamps? It was under my email.", status: "resolved", reply: "Hi Fatima, we've issued you a new card with all 8 stamps credited. Collect it at the counter.", createdAt: "2026-10-20T17:10:00.000Z" },
];

export const seedSettings: Settings = {
  shopName: "SHUBHAM COFFEE SHOP",
  tagline: "Where every cup tells a story",
  currency: "₹",
  taxRate: 5,
  deliveryFee: 40,
  freeDeliveryAbove: 500,
  adminEmail: "admin@shubhamcoffee.com",
  adminPassword: "admin123",
  address: "42 Brew Street, Bandra West, Mumbai 400050",
  phone: "+91 22 4890 1234",
  email: "hello@shubhamcoffee.com",
  hours: "Mon–Sun · 7:00 AM – 11:00 PM",
  instagram: "@shubhamcoffeeshop",
};
