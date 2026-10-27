export type ProductSummary = {
  id: number;
  name: string;
  price: number;
  sizeMl: number;
  gender: string;
  imageUrl: string;
  brand: string;
  avgRating: number;
};

export type ProductList = {
  total: number;
  page: number;
  pageSize: number;
  items: ProductSummary[];
};

export type Brand = { id: number; name: string };

export type ProductDetail = {
  id: number;
  name: string;
  description: string;
  price: number;
  sizeMl: number;
  gender: string;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  imageUrl: string;
  stock: number;
  isFeatured: boolean;
  brandId: number;
  brand: { id: number; name: string } | null;
};

export type Review = { id: number; rating: number; comment: string; createdAt: string; reviewer: string };
export type ReviewResult = { average: number; count: number; reviews: Review[] };

export type User = { id: number; fullName: string; email: string; role: string };

export type CartItem = {
  id: number;
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  lineTotal: number;
};
export type Cart = { items: CartItem[]; total: number };

export type OrderItem = { productId: number; name: string; quantity: number; unitPrice: number };
export type Order = {
  id: number;
  orderDate: string;
  total: number;
  status: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentRef: string | null;
  items: OrderItem[];
};
export type AdminOrder = { order: Order; customer: string };

export type Stats = { orders: number; revenue: number; products: number; customers: number; lowStock: number };

export const ORDER_STAGES: string[] = ["Placed", "Packed", "Shipped", "Delivered"];
export const ORDER_STATUSES: string[] = [...ORDER_STAGES, "Cancelled"];

export type PaymentSession = {
  mode: "razorpay" | "demo";
  orderId: number;
  amount: number; // paise mein (Rs 1 = 100 paise)
  currency: string;
  keyId?: string;
  gatewayOrderId?: string;
};
