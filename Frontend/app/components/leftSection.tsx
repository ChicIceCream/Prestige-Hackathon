import { FaLink } from "react-icons/fa6";

export const LeftSection = () => {
    const sources = [
      {
        name: "BBC News",
        url: "https://www.bbc.com/news",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/BBC.svg/120px-BBC.svg.png",
        description:
          "BBC News provides unbiased global news coverage. It offers reliable and in-depth reports on current affairs, politics, business, and more.",
      },
      {
        name: "CNN",
        url: "https://www.cnn.com",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/CNN.svg/120px-CNN.svg.png",
        description:
          "CNN delivers breaking news updates and analysis from around the world, covering politics, business, health, and technology extensively.",
      },
      {
        name: "Reuters",
        url: "https://www.reuters.com",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Reuters_Logo.svg/120px-Reuters_Logo.svg.png",
        description:
          "Reuters is a trusted source for accurate and up-to-date business, financial, and global news, providing unbiased reporting.",
      },
    ];
  
    return (
      <div className="w-1/2 h-full bg-white flex flex-col justify-center items-center p-6">
        <h1 className="text-black text-3xl font-bold mb-6">Trusted Sources</h1>
        <ul className="w-full max-w-lg">
          {sources.map((source, index) => (
            <li
              key={index}
              className="flex items-start p-4 rounded-lg shadow-lg transition duration-300 "
            >
              <img src={source.logo} alt={source.name} className="w-10 h-10 mr-4 rounded-md" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{source.name}</h2>
                <p className="text-sm text-gray-600">{source.description}</p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center space-x-2 mt-2"
                >
                  <span>Visit Site</span>
                  <FaLink className="text-blue-500" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };