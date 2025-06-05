import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';
const Footer = () => {
  return <footer id="contacto" className="bg-secondary text-white py-10 font-serif">
      <div className="container mx-auto my-[11px] px-4 md:px-[71px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-[15px] px-0">
          {/* Left side - contact info */}
          <div className="space-y-6 transform transition-all duration-500 hover:translate-y-[-5px] my-[45px] mx-[64px]">
            <div className="mx-0">
              <h2 className="text-3xl font-bold uppercase mb-4">CONTACTANOS</h2>
              <p className="text-white/90 mb-2 px-0">¿TENÉS CONSULTAS? COMUNICATE CON NOSOTROS.</p>
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

            <div className="flex items-center space-x-4 pt-2">
              <a href="https://www.facebook.com/almango.com.uy" target="_blank" rel="noreferrer" className="text-white hover:text-gray-300 transition-colors" aria-label="Facebook">
                <Facebook size={24} />
              </a>
              <a href="https://www.instagram.com/almangoservicios/" target="_blank" rel="noreferrer" className="text-white hover:text-gray-300 transition-colors" aria-label="Instagram">
                <Instagram size={24} />
              </a>
            </div>
            
            <div className="pt-1">
              <p className="font-semibold">AMG GROUP SAS</p>
            </div>
          </div>
          
          {/* Right side - partners and affiliations with their logos */}
          <div className="space-y-6 transform transition-all duration-500 hover:translate-y-[-5px] mx-0 sm:mx-[57px] px-[42px]">
            <div className="mb-4">
              <p className="text-sm text-white/80">Apoyan:</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="px-0 py-1 rounded flex items-center h-12">
                  <img src="https://almango.com.uy/img/logo-ande.svg" alt="ANDE" className="h-8 object-contain" />
                </div>
                <div className="px-0 py-1 rounded flex items-center h-12">
                  <img src="https://almango.com.uy/img/logo-anii.png" alt="ANII" className="h-8 object-contain" />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-white/80">Partner:</p>
              <div className="flex items-center mt-2">
                <div className="px-0 py-1 rounded flex items-center h-12">
                  <img src="https://almango.com.uy/img/logo-taleslab.png" alt="ThalesLAB" className="h-8 object-contain" />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-white/80">Empresa afiliada a:</p>
              <div className="flex items-center mt-2">
                <div className="px-0 py-1 rounded flex items-center h-12">
                  <img src="https://almango.com.uy/img/logo-equifax.png" alt="Equifax + Clearing" className="h-8 object-contain" />
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-white/80">Servicios seguros:</p>
              <div className="flex items-center mt-2">
                <div className="px-0 py-1 rounded flex items-center h-12">
                  <img src="https://almango.com.uy/img/logo-sura.png" alt="SURA" className="h-8 object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-4 text-center text-white/70 text-xs">
          <p>© ALMANGO {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>;
};
export default Footer;