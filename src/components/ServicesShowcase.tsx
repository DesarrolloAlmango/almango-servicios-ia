
import React from 'react';
import { Card } from "@/components/ui/card";

interface ServiceItem {
  title: string;
  imageUrl: string;
}

const ServiceItems: ServiceItem[] = [
  { title: "INSTALACIONES ELÉCTRICAS", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-01.png" },
  { title: "ARMADO DE MUEBLES", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-04.png" },
  { title: "INSTALACIONES SANITARIAS", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-02.png" },
  { title: "SERVICIO DE A/A", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-05.png" },
  { title: "MUDANZAS", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-03.png" },
  { title: "INSTALACIÓN DE ELECTRO DOMÉSTICOS", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-06.png" },
  { title: "JARDINERÍA", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-07.png" },
  { title: "ALBAÑILERÍA", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-11.png" },
  { title: "REVESTIMIENTO", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-08.png" },
  { title: "PINTURA", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-12.png" },
  { title: "SISTEMAS DE SEGURIDAD", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-09.png" },
  { title: "CERRAJERÍA", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-09.png" },
  { title: "DECO HOGAR", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-10.png" },
  { title: "HERRERÍA", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-14.png" },
  { title: "LIMPIEZA", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-15.png" },
  { title: "FUMIGACIÓN", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-16.png" },
  { title: "SERVICIO TÉCNICO", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-17.png" },
  { title: "STEEL FRAMING", imageUrl: "https://almango.com.uy/img/iconos/icon-steelframing.png" },
  { title: "MONTAJES PARA DEPÓSITOS", imageUrl: "https://almango.com.uy/img/iconos/icon-depositos.png" },
  { title: "CALEFACCIÓN", imageUrl: "https://almango.com.uy/img/iconos/icono-almango-18.png" }
];

const ServicesShowcase: React.FC = () => {
  return (
    <section className="py-16 bg-[#F0F0F0]">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center text-secondary uppercase">Nuestros Servicios</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {ServiceItems.map((service, index) => (
            <div key={index} className="flex flex-col items-center">
              <Card className="w-full aspect-square flex flex-col items-center justify-center p-4 hover:shadow-md transition-shadow duration-300 service-card-hover">
                <img 
                  src={service.imageUrl} 
                  alt={service.title} 
                  className="h-16 w-16 mb-4 transition-transform duration-300"
                />
                <h3 className="text-xs sm:text-sm text-center font-medium text-gray-800">{service.title}</h3>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesShowcase;
