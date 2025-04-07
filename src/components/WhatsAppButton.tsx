
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  return (
    <a
      href="https://api.whatsapp.com/send?phone=+59892612655&text=Hola%2C+Me+interesa+contratar+un+servicio."
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 right-4 z-40 md:bottom-8 md:right-8 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors"
      aria-label="WhatsApp"
    >
      <MessageCircle size={28} className="animate-bounce" />
    </a>
  );
};

export default WhatsAppButton;
