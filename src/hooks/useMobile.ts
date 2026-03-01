import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;
const isMobileWidth = () => window.innerWidth <= MOBILE_BREAKPOINT;

const useMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(isMobileWidth);

  useEffect(() => {
    const handleResize = () => setIsMobile(isMobileWidth());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

export default useMobile;
