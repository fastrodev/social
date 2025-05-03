export default function Welcome() {
  return (
    <div className={`m-3 text-center space-y-3 `}>
      <h2
        className="text-3xl sm:text-4xl font-bold"
        style={{
          backgroundImage: "linear-gradient(to right, #c084fc, #ec4899)",
          backgroundClip: "text",
          color: "transparent",
          textShadow: "0 0 15px rgba(192, 132, 252, 0.5)",
          animation: "pulse 1.5s infinite ease-in-out",
        }}
      >
        Welcome to Fastro Social
      </h2>
      <p className="text-base sm:text-xl opacity-80">
        Join the conversation! Share your thoughts with the world.
      </p>
    </div>
  );
}
