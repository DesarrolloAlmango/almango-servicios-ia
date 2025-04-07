
import { Facebook, Instagram, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contacto" className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-bold mb-3">ALMANGO</h3>
            <p className="text-gray-300 text-sm mb-3">
              Profesionales a tu servicio. Soluciones para tu hogar o empresa en un solo lugar.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/almango.com.uy" 
                target="_blank" 
                rel="noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://www.instagram.com/almangoservicios/" 
                target="_blank" 
                rel="noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-3">Contacto</h3>
            <div className="space-y-1">
              <p className="flex items-center text-gray-300 text-sm">
                <MapPin size={16} className="mr-2" />
                Montevideo, Uruguay
              </p>
              <p className="flex items-center text-gray-300 text-sm">
                <Mail size={16} className="mr-2" />
                info@almango.com.uy
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-3">Enlaces</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a 
                  href="#inicio" 
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Inicio
                </a>
              </li>
              <li>
                <a 
                  href="#servicios" 
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Servicios
                </a>
              </li>
              <li>
                <a 
                  href="#quienes-somos" 
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  ¿Quiénes somos?
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-6 pt-4 text-center text-gray-400 text-xs">
          <p>&copy; {new Date().getFullYear()} ALMANGO. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
