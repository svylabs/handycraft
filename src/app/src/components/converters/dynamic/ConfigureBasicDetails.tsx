import React, { useState, useEffect, useRef } from "react";
import pin from "../../photos/paperclip-solid.svg";
import ConfigureInputsOutputs from "./ConfigureInputsOutputs";
import "./ConfigureBasicDetails.scss";
import arrow from "../../photos/angle-right-solid.svg"

const ConfigureBasicDetails: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    title: false,
    image: false,
  });
  const [showNext, setShowNext] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
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
      const data = { title, description, image };
    const existingData = localStorage.getItem("formData");
    const parsedExistingData = existingData ? JSON.parse(existingData) : [];
    localStorage.setItem(
      "formData",
      JSON.stringify([...parsedExistingData, data])
    );

    const codeId = localStorage.getItem("codeId");
    const codeSets = localStorage.getItem("codeSets");
    const parsedQuestionSets = codeSets ? JSON.parse(codeSets) : [];
    const updatedSets = parsedQuestionSets.map((set) =>
      codeId !== null && set.id === codeId ? { ...set, title } : set
    );
    localStorage.setItem("codeSets", JSON.stringify(updatedSets));

      setShowNext(true);
    }
  };

  if (showNext) {
    return <ConfigureInputsOutputs />;
  }

  return (
    <div className="bg-gray-100 shadow-lg rounded-md">
        <div className="p-1 md:p-4 flex flex-col gap-5">
          <div className="flex gap-2 md:gap-8 lg:gap-12 border-b pb-5">
            <p className="flex gap-3 items-center text-[#414A53] text-lg xl:text-2xl">
              <span className="bg-[#31A05D] text-white p-1 px-3 md:px-3.5 rounded-full font-bold">
                1
              </span>
              Configure basic details
            </p>
            <img src={arrow} alt="arrow"></img>
            <p className="flex gap-3 items-center text-[#414A53] text-lg xl:text-2xl">
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
          <div className="flex flex-col md:flex-row mt-2 justify-between gap-5">
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
            </div>
            {fieldErrors.image && (
              <p className="md:hidden text-red-500 -mt-2">Image is required.</p>
            )}
            <button
              className="cursor-pointer text-white bg-[#31A05D] rounded-md xl:text-xl p-2 md:p-3 md:px-5 font-semibold text-center"
              onClick={handleSaveNext}
              type="submit"
            >
              Save & Next
            </button>
          </div>
          {fieldErrors.image && (
            <p className="hidden md:block text-red-500 -mt-2">
              Image is required.
            </p>
          )}
        </div>
    </div>
  );
};

export default ConfigureBasicDetails;
