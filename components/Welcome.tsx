import BoltSvg from "@app/components/icons/bolt.tsx";

export default function Welcome() {
  return (
    <div className={`m-3 text-center space-y-3 `}>
      <div className="flex justify-center">
        <div className="text-white-400 border border-gray-600/50 bg-gray-900 rounded-full p-3 animate-spin hover:animate-pulse transition-all  duration-[5000ms]">
          <BoltSvg width="64" height="64" />
        </div>
      </div>
      <h2
        className="text-3xl sm:text-4xl font-bold"
        style={{
          backgroundImage: "linear-gradient(to right, #c084fc, #ec4899)",
          backgroundClip: "text",
          color: "transparent",
          textShadow: "0 0 15px rgba(192, 132, 252, 0.5)",
        }}
      >
        Fastro Social
      </h2>
      <p className="text-base sm:text-xl opacity-80">
        Join the conversation
      </p>
    </div>
  );
}
