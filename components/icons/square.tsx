export function SquareIcon() {
  return (
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="squares"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
          patternTransform="scale(0.3)"
        >
          <path
            d="M0 0L30 0L30 30L0 30L0 0"
            fill="none"
            stroke="#777"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#squares)" />
    </svg>
  );
}
