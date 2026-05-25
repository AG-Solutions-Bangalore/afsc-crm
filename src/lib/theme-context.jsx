import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "black",
  setTheme: () => {},
});

const VALID_THEMES = [
  "default",
  "purple",
  "yellow",
  "green",
  "teal",
  "gray",
  "black",
];

export const ThemeProvider = ({ children }) => {
  // Get saved theme from localStorage
  const stored = localStorage.getItem("theme");

  // Default theme = black
  const initial = VALID_THEMES.includes(stored) ? stored : "black";

  const [theme, setTheme] = useState(initial);

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes first
    root.classList.remove(
      "theme-yellow",
      "theme-green",
      "theme-purple",
      "theme-teal",
      "theme-gray",
      "theme-black",
    );

    // Add active theme class
    if (theme === "yellow") {
      root.classList.add("theme-yellow");
    } else if (theme === "green") {
      root.classList.add("theme-green");
    } else if (theme === "purple") {
      root.classList.add("theme-purple");
    } else if (theme === "teal") {
      root.classList.add("theme-teal");
    } else if (theme === "gray") {
      root.classList.add("theme-gray");
    } else if (theme === "black") {
      root.classList.add("theme-black");
    }

    // Save selected theme
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme: theme || "black",
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context || !context.theme) {
    return {
      theme: "black",
      setTheme: () => {},
    };
  }

  return context;
};
