// import { useState, useEffect } from 'react';

// export function useTheme() {
//   const [isDark, setIsDark] = useState(() =>
//     document.documentElement.classList.contains('dark')
//   );

//   useEffect(() => {
//     document.documentElement.classList.toggle('dark', isDark);
//   }, [isDark]);

//   return { isDark, toggle: () => setIsDark(prev => !prev) };
// }
import { useState, useEffect } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    const sidebar= document.getElementById('SB')
    if (isDark) {
      root.classList.add("dark");
      // sidebar.classList.add("dark");
      // sidebar.classList.remove("bg-sidebar");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      sidebar.classList.remove("dark");
      // sidebar.classList.add("bg-sidebar");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);
  return { isDark, toggle };
}
