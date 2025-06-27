import { useEffect } from "react";

export default function SEOHead() {
  useEffect(() => {
    // Update title dynamically if needed
    document.title = "ScreenEdit Pro - Free Online Screenshot Editor | Edit Images Instantly";
    
    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "ScreenEdit Pro",
      "description": "Free online screenshot and image editor",
      "url": window.location.origin,
      "applicationCategory": "PhotoEditingApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
