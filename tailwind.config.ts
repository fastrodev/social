import ts from "tailwind-scrollbar";
import tsh from "tailwind-scrollbar-hide";

export default {
  content: [
    "./modules/**/*.tsx",
    "./components/**/*.tsx",
  ],
  darkMode: "class",
  plugins: [
    ts,
    tsh,
  ],
  variants: {
    scrollbar: ["rounded", "dark"],
  },
};
