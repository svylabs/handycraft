import React, { useEffect, useState } from "react";
import "./ActionPage.scss";
import Graph from "./outputPlacement/GraphComponent";
import Table from "./outputPlacement/TableComponent";
import TextOutput from "./outputPlacement/TextOutput";
import { redirect, useLocation, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { BASE_API_URL } from "~/components/constants";

interface Output {
  [key: string]: any;
}

const UserActionPage = () => {
  const location = useLocation();
  const { appId } = useParams<{ appId: string; title?: string }>();
  const [output, setOutput] = useState<any>(location?.state?.output || {});
  const [components, setComponents] = useState(
    output?.component_definition || []
  );
  const [data, setData] = useState<{ [key: string]: any }>({});
  const [outputCode, setOutputCode] = useState<Output | string>();
  // const [feedback, setFeedback] = useState(false);

  const savedFormDataString = localStorage.getItem("formData");
  const savedFormData = savedFormDataString
    ? JSON.parse(savedFormDataString)
    : [];
  const [loadedData, setLoadedData] = useState(savedFormData);

  const isAuthenticated = () => {
    if (localStorage.getItem("userDetails")) {
      return true;
    }
    return false;
  };

  const setSelectedApp = (appId: string | undefined) => {
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
    if (components.length === 0) {
      fetch(`${BASE_API_URL}/dynamic-component/${appId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Component detail: ", data);
          setComponents(data.component_definition || []);
          setOutput(data);
          if (data.is_authentication_required) {
            if (isAuthenticated()) {
              setSelectedApp(appId);
            } else {
              toast.error(
                "Some features of this app may work only if you are logged into the platform."
              );
            }
          }
        });
    }
  }, []);

  const handleInputChange = (id: string, value: string) => {
    setData((prevInputValues) => ({
      ...prevInputValues,
      [id]: value,
    }));
  };

  const handleRun = async (
    code: string,
    inputValues: { [key: string]: string }
  ) => {
    try {
      const result = await eval(code);
      let vals = data;
      if (typeof result === "object") {
        for (const key in result) {
          vals[key] = result[key];
        }
        setData(vals);
      }
      console.log(result);
      setOutputCode(vals);
      // setOutputCode(result);
    } catch (error) {
      console.log(`Error: ${error}`);
      setOutputCode(`Error: ${error}`);
    }
  };

  const goBack = () => {
    // setFeedback(true);
    window.location.href = "/";
  };

  // function submitFeedback() {
  //   setFeedback(false);
  //   window.location.href = "/";
  // }

  return (
    <div className="image-pdf p-4 xl:py-10 min-h-[100vh] flex flex-col">
      <ToastContainer />
      <h1 className="text-xl md:text-3xl font-bold py-2 mx-auto bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-purple-600">
        {output.title || appId}
      </h1>
      <div className=" bg-gray-100 shadow-lg rounded-md flex flex-col gap-5 p-2 pt-3 md:p-3 lg:pt-8 lg:p-6 lg:mx-20 xl:mx-40">
        {(output.approval_status || "pending") === "pending" && (
          <div className="bg-yellow-200 text-yellow-800 p-2 rounded-md md:text-sm flex justify-center items-center animate-pulse">
            <p>
              <span className="font-bold text-lg mr-2">⚠️ Caution:</span>
              This tool is currently under review. Proceed with caution.
            </p>
          </div>
        )}
        <div className="px-2 md:p- text-wrap">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
            <h1 className="font-semibold md:text-xl hidden md:block">
              {output.title || appId}
            </h1>
            <button
              className="common-button px-4 py-2 text-white font-semibold bg-blue-500 rounded-md focus:bg-blue-600 focus:outline-none hover:bg-blue-600 hover:shadow-lg transition duration-300 self-end md:self-auto"
              onClick={goBack}
            >
              <span className="absolute text-hover text-white font-medium mt-10 -ml-14 px-2 md:-ml-11 bg-slate-500 p-1 rounded-md z-50">
                Back To Home
              </span>
              Back
            </button>
            <h1 className="block md:hidden font-semibold text-lg mt-2">
              {output.title || appId}
            </h1>
          </div>
          <ul className="whitespace-normal break-words">
            {components.map((component, index) => (
              <li key={index} className="mb-4">
                ID: {component.id}, Label: {component.label}, Type:{" "}
                {component.type}, Placement: {component.placement}
                {component.config && `, Config: ${component.config}`}
                {component.optionsConfig &&
                  `, optionsConfig: ${component.optionsConfig}`}
                {component.code && `, Code: ${component.code}`}
                <br />
                {(component.type === "text" ||
                  component.type === "number" ||
                  component.type === "file" ||
                  component.type === "table" ||
                  component.type === "json" ||
                  component.type === "graph") && (
                  <div>
                    <label className="text-slate-500 font-semibold text-lg xl:text-xl">
                      {component.label}:
                    </label>
                    <input
                      className="w-full px-4  p-2 mt-1 border bg-slate-200 border-gray-300 rounded focus:outline-none"
                      type={component.type}
                      id={component.id}
                      value={data[component.id] || ""}
                      onChange={(e) =>
                        handleInputChange(component.id, e.target.value)
                      }
                    />
                  </div>
                )}
                {component.type === "dropdown" && (
                  <select
                    className="block w-full p-2 mt-1 border bg-slate-200 border-gray-300 rounded-md focus:outline-none"
                    id={component.id}
                    value={data[component.id] || ""}
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
                  <div className="flex flex-col gap-2">
                    {component.optionsConfig &&
                      JSON.parse(component.optionsConfig).values.map(
                        (option, idx) => (
                          <div key={idx} className="flex items-center">
                            <input
                              type="radio"
                              id={`${component.id}_${idx}`}
                              name={component.id}
                              value={option.trim()}
                              checked={data[component.id] === option}
                              onChange={(e) =>
                                handleInputChange(component.id, e.target.value)
                              }
                              className="mr-2"
                            />
                            <label htmlFor={`${component.id}_${idx}`}>
                              {option.trim()}
                            </label>
                          </div>
                        )
                      )}
                  </div>
                )}
                {component.type === "checkbox" && (
                  <div className="flex flex-col gap-2">
                    {component.optionsConfig &&
                      JSON.parse(component.optionsConfig).values.map(
                        (option, idx) => (
                          <div key={idx} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`${component.id}_${idx}`}
                              name={component.id}
                              value={option.trim()}
                              onChange={(e) =>
                                handleInputChange(component.id, e.target.value)
                              }
                              className="mr-2"
                            />
                            <label htmlFor={`${component.id}_${idx}`}>
                              {option.trim()}
                            </label>
                          </div>
                        )
                      )}
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
            <div key={index}>
              {component.placement === "output" &&
                component.type === "text" && (
                  <TextOutput data={data[component.id]} />
                )}
              {component.placement === "output" &&
                component.type === "json" && (
                  <pre className="overflow-auto w-full mt-2 px-4 py-2 bg-gray-100 overflow-x-auto  border border-gray-300 rounded-lg">
                    {data[component.id]
                      ? `${component.id}: ${JSON.stringify(data[component.id], null, 2)}`
                      : "No output available for JSON"}
                  </pre>
                )}
              {component.placement === "output" &&
                component.type === "table" && (
                  <Table data={data[component.id]} />
                )}
              {component.placement === "output" &&
                component.type === "graph" && (
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
        </div>

        {/* {feedback && (
        <div className="flex flex-col justify-center items-center -ml-[1rem] md:-ml-[2.5rem] lg:-ml-[6.5rem] xl:-ml-[11.5rem] fixed bg-[#000000b3] top-0 w-[100vw] h-[100vh]">
          <div className="bg-white rounded-md font-serif p-1 py-8 md:p-2 xl:p-4 flex flex-col justify-center items-center w-[20rem] md:w-[25rem] md:h-[20rem] lg:w-[30rem] lg:p-6 xl:w-[36rem] gap-3">
            <h2 className="text-xl md:text-2xl xl:text-3xl text-[#589c36] text-center">
              What is your level of satisfaction with this tool app?
            </h2>
            <p className="text-[#85909B] xl:text-xl text-center">
              This will help us improve your experience.
            </p>
            <label className="flex gap-5 md:mt-1 text-4xl md:text-5xl lg:text-6xl lg:gap-6 text-[#85909B] mx-5 xl:mx-10">
              <button onClick={submitFeedback}>
                &#128545;
                <span className="text-lg md:text-xl xl:text-2xl text-red-600">
                  Unhappy
                </span>
              </button>
              <button onClick={submitFeedback}>
                &#128528;
                <span className="text-lg md:text-xl xl:text-2xl text-yellow-500">
                  Neutral
                </span>
              </button>
              <button onClick={submitFeedback}>
                &#128525;
                <span className="text-lg md:text-xl xl:text-2xl text-green-600">
                  Satisfied
                </span>
              </button>
            </label>
          </div>
        </div>
      )} */}
      </div>
    </div>
  );
};

export default UserActionPage;
