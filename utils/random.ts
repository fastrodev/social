// Track recently used images to avoid repetition
const recentlyUsedImages: string[] = [];
const MAX_RECENT_IMAGES = 5; // Number of recently used images to track

export const getRandomImage = (tags: string[] | null) => {
  const IMG_BASE_URL = "https://social.fastro.dev/img";

  const imageCategories = {
    nature: [
      `${IMG_BASE_URL}/wrp8skwrp8skwrp8.jpg`, // planet
      `${IMG_BASE_URL}/8kwzn08kwzn08kwz.jpg`, // planet
    ],
    technology: [
      // Add some technology images to avoid empty category
      `${IMG_BASE_URL}/yfzxmiyfzxmiyfzx.jpg`, // tech/machine
      `${IMG_BASE_URL}/i00vm5i00vm5i00v.jpg`, // tech/machine
    ],
    abstract: [
      `${IMG_BASE_URL}/midvcjmidvcjmidv.jpg`, // abstract
      `${IMG_BASE_URL}/ckp4shckp4shckp4.jpg`, // abstract
      `${IMG_BASE_URL}/m0zjohm0zjohm0zj.jpg`, // abstract
      `${IMG_BASE_URL}/kbyeb2kbyeb2kbye.jpg`, // abstract
      `${IMG_BASE_URL}/91pymj91pymj91py.jpg`, // abstract
    ],
    urban: [
      `${IMG_BASE_URL}/yfzxmiyfzxmiyfzx.jpg`, // urban/machine
      `${IMG_BASE_URL}/i00vm5i00vm5i00v.jpg`, // urban/machine
      `${IMG_BASE_URL}/6sftej6sftej6sft.jpg`, // urban/machine
    ],
  };

  // Default images array (all images)
  const allImages = Object.values(imageCategories).flat();

  // Get candidate images based on tags
  let candidateImages: string[] = [];

  if (!tags || tags.length === 0) {
    candidateImages = [...allImages];
  } else {
    // Normalize tags for matching (lowercase)
    const normalizedTags = tags.map((tag) => tag.toLowerCase());

    // Collect images from all matching categories
    for (const tag of normalizedTags) {
      if (tag === "nature" && imageCategories.nature.length > 0) {
        candidateImages = [...candidateImages, ...imageCategories.nature];
      } else if (
        (tag === "tech" || tag === "technology") &&
        imageCategories.technology.length > 0
      ) {
        candidateImages = [...candidateImages, ...imageCategories.technology];
      } else if (tag === "abstract" && imageCategories.abstract.length > 0) {
        candidateImages = [...candidateImages, ...imageCategories.abstract];
      } else if (
        (tag === "urban" || tag === "city") &&
        imageCategories.urban.length > 0
      ) {
        candidateImages = [...candidateImages, ...imageCategories.urban];
      }
    }

    // If no matches found, use all images
    if (candidateImages.length === 0) {
      candidateImages = [...allImages];
    }
  }

  // Filter out recently used images if possible
  const unusedImages = candidateImages.filter((img) =>
    !recentlyUsedImages.includes(img)
  );

  // Use filtered list if available, otherwise use all candidates
  const selectionPool = unusedImages.length > 0
    ? unusedImages
    : candidateImages;

  // Add some true randomness with timestamp-based seed
  const seed = Date.now() % selectionPool.length;
  const randomIndex = Math.floor(Math.random() * selectionPool.length + seed) %
    selectionPool.length;

  const selectedImage = selectionPool[randomIndex];

  // Track this image as recently used
  recentlyUsedImages.push(selectedImage);
  if (recentlyUsedImages.length > MAX_RECENT_IMAGES) {
    recentlyUsedImages.shift(); // Remove oldest image
  }

  return selectedImage;
};
