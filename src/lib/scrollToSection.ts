import { NavigateFunction } from "react-router-dom";

export const scrollToSection = (
  section: "tools" | "features" | "security",
  navigate: NavigateFunction
) => {
  const element = document.getElementById(section);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    // Fallback: navigate to home with hash
    navigate("/");
    setTimeout(() => {
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }
};
