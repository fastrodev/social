import { AdvertisementCard } from "./AdvertisementCard.tsx";
import { TabbedContent } from "./TabbedContent.tsx"; // Import the new component

type AdvertisementProps = {
  contactEmail?: string;
};

export function Advertisement(
  { contactEmail = "hello@fastro.dev" }: AdvertisementProps,
) {
  // Define the tabs and dummy data
  const tabs = [
    { key: "views", label: "Most Viewed" },
    { key: "comments", label: "Most Commented" },
    { key: "sponsors", label: "Most Sponsored" },
  ] as const;
  type TabKey = typeof tabs[number]["key"];

  const dummyData: Record<TabKey, { id: number; title: string }[]> = {
    views: [
      { id: 1, title: "Popular Post #1" },
      { id: 2, title: "Popular Post #2" },
      { id: 3, title: "Popular Post #3" },
    ],
    comments: [
      { id: 4, title: "Hot Discussion #1" },
      { id: 5, title: "Hot Discussion #2" },
      { id: 6, title: "Hot Discussion #3" },
    ],
    sponsors: [
      { id: 7, title: "Sponsored Story #1" },
      { id: 8, title: "Sponsored Story #2" },
      { id: 9, title: "Sponsored Story #3" },
    ],
  };

  return (
    // hide this component on mobile
    <div className="hidden lg:w-80 lg:flex lg:flex-col lg:gap-y-4">
      <TabbedContent tabs={tabs} data={dummyData} initialTabKey="views" />
      <AdvertisementCard contactEmail={contactEmail} />
    </div>
  );
}
