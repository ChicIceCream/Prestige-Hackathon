"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import nlp from "compromise";
import { div, filter } from "framer-motion/client";

interface ClaimReview {
  publisher: {
    name: string;
    site: string;
  };
  textualRating: string;
  url: string;
}

interface Claim {
  text: string;
  claimant?: string;
  claimReview: ClaimReview[];
}

interface FactCheckResponse {
  claims: {
    text: string;
    claimant?: string;
    claimReview: {
      publisher: { name: string; site: string };
      textualRating: string;
      url: string;
    }[];
  }[];
}

const VeriFactAI: React.FC = () => {
  const [userNews, setuserNews] = useState<string>("");
  const [importantKeywords, setImportantKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ status: string; info: string } | null>(
    null
  );
  const [maxNewsPrediction, setMaxNewsPrediction] = useState<number | null>(
    null
  );
  const [googleApiCheck, setGoogleApiCheck] = useState<boolean>(false);
  const [newsApiCheck, setNewsApiCheck] = useState<boolean>(false);

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FACT_CHECK_API_KEY;

  // useEffect(() => {
  //   const text = "India won the champions trophy 2025";
  //   const doc = nlp(text);

  //   const nouns = doc.nouns().out("array");
  //   const verbs = doc.verbs().out("array");

  //   console.log(nouns)
  //   console.log(verbs)

  // }, [])

  const getTheApisData = () => {
    if (userNews == "") return;
    fetchGoogleApiData(userNews);
    const doc = nlp(userNews);
    const nouns = doc.nouns().out("array").join(" "); // Convert array to string
    fetchNewsApiData(nouns);
  };

  async function fetchGoogleApiData(query: string): Promise<void> {
    if (userNews === "") return;
    if (!API_KEY) {
      console.error("Missing API key.");
      return;
    }

    setLoading(true);
    setResult(null); // Reset previous result

    const API_URL = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(
      query
    )}&key=${API_KEY}`;

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: FactCheckResponse = await response.json();

      if (!data.claims || data.claims.length === 0) {
        console.log("No fact-checking results found.");
        setGoogleApiCheck(false);
        setResult({ status: "⚠️", info: "No claims found for this news." });
        return;
      }

      const allClaims = data.claims.map(
        (claim, index) => `Claim ${index + 1}: ${claim.text}`
      );
      if (allClaims.length === 0) {
        setResult({ status: "⚠️", info: "No claims found." });
      } else {
        setResult({ status: "✅", info: "Claims retrieved successfully." });
        setGoogleApiCheck(true);
        checkSimilarity(allClaims);
      }
    } catch (error) {
      console.error("Error fetching fact-check data:", error);
      setResult({
        status: "⚠️",
        info: "Error fetching data. Try again later.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchNewsApiData(query: string) {
    const API_KEY = "f6b415a7a7344861bccea1916fea14fa";
    const URL = `https://newsapi.org/v2/everything?qInTitle=${encodeURIComponent(
      query
    )}&sortBy=relevancy&language=en&apiKey=${API_KEY}`;

    try {
      const response = await fetch(URL);
      const data = await response.json();

      if (data.articles.length > 0) {
        setNewsApiCheck(true);
        checkSimilarity(data.articles.map((article: any) => article.title));
      } else {
        setNewsApiCheck(false);
        console.log("No highly relevant news found for:", query);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  }

  async function checkSimilarity(apiNews: string[]) {
    console.log(apiNews);

    if (!apiNews.length) {
      console.error("No claims to compare.");
      return;
    }

    const BACKEND_URL = "http://127.0.0.1:8000/similarity";
    let similarityScores: number[] = [];

    try {
      for (const news of apiNews) {
        const response = await fetch(BACKEND_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text1: userNews.trim(), // User-entered news
            text2: news.trim(), // Claim from fact-check API
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const score = parseFloat(data.similarity_score); // Convert to float
        if (!isNaN(score)) {
          similarityScores.push(score);
        }
      }

      // Find the max similarity score
      if (similarityScores.length > 0) {
        const maxSimilarity = Math.max(...similarityScores);

        setMaxNewsPrediction((prev) => Math.max(prev ?? 0, maxSimilarity));

        console.log("Maximum Similarity Score:", maxSimilarity);
      } else {
        console.log("No valid similarity scores found.");
      }
    } catch (error) {
      console.error("Error sending similarity request:", error);
    }
  }

  console.log(googleApiCheck, newsApiCheck);

  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      <div className="absolute inset-0 opacity-40 backdrop-blur-xl"></div>

      {/* Navbar */}
      <nav className="relative z-10 w-full px-6 py-4 text-white text-3xl font-bold shadow-md bg-gray-900 backdrop-blur-lg">
        VeriFact AI
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col md:flex-row w-full flex-1">
        {/* Left Section */}
        <motion.div
          className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 shadow-lg bg-white/60 rounded-lg m-4"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-center text-black">
            Enter News to Verify
          </h2>
          <textarea
            className="w-full p-4 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-black placeholder-gray-700"
            rows={3}
            placeholder="Enter news article headline..."
            value={userNews}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setuserNews(e.target.value)
            }
          ></textarea>

          <button
            onClick={getTheApisData}
            className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg text-lg font-semibold shadow-md text-white"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Verify News"}
          </button>
        </motion.div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-white p-8 bg-gray-900 backdrop-blur-lg rounded-lg m-4">
          <motion.h1
            className="text-5xl font-extrabold mb-4 text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            VeriFact AI - Fake News Detector
          </motion.h1>
          <p className="text-lg text-gray-300 text-center">
            Enter a news headline, and our AI will verify whether it's{" "}
            <strong>real or fake</strong>.
          </p>

          {(googleApiCheck || newsApiCheck) && maxNewsPrediction ? (
            <div>
              <div
                className={`p-6 rounded-lg text-white text-center shadow-lg transition-all ${
                  maxNewsPrediction > 0.7
                    ? "bg-gradient-to-r from-green-500 to-green-700"
                    : maxNewsPrediction >= 0.5
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-700"
                    : "bg-gradient-to-r from-red-600 to-red-800"
                }`}
              >
                <div className="flex items-center justify-center mb-3">
                  {maxNewsPrediction > 0.7 ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-4xl">✅</span>
                      <h3 className="text-3xl font-bold">News Verified!</h3>
                    </div>
                  ) : maxNewsPrediction >= 0.5 ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-4xl">⚠️</span>
                      <h3 className="text-3xl font-bold">Uncertain News!</h3>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-4xl">🚨</span>
                      <h3 className="text-3xl font-bold">Fake News Alert!</h3>
                    </div>
                  )}
                </div>

                <p className="text-lg">
                  {maxNewsPrediction > 0.7 ? (
                    <>
                      ✅ According to our model, there is a{" "}
                      <span className="font-semibold">
                        {(maxNewsPrediction * 100).toFixed(2)}% chance
                      </span>{" "}
                      that this news is **TRUE**.
                    </>
                  ) : maxNewsPrediction >= 0.5 ? (
                    <>
                      ⚠️ This news has a{" "}
                      <span className="font-semibold text-gray-900">
                        {(maxNewsPrediction * 100).toFixed(2)}% probability
                      </span>{" "}
                      of being true, but we recommend **checking other sources**
                      before trusting it.
                    </>
                  ) : (
                    <>
                      🚨 Our model predicts a{" "}
                      <span className="font-semibold text-yellow-300">
                        {((1 - maxNewsPrediction) * 100).toFixed(2)}% chance
                      </span>{" "}
                      that this news is **FAKE**. Be cautious before sharing!
                    </>
                  )}
                </p>

                {/* Buttons */}
                {maxNewsPrediction > 0.7 ? (
                  <button className="mt-4 bg-white text-green-700 px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition">
                    ✅ Share the Truth
                  </button>
                ) : maxNewsPrediction >= 0.5 ? (
                  <button className="mt-4 bg-white text-yellow-800 px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition">
                    ⚠️ Read More from Trusted Sources
                  </button>
                ) : (
                  <button className="mt-4 bg-white text-red-700 px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition">
                    🚨 Report Misinformation
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-500 text-white rounded-lg shadow-lg">
              <span className="text-5xl mb-3">🤔</span>
              <h3 className="text-2xl font-bold text-red-5`00">No Data Found</h3>
              <p className="text-lg text-gray-300 text-center mt-2">
                The news might be <strong className="text-red-500">fake</strong>
                . Please verify with other sources before trusting it.
              </p>
              <button className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md font-semibold transition">
                🔎 Verify Sources
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VeriFactAI;
