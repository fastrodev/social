import { User } from "./TagSelector.tsx";

type UserCardProps = {
  user: User;
};

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="w-full p-4 bg-gray-800/90 rounded-lg shadow-lg 
      border border-purple-500/20 backdrop-blur-sm
      transition-all duration-300">
      <div className="flex flex-col items-center">
        <div className="w-full flex justify-center bg-purple-900/40 rounded-t-lg py-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full border-2 border-purple-500/20"
          />
        </div>
        <div className="w-full flex justify-center bg-gray-900/60 rounded-b-lg py-3">
          <span className="text-sm font-medium text-gray-200">
            {user.name}
          </span>
        </div>
      </div>
    </div>
  );
}
