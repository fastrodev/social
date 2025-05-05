import BoltSvg from "@app/components/icons/bolt.tsx";

export default function Welcome() {
  return (
    <div className={`m-3 text-center space-y-3 `}>
      <div className="flex justify-center">
        <div className="text-white-400 border border-gray-600/50 bg-gray-900 rounded-full p-2 sm:p-3 animate-spin hover:animate-pulse transition-all duration-[5000ms]">
          <BoltSvg width="24" height="24" className="sm:h-14 sm:w-14" />
        </div>
      </div>
      <p className="text-base sm:text-xl opacity-80">
        Getting Ready
      </p>
    </div>
  );
}
