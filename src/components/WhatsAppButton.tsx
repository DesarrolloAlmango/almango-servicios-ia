
import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Show button after a short delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleWhatsAppClick = () => {
    // Uruguay WhatsApp number with international format
    const phoneNumber = "+59899123456";
    const message = "¡Hola! Me gustaría consultar sobre sus servicios.";
    
    // Create WhatsApp URL with phone and encoded message
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <button 
      onClick={handleWhatsAppClick}
      className={`fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 rounded-full p-4 shadow-lg transition-all duration-300 z-50 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="text-white" size={28} />
    </button>
  );
};

export default WhatsAppButton;
