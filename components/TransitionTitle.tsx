import { useEffect, useState } from "preact/hooks";

type TransitionTitleProps = {
  text: string;
  className?: string;
};

export function TransitionTitle(
  { text, className = "" }: TransitionTitleProps,
) {
  const [currentText, setCurrentText] = useState(text);
  const [nextText, setNextText] = useState(text);
  const [transitioning, setTransitioning] = useState<
    "none" | "fadeOut" | "fadeIn"
  >("none");

  useEffect(() => {
    if (text !== currentText) {
      // Start fade out
      setTransitioning("fadeOut");
      setNextText(text);

      // After fade out, switch texts and fade in
      const fadeOutTimeout = setTimeout(() => {
        setCurrentText(text);
        setTransitioning("fadeIn");

        // Reset state after fade in
        const fadeInTimeout = setTimeout(() => {
          setTransitioning("none");
        }, 300);

        return () => clearTimeout(fadeInTimeout);
      }, 300);

      return () => clearTimeout(fadeOutTimeout);
    }
  }, [text]);

  return (
    <div className="relative">
      <span
        className={`block transition-opacity duration-300 absolute inset-0
          ${transitioning === "fadeOut" ? "opacity-0" : "opacity-100"}
          ${className}`}
      >
        {currentText}
      </span>
      <span
        className={`block transition-opacity duration-300 absolute inset-0
          ${transitioning === "fadeIn" ? "opacity-100" : "opacity-0"}
          ${className}`}
        aria-hidden={transitioning !== "fadeIn"}
      >
        {nextText}
      </span>
      {/* Invisible span to maintain correct height */}
      <span className="invisible">{currentText}</span>
    </div>
  );
}
