
import { Phone, MessageCircle } from 'lucide-react';

const ContactInfo = () => {
  return (
    <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-20 flex flex-col gap-4">
      <a 
        href="tel:+59898614418" 
        className="flex items-center justify-center w-12 h-12 bg-[#008be1] hover:bg-[#0079c4] text-white rounded-full shadow-lg transition-all hover:scale-110"
      >
        <Phone className="w-5 h-5" />
      </a>
      <a 
        href="mailto:info@almango.com.uy" 
        className="flex items-center justify-center w-12 h-12 bg-primary hover:bg-primary/80 text-white rounded-full shadow-lg transition-all hover:scale-110"
      >
        <MessageCircle className="w-5 h-5" />
      </a>
    </div>
  );
};

export default ContactInfo;
