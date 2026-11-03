import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  cancelOrder as cancelOrderDomain,
  computeTotals,
  deleteOrder as deleteOrderDomain,
  placeOrder as placeOrderDomain,
  restoreCancelledOrder,
  setOrderStatus as setOrderStatusDomain,
  type PlaceOrderInput,
} from "@/lib/domain";
import { uid } from "@/lib/format";
import {
  seedCategories,
  seedCoupons,
  seedCustomers,
  seedEmployees,
  seedEnquiries,
  seedLogs,
  seedOrders,
  seedProducts,
  seedSettings,
} from "@/lib/seed";
import {
  KEYS,
  loadCollection,
  loadSettings,
  loadSingle,
  removeKey,
  resetStorage,
  saveCollection,
  saveSettings as persistSettings,
  saveSingle,
  seedIfNeeded,
} from "@/lib/storage";
import type {
  AdminSession,
  CartLine,
  Category,
  Coupon,
  Customer,
  DataSnapshot,
  Employee,
  Enquiry,
  EnquiryStatus,
  InventoryLog,
  Order,
  OrderStatus,
  Product,
  Settings,
} from "@/lib/types";

export interface CartDetailLine {
  product: Product;
  qty: number;
}

interface StoreContextValue {
  // Collections
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  logs: DataSnapshot["logs"];
  enquiries: Enquiry[];
  employees: Employee[];
  coupons: Coupon[];
  settings: Settings;
  // Cart
  cart: CartLine[];
  cartLines: CartDetailLine[];
  cartCount: number;
  addToCart: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  // Orders
  placeOrder: (input: PlaceOrderInput) => { ok: boolean; order?: Order; error?: string };
  updateOrderStatus: (orderId: string, status: OrderStatus) => { ok: boolean; error?: string };
  deleteOrder: (orderId: string) => void;
  // CRUD
  saveProduct: (product: Omit<Product, "createdAt"> & { createdAt?: string }) => void;
  deleteProduct: (productId: string) => void;
  saveCategory: (category: Omit<Category, "createdAt"> & { createdAt?: string }) => void;
  deleteCategory: (categoryId: string) => { ok: boolean; error?: string };
  saveCustomer: (customer: Omit<Customer, "createdAt"> & { createdAt?: string }) => void;
  deleteCustomer: (customerId: string) => void;
  saveEmployee: (employee: Omit<Employee, "joinedAt"> & { joinedAt?: string }) => void;
  deleteEmployee: (employeeId: string) => void;
  saveCoupon: (coupon: Omit<Coupon, "createdAt" | "usedCount"> & { createdAt?: string; usedCount?: number }) => void;
  deleteCoupon: (couponId: string) => void;
  submitEnquiry: (enquiry: Omit<Enquiry, "id" | "status" | "reply" | "createdAt">) => void;
  updateEnquiry: (id: string, patch: Partial<Pick<Enquiry, "status" | "reply">>) => void;
  deleteEnquiry: (id: string) => void;
  adjustStock: (productId: string, change: number, reason: string) => { ok: boolean; error?: string };
  saveSettings: (settings: Settings) => void;
  // Auth
  isAdmin: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function useHydratedCollection<T>(
  key: string,
  seedValue: T[],
): [T[], (next: T[] | ((prev: T[]) => T[])) => void] {
  const [value, setValue] = useState<T[]>(seedValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(loadCollection<T>(key, seedValue));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAndSave = useCallback(
    (next: T[] | ((prev: T[]) => T[])) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T[]) => T[])(prev) : next;
        if (hydrated) saveCollection(key, resolved);
        return resolved;
      });
    },
    [key, hydrated],
  );

  return [value, setAndSave];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // Seed values keep SSR and the first client render identical; localStorage
  // is read in an effect after hydration.
  const [categories, setCategories] = useHydratedCollection<Category>(KEYS.categories, seedCategories);
  const [products, setProducts] = useHydratedCollection<Product>(KEYS.products, seedProducts);
  const [customers, setCustomers] = useHydratedCollection<Customer>(KEYS.customers, seedCustomers);
  const [orders, setOrders] = useHydratedCollection<Order>(KEYS.orders, seedOrders);
  const [logs, setLogs] = useHydratedCollection<InventoryLog>(KEYS.logs, seedLogs);
  const [enquiries, setEnquiries] = useHydratedCollection<Enquiry>(KEYS.enquiries, seedEnquiries);
  const [employees, setEmployees] = useHydratedCollection<Employee>(KEYS.employees, seedEmployees);
  const [coupons, setCoupons] = useHydratedCollection<Coupon>(KEYS.coupons, seedCoupons);
  const [settings, setSettingsState] = useState<Settings>(seedSettings);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    seedIfNeeded({
      categories: seedCategories,
      products: seedProducts,
      customers: seedCustomers,
      orders: seedOrders,
      logs: seedLogs,
      enquiries: seedEnquiries,
      employees: seedEmployees,
      coupons: seedCoupons,
      settings: seedSettings,
    });
    setCategories(loadCollection(KEYS.categories, seedCategories));
    setProducts(loadCollection(KEYS.products, seedProducts));
    setCustomers(loadCollection(KEYS.customers, seedCustomers));
    setOrders(loadCollection(KEYS.orders, seedOrders));
    setLogs(loadCollection(KEYS.logs, seedLogs));
    setEnquiries(loadCollection(KEYS.enquiries, seedEnquiries));
    setEmployees(loadCollection(KEYS.employees, seedEmployees));
    setCoupons(loadCollection(KEYS.coupons, seedCoupons));
    setSettingsState(loadSettings(KEYS.settings, seedSettings));
    setCart(loadCollection<CartLine>(KEYS.cart, []));
    setSession(loadSingle<AdminSession | null>(KEYS.session, null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snapshot = useMemo<DataSnapshot>(
    () => ({ categories, products, customers, orders, logs, enquiries, employees, coupons, settings }),
    [categories, products, customers, orders, logs, enquiries, employees, coupons, settings],
  );

  const persistCart = useCallback((next: CartLine[]) => {
    setCart(next);
    saveCollection(KEYS.cart, next);
  }, []);

  const addToCart = useCallback(
    (productId: string, qty = 1) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      setCart((prev) => {
        const existing = prev.find((l) => l.productId === productId);
        const currentQty = existing?.qty ?? 0;
        const nextQty = Math.min(currentQty + qty, product.stock, 99);
        if (nextQty <= currentQty) return prev;
        const next = existing
          ? prev.map((l) => (l.productId === productId ? { ...l, qty: nextQty } : l))
          : [...prev, { productId, qty: nextQty }];
        saveCollection(KEYS.cart, next);
        return next;
      });
    },
    [products],
  );

  const setQty = useCallback(
    (productId: string, qty: number) => {
      const product = products.find((p) => p.id === productId);
      if (!product || qty < 1) return;
      persistCart(
        cart.map((l) =>
          l.productId === productId ? { ...l, qty: Math.min(qty, product.stock, 99) } : l,
        ),
      );
    },
    [cart, products, persistCart],
  );

  const removeFromCart = useCallback(
    (productId: string) => persistCart(cart.filter((l) => l.productId !== productId)),
    [cart, persistCart],
  );

  const clearCart = useCallback(() => persistCart([]), [persistCart]);

  const cartLines = useMemo<CartDetailLine[]>(
    () =>
      cart
        .map((line) => {
          const product = products.find((p) => p.id === line.productId);
          return product ? { product, qty: line.qty } : null;
        })
        .filter((l): l is CartDetailLine => l !== null),
    [cart, products],
  );

  const cartCount = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart]);

  // ---------- Orders ----------
  const placeOrder = useCallback(
    (input: PlaceOrderInput) => {
      const res = placeOrderDomain(snapshot, input);
      if ("error" in res) return { ok: false as const, error: res.error };
      const d = res.data;
      setProducts(d.products);
      setCustomers(d.customers);
      setCoupons(d.coupons);
      setOrders(d.orders);
      setLogs(d.logs);
      return { ok: true as const, order: res.order };
    },
    [snapshot, setProducts, setCustomers, setCoupons, setOrders, setLogs],
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      if (status === "cancelled") {
        const res = cancelOrderDomain(snapshot, orderId);
        if (!res.changed) return { ok: false as const, error: "Stock was already restored for this order" };
        setProducts(res.data.products);
        setOrders(res.data.orders);
        setLogs(res.data.logs);
        return { ok: true as const };
      }
      if (status !== "pending") {
        const res = restoreCancelledOrder(snapshot, orderId, status);
        if (res.error) return { ok: false as const, error: res.error };
        setProducts(res.data.products);
        setOrders(res.data.orders);
        setLogs(res.data.logs);
        return { ok: true as const };
      }
      const res = setOrderStatusDomain(snapshot, orderId, status);
      setOrders(res.data.orders);
      return { ok: true as const };
    },
    [snapshot, setProducts, setOrders, setLogs],
  );

  const deleteOrder = useCallback(
    (orderId: string) => {
      const next = deleteOrderDomain(snapshot, orderId);
      setProducts(next.products);
      setOrders(next.orders);
      setLogs(next.logs);
    },
    [snapshot, setProducts, setOrders, setLogs],
  );

  // ---------- CRUD ----------
  const saveProduct = useCallback(
    (product: Omit<Product, "createdAt"> & { createdAt?: string }) => {
      setProducts((prev) => {
        const exists = prev.some((p) => p.id === product.id);
        const next = exists
          ? prev.map((p) => (p.id === product.id ? { ...p, ...product, createdAt: product.createdAt ?? p.createdAt } : p))
          : [...prev, { ...product, createdAt: product.createdAt ?? new Date().toISOString() }];
        saveCollection(KEYS.products, next);
        return next;
      });
    },
    [setProducts],
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      setProducts((prev) => {
        const next = prev.filter((p) => p.id !== productId);
        saveCollection(KEYS.products, next);
        return next;
      });
      setCart((prev) => {
        const next = prev.filter((l) => l.productId !== productId);
        saveCollection(KEYS.cart, next);
        return next;
      });
    },
    [setProducts],
  );

  const saveCategory = useCallback(
    (category: Omit<Category, "createdAt"> & { createdAt?: string }) => {
      setCategories((prev) => {
        const exists = prev.some((c) => c.id === category.id);
        const next = exists
          ? prev.map((c) => (c.id === category.id ? { ...c, ...category, createdAt: category.createdAt ?? c.createdAt } : c))
          : [...prev, { ...category, createdAt: category.createdAt ?? new Date().toISOString() }];
        saveCollection(KEYS.categories, next);
        return next;
      });
    },
    [setCategories],
  );

  const deleteCategory = useCallback(
    (categoryId: string) => {
      const inUse = products.some((p) => p.categoryId === categoryId);
      if (inUse) return { ok: false as const, error: "Move or delete the products in this category first" };
      setCategories((prev) => {
        const next = prev.filter((c) => c.id !== categoryId);
        saveCollection(KEYS.categories, next);
        return next;
      });
      return { ok: true as const };
    },
    [products, setCategories],
  );

  const saveCustomer = useCallback(
    (customer: Omit<Customer, "createdAt"> & { createdAt?: string }) => {
      setCustomers((prev) => {
        const exists = prev.some((c) => c.id === customer.id);
        const next = exists
          ? prev.map((c) => (c.id === customer.id ? { ...c, ...customer, createdAt: customer.createdAt ?? c.createdAt } : c))
          : [...prev, { ...customer, createdAt: customer.createdAt ?? new Date().toISOString() }];
        saveCollection(KEYS.customers, next);
        return next;
      });
    },
    [setCustomers],
  );

  const deleteCustomer = useCallback(
    (customerId: string) => {
      setCustomers((prev) => {
        const next = prev.filter((c) => c.id !== customerId);
        saveCollection(KEYS.customers, next);
        return next;
      });
    },
    [setCustomers],
  );

  const saveEmployee = useCallback(
    (employee: Omit<Employee, "joinedAt"> & { joinedAt?: string }) => {
      setEmployees((prev) => {
        const exists = prev.some((e) => e.id === employee.id);
        const next = exists
          ? prev.map((e) => (e.id === employee.id ? { ...e, ...employee, joinedAt: employee.joinedAt ?? e.joinedAt } : e))
          : [...prev, { ...employee, joinedAt: employee.joinedAt ?? new Date().toISOString().slice(0, 10) }];
        saveCollection(KEYS.employees, next);
        return next;
      });
    },
    [setEmployees],
  );

  const deleteEmployee = useCallback(
    (employeeId: string) => {
      setEmployees((prev) => {
        const next = prev.filter((e) => e.id !== employeeId);
        saveCollection(KEYS.employees, next);
        return next;
      });
    },
    [setEmployees],
  );

  const saveCoupon = useCallback(
    (
      coupon: Omit<Coupon, "createdAt" | "usedCount"> & { createdAt?: string; usedCount?: number },
    ) => {
      setCoupons((prev) => {
        const exists = prev.some((c) => c.id === coupon.id);
        const next = exists
          ? prev.map((c) => (c.id === coupon.id ? { ...c, ...coupon } : c))
          : [...prev, { ...coupon, usedCount: coupon.usedCount ?? 0, createdAt: coupon.createdAt ?? new Date().toISOString() }];
        saveCollection(KEYS.coupons, next);
        return next;
      });
    },
    [setCoupons],
  );

  const deleteCoupon = useCallback(
    (couponId: string) => {
      setCoupons((prev) => {
        const next = prev.filter((c) => c.id !== couponId);
        saveCollection(KEYS.coupons, next);
        return next;
      });
    },
    [setCoupons],
  );

  const submitEnquiry = useCallback(
    (enquiry: Omit<Enquiry, "id" | "status" | "reply" | "createdAt">) => {
      setEnquiries((prev) => {
        const next: Enquiry[] = [
          { ...enquiry, id: uid("enq"), status: "new", reply: "", createdAt: new Date().toISOString() },
          ...prev,
        ];
        saveCollection(KEYS.enquiries, next);
        return next;
      });
    },
    [setEnquiries],
  );

  const updateEnquiry = useCallback(
    (id: string, patch: Partial<Pick<Enquiry, "status" | "reply">>) => {
      setEnquiries((prev) => {
        const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
        saveCollection(KEYS.enquiries, next);
        return next;
      });
    },
    [setEnquiries],
  );

  const deleteEnquiry = useCallback(
    (id: string) => {
      setEnquiries((prev) => {
        const next = prev.filter((e) => e.id !== id);
        saveCollection(KEYS.enquiries, next);
        return next;
      });
    },
    [setEnquiries],
  );

  const adjustStock = useCallback(
    (productId: string, change: number, reason: string) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return { ok: false as const, error: "Product not found" };
      const newStock = product.stock + change;
      if (newStock < 0) return { ok: false as const, error: `Stock cannot go below 0 (current: ${product.stock})` };

      setProducts((prev) => {
        const next = prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p));
        saveCollection(KEYS.products, next);
        return next;
      });
      setLogs((prev) => {
        const next: DataSnapshot["logs"] = [
          {
            id: uid("log"),
            productId,
            productName: product.name,
            change,
            reason,
            orderId: null,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ];
        saveCollection(KEYS.logs, next);
        return next;
      });
      return { ok: true as const };
    },
    [products, setProducts, setLogs],
  );

  const saveSettings = useCallback(
    (next: Settings) => {
      setSettingsState(next);
      persistSettings(KEYS.settings, next);
    },
    [],
  );

  // ---------- Auth ----------
  const login = useCallback(
    (email: string, password: string) => {
      if (
        email.trim().toLowerCase() !== settings.adminEmail ||
        password !== settings.adminPassword
      ) {
        return { ok: false as const, error: "Invalid email or password" };
      }
      const next: AdminSession = { email: settings.adminEmail, loggedInAt: new Date().toISOString() };
      setSession(next);
      saveSingle(KEYS.session, next);
      return { ok: true as const };
    },
    [settings],
  );

  const logout = useCallback(() => {
    setSession(null);
    removeKey(KEYS.session);
  }, []);

  const resetDemoData = useCallback(() => {
    resetStorage();
    window.location.reload();
  }, []);

  const value: StoreContextValue = {
    categories,
    products,
    customers,
    orders,
    logs,
    enquiries,
    employees,
    coupons,
    settings,
    cart,
    cartLines,
    cartCount,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    placeOrder,
    updateOrderStatus,
    deleteOrder,
    saveProduct,
    deleteProduct,
    saveCategory,
    deleteCategory,
    saveCustomer,
    deleteCustomer,
    saveEmployee,
    deleteEmployee,
    saveCoupon,
    deleteCoupon,
    submitEnquiry,
    updateEnquiry,
    deleteEnquiry,
    adjustStock,
    saveSettings,
    isAdmin: session !== null,
    adminEmail: session?.email ?? null,
    login,
    logout,
    resetDemoData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

export { computeTotals };
export type { EnquiryStatus };
