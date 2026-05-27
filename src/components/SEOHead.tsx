"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead = ({
  title = "Vikkmore - Free YouTube Music Player & Playlist Manager",
  description = "Vikkmore is the best free YouTube music player with playlist management. Stream millions of songs, create custom playlists, and enjoy ad-free music experience. No downloads required.",
  keywords = "vikkmore, youtube music player, free music streaming, playlist manager, online music player, youtube audio, music streaming service, create playlists, music library",
  image = "https://vikkmore.vercel.app/icon-512.png",
  url = "https://vikkmore.vercel.app",
  type = "website"
}: SEOHeadProps) => {
  const pathname = usePathname();

  useEffect(() => {
    // Update title
    document.title = title;
    
    // Update meta description
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', description);
    }
    
    // Update keywords
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) {
      keywordsMeta.setAttribute('content', keywords);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogType = document.querySelector('meta[property="og:type"]');
    
    if (ogTitle) ogTitle.setAttribute('content', title);
    if (ogDescription) ogDescription.setAttribute('content', description);
    if (ogImage) ogImage.setAttribute('content', image);
    if (ogUrl) ogUrl.setAttribute('content', `${url}${pathname}`);
    if (ogType) ogType.setAttribute('content', type);
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    const twitterImage = document.querySelector('meta[property="twitter:image"]');
    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    
    if (twitterTitle) twitterTitle.setAttribute('content', title);
    if (twitterDescription) twitterDescription.setAttribute('content', description);
    if (twitterImage) twitterImage.setAttribute('content', image);
    if (twitterUrl) twitterUrl.setAttribute('content', `${url}${pathname}`);
    
    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${url}${pathname}`);
    }
    
  }, [title, description, keywords, image, url, type, pathname]);

  return null;
};

export default SEOHead;