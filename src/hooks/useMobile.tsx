import { useEffect, useState } from "react";

const mobileCondition = () => window.innerWidth <= 768;

const useMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(mobileCondition);

  function handleWindowSizeChange() {
    if (mobileCondition()) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  return isMobile;
};

export default useMobile;
