import "./Advertisement.css"

import { useEffect, useRef } from "react";


function Advertisement() {

  const advertisementRef =
    useRef<HTMLDivElement | null>(null);
 
  /* ======================================
     Auto Scroll
  ====================================== */

  useEffect(() => {

  const container =
    advertisementRef.current;

  if (!container) return;

  const interval = setInterval(() => {

    container.scrollTop += 1;

    const isBottom =

      container.scrollTop >=
      (
        container.scrollHeight -
        container.clientHeight - 1
      );

    if (isBottom) {

      container.scrollTop = 0;
    }

  }, 30);

  return () => clearInterval(interval);

  }, []);


    return(
      
            <div
              className="right-menu"
              ref={advertisementRef}
            >

              <img
                src="/images/settingimages/advertisement1.png"
                alt="ad"
              />

              <img
                src="/images/settingimages/advertisement2.png"
                alt="ad"
              />

              <img
                src="/images/settingimages/advertisement1.png"
                alt="ad"
              />

              <img
                src="/images/settingimages/advertisement2.png"
                alt="ad"
              />

            </div>
    );
}

export default Advertisement;