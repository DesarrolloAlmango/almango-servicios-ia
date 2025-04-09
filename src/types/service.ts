
import { LucideIcon } from "lucide-react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  serviceCategory: string;
}

export interface TarjetaServicio {
  id?: string;
  name: string;
  icon: string;
  url?: string;
}

export interface ServiceIconsMap {
  [key: string]: LucideIcon;
}

export interface Category {
  id: string;
  name: string;
  monedaid: string;
  precio: number;
  image: string;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}
