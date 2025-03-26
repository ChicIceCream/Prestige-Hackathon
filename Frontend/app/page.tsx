import { useState } from "react";
import { motion } from "framer-motion";

const VeriFactAI = () => {
  const [newsText, setNewsText] =  useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Dummy news data (for now)
  const dummyNews = {
    "NASA successfully lands rover on Mars": {
      status: "real",
      info: "NASA's Perseverance rover landed on Mars in 2021 as part of its mission to search for signs of ancient life.",
    },
    "Government bans the internet for 6 months": {
      status: "fake",
      info: "This is a false claim. No such long-term internet ban has been issued by the government.",
    },
    "Scientists discover a new element named ‘Elonium’": {
      status: "fake",
      info: "This news is fake. No new element called 'Elonium' has been discovered.",
    },
    "Apple announces iPhone 15 Pro Max": {
      status: "real",
      info: "Apple officially launched the iPhone 15 Pro Max in 2023 with new features like a titanium body and improved cameras.",
    },
  };

  const analyzeNews = () => {
    setLoading(true);
    setTimeout(() => {
      if (dummyNews[newsText]) {
        setResult(dummyNews[newsText]);
      } else {
        setResult({ status: "unknown", info: "No data available. Please verify from trusted sources." });
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-gray-900 opacity-40 backdrop-blur-xl"></div>

      {/* Navbar */}
      <nav className="relative z-10 w-full px-6 py-4 text-white text-3xl font-bold shadow-md bg-black/40 backdrop-blur-lg">
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
            rows="3"
            placeholder="Enter news article headline..."
            value={newsText}
            onChange={(e) => setNewsText(e.target.value)}
          ></textarea>

          <button
            onClick={analyzeNews}
            className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg text-lg font-semibold shadow-md text-white"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Verify News"}
          </button>
        </motion.div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-white p-8 bg-black/40 backdrop-blur-lg rounded-lg m-4">
          <motion.h1
            className="text-5xl font-extrabold mb-4 text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            VeriFact AI - Fake News Detector
          </motion.h1>
          <p className="text-lg text-gray-300 text-center">
            Enter a news headline, and our AI will verify whether it's **real or fake**.
          </p>

          {result && (
            <div className={`mt-6 p-6 w-full text-center rounded-lg shadow-md ${result.status === "real" ? "bg-green-500" : result.status === "fake" ? "bg-red-500" : "bg-yellow-500"}`}>
              <h3 className="text-2xl font-bold">{result.status === "real" ? "✅ Real News" : result.status === "fake" ? "❌ Fake News" : "⚠️ Unknown"}</h3>
              <p className="text-lg mt-2">{result.info}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VeriFactAI;

