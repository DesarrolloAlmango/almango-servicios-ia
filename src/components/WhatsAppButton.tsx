
import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/' || location.pathname === '/index.html';
  
  // If not on homepage, don't render the button
  if (!isHomePage) {
    return null;
  }

  const handleWhatsAppClick = () => {
    // Updated WhatsApp URL as requested
    const whatsappUrl = "https://api.whatsapp.com/send?phone=+59892612655&text=Hola%2C+Me+interesa+contratar+un+servicio.";
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[110]">
      <button 
        onClick={handleWhatsAppClick} 
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all hover:scale-110" 
        style={{
          animation: 'bounce 2s infinite',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
        }}
      >
        <MessageCircle className="h-8 w-8 z-9999" />
      </button>
    </div>
  );
};

export default WhatsAppButton;
