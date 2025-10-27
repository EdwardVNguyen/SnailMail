import { useState, useEffect } from "react";
import { SnailLoader } from "./SnailLoader";

export function CssLoaderWrapper({ children }) {
  const [cssLoaded, setCssLoaded] = useState(false);

  useEffect(() => {
    // Query all CSS <link> tags in <head>
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    let loadedCount = 0;

    const onLoad = () => {
      loadedCount++;
      if (loadedCount === links.length) {
        setCssLoaded(true);
      }
    };

    links.forEach(link => {
      if (link.sheet) {
        loadedCount++;
      } else {
        link.addEventListener('load', onLoad);
      }
    });

    // fallback: if all sheets already loaded
    if (loadedCount === links.length) setCssLoaded(true);

  }, []);

  if (!cssLoaded) {
    return (
      <div >
        <SnailLoader />
      </div>
    );
  }

  return <>{children}</>;
}
