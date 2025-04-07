
import { Facebook, Instagram, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contacto" className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ALMANGO</h3>
            <p className="text-gray-300 mb-4">
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
                <Facebook size={20} />
              </a>
              <a 
                href="https://www.instagram.com/almangoservicios/" 
                target="_blank" 
                rel="noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <div className="space-y-2">
              <p className="flex items-center text-gray-300">
                <MapPin size={18} className="mr-2" />
                Montevideo, Uruguay
              </p>
              <p className="flex items-center text-gray-300">
                <Mail size={18} className="mr-2" />
                info@almango.com.uy
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces</h3>
            <ul className="space-y-2">
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
        
        <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ALMANGO. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
