import { RefObject, useEffect } from "react";

const useCheckWrapped = (
  containerRef: RefObject<HTMLDivElement>,
  setIsWrapped: (isWrapped: boolean) => void,
  adjust1stValue: number = 0
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkWrap = () => {
      const firstChild = container.children[0] as HTMLElement; // Icon
      const secondChild = container.children[1] as HTMLElement; // File name

      if (!firstChild || !secondChild) return;
      // const isWrappedNow =
      //   secondChild.offsetTop > firstChild.offsetTop + adjust1stValue;
      const isWrappedNow =
        secondChild.getBoundingClientRect().left <
        firstChild.getBoundingClientRect().left + adjust1stValue;
      setIsWrapped(isWrappedNow);
    };

    const observer = new ResizeObserver(checkWrap);
    observer.observe(container);

    window.addEventListener("resize", checkWrap);
    checkWrap(); // Initial check

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkWrap);
    };
  }, [containerRef, setIsWrapped, adjust1stValue]);
};

export default useCheckWrapped;
