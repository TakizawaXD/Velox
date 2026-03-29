import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
}

export function SEO({ title, description }: SEOProps) {
  useEffect(() => {
    // Prefix current page title with branding
    const fullTitle = `${title} | Velox Supreme`;
    document.title = fullTitle;

    // Optional: Update meta descriptions dynamically
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }

    return () => {
      // Restore default title if needed (optional)
      document.title = 'Velox | Logística Inteligente';
    };
  }, [title, description]);

  return null; // This component doesn't render anything visual
}
