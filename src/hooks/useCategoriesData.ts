
import { useState, useEffect } from "react";
import { Category, Product } from "@/types/service";
import { toast } from "sonner";

// Fallback data in case API fails
const fallbackCategories = [
  {
    id: "cat1",
    name: "Instalaciones",
    monedaid: "ARS",
    precio: 100,
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=200&h=200",
    products: [
      { id: "p1", name: "Instalación de Tomacorriente", price: 25, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200", category: "Instalaciones" },
      { id: "p2", name: "Cambio de Lámpara", price: 15, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200", category: "Instalaciones" },
    ]
  },
  {
    id: "cat2",
    name: "Reparaciones",
    monedaid: "ARS",
    precio: 80,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200",
    products: [
      { id: "p3", name: "Reparación de Interruptor", price: 20, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200", category: "Reparaciones" },
      { id: "p4", name: "Reparación de Enchufe", price: 18, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200", category: "Reparaciones" },
    ]
  },
  {
    id: "cat3",
    name: "Mantenimiento",
    monedaid: "ARS",
    precio: 150,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200",
    products: [
      { id: "p5", name: "Mantenimiento de Tablero", price: 50, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200", category: "Mantenimiento" },
      { id: "p6", name: "Revisión de Circuitos", price: 35, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200", category: "Mantenimiento" },
    ]
  }
];

interface ApiCategory {
  id: string;
  name: string;
  monedaid: string;
  precio: number;
  image: string;
}

export function useCategoriesData(serviceId: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);

  useEffect(() => {
    if (!serviceId) {
      console.log("No service ID provided, using fallback data");
      setCategories(fallbackCategories);
      setIsLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        console.log(`Fetching categories for service ID: ${serviceId}`);
        const response = await fetch(`/api/ObtenerNivel1?Nivel0=${serviceId}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API Response:", data);
        setResponseData(data);
        
        // Map API data to our Category interface
        const mappedCategories = data.map((item: ApiCategory) => ({
          id: item.id,
          name: item.name,
          monedaid: item.monedaid,
          precio: item.precio,
          image: item.image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200",
          // Add some default products for testing
          products: [
            { 
              id: `p-${item.id}-1`, 
              name: `Producto 1 - ${item.name}`, 
              price: item.precio, 
              image: item.image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200", 
              category: item.name 
            },
            { 
              id: `p-${item.id}-2`, 
              name: `Producto 2 - ${item.name}`, 
              price: item.precio * 0.8, 
              image: item.image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200", 
              category: item.name 
            },
          ]
        }));
        
        setCategories(mappedCategories);
        setIsError(false);
        
        toast.success("Categorías cargadas correctamente", {
          duration: 3000
        });
      } catch (error) {
        console.error("Error fetching categories:", error);
        setResponseData({ error: String(error) });
        setCategories(fallbackCategories);
        setIsError(true);
        
        toast.error("Error al cargar categorías, usando datos predeterminados", {
          duration: 4000
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [serviceId]);

  return {
    categories,
    isLoading,
    isError,
    responseData
  };
}
