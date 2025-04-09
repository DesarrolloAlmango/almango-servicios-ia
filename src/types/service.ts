
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
