import axios from "./config";
import * as cheerio from "cheerio";

const clevelandURL = "https://openaccess-api.clevelandart.org/api/artworks/";
const chicagoURL = "https://api.artic.edu/api/v1/artworks?fields=id,title,image_id";
const giphyURL = "https://api.giphy.com/v1/gifs/trending?api_key=Fo9QcAQLMFI8V6pdWWHWl9qmW91ZBjoK&";
const harvardURL = "https://api.harvardartmuseums.org/image?apikey=c10d3ea9-27b1-45b4-853a-3872440d9782";

// old getApiImagesHelper (remove later if nothing breaks)
// async function getApiImagesHelper(userData){
//     if(userData.deckUID === "500-000005"){
//         const googlePhotos = randomize(userData.googlePhotos, userData.numOfRounds)
//         return googlePhotos
//     }
//     else if (userData.deckUID === "500-000006") {
//         const imagesInfo = await axios.get(clevelandURL + "?limit=100").then(response => response.data.data)
//         let clevelandImages = []
//         for(let i = 0; i < imagesInfo.length; i++){
//             if(imagesInfo[i].images !== null && imagesInfo[i].images.web !== undefined)
//                 clevelandImages.push(imagesInfo[i].images.web.url)
//         }
//         clevelandImages = randomize(clevelandImages, userData.numOfRounds)
//         return clevelandImages
//     }
//     else if (userData.deckUID === "500-000007") {
//         const path_begin = "https://www.artic.edu/iiif/2/"
//         const path_end = "/full/843,/0/default.jpg"
//         const imagesInfo = await axios.get(chicagoURL + "&limit=100").then(response => response.data.data)
//         let chicagoImages = []
//         for(let i = 0; i < imagesInfo.length; i++){
//             if(imagesInfo[i].image_id !== null){
//                 const imageURL = path_begin + imagesInfo[i].image_id + path_end
//                 chicagoImages.push(imageURL)
//             }
//         }
//         chicagoImages = randomize(chicagoImages, userData.numOfRounds)
//         return chicagoImages
//     }
//     else if (userData.deckUID === "500-000008") {
//         const imagesInfo = await axios.get(giphyURL + "&limit=50").then(response => response.data.data)
//         let giphyImages = []
//         for(let i = 0; i < imagesInfo.length; i++){
//             if(imagesInfo[i].images.original.url !== null)
//                 giphyImages.push(imagesInfo[i].images.original.url)
//         }
//         giphyImages = randomize(giphyImages, userData.numOfRounds)
//         return giphyImages
//     }
//     else if (userData.deckUID === "500-000009") {
//         const imagesInfo = await axios.get(harvardURL + "&size=100").then(response => response.data.records)
//         let harvardImages = []
//         for(let i = 0; i < imagesInfo.length; i++){
//             if(imagesInfo[i].baseimageurl !== null)
//                 harvardImages.push(imagesInfo[i].baseimageurl)
//         }
//         harvardImages = randomize(harvardImages, userData.numOfRounds)
//         return harvardImages
//     }
//     else if (userData.deckUID === "500-000010") {
//         let cnnURL = await axios.get(userData.CNN_URL).then(response => response.config.url)
//         let cnnImages = await getCnnImgURLs(cnnURL)
//         cnnImages = randomize(cnnImages, userData.numOfRounds)
//         return cnnImages
//     }
// }
async function validateImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Check if image is too large for mobile devices
      if (img.width * img.height > 4096 * 4096) {
        resolve(false);
      } else {
        resolve(true);
      }
    };
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// Add this function to handle image preloading and cleanup
function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      img.onload = null;
      img.onerror = null;
      resolve(url);
    };

    img.onerror = () => {
      img.onload = null;
      img.onerror = null;
      reject(new Error(`Failed to load image: ${url}`));
    };

    img.src = url;
  });
}

