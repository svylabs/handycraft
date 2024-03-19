import React, { useState, useEffect, useRef } from "react";
import pin from "../../photos/paperclip-solid.svg";
import "./ConfigureBasicDetails.scss";
import arrow from "../../photos/angle-right-solid.svg";
import { Link } from "react-router-dom";

const ConfigureBasicDetails: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    title: false,
    image: false,
  });
  const [userDetails, setUserDetails] = useState<string | null>(null);

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    console.log(userDetails)
    setUserDetails(userDetails);
  }, []);

  // const getCookie = (name: string) => {
  //   const cookies = document.cookie.split(";");
  //   for (const cookie of cookies) {
  //     const [cookieName, cookieValue] = cookie.trim().split("=");
  //     if (cookieName === name) {
  //       return decodeURIComponent(cookieValue);
  //     }
  //   }
  //   return null;
  // };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
        setImageName(file.name);
      }
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNext = () => {
    if (!title.trim() || !image.trim()) {
      setFieldErrors({
        title: !title.trim(),
        image: !image.trim(),
      });
      return;
    } else {
      localStorage.removeItem("formData");

      const data = { title, description, image };
      const existingData = localStorage.getItem("formData");
      const parsedExistingData = existingData ? JSON.parse(existingData) : [];
      localStorage.setItem(
        "formData",
        JSON.stringify([...parsedExistingData, data])
      );

      window.location.href =
        "/converter/configure/configureDetails/configureInputOutput";
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 md:p-10 xl:p-12 shadow-lg rounded-md">
      <div className="p-1 md:p-4 flex flex-col gap-5 bg-gray-100">
        {userDetails != null ? (
          <div className="p-1 md:p-4 flex flex-col gap-5">
            <div className="flex gap-2 md:gap-8 lg:gap-12 border-b pb-5">
              <p className="flex gap-3 items-center text-[#414A53] md:text-lg xl:text-2xl">
                <span className="bg-[#31A05D] text-white p-1 px-3 md:px-3.5 rounded-full font-bold">
                  1
                </span>
                Configure basic details
              </p>
              <img src={arrow} alt="arrow"></img>
              <p className="flex gap-3 items-center text-[#414A53] md:text-lg xl:text-2xl">
                <span className="bg-[#DADBE2]  p-1 px-3 md:px-3.5 rounded-full font-bold">
                  2
                </span>
                Configure inputs / outputs
              </p>
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="title"
                className="text-[#727679] font-semibold text-lg xl:text-xl"
              >
                Components Title (Limit: 22 characters)
              </label>
              <input
                type="text"
                maxLength={22}
                className="focus:outline-none border border-[#E2E3E8] rounded-lg mt-1 p-3 px-4 bg-[#F7F8FB] xl:text-2xl text-[#21262C] placeholder:italic"
                placeholder="Enter components title.."
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
                Components Description
              </label>
              <textarea
                className="description focus:outline-none border border-[#E2E3E8] rounded-lg mt-1 bg-[#F7F8FB] xl:text-2xl text-[#21262C] resize-none placeholder:italic"
                placeholder="Enter components description.."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="flex flex-col md:flex-row mt-2 justify-between gap-5 mb-3 md:mb-1">
              <div className="flex md:gap-5 justify-between">
                <p className="file-upload flex justify-center p-2 md:p-3 rounded-md gap-3 xl:text-lg cursor-pointer">
                  <img
                    src={pin}
                    alt="pin"
                    className="object-scale-down self-center lg:w-6 lg:h-7"
                  ></img>
                  <span className="text-[#2E4055] font-medium self-center ">
                    Attach file
                  </span>
                  <input
                    type="file"
                    className="w-40"
                    onChange={handleImageUpload}
                  ></input>
                </p>
                <p className="text-[#727679] self-center md:text-lg">
                  Choose Thumbnail
                </p>

                <p className="hidden md:block text-[#727679] self-center md:text-lg">
                  {imageName && <span>{imageName}</span>}
                </p>
              </div>

              <p className="md:hidden text-[#727679] self-center md:text-lg">
                {imageName && <span>{imageName}</span>}
              </p>
              {fieldErrors.image && (
                <p className="md:hidden text-red-500 -mt-2">
                  Image is required.
                </p>
              )}
              <Link to="#" onClick={handleSaveNext} className="mx-auto md:mx-0">
                <button
                  className="cursor-pointer text-white bg-[#31A05D] rounded-md xl:text-xl p-2 md:p-3 md:px-5 font-semibold text-center"
                  type="submit"
                >
                  Save & Next
                </button>
              </Link>
            </div>
            {fieldErrors.image && (
              <p className="hidden md:block text-red-500 -mt-2">
                Image is required.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-3 py-5">
            <p className="text-[#727679] mb-4">
              You need to log in to create custom components.
            </p>
            <a
              href="https://github.com/login/oauth/authorize?client_id=585042cc21ce245f7c54"
              className="mx-auto md:mx-0"
            >
              <button
                className="cursor-pointer text-white bg-[#31A05D] rounded-md xl:text-xl p-2 md:p-3 md:px-5 font-semibold text-center"
                type="submit"
              >
                Log in with GitHub
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigureBasicDetails;
