
import React from "react";
import { CalendarClock, UserCheck, CreditCard, Star } from "lucide-react";

const HowToHireSection: React.FC = () => {
  return (
    <div className="py-10 px-4 bg-[#F8F4F0] rounded-lg mb-12">
      <h2 className="text-3xl font-bold mb-4 text-center uppercase text-[#f06900]">¿CÓMO CONTRATAR?</h2>
      <h3 className="text-xl font-medium mb-10 text-center text-[#498bdd]">PROCESO DE CONTRATACIÓN</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
        <div className="text-center flex flex-col items-center opacity-100">
          <div className="mb-4 transition-all duration-300 transform hover:scale-110">
            <div className="bg-[#F8F4F0] p-4 rounded-full shadow-md">
              <CalendarClock size={48} className="text-[#f06900]" />
            </div>
          </div>
          <h4 className="text-lg font-semibold mb-2 text-[#498bdd]">Agendá fecha y hora</h4>
          <p className="text-gray-700">Coordinación inmediata.</p>
        </div>
        
        <div className="text-center flex flex-col items-center opacity-100">
          <div className="mb-4 transition-all duration-300 transform hover:scale-110">
            <div className="bg-[#F8F4F0] p-4 rounded-full shadow-md">
              <UserCheck size={48} className="text-[#f06900]" />
            </div>
          </div>
          <h4 className="text-lg font-semibold mb-2 text-[#498bdd]">Recibí al técnico</h4>
          <p className="text-gray-700">Un profesional calificado realizará el trabajo.</p>
        </div>
        
        <div className="text-center flex flex-col items-center opacity-100">
          <div className="mb-4 transition-all duration-300 transform hover:scale-110">
            <div className="bg-[#F8F4F0] p-4 rounded-full shadow-md">
              <CreditCard size={48} className="text-[#f06900]" />
            </div>
          </div>
          <h4 className="text-lg font-semibold mb-2 text-[#498bdd]">Realizá el pago al finalizar</h4>
          <p className="text-gray-700">Elegí cómo querés pagar. Online hasta 12 cuotas, o directo al Profesional al finalizar.</p>
        </div>
        
        <div className="text-center flex flex-col items-center opacity-100">
          <div className="mb-4 transition-all duration-300 transform hover:scale-110">
            <div className="bg-[#F8F4F0] p-4 rounded-full shadow-md">
              <Star size={48} className="text-[#f06900]" />
            </div>
          </div>
          <h4 className="text-lg font-semibold mb-2 text-[#498bdd]">Ayudanos a mejorar</h4>
          <p className="text-gray-700">Calificá el servicio, tus comentarios importan.</p>
        </div>
      </div>
    </div>
  );
};

export default HowToHireSection;
