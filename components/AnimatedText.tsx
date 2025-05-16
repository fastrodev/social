import { useEffect, useState } from "preact/hooks";

type AnimatedTextProps = {
  text: string;
  className?: string;
};

export function AnimatedText({ text, className = "" }: AnimatedTextProps) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    setDisplayText("");

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={className}>
      {displayText}
    </span>
  );
}
