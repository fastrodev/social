import ts from "tailwind-scrollbar";

export default {
  content: [
    "./modules/**/*.tsx",
    "./components/**/*.tsx",
  ],
  darkMode: "class",
  plugins: [
    ts,
  ],
};