async function getApiImagesHelper(userData) {
  try {
    let images = [];

    if (userData.deckUID === "500-000005") {
      const googlePhotos = randomize(userData.googlePhotos, userData.numOfRounds);
      images = googlePhotos;
    } else if (userData.deckUID === "500-000006") {
      const imagesInfo = await axios
        .get(clevelandURL + "?limit=100")
        .then((response) => response.data.data)
        .catch((error) => {
          console.error("Error fetching Cleveland images:", error);
          return [];
        });
      for (let i = 0; i < imagesInfo.length; i++) {
        if (imagesInfo[i].images !== null && imagesInfo[i].images.web !== undefined) images.push(imagesInfo[i].images.web.url);
      }
    } else if (userData.deckUID === "500-000007") {
      const path_begin = "https://www.artic.edu/iiif/2/";
      const path_end = "/full/843,/0/default.jpg";
      const imagesInfo = await axios
        .get(chicagoURL + "&limit=100")
        .then((response) => response.data.data)
        .catch((error) => {
          console.error("Error fetching Chicago images:", error);
          return [];
        });
      for (let i = 0; i < imagesInfo.length; i++) {
        if (imagesInfo[i].image_id !== null) {
          const imageURL = path_begin + imagesInfo[i].image_id + path_end;
          images.push(imageURL);
        }
      }
    } else if (userData.deckUID === "500-000008") {
      const imagesInfo = await axios
        .get(giphyURL + "&limit=50")
        .then((response) => response.data.data)
        .catch((error) => {
          console.error("Error fetching Giphy images:", error);
          return [];
        });
      for (let i = 0; i < imagesInfo.length; i++) {
        if (imagesInfo[i].images.original.url !== null) images.push(imagesInfo[i].images.original.url);
      }
    } else if (userData.deckUID === "500-000009") {
      const imagesInfo = await axios
        .get(harvardURL + "&size=100")
        .then((response) => response.data.records)
        .catch((error) => {
          console.error("Error fetching Harvard images:", error);
          return [];
        });
      for (let i = 0; i < imagesInfo.length; i++) {
        if (imagesInfo[i].baseimageurl !== null) images.push(imagesInfo[i].baseimageurl);
      }
    } else if (userData.deckUID === "500-000010") {
      const cnnURL = await axios
        .get(userData.CNN_URL)
        .then((response) => response.config.url)
        .catch((error) => {
          console.error("Error fetching CNN URL:", error);
          return "";
        });
      if (cnnURL) {
        const cnnImages = await getCnnImgURLs(cnnURL).catch((error) => {
          console.error("Error fetching CNN images:", error);
          return [];
        });
        images = cnnImages;
      }
    }

    // Validate and preload images before randomization
    const validatedImages = [];
    for (const url of images) {
      try {
        await preloadImage(url);
        validatedImages.push(url);
      } catch (error) {
        console.error(`Failed to validate/preload image: ${url}`, error);
      }
    }

    if (validatedImages.length < userData.numOfRounds) {
      throw new Error(`Not enough valid images (needed: ${userData.numOfRounds}, got: ${validatedImages.length})`);
    }

    // Use non-destructive randomization
    return randomizeNonDestructive(validatedImages, userData.numOfRounds);
  } catch (error) {
    console.error("Error in getApiImagesHelper:", error);
    throw error;
  }
}

function randomize(inputArray, numOfRounds) {
  let tempArray = [];
  for (let i = 0; i < numOfRounds; i++) {
    const randomIndex = Math.floor(Math.random() * inputArray.length);
    const imageURL = inputArray.splice(randomIndex, 1);
    tempArray.push(imageURL[0]);
  }
  return tempArray;
}

// Update the randomization to be completely non-destructive
function randomizeNonDestructive(array, count) {
  const shuffled = [...array];
  let currentIndex = shuffled.length;

  while (currentIndex > 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Swap elements
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }

  return shuffled.slice(0, count);
}

// FUNCTION: getCnnImgURLs
// DESCRIPTION: Web scrapes the URL page source for <script> tag then adds img URLs to list
async function getCnnImgURLs(URL) {
  const htmlString = await axios.get(URL).then((response) => response.data);
  const $ = cheerio.load(htmlString);
  const imgElements = $("body").find("img");
  let imgURLs = [];
  for (let i = 0; i < imgElements.length; i++) {
    imgURLs.push(imgElements[i].attribs.src);
  }
  return imgURLs;
}

// FUNCTION: getCurrentCnnURL
// DESCRIPTION: Starting from today, iterates through the past 365 days for the most current valid CNN URL
async function getCurrentCnnURL() {
  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  let cnnURL = "";
  let beginDate = new Date();
  let endDate = new Date();
  beginDate.setDate(endDate.getDate() - 7);
  for (let i = 0; i <= 365; i++) {
    let beginDay = beginDate.getDate(),
      beginMonth = beginDate.getMonth();
    let endDay = endDate.getDate(),
      endMonth = endDate.getMonth(),
      endYear = endDate.getFullYear();
    let potentialCnnURL = "";
    if (endDay < 10)
      potentialCnnURL = `https://www.cnn.com/${endYear}/${endMonth + 1}/0${endDay}/world/gallery/photos-this-week-${months[beginMonth]}-${beginDay}-${months[endMonth]}-${endDay}/index.html`;
    else potentialCnnURL = `https://www.cnn.com/${endYear}/${endMonth + 1}/${endDay}/world/gallery/photos-this-week-${months[beginMonth]}-${beginDay}-${months[endMonth]}-${endDay}/index.html`;
    try {
      cnnURL = await axios.get(potentialCnnURL).then((response) => response.config.url);
      break;
    } catch (error) {
      beginDate.setDate(beginDate.getDate() - 1);
      endDate.setDate(endDate.getDate() - 1);
    }
  }
  return getCnnImgURLs(cnnURL);
}

const handleApiError = (error, onRetry, context) => {
  console.error(error);
  const { setShow, setOnRetry, setTitle, setDescription } = context;
  if (error.response) {
    setTitle("Server error - SQL error");
    setDescription(error.response.data.message);
  } else if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
    setTitle("Network error - Timeout error");
    setDescription("This is taking longer than ususal. Please check your network connection and try again");
  } else {
    setTitle("Network error - Send error");
    setDescription("Unable to reach server. Please check your network connection and try again");
  }
  setOnRetry(() => onRetry);
  setShow(true);
};

export { getApiImagesHelper, handleApiError };
