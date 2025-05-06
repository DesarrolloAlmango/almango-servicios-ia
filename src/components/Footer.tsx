
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contacto" className="bg-secondary text-white py-10 font-serif">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side - contact info */}
          <div className="space-y-6 transform transition-all duration-500 hover:translate-y-[-5px]">
            <div>
              <h2 className="text-3xl font-bold uppercase mb-4">Contáctanos</h2>
              <p className="text-white/90 mb-6">
                Si tienes alguna consulta puedes comunicarte a través de:
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone size={24} className="text-white" />
                <span className="text-xl font-medium">0800 8248</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone size={24} className="text-white" />
                <span className="text-xl font-medium">092 612 655</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-white" />
                <span>Montevideo, Uruguay</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail size={20} className="text-white" />
                <span>info@almango.com.uy</span>
              </div>
            </div>
            
            <div className="pt-2">
              <p className="font-semibold">AMG GROUP SAS</p>
            </div>
          </div>
          
          {/* Right side - partners and affiliations with their logos */}
          <div className="space-y-6 transform transition-all duration-500 hover:translate-y-[-5px]">
            <div className="mb-4">
              <p className="text-sm text-white/80">Apoyan:</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="bg-white/90 px-3 py-1 rounded flex items-center h-12">
                  <img 
                    src="https://almango.com.uy/img/logo-ande.svg" 
                    alt="ANDE" 
                    className="h-8 object-contain"
                  />
                </div>
                <div className="bg-white/90 px-3 py-1 rounded flex items-center h-12">
                  <img 
                    src="https://almango.com.uy/img/logo-anii.png" 
                    alt="ANII" 
                    className="h-8 object-contain"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-white/80">Partner:</p>
              <div className="flex items-center mt-2">
                <div className="bg-white/90 px-3 py-1 rounded flex items-center h-12">
                  <img 
                    src="https://almango.com.uy/img/logo-taleslab.png" 
                    alt="ThalesLAB" 
                    className="h-8 object-contain"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-white/80">Empresa afiliada a:</p>
              <div className="flex items-center mt-2">
                <div className="bg-white/90 px-3 py-1 rounded flex items-center h-12">
                  <img 
                    src="https://almango.com.uy/img/logo-equifax.png" 
                    alt="Equifax + Clearing" 
                    className="h-8 object-contain"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-white/80">Servicios seguros:</p>
              <div className="flex items-center mt-2">
                <div className="bg-white/90 px-3 py-1 rounded flex items-center h-12">
                  <img 
                    src="https://almango.com.uy/img/logo-sura.png" 
                    alt="SURA" 
                    className="h-8 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-4 text-center text-white/70 text-xs">
          <p>© ALMANGO {new Date().getFullYear()} - Diseño por WesolveIT</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
