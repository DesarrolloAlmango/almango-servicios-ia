
import React from 'react';
import { Card } from "@/components/ui/card";

interface ServiceItem {
  title: string;
  imageUrl: string;
}

interface SealItem {
  imageUrl: string;
  alt: string;
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

const SealItems: SealItem[] = [
  { imageUrl: "https://almango.com.uy/img/caracteristicas/01-atencion-personalizada.svg", alt: "Atención personalizada" },
  { imageUrl: "https://almango.com.uy/img/caracteristicas/02-servicios-seguros.svg", alt: "Servicios seguros" },
  { imageUrl: "https://almango.com.uy/img/caracteristicas/03-profesionales-calificados.svg", alt: "Profesionales calificados" },
  { imageUrl: "https://almango.com.uy/img/caracteristicas/04-pago-online.svg", alt: "Pago online" },
  { imageUrl: "https://almango.com.uy/img/caracteristicas/05-garantia-de-instalacion.svg", alt: "Garantía de instalación" },
  { imageUrl: "https://almango.com.uy/img/caracteristicas/06-proveedores-verificados.svg", alt: "Proveedores verificados" }
];

const ServicesShowcase: React.FC = () => {
  return (
    <section className="py-16 bg-[#F0F0F0]">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center text-secondary uppercase">Nuestros Servicios</h2>
        
        <div className="max-w-3xl mx-auto mt-8 mb-12">
          <h3 className="text-xl font-semibold mb-4 text-primary">Hogares</h3>
          <p className="text-lg text-gray-600 mb-8">
            Descubrí una amplia red de profesionales listos para ayudarte. En Almango, podés contratar servicios de reparación, instalación, reformas y una variedad de oficios para tu hogar. Disfrutá de precios estandarizados, garantía de instalación de 12 meses, profesionales calificados y más beneficios.
          </p>
          
          <h3 className="text-xl font-semibold mb-4 text-primary">Empresas</h3>
          <p className="text-lg text-gray-600 mb-8">
            A través de Almango podés acceder a servicios de logística, montaje, instalaciones, mantenimiento y mucho más, todo adaptado a las necesidades de tu empresa. Simplificá la gestión de proyectos y garantizá la eficiencia operativa.
          </p>
        </div>
        
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
        
        {/* Services Counter Section - Updated with blue color */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="text-secondary text-2xl md:text-3xl font-bold uppercase">
            SERVICIOS REALIZADOS
          </div>
          
          <div className="flex">
            {[0, 9, 8, 8, 0, 0].map((digit, index) => (
              <div 
                key={index} 
                className="bg-[#1A1F2C] text-white w-10 h-14 md:w-12 md:h-16 flex items-center justify-center text-xl md:text-2xl font-bold mx-0.5"
              >
                {digit}
              </div>
            ))}
          </div>
          
          <div className="text-secondary text-2xl md:text-3xl font-bold uppercase">
            Y CONTANDO...
          </div>
        </div>
        
        {/* Seals Section - Updated with larger size */}
        <div className="mt-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6">
            {SealItems.map((seal, index) => (
              <div key={index} className="flex flex-col items-center">
                <img 
                  src={seal.imageUrl} 
                  alt={seal.alt}
                  className="h-28 w-28 mb-2 transition-transform hover:scale-110 duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesShowcase;
