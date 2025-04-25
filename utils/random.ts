export const getRandomImage = (tags: string[] | null) => {
  const IMG_BASE_URL = "https://social.fastro.dev/img";

  const imageCategories = {
    nature: [
      `${IMG_BASE_URL}/wrp8skwrp8skwrp8.jpg`, // planet
      `${IMG_BASE_URL}/8kwzn08kwzn08kwz.jpg`, // planet
    ],
    technology: [],
    abstract: [
      `${IMG_BASE_URL}/midvcjmidvcjmidv.jpg`, // abstract
      `${IMG_BASE_URL}/ckp4shckp4shckp4.jpg`, // abstract
      `${IMG_BASE_URL}/m0zjohm0zjohm0zj.jpg`, // abstract
      `${IMG_BASE_URL}/kbyeb2kbyeb2kbye.jpg`, // abstract
      `${IMG_BASE_URL}/91pymj91pymj91py.jpg`, // abstract
    ],
    urban: [
      `${IMG_BASE_URL}/yfzxmiyfzxmiyfzx.jpg`, // mesin
      `${IMG_BASE_URL}/i00vm5i00vm5i00v.jpg`, // mesin
      `${IMG_BASE_URL}/6sftej6sftej6sft.jpg`, // mesin
    ],
  };

  // Default images array (all images)
  const allImages = Object.values(imageCategories).flat();

  // If no tags or empty array, return a random image from all available
  if (!tags || tags.length === 0) {
    const randomIndex = Math.floor(Math.random() * allImages.length);
    return allImages[randomIndex];
  }

  // Normalize tags for matching (lowercase)
  const normalizedTags = tags.map((tag) => tag.toLowerCase());

  // Filter categories that might match our tags
  let matchedImages: string[] = [];

  for (const tag of normalizedTags) {
    // Check if tag matches a category name
    if (tag === "nature" && imageCategories.nature.length > 0) {
      matchedImages = [...matchedImages, ...imageCategories.nature];
    } else if (
      tag === "tech" ||
      tag === "technology" && imageCategories.technology.length > 0
    ) {
      matchedImages = [...matchedImages, ...imageCategories.technology];
    } else if (tag === "abstract" && imageCategories.abstract.length > 0) {
      matchedImages = [...matchedImages, ...imageCategories.abstract];
    } else if (
      (tag === "urban" || tag === "city") && imageCategories.urban.length > 0
    ) {
      matchedImages = [...matchedImages, ...imageCategories.urban];
    }
  }

  // If no matches found, return a random image from all images
  if (matchedImages.length === 0) {
    const randomIndex = Math.floor(Math.random() * allImages.length);
    return allImages[randomIndex];
  }

  // Return a random image from the matched images
  const randomIndex = Math.floor(Math.random() * matchedImages.length);
  return matchedImages[randomIndex];
};
