import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.scss";
import { FiTrash2 } from "react-icons/fi";
import LoginSignupModal from "./LoginSignupModal";
import { BASE_API_URL } from "./constants";

interface Converter {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface DynamicComponent {
  created_on: string;
  approval_status: string;
  id: string;
  title: string;
  description: string;
  image_url: string;
  component_definition: any[];
}

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [dynamicComponents, setDynamicComponents] = useState<
    DynamicComponent[]
  >([]);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  useEffect(() => {
    const storedRecentTools = localStorage.getItem("recentTools");
    if (storedRecentTools) {
      setRecentTools(JSON.parse(storedRecentTools));
      setActiveCategory("recent");
    } else {
      setActiveCategory("all");
    }

    // Fetch dynamic components
    fetch(`${BASE_API_URL}/dynamic-component/all`)
      .then((response) => response.json())
      .then((data: DynamicComponent[]) => {
        setDynamicComponents(data);
      })
      .catch((error) => {
        console.error("Error fetching dynamic components:", error);
      });

    // Fetch user data
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/auth/user`, {
        credentials: "include",
      });
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const userData = await response.json();
          setUserName(userData.name || userData.login);
          setUserAvatar(userData.avatar_url);
          localStorage.setItem("userDetails", JSON.stringify(userData));
        } else {
          console.error("Response is not valid JSON");
        }
      } else {
        console.error("Failed to fetch user data:", response.status);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleImageClick = (componentDefinition: any) => {
    navigate(
      `/app/published/` + (componentDefinition.id || componentDefinition.title),
      {
        state: { output: componentDefinition },
      }
    );
  };

  const allConverters: Converter[] = [
    {
      id: "JSON ⇔ String",
      title: "JSON ⇄ String",
      description: "Converts JSON to String ",
      image: "./photos/json.jpg",
    },
    {
      id: "JSON Formatter",
      title: "Pretty JSON",
      description: "Pretty print a JSON",
      image: "./photos/pretty-json.png",
    },
    {
      id: "JSON Diff",
      title: "Compare JSON Structures",
      description: "Tool for highlighting differences in JSON objects.",
      image: "./photos/string-to-json.png",
    },
    {
      id: "Encoding ⇔ Decoding",
      title: "Encoding ⇄ Decoding",
      description: "Encode data in various formats",
      image: "./photos/base64-encode-decode.png",
    },
    {
      id: "Encode Image&File",
      title: "Base64 Image/File Encoding",
      description:
        "Convert images/file into Base64 encoding for efficient transmission and storage.",
      image: "./photos/image-base64.jpg",
    },
    {
      id: "ImageToPdf",
      title: "Image to PDF",
      description: "Convert multiple images to PDFs",
      image: "./photos/image-pdf.png",
    },
    {
      id: "Merge PDFs",
      title: "Merge PDFs",
      description: "Merge two or more PDFs into a single PDF",
      image: "./photos/merge-pdf.jpg",
    },
    {
      id: "Secure-Pdf",
      title: "Secure PDFs",
      description: "Protect your documents with password encryption.",
      image: "./photos/protected-pdf.png",
    },
    {
      id: "ECC-Tools",
      title: "Elliptic Curve Toolbox",
      description:
        "Tools for Elliptic Curve Cryptography, covering key generation, digital signature operations, and verification.",
      image: "./photos/ecc.png",
    },
    {
      id: "Cryptographic Hash",
      title: "Cryptographic Hash",
      description:
        "Tinker with SHA-256, SHA-3, and Poseidon: powerful tools for secure data hashing.",
      image: "./photos/crypto-hash.png",
    },
    {
      id: "BLS Signatures",
      title: "BLS Signatures",
      description:
        "Short and efficient digital signature scheme based on the BLS12-384 elliptic curve, offering BLS DSA and Schnorr variants.",
      image: "./photos/bls-signature.jpg",
    },
    {
      id: "Encryption ⇔ Decryption",
      title: "Encryption & Decryption",
      description: "Encrypt and decrypt data securely with AES128 and AES256.",
      image: "./photos/aes.jpg",
    },
    {
      id: "ECDH Key Sharing",
      title: "ECDH Key Sharing",
      description:
        "ECDH Key Sharing: Utilizes elliptic curve cryptography for secure key exchange, providing forward secrecy.",
      image: "./photos/ecdh.png",
    },
    {
      id: "Image Editor",
      title: "Image Editor Pro",
      description:
        "A user-friendly tool for editing and enhancing images with features like cropping, resizing, flipping, and more.",
      image: "./photos/image-editor.jpg",
    },
    {
      id: "New App",
      title: "Publish your own",
      description: "Pushlish your own app",
      image: "./photos/dynamic.svg",
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConverters, setFilteredConverters] = useState(allConverters);
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("recent");
  const categories = [
    "recent",
    "all",
    "json",
    "pdf",
    "base64",
    "cryptography",
    "image",
  ];
  const [customComponentCategory, setCustomComponentCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addToRecentTools = (toolId: string) => {
    const updatedRecentTools = [
      toolId,
      ...recentTools.filter((id) => id !== toolId),
    ];
    if (updatedRecentTools.length > 6) {
      updatedRecentTools.pop();
    }
    setRecentTools(updatedRecentTools);
    localStorage.setItem("recentTools", JSON.stringify(updatedRecentTools));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = allConverters.filter((converter) =>
      converter.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredConverters(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    let filteredConverters: Converter[] = [];
    switch (category) {
      case "recent":
        if (recentTools.length === 0) {
          filteredConverters = allConverters;
        } else {
          filteredConverters = recentTools
            .map((toolId) =>
              allConverters.find((converter) => converter.id === toolId)
            )
            .filter(Boolean) as Converter[];
        }
        break;
      case "all":
        filteredConverters = allConverters;
        break;
      case "base64":
        filteredConverters = allConverters.filter(
          (converter) =>
            converter.title.toLowerCase().includes("encoding") ||
            converter.title.toLowerCase().includes("base64")
        );
        break;
      case "cryptography":
        filteredConverters = allConverters.filter(
          (converter) =>
            converter.title.toLowerCase().includes("ecc") ||
            converter.title.toLowerCase().includes("cryptographic hash") ||
            converter.title.toLowerCase().includes("bls signatures") ||
            converter.title.toLowerCase().includes("encryption")
        );
        break;
      default:
        filteredConverters = allConverters.filter((converter) =>
          converter.title.toLowerCase().includes(category.toLowerCase())
        );
        break;
    }
    setFilteredConverters(filteredConverters);
  };

  const handleCreateComponents = (converter: Converter) => {
    addToRecentTools(converter.id);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const renderMobileCategoryDropdown = () => {
    return (
      <div className="relative">
        <button
          type="button"
          className="inline-flex items-center justify-center w-ful rounded-md gap-5 px-4 py-2 bg-gray-400 text-gray-800 hover:bg-blue-600 hover:text-white focus:outline-none"
          onClick={toggleMobileMenu}
        >
          {activeCategory === "recent"
            ? "Recently Used"
            : activeCategory.toUpperCase()}
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 14l-5-5h10l-5 5z" />
          </svg>
        </button>
        {isMobileMenuOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`${
                    activeCategory === category
                      ? "bg-blue-500 text-white"
                      : "text-gray-900"
                  } block px-4 py-2 text-sm w-full text-left`}
                  onClick={() => {
                    handleCategoryChange(category);
                    toggleMobileMenu();
                  }}
                >
                  {category === "recent"
                    ? "Recently Used"
                    : category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const capitalize = (str: string) => {
    if (str.length <= 4) return str.toUpperCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleCustomComponentCategoryChange = (category: string) => {
    setCustomComponentCategory(category);
  };

  // Filter custom components based on category
  let filteredCustomComponents: DynamicComponent[] = [];
  switch (customComponentCategory) {
    case "all":
      filteredCustomComponents = dynamicComponents;
      break;
    case "pending":
      filteredCustomComponents = dynamicComponents.filter(
        (component) => component.approval_status === "pending"
      );
      break;
    case "approved":
      filteredCustomComponents = dynamicComponents.filter(
        (component) => component.approval_status === "approved"
      );
      break;
    default:
      filteredCustomComponents = dynamicComponents;
      break;
  }

  // Render custom component category buttons
  const renderCustomComponentCategories = () => {
    return (
      <div className="flex gap-3 mb-4">
        {["all", "pending", "approved"].map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded ${
              customComponentCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            } hover:bg-blue-600 focus:outline-none`}
            onClick={() => handleCustomComponentCategoryChange(category)}
          >
            {category === "all"
              ? "All"
              : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="max-w-screen-xl mx-auto p-4 lg:px-8">
        <div className="sticky top-0 bg-white z-40 pb-3">
          <div className="flex flex-wrap md:justify-between mb-6">
            <div className="flex gap-5 items-center mx-auto md:mx-0">
              <img
                src="/microcraft.png"
                alt="Microcraft"
                className="w-10 h-10 lg:w-16 lg:h-16"
              />
              <h2 className="flex flex-col py-2 text-2xl md:text-3xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500">
                Microcraft
                <span className="text-xs md:text-3sm lg:text-base">
                  Apps you wish you had
                </span>
              </h2>
            </div>
            <div className="flex gap-3 self-center">
              {userName !== "" && (
                <div className="flex gap-3 self-center">
                  <img
                    className="w-12 h-12 rounded-full cursor-pointer transform hover:scale-110 shadow-lg"
                    src={userAvatar}
                    alt={userName}
                    onClick={handleLogin}
                  ></img>
                  <p className="hidden md:flex self-center text-[#092C4C] text-lg xl:text-xl">
                    <span className="font-bold">Hello!</span> {userName}
                  </p>
                </div>
              )}
              {userName === "" && (
                <div className="flex gap-3 self-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 shadow-lg">
                    <span className="text-gray-600" onClick={handleLogin}>
                      Avatar
                    </span>
                  </div>
                  <p className="hidden md:flex self-center text-[#092C4C] text-lg xl:text-xl">
                    <span className="font-bold">Hello!</span> Guest
                  </p>
                </div>
              )}
            </div>
          </div>
          <input
            type="text"
            className="focus:outline-none border border-[#E2E3E8] rounded-lg p-3 bg-[#F7F8FB] text-lg lg:text-xl placeholder-italic w-full mb-4"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <div className="md:hidden mb-4">{renderMobileCategoryDropdown()}</div>
          <div className="hidden md:flex justify-center space-x-4 mb-1">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded ${
                  activeCategory === category
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                } hover:bg-blue-600 focus:outline-none`}
                onClick={() => handleCategoryChange(category)}
              >
                {category === "recent"
                  ? "Recently Used"
                  : category.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {activeCategory === "recent" && (
          <div className="mb-6">
            {recentTools.length === 0 && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-2">
                  Recently Used Tools
                </h2>
                <div className="text-lg text-center text-gray-600">
                  No recently used tools.
                </div>
              </div>
            )}
            {recentTools.length > 0 && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-2">
                  Recently Used Apps
                </h2>
                <ul className="flex flex-wrap -mx-2">
                  {recentTools.map((toolId) => {
                    const tool = allConverters.find(
                      (converter) => converter.id === toolId
                    );
                    return (
                      <li
                        key={toolId}
                        className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-2 transform transition-transform hover:scale-105"
                      >
                        <div className="relative">
                          <button
                            className="absolute top-0 right-0 p-1 text-red-500 bg-white rounded-full hover:bg-gray-200 focus:outline-none"
                            onClick={() => {
                              const updatedTools = recentTools.filter(
                                (id) => id !== toolId
                              );
                              setRecentTools(updatedTools);
                              localStorage.setItem(
                                "recentTools",
                                JSON.stringify(updatedTools)
                              );
                            }}
                          >
                            <FiTrash2 />
                          </button>
                          <Link
                            to={`/app/inbuilt/${toolId}`}
                            onClick={() => addToRecentTools(toolId)}
                          >
                            <div className="flex flex-col justify-center items-center bg-white rounded-lg overflow-hidden p-4 shadow-md hover:shadow-lg">
                              <div className="home-image relative">
                                <img
                                  src={tool?.image}
                                  alt={tool?.title}
                                  className="w-full rounded container h-40 object-cover mb-2"
                                />
                                <div className="description h-40 flex flex-col rounded justify-center items-center p-2 hyphens-auto absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
                                  <span className="text-white">
                                    {tool?.description}
                                  </span>
                                </div>
                              </div>
                              <strong className="block text-lg font-bold mb-1">
                                {tool?.title}
                              </strong>
                            </div>
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <button
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                  onClick={() => {
                    setRecentTools([]);
                    localStorage.removeItem("recentTools");
                  }}
                >
                  Clear history
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            {activeCategory === "recent"
              ? "All Apps"
              : capitalize(activeCategory) + " Apps"}
          </h2>
          <ul className="flex flex-wrap -mx-2">
            {filteredConverters.map((converter) => (
              <li
                key={converter.id}
                className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-2 transform transition-transform hover:scale-105"
              >
                {converter.id === "Custom Components" ? (
                  <Link
                    to={`/app/inbuilt/${converter.id}`}
                    onClick={() => handleCreateComponents(converter)}
                  >
                    <div className="flex flex-col justify-center items-center bg-white rounded-lg overflow-hidden p-4 shadow-md hover:shadow-lg">
                      <div className="home-image relative">
                        <img
                          src={converter.image}
                          alt={`${converter.title} Icon`}
                          className="w-full rounded container h-40 object-cover mb-2"
                        />
                        <div className="description h-40 flex flex-col rounded justify-center items-center p-2 hyphens-auto absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white">
                            {converter.description}
                          </span>
                        </div>
                      </div>
                      <strong className="block text-lg font-bold mb-1">
                        {converter.title}
                      </strong>
                    </div>
                  </Link>
                ) : (
                  <Link
                    to={`/app/inbuilt/${converter.id}`}
                    onClick={() => addToRecentTools(converter.id)}
                  >
                    <div className="flex flex-col justify-center items-center bg-white rounded-lg overflow-hidden p-4 shadow-md hover:shadow-lg">
                      <div className="home-image relative">
                        <img
                          src={converter.image}
                          alt={`${converter.title} Icon`}
                          className="w-full rounded container h-40 object-cover mb-2"
                        />
                        <div className="description h-40 flex flex-col rounded justify-center items-center p-2 hyphens-auto absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white">
                            {converter.description}
                          </span>
                        </div>
                      </div>
                      <strong className="block text-lg font-bold mb-1">
                        {converter.title}
                      </strong>
                    </div>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            Community published apps
          </h2>
          {renderCustomComponentCategories()}
          {filteredCustomComponents.length === 0 ? (
            <div className="text-gray-600">None found.</div>
          ) : (
            <div className="flex flex-wrap -mx-2">
              {filteredCustomComponents.map((data, index) => (
                <div
                  key={index}
                  className={`common-button flex flex-col w-full md:w-[47.8%] lg:w-[31.6%] xl:w-[23.7%] justify-center items-center bg-white rounded-lg overflow-hidden p-4 shadow-md hover:shadow-lg transform transition-transform hover:scale-105 m-2 ${
                    data.approval_status === "pending"
                      ? "border border-dashed border-red-400"
                      : ""
                  }`}
                  onClick={() => handleImageClick(data)}
                >
                  <div className="home-image">
                    {data.image_url && (
                      <img
                        className="w-full rounded container h-40 object-cover mb-2"
                        src={data.image_url}
                        alt="image-thumbnail"
                      />
                    )}
                    <div className="description h-40 flex flex-col rounded justify-center items-center p-2 hyphens-auto absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
                      <span>{data.description}</span>
                    </div>
                  </div>
                  <p className="block text-lg font-bold mb-1">{data.title}</p>
                  {data.approval_status === "pending" && (
                    <span className="absolute text-hover text-red-500 text-center font-medium bg-black bg-opacity-50 p-2 rounded-md z-50 animate-puls">
                      ⚠️ Caution: Component under review. Use with care.
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isModalOpen && <LoginSignupModal closeModal={closeModal} />}
    </>
  );
};

export default Home;
