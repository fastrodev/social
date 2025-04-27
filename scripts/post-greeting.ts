const API_URL = "https://web.fastro.dev/api/post";
const DEFAULT_IMAGE = "https://example.com/default-image.jpg";

interface PostData {
  content: string;
  isMarkdown: boolean;
  image: string;
  defaultImage: string;
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour === 6) {
    const morningGreetings = [
      "Good morning! Rise and shine! It's a brand new day with fresh opportunities. What are your goals today?",
      "Morning has broken! What positive impact will you make today?",
      "A new dawn, a new day! What possibilities will you explore?",
      "Good morning! The early bird catches the success. What's your first win going to be today?",
      "Morning sunshine! Your potential today is limitless. What will you accomplish?",
      "Fresh morning, fresh mindset! What new perspective will guide you today?",
      "Morning energy activated! Channel it into your most important priorities today.",
      "Rise with purpose! This morning marks the beginning of something amazing.",
      "Hello, morning! The world is full of possibilities waiting for your touch today.",
      "Morning optimism at its peak! What challenge will you transform into an opportunity?",
      "Dawn of a new day! Your morning choices set the tone - make them count!",
      "Good morning world! Today is a blank canvas - what masterpiece will you create?",
      "Morning vibes! Embrace this day with the energy it deserves!",
    ];
    return morningGreetings[
      Math.floor(Math.random() * morningGreetings.length)
    ];
  } else if (hour === 13) {
    const afternoonGreetings = [
      "Afternoon energy boost! Hope your day is going well. Remember to take a moment to breathe and refocus.",
      "Mid-day check-in! How's your productivity? Time for a quick refresh?",
      "Afternoon motivation! The day is half over - make the rest count!",
      "Afternoon pause! How's your day unfolding? Time to reassess priorities for maximum impact.",
      "Midday momentum check! Keep the positive energy flowing through the afternoon.",
      "Afternoon reflection time! What have you accomplished so far and what's next?",
      "Lunchtime wisdom: The afternoon is your second chance to make today amazing!",
      "Afternoon reset button! Clear your mind, refocus your energy, and finish strong.",
      "Midday greetings! Remember that consistent progress beats sporadic perfection.",
      "The afternoon stretch! Stand up, breathe deep, and recommit to your important goals.",
      "Afternoon perspective: You're not just busy, you're building something meaningful!",
      "Sunny afternoon vibes! Let your productivity shine as bright as the midday sun.",
      "Afternoon reminder: Your well-being matters! Take a moment to check in with yourself.",
    ];
    return afternoonGreetings[
      Math.floor(Math.random() * afternoonGreetings.length)
    ];
  } else if (hour === 16) {
    const lateAfternoonGreetings = [
      "Late afternoon check-in! How's your day been? There's still time to accomplish something meaningful before the day ends.",
      "Final stretch of the workday! What's one more thing you can accomplish?",
      "Afternoon reflection time! What were your wins today, and what's still on your list?",
      "The 4pm opportunity window! You still have time to make today count in a special way.",
      "Late afternoon energy check! What needs your attention most before you wrap up today?",
      "Golden hour productivity! Make these final working hours shine with focused effort.",
      "Afternoon wind-down beginning! Prioritize your remaining tasks wisely.",
      "Day's final sprint! What deserves your energy and attention before closing time?",
      "Late day inspiration: Finish stronger than you started, even when energy wanes.",
      "Almost there! What important task can you complete before the workday ends?",
      "Afternoon completion zone! Time to tie up loose ends and prepare for tomorrow.",
      "4pm reminder: Your future self will thank you for finishing strong today!",
      "Late afternoon check: Don't let perfect be the enemy of done as you wrap up today.",
    ];
    return lateAfternoonGreetings[
      Math.floor(Math.random() * lateAfternoonGreetings.length)
    ];
  } else if (hour === 20) {
    const eveningGreetings = [
      "Evening reflections! As the day winds down, what was your biggest win today? Time to recharge for tomorrow's adventures.",
      "Winding down for the day? Take a moment to celebrate what you accomplished!",
      "Evening vibes! Time to relax and prepare for another day of possibilities tomorrow.",
      "Evening gratitude moment! What three things went well today that you appreciate?",
      "Nightfall wisdom: Today's efforts become tomorrow's results. Rest well!",
      "Evening wind-down activated! Time to switch from productivity to recovery mode.",
      "Stars are appearing! As your day concludes, what moment shined brightest for you?",
      "Evening reflection: Progress isn't always visible in the moment, but you're moving forward!",
      "Twilight thoughts: Let go of today's challenges and embrace tomorrow's potential.",
      "Day's end ritual: Celebrate wins, learn from setbacks, and prepare for a fresh start.",
      "Evening reminder: Rest isn't laziness, it's preparation for future productivity!",
      "Night settling in! Time to power down your mind and recharge your spirit.",
      "Evening mantra: You did your best today, and that's always enough.",
    ];
    return eveningGreetings[
      Math.floor(Math.random() * eveningGreetings.length)
    ];
  } else {
    const defaultGreetings = [
      "Hello there! Hope you're having a wonderful day!",
      "Greetings! Every moment is a chance to make positive changes.",
      "Hi friend! Remember that your journey matters, whatever time it is.",
      "Checking in with a friendly reminder that you're doing great!",
      "Hello! Taking small steps consistently leads to big results.",
      "Friendly reminder: Your well-being matters at every hour of the day.",
      "Time for a quick mindfulness moment. Take a deep breath!",
      "Whatever time it is, it's always a good moment to celebrate your progress.",
      "Sending positive energy your way, no matter the hour!",
      "Remember: Each moment contains the seed of opportunity.",
    ];
    return defaultGreetings[
      Math.floor(Math.random() * defaultGreetings.length)
    ];
  }
}

async function postToApi() {
  // Get the image URL from environment or generate one
  let postImage = Deno.env.get("POST_IMAGE");

  // If no image URL is provided in environment, generate one
  if (!postImage || postImage === DEFAULT_IMAGE) {
    postImage = generateImageUrl();
  }

  const postContent = getTimeBasedGreeting();

  const postData: PostData = {
    content: postContent,
    isMarkdown: true,
    image: postImage,
    defaultImage: postImage,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include API key if needed
        ...(Deno.env.get("API_KEY") &&
          { "Authorization": `Bearer ${Deno.env.get("API_KEY")}` }),
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(
        `Error posting to API: ${response.status} ${response.statusText}`,
      );
    }

    console.log("Post successful!");
    console.log("Content:", postContent);
    console.log("Image URL:", postImage);
  } catch (error) {
    console.error("Failed to post:", error);
    Deno.exit(1);
  }
}

function generateImageUrl(): string {
  const id = Math.floor(Math.random() * 1000) + 1;
  return `https://picsum.photos/seed/${id}/800/600.jpg`;
}

await postToApi();
