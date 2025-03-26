"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ status: string; info: string } | null>(
    null
  );
  const [claims, setClaims] = useState<string[]>([]);
  const [newsResult, setNewsResult] = useState<number | null>(null);
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FACT_CHECK_API_KEY;

  async function fetchNewsApiData(query: string) {
    const API_KEY = "f6b415a7a7344861bccea1916fea14fa";
    const URL = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`;

    fetch(URL)
      .then((response) => response.json())
      .then((data) => console.log(data.articles))
      .catch((error) => console.error("Error fetching news:", error));
  }

  useEffect(() => {
    fetchNewsApiData("India won the Champions Trophy 2025");
  }, []);

  async function fetchFactCheck(query: string): Promise<void> {
    if (userNews === "") return;
    if (!API_KEY) {
      console.error("Missing API key.");
      return;
    }

    setLoading(true);
    setResult(null); // Reset previous result

    const API_URL = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(query)}&key=${API_KEY}`;

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: FactCheckResponse = await response.json();

      if (!data.claims || data.claims.length === 0) {
        console.log("No fact-checking results found.");
        setClaims([]);
        setResult({ status: "⚠️", info: "No claims found for this news." });
        return;
      }

      console.log("all claims", data.claims);
      // Filter claims where at least one review has a rating of "true" or "correct"
      const allClaims = data.claims.map((claim, index) => `Claim ${index + 1}: ${claim.text}`);

      setClaims(allClaims);
      
      if (allClaims.length === 0) {
        setResult({ status: "⚠️", info: "No claims found." });
      } else {
        setResult({ status: "✅", info: "Claims retrieved successfully." });
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

  async function checkSimilarity(filteredClaims: string[]) {
    if (!filteredClaims.length) {
      console.error("No claims to compare.");
      return;
    }

    const BACKEND_URL = "http://127.0.0.1:8000/similarity"; // Flask API
    let similarityScores: number[] = []; // Array to store similarity scores

    try {
      for (const claim of filteredClaims) {
        const response = await fetch(BACKEND_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text1: userNews.trim(), // User-entered news
            text2: claim.trim(), // Claim from fact-check API
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

        console.log(`Similarity score for "${claim}":`, score);
      }

      // Find the max similarity score
      if (similarityScores.length > 0) {
        const maxSimilarity = Math.max(...similarityScores);

        setNewsResult(maxSimilarity);

        console.log("Maximum Similarity Score:", maxSimilarity);
      } else {
        console.log("No valid similarity scores found.");
      }
    } catch (error) {
      console.error("Error sending similarity request:", error);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col relative bg-white"
    >
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
            onClick={() => fetchFactCheck(userNews)}
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

          {newsResult !== null && (
            <div
              className={`p-6 rounded-lg text-white text-center shadow-lg transition-all ${
                newsResult > 0.7
                  ? "bg-gradient-to-r from-green-500 to-green-700"
                  : newsResult >= 0.5
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-700"
                  : "bg-gradient-to-r from-red-600 to-red-800"
              }`}
            >
              <div className="flex items-center justify-center mb-3">
                {newsResult > 0.7 ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-4xl">✅</span>
                    <h3 className="text-3xl font-bold">News Verified!</h3>
                  </div>
                ) : newsResult >= 0.5 ? (
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
                {newsResult > 0.7 ? (
                  <>
                    ✅ According to our model, there is a{" "}
                    <span className="font-semibold">
                      {(newsResult * 100).toFixed(2)}% chance
                    </span>{" "}
                    that this news is **TRUE**.
                  </>
                ) : newsResult >= 0.5 ? (
                  <>
                    ⚠️ This news has a{" "}
                    <span className="font-semibold text-gray-900">
                      {(newsResult * 100).toFixed(2)}% probability
                    </span>{" "}
                    of being true, but we recommend **checking other sources**
                    before trusting it.
                  </>
                ) : (
                  <>
                    🚨 Our model predicts a{" "}
                    <span className="font-semibold text-yellow-300">
                      {((1 - newsResult) * 100).toFixed(2)}% chance
                    </span>{" "}
                    that this news is **FAKE**. Be cautious before sharing!
                  </>
                )}
              </p>

              {newsResult > 0.7 ? (
                <button className="mt-4 bg-white text-green-700 px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition">
                  ✅ Share the Truth
                </button>
              ) : newsResult >= 0.5 ? (
                <button className="mt-4 bg-white text-yellow-800 px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition">
                  ⚠️ Read More from Trusted Sources
                </button>
              ) : (
                <button className="mt-4 bg-white text-red-700 px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition">
                  🚨 Report Misinformation
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VeriFactAI;
