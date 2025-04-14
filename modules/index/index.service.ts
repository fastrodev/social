export function indexService() {
  const titles = [
    "Welcome to the Community",
    "Your Journey Starts Here",
    "Connect and Collaborate",
    "Discover Together",
    "Build Something Amazing",
    "Join the Conversation",
    "Ready to Create?",
    "Let's Get Started",
    "Dive Into Development",
    "Code, Connect, Create",
    "The Future is Here",
    "Welcome Aboard!",
    "A New Social Experience",
    "The Beginning of Something Great",
    "Expand Your Network",
  ];

  const descriptions = [
    "A journey of a thousand miles begins with a single step",
    "Great things start from small beginnings",
    "Every expert was once a beginner",
    "Innovation happens at the intersection of ideas",
    "The best way to predict the future is to create it",
    "Alone we can do so little; together we can do so much",
    "Collaboration is the key to unlocking potential",
    "Your next great connection could change everything",
    "Dreams become reality when we work together",
    "Today's ideas become tomorrow's innovations",
  ];

  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  const randomDescription =
    descriptions[Math.floor(Math.random() * descriptions.length)];

  const baseUrl = Deno.env.get("BASE_URL") || "https://social.fastro.dev/";
  const imageUrl = baseUrl + "social.jpeg";

  return {
    title: randomTitle,
    description: randomDescription,
    image: imageUrl,
  };
}
