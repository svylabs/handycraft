import React, { useState, useEffect, useRef } from "react";
import ActionPage from "./ActionPage";
import trash from "../../photos/trash-can-regular.svg";
import arrow from "../../photos/angle-right-solid.svg";
import preview from "../../photos/eye-regular.svg";
import edit from "../../photos/pen-to-square-solid.svg";

const saveDataToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getDataFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

interface CustomComponent {
  id: string;
  label: string;
  type: string;
  placement: string;
  code?: string;
}

const ConfigureInputsOutputs: React.FC = () => {
  const [currentComponent, setCurrentComponent] = useState<CustomComponent>({
    id: "",
    label: "",
    type: "text",
    placement: "input",
    code: "",
  });
  const [components, setComponents] = useState<CustomComponent[]>([]);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number>(-1);

  useEffect(() => {
    const savedComponents = getDataFromLocalStorage("components");
    if (savedComponents && Array.isArray(savedComponents)) {
      setComponents(savedComponents);
    }
  }, []);
  
  

  const handleEditComponent = (index: number) => {
    setIsEditMode(true);
    setEditIndex(index);
    setCurrentComponent(components[index]);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
 
    if (((name === "placement") && (value === "action" || value === "output")) && currentComponent.type === "text") {
      setCurrentComponent((prevState) => ({
        ...prevState,
        [name]: value,
        type: "button",
      }));
    } else {
      setCurrentComponent((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  

  const handleAddComponent = () => {
    if (!currentComponent.id.trim() || !currentComponent.label.trim()) {
      alert("Please provide both ID and Label.");
      return;
    }
  
    if ((currentComponent.placement === "action" || currentComponent.placement === "output") && !currentComponent.code?.trim()) {
      alert("Please provide code for action/output placement.");
      return;
    }
  
    const updatedComponents = [...components];
    if (isEditMode && editIndex !== -1) {
      updatedComponents[editIndex] = currentComponent;
      setIsEditMode(false);
      setEditIndex(-1);
    } else {
      if (
        updatedComponents.some(
          (component) =>
            component.id.trim() === currentComponent.id.trim() &&
            updatedComponents.indexOf(component) !== editIndex
        )
      ) {
        alert(
          "Field with the same ID already exists. Please use a different ID."
        );
        return;
      }
      updatedComponents.push(currentComponent);
    }
  
    setComponents(updatedComponents);
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [currentComponent.id]: "",
    }));
  
    saveDataToLocalStorage("components", updatedComponents);
  
    setCurrentComponent({
      id: "",
      label: "",
      type: "text",
      placement: "input",
      code: "",
    });
  };
  

  const handlePreview = async () => {
    console.log(components);
    setShowOutput(true);
  };

  const handleInputChange = (id: string, value: string) => {
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [id]: value,
    }));
  };

  const handleDeleteComponent = (id: string) => {
    setComponents((prevComponents) =>
      prevComponents.filter((component) => component.id !== id)
    );
    setInputValues((prevInputValues) => {
      const updatedInputValues = { ...prevInputValues };
      delete updatedInputValues[id];
      return updatedInputValues;
    });
    saveDataToLocalStorage("components", components.filter((component) => component.id !== id));
  };
  

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const numbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    const numbers = numbersRef.current;

    const updateLineNumbers = () => {
      if (textarea && numbers) {
        const lines = textarea.value.split("\n").length;
        numbers.innerHTML = Array.from(
          { length: lines },
          (_, index) => index + 1
        ).join("<br>");
      }
    };

    if (textarea) {
      updateLineNumbers();
      textarea.addEventListener("input", updateLineNumbers);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener("input", updateLineNumbers);
      }
    };
  }, [currentComponent.type]);

  if (showOutput) {
    return <ActionPage output={components} />;
  }
  // console.log("Placement:", currentComponent.placement);
  // console.log("Type:", currentComponent.type);

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg rounded-md flex flex-col gap-5 p-2 m-2 mt-3 md:m-5 md:p-5 lg:mt-8 lg:p-6 lg:mx-20 xl:mt-16 xl:mx-40 lg:p- xl:p-12">
      <div className="p-1 md:p-4 bg-gray-100">
        <div className="flex gap-2 md:gap-8 lg:gap-12 border-b pb-5">
          <p className="flex gap-3 items-center text-[#414A53] text-lg xl:text-2xl">
            <span className="bg-[#31A05D] text-white p-1 px-3 md:px-3.5 rounded-full font-bold">
              1
            </span>
            Configure basic details
          </p>
          <img src={arrow} alt="arrow"></img>
          <p className="flex gap-3 items-center text-[#414A53] text-lg xl:text-2xl">
            <span className="bg-[#31A05D] text-white  p-1 px-3 md:px-3.5 rounded-full font-bold">
              2
            </span>
            Configure inputs / outputs
          </p>
        </div>

        <label className="block mb-2 mt-5 text-[#727679] font-semibold text-lg xl:text-xl">
        Placement:
        <select
          className="block w-full p-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none"
          name="placement"
          value={currentComponent.placement}
          onChange={handleChange}
        >
          <option value="input">Input</option>
          <option value="action">Action</option>
          <option value="output">Output</option>
        </select>
      </label>
      {currentComponent.placement === "input" && (
          <div>
            <label className="block mb-2 mt-5 text-[#727679] font-semibold text-lg xl:text-xl">
              Type:
              <select
                className="block w-full p-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none"
                name="type"
                value={currentComponent.type}
                onChange={handleChange}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="file">File</option>
              </select>
            </label>
          </div>
        )}

        {currentComponent.placement === "action" && (
          <div>
            <label className="block mb-2 mt-5 text-[#727679] font-semibold text-lg xl:text-xl">
              Type:
              <select
                className="block w-full p-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none"
                name="type"
                value={currentComponent.type}
                onChange={handleChange}
              >
                <option value="button">Button</option>
              </select>
            </label>
          </div>
        )}

        {currentComponent.placement === "output" && (
          <div>
            <label className="block mb-2 mt-5 text-[#727679] font-semibold text-lg xl:text-xl">
              Type:
              <select
                className="block w-full p-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none"
                name="type"
                value={currentComponent.type}
                onChange={handleChange}
              >
                <option value="text">Text</option>
                <option value="json">JSON</option>
                <option value="table">Table</option>
                <option value="graph">Graph</option>
              </select>
            </label>
          </div>
        )}

        <label className="block mb-2 text-[#727679] font-semibold text-lg xl:text-xl">
          Label:
          <input
            className="block w-full p-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none placeholder:italic placeholder:font-normal"
            type="text"
            name="label"
            value={currentComponent.label}
            onChange={handleChange}
            placeholder="Type label here.."
          />
        </label>

        <label className="block mb-2 text-[#727679] font-semibold text-lg xl:text-xl">
          ID:
          <input
            className="block w-full p-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none placeholder:italic placeholder:font-normal"
            type="text"
            name="id"
            value={currentComponent.id}
            onChange={handleChange}
            placeholder="Type ID here.."
          />
        </label>

        {(currentComponent.placement === "action" || currentComponent.placement === "output") && (
          <div>
            <label className="block mb-2 text-[#727679] font-semibold text-lg xl:text-xl">
              Code:
            </label>
            <div className="flex bg-gray-900 rounded-md p-2">
              <div
                className="px-2 text-gray-500"
                ref={numbersRef}
                style={{ whiteSpace: "pre-line", overflowY: "hidden" }}
              ></div>
              <textarea
                ref={textareaRef}
                className="flex-1 bg-gray-900 text-white outline-none"
                style={{ overflowY: "hidden" }}
                placeholder="Enter your JavaScript code here"
                cols={30}
                rows={10}
                name="code"
                value={currentComponent.code}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        )}

        <button
          className="block w-full md:w-60 font-bold mx-auto p-3 mt-4 text-white bg-blue-500 border border-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-700"
          onClick={handleAddComponent}
        >
          Add Field
        </button>

        <div className="md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto">
          <h2 className="mt-6 text-2xl font-bold">Added Fields:</h2>
          <ul>
            {components.map((component, index) => (
              <li key={index} className="mb-4">
                ID: {component.id}, Label: {component.label}, Type:{" "}
                {component.type}, Placement: {component.placement}
                {component.code && `, Code: ${component.code}`}
                <br />
                {component.type !== "button" && (
                  <div>
                    <div className="flex justify-between">
                      <label className="text-slate-500 font-semibold text-lg xl:text-xl">
                        {component.label}:
                      </label>
                      <div className="flex gap-3 md:gap-5">
                        <button onClick={() => handleEditComponent(index)}>
                          <img src={edit} alt="edit"></img>
                        </button>
                        <button
                          onClick={() => handleDeleteComponent(component.id)}
                        >
                          <img src={trash} alt="trash"></img>
                        </button>
                      </div>
                    </div>
                    <input
                      className="block w-full p-2 mt-1 border bg-slate-200 border-gray-300 rounded-md focus:outline-none"
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      type={component.type}
                      id={component.id}
                      value={inputValues[component.id]}
                      onChange={(e) =>
                        handleInputChange(component.id, e.target.value)
                      }
                    />
                  </div>
                )}
                {component.type === "button" && component.code && (
                  <div>
                    <div className="flex justify-between">
                      <label className="text-slate-500 font-semibold text-lg xl:text-xl">
                        {component.label}:
                      </label>
                      <div className="flex gap-3 md:gap-5">
                        <button onClick={() => handleEditComponent(index)}>
                          <img src={edit} alt="edit"></img>
                        </button>
                        <button
                          onClick={() => handleDeleteComponent(component.id)}
                        >
                          <img src={trash} alt="trash"></img>
                        </button>
                      </div>
                    </div>
                    <button
                      className="block p-2 w-full text-white bg-red-500 border border-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:border-red-700"
                      id={component.id}
                    >
                      {component.label}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex mt-5 justify-end">
          <button
            className="preview text-[#21262C] flex gap-3 bg-[#DBE3ED] rounded xl:text-xl p-3 px-4"
            onClick={handlePreview}
          >
            <img src={preview} alt="preview" className="self-center"></img>
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigureInputsOutputs;
