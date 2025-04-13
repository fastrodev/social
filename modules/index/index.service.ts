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

  const randomTitle = titles[Math.floor(Math.random() * titles.length)];

  return {
    title: randomTitle,
    description: "A journey of a thousand miles begins with a single step",
  };
}
