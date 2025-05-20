import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(true);
  const handleWhatsAppClick = () => {
    // WhatsApp number and predefined message
    const phoneNumber = "59899999999"; // Replace with your actual number
    const message = "Hola! Estoy interesado en sus servicios.";

    // Create the WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };
  return <div className="fixed bottom-6 right-6 z-50">
      <button onClick={handleWhatsAppClick} className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all hover:scale-110" style={{
      animation: 'bounce 2s infinite',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
    }}>
        <MessageCircle className="h-8 w-8 z-9999" />
      </button>
    </div>;
};
export default WhatsAppButton;