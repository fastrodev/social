import { AdvertisementCard } from "./AdvertisementCard.tsx";

type AdvertisementProps = {
  contactEmail?: string;
};

export function Advertisement(
  { contactEmail = "hello@fastro.dev" }: AdvertisementProps,
) {
  return (
    // hide this component on mobile
    <div className="hidden lg:block lg:w-80 flex-shrink-0">
      <div className="sticky top-6">
        <AdvertisementCard contactEmail={contactEmail} />
      </div>
    </div>
  );
}
