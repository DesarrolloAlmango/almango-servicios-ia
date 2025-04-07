
import { Phone, MessageCircle } from 'lucide-react';

const ContactInfo = () => {
  return (
    <div className="absolute bottom-4 left-4 z-30 md:bottom-8 md:left-8">
      <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-lg p-2 space-y-2">
        <a 
          href="tel:08008248" 
          className="flex items-center text-gray-700 hover:text-primary transition-colors"
        >
          <Phone size={18} className="mr-2" />
          <span className="text-sm font-medium">0800 8248</span>
        </a>
        <a 
          href="https://api.whatsapp.com/send?phone=+59892612655&text=Hola%2C+Me+interesa+contratar+un+servicio."
          target="_blank"
          rel="noreferrer"
          className="flex items-center text-gray-700 hover:text-primary transition-colors"
        >
          <MessageCircle size={18} className="mr-2" />
          <span className="text-sm font-medium">092 612 655</span>
        </a>
      </div>
    </div>
  );
};

export default ContactInfo;
