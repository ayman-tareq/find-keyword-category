const difflib = require("difflib");
const axios = require("axios");
const fs = require('fs');


const data = fs.readFileSync('apikey.json', 'utf8');
const jsonData = JSON.parse(data);
const apiKey = jsonData['apiKey']

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    "apiKey": apiKey
});

const openai = new OpenAIApi(configuration);

const retrieveTopics = () => {
    const topics = { 
      "arts & culture": [
          "literature",
          "mythology",
          "film",
          "music",
          "theatre",
          "comics",
          "design",
          "drawing",
          "painting",
          "photography",
          "dance",
          "podcast",
          "animé",
      ],
      "games & tv shows": [
          "board games",
          "card games",
          "video games",
          "puzzles",
          "game shows",
          "reality tv",
          "drama shows",
          "sitcoms",
          "cartoon",
          "animé",
          "celebrities",
          "podcast",
      ],
      "health & wellness": [
          "self care",
          "nutrition",
          "exercise",
          "psychology",
          "public health",
          "medicine",
          "meditation",
          "self-improvement",
      ],
      "sports & recreation": [
          "american football",
          "auto racing",
          "baseball",
          "basketball",
          "boxing",
          "cricket",
          "cycling",
          "football (soccer)",
          "fishing",
          "golf",
          "gymnastics",
          "horse racing",
          "ice hockey",
          "lacrosse",
          "rugby",
          "sailing",
          "skiing",
          "swimming",
          "tennis",
          "extreme sports",
      ],
      "science & technology": [
          "math",
          "biology",
          "geography",
          "nature",
          "chemistry",
          "climate",
          "physics",
          "space",
          "engineering",
          "tech",
          "computing",
          "software development",
          "apps",
          "robotics",
      ],
      "business & finance": [
          "architecture",
          "finance",
          "luxury",
          "crypto",
          "dropshipping",
          "entrepreneurship",
          "business",
          "economics",
          "real estate",
          "marketing",
          "logistics",
          "make money online",
          "investing",
          "stocks",
          "gambling",
      ],
      "history & society": [
          "politics",
          "christianity",
          "religion",
          "travel",
          "war",
          "history",
          "law",
          "crime",
          "education",
          "geopolitics",
          "philosophy",
      ],
      "cooking & food": [
          "recipes",
          "cooking techniques",
          "meal planning & prep",
          "food and drink",
      ],
      "outdoors & nature": [
          "hunting",
          "agriculture",
          "fishing",
          "boating",
          "diving",
          "nature",
          "geography",
          "travel",
          "cycling",
      ],
      "beauty & fashion": [
          "makeup",
          "skincare",
          "haircare",
          "clothing",
          "accessories",
          "celebrities",
      ],
      "transportation": [
        "aviation", "cars", "boating", "travel", "cycling"
    ]
  };
  return topics;
};

const findClosestCategory = (category, categoryList) => {
  const closestCategory = difflib.getCloseMatches(
      category,
      categoryList,
      1,
      0.1
  );
  return closestCategory.length ? closestCategory[0] : null;
};


const sendGpt3Request = async (prompt, categories) => {
  const completions = await openai.createCompletion(
      {
          model: "text-davinci-003",
          prompt,
      },
      {
          timeout: 10000,
      }
  );
  let gptCategory =
      completions.data.choices &&
      completions.data.choices[0].text.toLowerCase().trim();
  console.log("Open API Response With category:", "(", gptCategory, ")");
  gptCategory = findClosestCategory(gptCategory, categories);
  return gptCategory;
};

const processGpt3Requests = async (keyword) => {
    const topics = retrieveTopics('topics');
    const mainCategories = Object.keys(topics);

    const mainPrompt = `classify the keyword '${keyword}' into one of the categories below. The output should be only the name of the category, exactly as it appears in the list. Think step-by-step and debate pros and cons before choosing a category. Do not create new categories. Only choose from the following list:\n${mainCategories.join(
        "\n"
    )}\nFor example, if the keyword is 'soccer', the output should be 'sports & recreation'. Remember, only choose from the list.`;
    let gptMainCategory = await sendGpt3Request(mainPrompt, mainCategories);
    console.log("returned main gpt category is ", gptMainCategory);
    console.log("******----*******");
    if (!gptMainCategory) {
        console.log("Failed to find a valid main category.");
        return null;
    }
    
    const subCategories = topics[gptMainCategory]
    
    const subPrompt = `classify the keyword '${keyword}' into one of the categories below. The output should be only the name of the category, exactly as it appears in the list. Think step-by-step and debate pros and cons before choosing a category. Do not create new categories. Only choose from the following list:\n${subCategories.join(
        "\n"
    )}\nFor example, if the keyword is 'soccer', the output should be 'football (soccer)'. Remember, only choose from the list.`;
    let gptSubCategory = await sendGpt3Request(subPrompt, subCategories);
    if (!gptSubCategory) {
        console.log("Failed to find a valid sub-category.");
        return null;
    }
    
    console.log(`Keyword: ${keyword}  --- GPT mainCategory: ${gptMainCategory} and GPT subCategory: ${gptSubCategory}`);
    return [gptMainCategory, gptSubCategory];
};

keyword = 'fast food'
processGpt3Requests(keyword).then((result) => {
    console.log(result);
});
