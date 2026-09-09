/**
 * Educational Synthetic Response Generator
 * Generates synthetic test data strictly labeled as [TEST DATA].
 * Includes predefined student pools and random response generators for surveys.
 */

export interface SyntheticResponse {
  name: string;
  email: string;
  course: string;
  satisfaction: string;
  rating: string;
  feedback: string;
  // Social Media Academic Survey test fields
  age?: string;
  yearOfStudy?: string;
  socialMediaTime?: string;
  socialPlatforms?: string[];
  checkFrequency?: string;
  distractionRating?: string;
  timeReductionRating?: string;
  academicUseRating?: string;
  overallEffect?: string;
}

// Survey options based on developer form questions
export const surveyOptions = {
  age: ["Below 18", "18–20", "21–23", "24–26", "Above 26"],
  yearOfStudy: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
  socialMediaTime: ["Less than 1 hour", "1–2 hours", "2–4 hours", "4–6 hours", "More than 6 hours"],
  platforms: ["Facebook", "Instagram", "TikTok", "WhatsApp", "YouTube", "X"],
  checkFrequency: ["Always", "Often", "Sometimes", "Rarely", "Never"],
  ratings: ["1", "2", "3", "4", "5"],
  overallEffect: ["Very Negative", "Negative", "No Significant Effect", "Positive", "Very Positive"]
};

// Predefined test responses as requested
export const testResponses: SyntheticResponse[] = [
  {
    name: "[TEST DATA] Test Student 001",
    email: "test.student001@example.edu",
    course: "[TEST DATA] Information Systems",
    satisfaction: "Very Satisfied",
    rating: "5",
    feedback: "[TEST DATA] Excellent course material, highly practical hands-on labs.",
    age: "21–23",
    yearOfStudy: "3rd Year",
    socialMediaTime: "2–4 hours",
    socialPlatforms: ["YouTube", "WhatsApp"],
    checkFrequency: "Sometimes",
    distractionRating: "3",
    timeReductionRating: "3",
    academicUseRating: "4",
    overallEffect: "Positive"
  },
  {
    name: "[TEST DATA] Test Student 002",
    email: "test.student002@example.edu",
    course: "[TEST DATA] Software Engineering",
    satisfaction: "Satisfied",
    rating: "4",
    feedback: "[TEST DATA] Clear lectures and great teamwork assignments.",
    age: "18–20",
    yearOfStudy: "1st Year",
    socialMediaTime: "1–2 hours",
    socialPlatforms: ["Instagram", "YouTube"],
    checkFrequency: "Rarely",
    distractionRating: "2",
    timeReductionRating: "2",
    academicUseRating: "5",
    overallEffect: "Positive"
  },
  {
    name: "[TEST DATA] Test Student 003",
    email: "test.student003@example.edu",
    course: "[TEST DATA] Computer Science",
    satisfaction: "Neutral",
    rating: "3",
    feedback: "[TEST DATA] Good overall, but pacing in week 4 was quite fast.",
    age: "21–23",
    yearOfStudy: "2nd Year",
    socialMediaTime: "4–6 hours",
    socialPlatforms: ["TikTok", "Instagram"],
    checkFrequency: "Often",
    distractionRating: "4",
    timeReductionRating: "4",
    academicUseRating: "3",
    overallEffect: "Negative"
  }
];

const firstNames = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Riley", "Casey", "Avery"];
const lastNames = ["Chen", "Smith", "Patel", "Garcia", "Johnson", "Kim", "Muller", "Tanaka", "Silva", "Brown"];
const courses = [
  "[TEST DATA] Information Systems",
  "[TEST DATA] Software Engineering",
  "[TEST DATA] Computer Science",
  "[TEST DATA] Data Science & Analytics",
  "[TEST DATA] Cybersecurity"
];
const feedbackSnippets = [
  "[TEST DATA] Well-structured curriculum and supportive instructor feedback.",
  "[TEST DATA] The practical coding exercises were very engaging.",
  "[TEST DATA] Good balance between theoretical foundations and live demonstrations.",
  "[TEST DATA] Clear documentation and informative assignment rubrics."
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Randomly generate or select a synthetic test response.
 * All generated data is strictly labeled as TEST DATA.
 */
export function generateTestResponse(responseNumber?: number): SyntheticResponse {
  const index = responseNumber !== undefined ? responseNumber : Math.floor(Math.random() * 1000);
  const randomFirst = pickRandom(firstNames);
  const randomLast = pickRandom(lastNames);
  const paddedId = String(index).padStart(3, "0");

  // Pick 1-2 random platforms
  const shuffledPlatforms = [...surveyOptions.platforms].sort(() => 0.5 - Math.random());
  const selectedPlatforms = shuffledPlatforms.slice(0, Math.floor(Math.random() * 2) + 1);

  return {
    name: `[TEST DATA] Test Student ${paddedId} (${randomFirst} ${randomLast})`,
    email: `test.student${paddedId}@example.edu`,
    course: pickRandom(courses),
    satisfaction: pickRandom(["Very Satisfied", "Satisfied", "Neutral"]),
    rating: pickRandom(surveyOptions.ratings),
    feedback: pickRandom(feedbackSnippets),
    age: pickRandom(surveyOptions.age),
    yearOfStudy: pickRandom(surveyOptions.yearOfStudy),
    socialMediaTime: pickRandom(surveyOptions.socialMediaTime),
    socialPlatforms: selectedPlatforms,
    checkFrequency: pickRandom(surveyOptions.checkFrequency),
    distractionRating: pickRandom(surveyOptions.ratings),
    timeReductionRating: pickRandom(surveyOptions.ratings),
    academicUseRating: pickRandom(surveyOptions.ratings),
    overallEffect: pickRandom(surveyOptions.overallEffect)
  };
}
