type AdvertisementProps = {
  contactEmail?: string;
};
export function Advertisement(
  { contactEmail = "hello@fastro.dev" }: AdvertisementProps,
) {
  return (
    <div className="lg:w-80 flex-shrink-0">
      <div className="sticky top-6">
        <div className="w-full p-4 mb-4 bg-gray-800/90 rounded-lg shadow-lg 
          border border-purple-500/20 backdrop-blur-sm
          transition-all duration-300 relative
          hover:shadow-purple-500/10 hover:border-purple-500/30 hover:shadow-2xl
          before:absolute before:inset-0 before:rounded-lg before:-z-10">
          <div className="flex flex-col items-center space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Advertisement
            </p>
            <div className="w-full h-[250px] bg-gray-900/50 rounded flex items-center justify-center
              border border-gray-700/50 shadow-inner">
              <p className="text-gray-400 text-sm">
                Your Ad Could Be Here
              </p>
            </div>
            <p className="text-xs text-gray-600">
              Contact us at{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-purple-500 hover:text-purple-400 transition-colors"
              >
                {contactEmail}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
