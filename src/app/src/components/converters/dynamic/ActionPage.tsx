import React, { useEffect, useState } from "react";
import flower from "../../photos/flower.png";
import "./ActionPage.scss";
import { toast, ToastContainer } from "react-toastify";
import { BASE_API_URL } from "~/components/constants";
import { redirect } from "react-router-dom";
import Graph from "./outputPlacement/GraphComponent";
import Table from "./outputPlacement/TableComponent";
import TextOutput from "./outputPlacement/TextOutput";

interface Output {
  [key: string]: any;
}

const ActionPage = ({ output }) => {
  const [components, setComponents] = useState(output);
  const [outputCode, setOutputCode] = useState<Output | string>();
  const [outputFormat, setOutputFormat] = useState<string>("json");
  const [graphType, setGraphType] = useState<string>("bar");
  const [popup, setPopup] = useState(false);
  const [data, setData] = useState<{ [key: string]: any }>({});
  // const [graphData, setgraphData] = useState<Output | string>();

  const savedFormDataString = localStorage.getItem("formData");
  const savedFormData = savedFormDataString
    ? JSON.parse(savedFormDataString)
    : [];
  const [loadedData, setLoadedData] = useState(savedFormData);

  const setSelectedApp = (appId: string) => {
    fetch(`${BASE_API_URL}/appdata/set-selected-app`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        credentials: "include",
      },
      body: JSON.stringify({ selected_app: appId }),
    }).then((response) => {
      if (response.ok) {
        console.log("App selected successfully");
      } else {
        if (toast) {
          toast.error(
            "Error initializing the app - some features of the app may not function properly. Please refresh the page and try again."
          );
        }
      }
    });
  };

  useEffect(() => {
    setLoadedData(savedFormData);
    setSelectedApp("sandbox-" + savedFormData[0].title);

    // Initialize dropdowns with their first options
    const initialDropdownState = {};
    components.forEach((component) => {
      if (component.type === "dropdown" && component.optionsConfig) {
        initialDropdownState[component.id] = JSON.parse(
          component.optionsConfig
        ).values[0].trim();
      }
      if (component.type === "slider" && component.sliderConfig) {
        const sliderConfig = JSON.parse(component.sliderConfig);
        setData((prevData) => ({
          ...prevData,
          [component.id]: sliderConfig.value,
        }));
      }
    });
    setData((prevData) => ({
      ...prevData,
      ...initialDropdownState,
    }));
  }, []);

  const handleInputChange = (id: string, value: string) => {
    setData((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
  };

  const handleRun = async (code: string, data: { [key: string]: string }) => {
    try {
      const result = await eval(code);
      let vals = data;
      if (typeof result === "object") {
        for (const key in result) {
          vals[key] = result[key];
        }
        setData(vals);
      }
      console.log(vals);
      console.log(result);
      setOutputCode(vals);
      // setgraphData(result);
      // setOutputCode(result);
    } catch (error) {
      console.log(`Error: ${error}`);
      setOutputCode(`Error: ${error}`);
    }
  };

  const saveClick = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/dynamic-component/new`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: loadedData[0].title,
          description: loadedData[0].description,
          image_url: loadedData[0].image,
          component_definition: components,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      localStorage.removeItem("formData");
      localStorage.removeItem("components");
      setPopup(true);
      setTimeout(() => {
        setPopup(false);
        // redirect("/");
        window.location.href = "/";
      }, 5000);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const goBack = (components) => {
    // const queryParams = new URLSearchParams({
    //   components: JSON.stringify(components),
    // });

    // window.location.href = `/app/new?${queryParams}`;

    window.location.href = `/app/new`;
  };

  console.log(data);
  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg rounded-md flex flex-col gap-5 p-2 m-2 mt-3 md:m-5 md:p-5 lg:mt-8 lg:p-6 lg:mx-20 xl:mt-16 xl:mx-40 lg:p- xl:p-12">
      <ToastContainer />
      <div className="p-2 md:p-4 bg-gray-100">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-bold">
            Showing preview of {loadedData[0].title} App
          </h1>
          <button
            className="common-button px-4 py-2 text-white font-semibold bg-blue-500 rounded-md focus:bg-blue-600 focus:outline-none hover:bg-blue-600 hover:shadow-lg transition duration-300"
            onClick={() => goBack(components)}
          >
            <span className="absolute text-hover text-white font-medium mt-10 -ml-10 mr-2 md:mr-10 lg:-ml-20 px-2 bg-slate-500 p-1 rounded-md z-50">
              Return to edit the app
            </span>
            Back
          </button>
        </div>
        <ul className="whitespace-normal break-words lg:text-lg">
          {components.map((component, index) => (
            <li key={index} className="mb-4">
              {(component.placement === "input" || component.placement === "output")
                && (
                <div>
                  <label className="text-slate-500 font-semibold text-lg xl:text-xl">
                    {component.label}:
                  </label>
                </div>
              )}
              {component.type === "text" && (
                <input
                  className="w-full px-4  p-2 mt-1 border bg-slate-200 border-gray-300 rounded focus:outline-none"
                  type={component.type}
                  id={component.id}
                  value={data[component.id] || ""}
                  onChange={(e) =>
                    handleInputChange(component.id, e.target.value)
                  }
                />
              )}
              {component.type === "dropdown" && (
                <select
                  className="block w-full p-2 mt-1 border bg-slate-200 border-gray-300 rounded-md focus:outline-none"
                  id={component.id}
                  value={data[component.id]}
                  onChange={(e) =>
                    handleInputChange(component.id, e.target.value)
                  }
                >
                  {component.optionsConfig &&
                    JSON.parse(component.optionsConfig).values.map(
                      (option, idx) => (
                        <option key={idx} value={option.trim()}>
                          {option.trim()}
                        </option>
                      )
                    )}
                </select>
              )}
              {component.type === "radio" && (
                <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3">
                  {component.optionsConfig &&
                    JSON.parse(component.optionsConfig).values.map(
                      (option, idx) => {
                        const optionWidth = option.trim().length * 8 + 48;

                        return (
                          <div
                            key={idx}
                            className={`flex flex-shrink-0 items-center mr-2 md:mr-3 ${
                              optionWidth > 200 ? "overflow-x-auto md:h-8" : ""
                            } h-7 md:w-[12.4rem] lg:w-[15rem] xl:w-[14.1rem] relative`}
                          >
                            <input
                              type="radio"
                              id={`${component.id}_${idx}`}
                              name={component.id}
                              value={option.trim()}
                              checked={data[component.id] === option}
                              onChange={(e) =>
                                handleInputChange(component.id, e.target.value)
                              }
                              className="mr-2 absolute"
                              style={{
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            />
                            <label
                              htmlFor={`${component.id}_${idx}`}
                              className="whitespace-nowrap"
                              style={{ marginLeft: "1.5rem" }}
                            >
                              {option.trim()}
                            </label>
                          </div>
                        );
                      }
                    )}
                </div>
              )}
              {component.type === "checkbox" && (
                <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3">
                  {component.optionsConfig &&
                    JSON.parse(component.optionsConfig).values.map(
                      (option, idx) => {
                        const optionWidth = option.trim().length * 8 + 48;

                        return (
                          <div
                            key={idx}
                            className={`flex flex-shrink-0 items-center mr-2 md:mr-3 ${
                              optionWidth > 200 ? "overflow-x-auto md:h-8" : ""
                            } h-7 md:w-[10.75rem] lg:w-[12.75rem] xl:w-[14.75rem] relative`}
                          >
                            <input
                              type="checkbox"
                              id={`${component.id}_${idx}`}
                              checked={
                                data[component.id] &&
                                data[component.id].includes(option)
                              }
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const currentValue = data[component.id] || [];
                                const updatedValue = isChecked
                                  ? [...currentValue, option]
                                  : currentValue.filter(
                                      (item) => item !== option
                                    );
                                handleInputChange(component.id, updatedValue);
                              }}
                              className="mr-2 absolute"
                              style={{
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            />
                            <label
                              htmlFor={`${component.id}_${idx}`}
                              className="whitespace-nowrap"
                              style={{ marginLeft: "1.5rem" }}
                            >
                              {option.trim()}
                            </label>
                          </div>
                        );
                      }
                    )}
                </div>
              )}
              {component.type === "slider" && (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id={component.id}
                    className="w-full md:w-[60%] h-8"
                    name={component.label}
                    min={JSON.parse(component.sliderConfig).interval.min}
                    max={JSON.parse(component.sliderConfig).interval.max}
                    step={JSON.parse(component.sliderConfig).step}
                    value={
                      data[component.id] ||
                      JSON.parse(component.sliderConfig).value
                    }
                    onChange={(e) =>
                      handleInputChange(component.id, e.target.value)
                    }
                  />
                  <span className="font-semibold">
                    {data[component.id] ||
                      JSON.parse(component.sliderConfig).value}
                  </span>
                </div>
              )}
              {component.type === "button" && component.code && (
                <button
                  className="px-4 p-2 mt-2 font-semibold w-full md:w-auto text-white bg-red-500 border border-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring focus:border-red-700"
                  id={component.id}
                  onClick={() => handleRun(component.code!, data)}
                >
                  {component.label}
                </button>
              )}
            </li>
          ))}
        </ul>

        {components.map((component, index) => (
          <div key={index} className="mb-5">
            {component.placement === "output" && component.type === "text" && (
              <TextOutput data={data[component.id]} />
            )}
            {component.placement === "output" && component.type === "json" && (
              <pre className="overflow-auto w-full mt-2 px-4 py-2 bg-gray-100 overflow-x-auto  border border-gray-300 rounded-lg">
                {data[component.id]
                  ? `${component.id}: ${JSON.stringify(data[component.id], null, 2)}`
                  : "No output available for JSON."}
              </pre>
            )}
            {component.placement === "output" && component.type === "table" && (
              <Table data={data[component.id]} />
            )}
            {component.placement === "output" && component.type === "graph" && (
              <div>
                <Graph
                  output={data[component.id]}
                  configurations={component.config}
                  graphId={`graph-container-${component.id}`}
                />
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end">
          <button
            className="p-3 px-5 font-bold text-white bg-green-500 border border-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:border-green-700"
            onClick={saveClick}
          >
            Save
          </button>
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-bold">Execution log:</h2>
          {
            outputFormat === "json" ? (
              <pre className="overflow-auto w-full mt-2 px-4 py-2 bg-gray-100 overflow-x-auto  border border-gray-300 rounded-lg">
                {outputCode
                  ? JSON.stringify(outputCode, null, 2)
                  : "No output available for JSON."}
              </pre>
            ) : outputFormat === "table" ? (
              <Table data={outputCode} />
            ) : (
              <div></div>
            )
            // : null
          }
        </div>
      </div>

      {popup && (
        <div className="popupThanks flex flex-col justify-center items-center -ml-[1rem] md:-ml-[2.5rem] lg:-ml-[6.5rem] xl:-ml-[13rem] fixed bg-[#000000b3] top-0 w-[100vw] h-[100vh]">
          <div className="bg-white rounded-md font-serif p-1 py-8 md:p-2 md:w-[25rem] md:h-[20rem] lg:w-[30rem] xl:p-4 flex flex-col justify-center items-center">
            <img
              src={flower}
              alt="flowers"
              className="w-[3rem] md:w-[5rem]"
            ></img>
            <p className="text-2xl md:text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
              Congratulations!
            </p>
            <p className="lg:text-lg xl:text-xl text-[#85909B] text-center">
              Fantastic work! Your app has been created and submitted for
              review.
            </p>
            <p className="md:mt-2 text-green-600 text-lg lg:text-xl text-center">
              Keep innovating and sharing your creativity!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPage;
