import React, { useState, useEffect, useRef } from "react";
import "./ConfigureBasicDetails.scss";
import arrow from "../../photos/angle-right-solid.svg";
import { Link } from "react-router-dom";
import { GITHUB_CLIENT_ID } from "~/components/constants";

const ConfigureBasicDetails: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    title: false,
  });
  const [userDetails, setUserDetails] = useState<string | null>(null);

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    console.log(userDetails)
    setUserDetails(userDetails);
  }, []);

  const handleSaveNext = () => {
    if (!title.trim()) {
      setFieldErrors({
        title: !title.trim(),
      });
      return;
    } else {
      localStorage.removeItem("formData");

      const data = { title, description };
      const existingData = localStorage.getItem("formData");
      const parsedExistingData = existingData ? JSON.parse(existingData) : [];
      localStorage.setItem(
        "formData",
        JSON.stringify([...parsedExistingData, data])
      );

      window.location.href =
        "/app/new";
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 md:p-10 xl:p-12 shadow-lg rounded-md">
      <div className="p-1 md:p-4 flex flex-col gap-5 bg-gray-100 rounded">
        {userDetails != null ? (
          <div className="p-1 md:p-4 flex flex-col gap-5">
            <div className="relative flex overflow-auto gap-8 border-b pb-5 items-center">
              <p className="flex gap-4 lg:gap-3 items-center text-[#414A53] lg:text-lg">
                <span className="bg-[#31A05D] text-white p-1 px-3 md:px-3.5 rounded-full font-bold">
                  1
                </span>
                Configure basic details
                <img className="w-5 h-5" src={arrow} alt="arrow"></img>
                <span className="absolute bottom-0 h-[2px] w-[8rem] lg:w-[11rem] xl:w-[15rem] bg-[#31A05D]"></span>
              </p>
              
              {/* <img className="w-6 h-6" src={arrow} alt="arrow"></img> */}
              <p className="flex gap-4 lg:gap-3 items-center text-[#414A53] lg:text-lg">
                <span className="bg-[#DADBE2]  p-1 px-3 md:px-3.5 rounded-full font-bold">
                  2
                </span>
                Configure the layout
                <img className="w-5 h-5" src={arrow} alt="arrow"></img>
              </p>
              <p className="flex gap-4 lg:gap-3 items-center text-[#414A53] lg:text-lg">
                <span className="bg-[#DADBE2]  p-1 px-3 md:px-3.5 rounded-full font-bold">
                  3
                </span>
                Preview the app
                <img className="w-5 h-5" src={arrow} alt="arrow"></img>
              </p>
              <p className="flex gap-4 lg:gap-3 items-center text-[#414A53] lg:text-lg">
                <span className="bg-[#DADBE2]  p-1 px-3 md:px-3.5 rounded-full font-bold">
                  4
                </span>
                Select Thumbnail
              </p>
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="title"
                className="text-[#727679] font-semibold text-lg xl:text-xl"
              >
                Title (Limit: 32 characters)
              </label>
              <input
                type="text"
                maxLength={32}
                className="focus:outline-none border border-[#E2E3E8] rounded-lg mt-1 p-3 px-4 bg-[#F7F8FB] xl:text-2xl text-[#21262C] placeholder:italic"
                placeholder="Enter app title.."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              ></input>
              {fieldErrors.title && (
                <p className="text-red-500 mt-2">Title is required.</p>
              )}
              <br></br>

              <label
                htmlFor="description"
                className="text-[#727679] font-semibold text-lg xl:text-xl"
              >
                Description
              </label>
              <textarea
                className="description focus:outline-none border border-[#E2E3E8] rounded-lg mt-1 bg-[#F7F8FB] xl:text-2xl text-[#21262C] resize-none placeholder:italic"
                placeholder="Enter app description.."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end">
              <Link to="#" onClick={handleSaveNext} className="mx-0">
                <button
                  className="cursor-pointer text-white bg-[#31A05D] rounded-md xl:text-xl p-2 md:p-3 md:px-5 font-semibold text-center"
                  type="submit"
                >
                  Next
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-3 py-5">
            <p className="text-[#727679] mb-4">
              You need to log in to create custom apps.
            </p>
            <a
              href={`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`}
              className="mx-auto md:mx-0"
            >
              <button
                className="cursor-pointer text-white bg-[#31A05D] rounded-md xl:text-xl p-2 md:p-3 md:px-5 font-semibold text-center"
                type="submit"
              >
                Login with GitHub
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigureBasicDetails;
