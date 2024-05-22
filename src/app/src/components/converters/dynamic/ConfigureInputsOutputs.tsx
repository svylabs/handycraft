import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import trash from "../../photos/trash-can-regular.svg";
import arrow from "../../photos/angle-right-solid.svg";
import preview from "../../photos/eye-regular.svg";
import edit from "../../photos/pen-to-square-solid.svg";
import Wallet from "./Web3/DropdownConnectedWallet";
import FormField from './FormField';

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
  config?: any;
  inputConfig?: any;
  optionsConfig?: any;
  sliderConfig?: any;
  walletConfig?: any;
  events?: Event[] | undefined;
}

interface Event {
  event: string;
  eventsCode: string;
}

const ConfigureInputsOutputs: React.FC = () => {
  const [currentComponent, setCurrentComponent] = useState<CustomComponent>({
    id: "",
    label: "",
    // type: "text",
    type: "",
    placement: "input",
    code: "",
    config: "",
    inputConfig: "",
    optionsConfig: "",
    sliderConfig: "",
    walletConfig: "",
    events: [],
  });
  const [components, setComponents] = useState<CustomComponent[]>([]);
  const draggingPos = useRef<number | null>(null);
  const dragOverPos = useRef<number | null>(null);
  const [data, setData] = useState<{ [key: string]: any }>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<string>("");
  const [eventCode, setEventCode] = useState<string>("");
  const [graphConfig, setGraphConfig] = useState<any>({
    graphTitle: "Enter Graph Title",
    graphType: "bar/line",
    size: {
      width: 500,
      height: 400,
    },
    axis: {
      xAxis: {
        titleX: "Enter X-axis Title",
      },
      yAxis: {
        titleY: "Enter Y-axis Title",
      },
    },
    message:
      "Please fill in the required information to generate your graph. Choose between bar or line graph.",
  });

  const [inputConfig, setInputConfig] = useState<any>({
    color: "", 
    backgroundColor: "",
    fontSize: "", 
    padding: "",
    margin: "",
    // color: "#000000", 
    // backgroundColor: "#FFFFFF",
    // fontSize: "16px", 
    // padding: "8px", 
    // borderColor: "#CCCCCC", 
    // borderWidth: "1px", 
    // borderRadius: "4px",
    // fontFamily: "Arial, sans-serif",
    // fontWeight: "normal",
    // textAlign: "left",
    // cursor: "auto",
    // overflow: "visible",
  });

  const [optionsConfig, setOptionsConfig] = useState<any>({
    message:
      "Please enter options separated by commas. Do not add a comma after the last option.",
    values: ["text1"],
  });

  const [sliderConfig, setSliderConfig] = useState<any>({
    message:
      "Please specify the range of values. You can customize the minimum, maximum, value and step values below.",
    interval: {
      min: 1,
      max: 100,
    },
    value: 50,
    step: 1,
  });

  const [walletConfig, setWalletConfig] = useState<any>({
    message:
      "Welcome to your wallet configuration settings! Please fill in the following details to customize your experience.",
    network: {
      type: "mina | ethereum | keplr",
      config: {
        rpcUrl: "",
        chainId: "",
        exploreUrl: "(optional)",
      },
    },
  });

  useEffect(() => {
    const savedComponents = getDataFromLocalStorage("components");
    if (savedComponents && Array.isArray(savedComponents)) {
      setComponents(savedComponents);
    }
  }, []);

  const handleDragStart = (position: number) => {
    draggingPos.current = position;
  };

  const handleDragEnter = (position: number) => {
    dragOverPos.current = position;
    const newItems = [...components];
    const draggingItem = newItems[draggingPos.current!];
    if (!draggingItem) return;

    newItems.splice(draggingPos.current!, 1);
    newItems.splice(dragOverPos.current!, 0, draggingItem);

    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    draggingPos.current = position;
    dragOverPos.current = null;

    setComponents(reorderedItems);
    saveDataToLocalStorage("components", reorderedItems);
  };

  const handleEditComponent = (index: number) => {
    setIsEditMode(true);
    setEditIndex(index);
    setCurrentComponent({
      ...components[index],
      config: components[index].config || JSON.stringify(graphConfig, null, 2),
      inputConfig:
        components[index].inputConfig || JSON.stringify(inputConfig, null, 2),
      optionsConfig:
        components[index].optionsConfig ||
        JSON.stringify(optionsConfig, null, 2),
      sliderConfig:
        components[index].sliderConfig || JSON.stringify(sliderConfig, null, 2),
      walletConfig:
        components[index].walletConfig || JSON.stringify(walletConfig, null, 2),
      // events: components[index].events || [],
    });
    setEvents(components[index].events || []);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (
      name === "placement" &&
      (value === "action" || value === "output") &&
      currentComponent.type === "text"
    ) {
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

  // const handleAddComponent = () => {
  //   if (!currentComponent.id.trim() || !currentComponent.label.trim()) {
  //     toast.error("Please provide both ID and Label.");
  //     return;
  //   }

  //   if (
  //     currentComponent.placement === "action" &&
  //     !currentComponent.code?.trim()
  //   ) {
  //     toast.error("Please provide code for action placement.");
  //     return;
  //   }

  //   const updatedComponents = [...components];

  //   if (isEditMode && editIndex !== -1) {
  //     updatedComponents[editIndex] = {
  //       ...currentComponent,
  //       config:
  //         currentComponent.placement === "output" &&
  //         currentComponent.type === "graph"
  //           ? currentComponent.config || JSON.stringify(graphConfig, null, 2)
  //           : "",
  // inputConfig:
  //         (currentComponent.placement === "input" || currentComponent.placement === "action") &&
  //         (currentComponent.type === "text" ||
  //           currentComponent.type === "number" ||
  //           currentComponent.type === "file" ||
  //           currentComponent.type === "button")
  //           ? currentComponent.inputConfig ||
  //             JSON.stringify(inputConfig, null, 2)
  //           : "",
  //       optionsConfig:
  //         currentComponent.placement === "input" &&
  //         (currentComponent.type === "dropdown" ||
  //           currentComponent.type === "radio" ||
  //           currentComponent.type === "checkbox")
  //           ? currentComponent.optionsConfig ||
  //             JSON.stringify(optionsConfig, null, 2)
  //           : "",
  //       sliderConfig:
  //         currentComponent.placement === "input" &&
  //         currentComponent.type === "slider"
  //           ? currentComponent.sliderConfig ||
  //             JSON.stringify(sliderConfig, null, 2)
  //           : "",
  //       walletConfig:
  //         currentComponent.placement === "input" &&
  //         currentComponent.type === "walletDropdown"
  //           ? currentComponent.walletConfig ||
  //             JSON.stringify(walletConfig, null, 2)
  //           : "",
  //       events: [...events],
  //     };
  //     setIsEditMode(false);
  //     setEditIndex(-1);
  //   } else {
  //     if (
  //       updatedComponents.some(
  //         (component) =>
  //           component.id.trim() === currentComponent.id.trim() &&
  //           updatedComponents.indexOf(component) !== editIndex
  //       )
  //     ) {
  //       toast.error(
  //         "Field with the same ID already exists. Please use a different ID."
  //       );
  //       return;
  //     }
  //     updatedComponents.push({
  //       ...currentComponent,
  //       config:
  //         currentComponent.placement === "output" &&
  //         currentComponent.type === "graph"
  //           ? currentComponent.config || JSON.stringify(graphConfig, null, 2)
  //           : "",
  // inputConfig:
  //         (currentComponent.placement === "input" || currentComponent.placement === "action") &&
  //         (currentComponent.type === "text" ||
  //           currentComponent.type === "number" ||
  //           currentComponent.type === "file" ||
  //           currentComponent.type === "button")
  //           ? currentComponent.inputConfig ||
  //             JSON.stringify(inputConfig, null, 2)
  //           : "",
  //       optionsConfig:
  //         currentComponent.placement === "input" &&
  //         (currentComponent.type === "dropdown" ||
  //           currentComponent.type === "radio" ||
  //           currentComponent.type === "checkbox")
  //           ? currentComponent.optionsConfig ||
  //             JSON.stringify(optionsConfig, null, 2)
  //           : "",
  //       sliderConfig:
  //         currentComponent.placement === "input" &&
  //         currentComponent.type === "slider"
  //           ? currentComponent.sliderConfig ||
  //             JSON.stringify(sliderConfig, null, 2)
  //           : "",

  //       walletConfig:
  //         currentComponent.placement === "input" &&
  //         currentComponent.type === "walletDropdown"
  //           ? currentComponent.walletConfig ||
  //             JSON.stringify(walletConfig, null, 2)
  //           : "",
  //       events: [...events],
  //     });
  //   }

  //   setComponents(updatedComponents);

  //   setData((prevInputValues) => ({
  //     ...prevInputValues,
  //     [currentComponent.id]: "",
  //   }));
  //   setEvents([]);

  //   saveDataToLocalStorage("components", updatedComponents);

  //   setCurrentComponent({
  //     id: "",
  //     label: "",
  //     type: "text",
  //     placement: "input",
  //     code: "",
  //     config: "",
  //     inputConfig: "",
  //     optionsConfig: "",
  //     sliderConfig: "",
  //     walletConfig: "",
  //   });
  // };

  const handleAddComponent = () => {
    if (!currentComponent.id.trim() || !currentComponent.label.trim()) {
      toast.error("Please provide both ID and Label.");
      return;
    }

    if (
      currentComponent.placement === "action" &&
      !currentComponent.code?.trim()
    ) {
      toast.error("Please provide code for action placement.");
      return;
    }

    const updatedComponents = [...components];
    const existingIndex = updatedComponents.findIndex(
      (component) =>
        component.id.trim() === currentComponent.id.trim() &&
        component.label.trim() === currentComponent.label.trim()
    );

    if (existingIndex !== -1) {
      // Update existing field
      updatedComponents[existingIndex] = {
        ...currentComponent,
        config:
          currentComponent.placement === "output" &&
          currentComponent.type === "graph"
            ? currentComponent.config || JSON.stringify(graphConfig, null, 2)
            : "",
        inputConfig:
          (currentComponent.placement === "input" || currentComponent.placement === "action") &&
          (currentComponent.type === "text" ||
            currentComponent.type === "number" ||
            currentComponent.type === "file" ||
            currentComponent.type === "button")
            ? currentComponent.inputConfig ||
              JSON.stringify(inputConfig, null, 2)
            : "",
        optionsConfig:
          currentComponent.placement === "input" &&
          (currentComponent.type === "dropdown" ||
            currentComponent.type === "radio" ||
            currentComponent.type === "checkbox")
            ? currentComponent.optionsConfig ||
              JSON.stringify(optionsConfig, null, 2)
            : "",
        sliderConfig:
          currentComponent.placement === "input" &&
          currentComponent.type === "slider"
            ? currentComponent.sliderConfig ||
              JSON.stringify(sliderConfig, null, 2)
            : "",
        walletConfig:
          currentComponent.placement === "input" &&
          currentComponent.type === "walletDropdown"
            ? currentComponent.walletConfig ||
              JSON.stringify(walletConfig, null, 2)
            : "",
        events: [...events],
      };
    } else {
      // Add new field
      updatedComponents.push({
        ...currentComponent,
        config:
          currentComponent.placement === "output" &&
          currentComponent.type === "graph"
            ? currentComponent.config || JSON.stringify(graphConfig, null, 2)
            : "",
        inputConfig:
        (currentComponent.placement === "input" || currentComponent.placement === "action") &&
          (currentComponent.type === "text" ||
            currentComponent.type === "number" ||
            currentComponent.type === "file" ||
            currentComponent.type === "button")
            ? currentComponent.inputConfig ||
              JSON.stringify(inputConfig, null, 2)
            : "",
        optionsConfig:
          currentComponent.placement === "input" &&
          (currentComponent.type === "dropdown" ||
            currentComponent.type === "radio" ||
            currentComponent.type === "checkbox")
            ? currentComponent.optionsConfig ||
              JSON.stringify(optionsConfig, null, 2)
            : "",
        sliderConfig:
          currentComponent.placement === "input" &&
          currentComponent.type === "slider"
            ? currentComponent.sliderConfig ||
              JSON.stringify(sliderConfig, null, 2)
            : "",
        walletConfig:
          currentComponent.placement === "input" &&
          currentComponent.type === "walletDropdown"
            ? currentComponent.walletConfig ||
              JSON.stringify(walletConfig, null, 2)
            : "",
        events: [...events],
      });
    }

    setComponents(updatedComponents);
    setData((prevInputValues) => ({
      ...prevInputValues,
      [currentComponent.id]: "",
    }));
    setEvents([]);
    saveDataToLocalStorage("components", updatedComponents);

    setCurrentComponent({
      id: "",
      label: "",
      type: "text",
      placement: "input",
      code: "",
      config: "",
      inputConfig: "",
      optionsConfig: "",
      sliderConfig: "",
      walletConfig: "",
    });
  };

  const handlePreview = async () => {
    console.log(components);
    window.location.href = "/app/new/preview";
  };

  // const handleInputChange = (id: string, value: string) => {
  const handleInputChange = (id: string, value: any) => {
    setData((prevInputValues) => ({
      ...prevInputValues,
      [id]: value,
    }));
  };

  const handleDeleteComponent = (id: string) => {
    setComponents((prevComponents) =>
      prevComponents.filter((component) => component.id !== id)
    );
    setData((prevInputValues) => {
      const updatedInputValues = { ...prevInputValues };
      delete updatedInputValues[id];
      return updatedInputValues;
    });
    saveDataToLocalStorage(
      "components",
      components.filter((component) => component.id !== id)
    );
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
    // }, [currentComponent.type]);
  }, [currentComponent.type, currentEvent]);

  console.log(components);

  const handleAddEvent = () => {
    if (currentEvent && eventCode.trim() !== "") {
      if (editIndex !== -1) {
        const updatedEvents = [...events];
        updatedEvents[editIndex] = {
          event: currentEvent,
          eventsCode: eventCode,
        };
        setEvents(updatedEvents);
        setEditIndex(-1);
      } else {
        setEvents([...events, { event: currentEvent, eventsCode: eventCode }]);
      }
      setCurrentEvent("");
      setEventCode("");
    } else {
      toast.error("Please provide both event and code.");
    }
  };

  const handleEditEvent = (index: number) => {
    setCurrentEvent(events[index].event);
    setEventCode(events[index].eventsCode);
    setEditIndex(index);
  };

  const handleDeleteEvent = (index: number) => {
    const updatedEvents = [...events];
    updatedEvents.splice(index, 1);
    setEvents(updatedEvents);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg rounded-md flex flex-col gap-5 p-2 m-2 mt-3 md:m-5 md:p-5 lg:p-6 lg:mx-20 md:mt-2 xl:mx-40 xl:p-12">
        <div className="p-1 md:p-4 bg-gray-100 rounded">
          <div className="relative flex overflow-auto gap-8 border-b pb-5 items-center">
            <Link to="/app/inbuilt/New-App" className="group">
              <p className="flex gap-4 lg:gap-3 items-center text-[#414A53] lg:text-lg">
                <span className="bg-[#31A05D] text-white p-1 px-3 md:px-3.5 rounded-full font-bold">
                  1
                </span>
                Configure basic details
                <img className="w-5 h-5" src={arrow} alt="arrow"></img>
                <span className="absolute bottom-0 ml-1 h-[2px] w-[8rem] lg:w-[11rem] xl:w-[15rem] bg-[#31A05D]  opacity-0 group-hover:opacity-55 transition-opacity"></span>
              </p>
            </Link>
            <p className="flex gap-4 lg:gap-3 items-center text-[#414A53] lg:text-lg">
              <span className="bg-[#31A05D] text-white  p-1 px-3 md:px-3.5 rounded-full font-bold">
                2
              </span>
              Configure layout
              <img className="w-5 h-5" src={arrow} alt="arrow"></img>
              <span className="absolute bottom-0 h-[2px] w-[8rem] lg:w-[9rem] xl:w-[12rem] bg-[#31A05D]"></span>
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
            <>
              <label className="block mb-2 mt-5 text-[#727679] font-semibold text-lg xl:text-xl">
                Type:
                <select
                  className="block w-full p-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none"
                  name="type"
                  value={currentComponent.type}
                  onChange={handleChange}
                >
                  <option value="">Select Type</option>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="file">File</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="radio">Radio</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="slider">Slider</option>
                  <option value="walletDropdown">Connected Wallet</option>
                </select>
              </label>

              {(currentComponent.type === "text" ||
                currentComponent.type === "number" ||
                currentComponent.type === "file") && (
                <div>
                  <label className="block mb-2 mt-5 text-[#727679] font-semibold text-lg xl:text-xl">
                    Configuration:
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
                      placeholder=""
                      name="inputConfig"
                      cols={30}
                      rows={10}
                      value={
                        currentComponent.inputConfig ||
                        JSON.stringify(inputConfig, null, 2)
                      }
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              )}
              {(currentComponent.type === "dropdown" ||
                currentComponent.type === "radio" ||
                currentComponent.type === "checkbox") && (
                <div>
                  <label className="block mb-2 mt-5 text-[#727679] font-semibold text-lg xl:text-xl">
                    {/* {currentComponent.type === "dropdown"
                      ? "Dropdown Options:"
                      : "Radio Options:"} */}
                    Configuration:
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
                      placeholder="Enter options separated by commas"
                      name="optionsConfig"
                      cols={30}
                      rows={10}
                      value={
                        currentComponent.optionsConfig ||
                        JSON.stringify(optionsConfig, null, 2)
                      }
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              )}

              {currentComponent.type === "slider" && (
                <div>
                  <label className="block mb-2 mt-5 text-[#727679] font-semibold text-lg xl:text-xl">
                    Configuration:
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
                      placeholder="Enter slider configuration"
                      cols={30}
                      rows={10}
                      name="sliderConfig"
                      value={
                        currentComponent.sliderConfig ||
                        JSON.stringify(sliderConfig, null, 2)
                      }
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              )}
              {currentComponent.type === "walletDropdown" && (
                <div>
                  <label className="block mb-2 mt-5 text-[#727679] font-semibold text-lg xl:text-xl">
                    Configuration:
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
                      placeholder="Enter wallet configuration"
                      cols={30}
                      rows={10}
                      name="walletConfig"
                      value={
                        currentComponent.walletConfig ||
                        JSON.stringify(walletConfig, null, 2)
                      }
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              )}
            </>
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
              <div>
                  <label className="block mb-2 mt-5 text-[#727679] font-semibold text-lg xl:text-xl">
                    Configuration:
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
                      placeholder=""
                      name="inputConfig"
                      cols={30}
                      rows={10}
                      value={
                        currentComponent.inputConfig ||
                        JSON.stringify(inputConfig, null, 2)
                      }
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
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
                  <option value="">Select Type</option>
                  <option value="text">Text</option>
                  <option value="json">JSON</option>
                  <option value="table">Table</option>
                  <option value="graph">Graph</option>
                </select>
              </label>
            </div>
          )}

          <label className="block my-2 text-[#727679] font-semibold text-lg xl:text-xl">
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

          {currentComponent.placement === "input" && (
            <>
              <label className="block mb-2 mt-5 text-[#727679] font-semibold text-lg xl:text-xl">
                Events:
                <select
                  className="block w-full p-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none"
                  value={currentEvent}
                  onChange={(e) => setCurrentEvent(e.target.value)}
                >
                  <option value="">Select Event</option>
                  <option value="onLoad">onLoad</option>
                  <option value="onChange">onChange</option>
                </select>
              </label>

              {currentEvent && (
                <div>
                  <label className="block mb-2 mt-5 text-[#727679] font-semibold text-lg xl:text-xl">
                    Event Code:
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
                      placeholder="Enter event code here..."
                      cols={30}
                      rows={10}
                      name="eventCode"
                      value={eventCode}
                      onChange={(e) => setEventCode(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              )}

              {currentEvent && (
                <button
                  className="w-10 h-10 mx-auto mt-2 rounded-full bg-green-600 flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
                  title="Add Event"
                  onClick={handleAddEvent}
                >
                  {/* {editIndex !== null ? "Add Event" : "Edit Event"} */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="w-6 h-6 text-white font-bold"
                  >
                    <path
                      fill="currentColor"
                      d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                    />
                  </svg>
                </button>
              )}

              {/* Display added events */}
              <div>
                {events.map((event, index) => (
                  <div key={index} className="mt-3">
                    <div className="flex justify-between">
                      <p className="text-lg font-semibold">{event.event}:</p>
                      <div className="flex gap-3 md:gap-5">
                        <button
                          className="text-blue-600 font-semibold hover:text-blue-700"
                          onClick={() => handleEditEvent(index)}
                          title="Edit"
                        >
                          <img src={edit} alt="edit"></img>
                        </button>
                        <button
                          className="text-red-600 font-semibold hover:text-red-700"
                          onClick={() => handleDeleteEvent(index)}
                          title="Delete"
                        >
                          <img src={trash} alt="trash"></img>
                        </button>
                      </div>
                    </div>
                    <pre className="p-2 bg-gray-200 rounded-md">
                      {event.eventsCode}
                    </pre>
                  </div>
                ))}
              </div>
            </>
          )}

          {currentComponent.placement === "action" && (
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

          {currentComponent.placement === "output" &&
            currentComponent.type === "graph" && (
              <div>
                <label className="block mb-2 text-[#727679] font-semibold text-lg xl:text-xl">
                  Configuration:
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
                    placeholder="Enter graph configuration"
                    cols={30}
                    rows={10}
                    name="config"
                    value={
                      currentComponent.config ||
                      JSON.stringify(graphConfig, null, 2)
                    }
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

          <hr className="my-6" />

          <div className="md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto">
            <h2 className="mt-6 text-2xl font-bold">Added Fields:</h2>
            <ul className="whitespace-normal break-words">
              {components.map((component, index) => (
                <li
                  key={index}
                  className="mb-4"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  ID: {component.id}, Label: {component.label}, Type:{" "}
                  {component.type}, Placement: {component.placement}
                  {component.config && `, Configuration : ${component.config}`}
                  {component.inputConfig &&
                    `, Configuration: ${component.inputConfig}`}
                  {component.optionsConfig &&
                    `, Configuration: ${component.optionsConfig}`}
                  {component.sliderConfig &&
                    `, Configuration: ${component.sliderConfig}`}
                  {component.walletConfig &&
                    `, Configuration : ${component.walletConfig}`}
                  {component.code && `, Code: ${component.code}`}
                  {component.events &&
                    component.events.map((eventObj, index) => (
                      <div key={index} className="mt-3">
                        <p className="text-lg font-semibold">
                          {eventObj.event}:
                        </p>
                        <pre className="p-2 bg-gray-200 rounded-md">
                          {eventObj.eventsCode}
                        </pre>
                      </div>
                    ))}
                  <br />
                  {(component.type === "text" ||
                    component.type === "number" ||
                    component.type === "file" ||
                    component.type === "table" ||
                    component.type === "json" ||
                    component.type === "graph") && (
                    <div>
                      <div className="flex justify-between">
                        <label className="text-slate-500 font-semibold text-lg xl:text-xl">
                          {component.label}:
                        </label>
                        <div className="flex gap-3 md:gap-5">
                          <button
                            onClick={() => handleEditComponent(index)}
                            title="Edit"
                          >
                            <img src={edit} alt="edit"></img>
                          </button>
                          <button
                            onClick={() => handleDeleteComponent(component.id)}
                            title="Delete"
                          >
                            <img src={trash} alt="trash"></img>
                          </button>
                        </div>
                      </div>
                      {/* {console.log(component)}
                      {console.log(typeof component)}
                      {console.log(typeof component.inputConfig)}
                      {console.log(JSON.parse(component.inputConfig).color)} */}
                      {/* JSON.parse(component.sliderConfig).interval.min */}
                      <input
                        className="block w-full p-2 mt-1 border bg-slate-200 border-gray-300 rounded-md focus:outline-none"
                        style={{
                          ...(component.inputConfig ? JSON.parse(component.inputConfig) : {}),
                      }}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        type={component.type}
                        id={component.id}
                        value={data[component.id]}
                        onChange={(e) =>
                          handleInputChange(component.id, e.target.value)
                        }
                      />
                    </div>
                  )}
                  {component.type === "dropdown" && (
                    <div>
                      <div className="flex justify-between">
                        <label className="text-slate-500 font-semibold text-lg xl:text-xl">
                          {component.label}:
                        </label>
                        <div className="flex gap-3 md:gap-5">
                          <button
                            onClick={() => handleEditComponent(index)}
                            title="Edit"
                          >
                            <img src={edit} alt="edit"></img>
                          </button>
                          <button
                            onClick={() => handleDeleteComponent(component.id)}
                            title="Delete"
                          >
                            <img src={trash} alt="trash"></img>
                          </button>
                        </div>
                      </div>

                      <select
                        className="block w-full p-2 mt-1 border bg-slate-200 border-gray-300 rounded-md focus:outline-none"
                        id={component.id}
                        value={data[component.id]}
                        onChange={(e) =>
                          handleInputChange(component.id, e.target.value)
                        }
                      >
                        {/* Options for dropdown */}
                        {component.optionsConfig &&
                          JSON.parse(component.optionsConfig).values.map(
                            (option, idx) => (
                              <option key={idx} value={option.trim()}>
                                {option.trim()}
                              </option>
                            )
                          )}
                      </select>
                    </div>
                  )}
                  {component.type === "radio" && (
                    <div>
                      <div className="flex justify-between">
                        <label className="text-slate-500 font-semibold text-lg xl:text-xl">
                          {component.label}:
                        </label>
                        <div className="flex gap-3 md:gap-5">
                          <button
                            onClick={() => handleEditComponent(index)}
                            title="Edit"
                          >
                            <img src={edit} alt="edit"></img>
                          </button>
                          <button
                            onClick={() => handleDeleteComponent(component.id)}
                            title="Delete"
                          >
                            <img src={trash} alt="trash"></img>
                          </button>
                        </div>
                      </div>
                      {/* Options for radio */}
                      <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3">
                        {component.optionsConfig &&
                          JSON.parse(component.optionsConfig).values.map(
                            (option, idx) => {
                              const optionWidth = option.trim().length * 8 + 48;

                              return (
                                <div
                                  key={idx}
                                  className={`flex flex-shrink-0 items-center mr-2 md:mr-3 ${
                                    optionWidth > 200
                                      ? "overflow-x-auto md:h-8"
                                      : ""
                                  } lg:text-lg h-7 md:w-[10.75rem] lg:w-[12.75rem] xl:w-[14.75rem] relative`}
                                >
                                  <input
                                    type="radio"
                                    id={`${component.id}_${idx}`}
                                    name={component.id}
                                    value={option.trim()}
                                    checked={
                                      data[component.id] === option
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        component.id,
                                        e.target.value
                                      )
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
                    </div>
                  )}
                  {component.type === "checkbox" && (
                    <div>
                      <div className="flex justify-between">
                        <label className="text-slate-500 font-semibold text-lg xl:text-xl">
                          {component.label}:
                        </label>
                        <div className="flex gap-3 md:gap-5">
                          <button
                            onClick={() => handleEditComponent(index)}
                            title="Edit"
                          >
                            <img src={edit} alt="edit"></img>
                          </button>
                          <button
                            onClick={() => handleDeleteComponent(component.id)}
                            title="Delete"
                          >
                            <img src={trash} alt="trash"></img>
                          </button>
                        </div>
                      </div>
                      {/* Options for checkbox */}
                      <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3">
                        {component.optionsConfig &&
                          JSON.parse(component.optionsConfig).values.map(
                            (option, idx) => {
                              const optionWidth = option.trim().length * 8 + 48;

                              return (
                                <div
                                  key={idx}
                                  className={`flex flex-shrink-0 items-center mr-2 md:mr-3 ${
                                    optionWidth > 200
                                      ? "overflow-x-auto md:h-8"
                                      : ""
                                  } lg:text-lg h-7 md:w-[10.75rem] lg:w-[12.75rem] xl:w-[14.75rem] relative`}
                                >
                                  <input
                                    type="checkbox"
                                    id={`${component.id}_${idx}`}
                                    name={component.id}
                                    value={option.trim()}
                                    onChange={(e) =>
                                      handleInputChange(
                                        component.id,
                                        e.target.value
                                      )
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
                    </div>
                  )}
                  {component.type === "slider" && (
                    <div>
                      <div className="flex justify-between">
                        <label className="text-slate-500 font-semibold text-lg xl:text-xl">
                          {component.label}:
                        </label>
                        <div className="flex gap-3 md:gap-5">
                          <button
                            onClick={() => handleEditComponent(index)}
                            title="Edit"
                          >
                            <img src={edit} alt="edit"></img>
                          </button>
                          <button
                            onClick={() => handleDeleteComponent(component.id)}
                            title="Delete"
                          >
                            <img src={trash} alt="trash"></img>
                          </button>
                        </div>
                      </div>
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
                    </div>
                  )}
                  {component.type === "walletDropdown" && (
                    <div>
                      <div className="flex justify-between">
                        <label className="text-slate-500 font-semibold text-lg xl:text-xl">
                          {component.label}:
                        </label>
                        <div className="flex gap-3 md:gap-5">
                          <button
                            onClick={() => handleEditComponent(index)}
                            title="Edit"
                          >
                            <img src={edit} alt="edit"></img>
                          </button>
                          <button
                            onClick={() => handleDeleteComponent(component.id)}
                            title="Delete"
                          >
                            <img src={trash} alt="trash"></img>
                          </button>
                        </div>
                      </div>

                      {/* <Wallet
                        configurations = {component.walletConfig}
                        onSelectAddress={(address) =>
                          handleInputChange(component.id, address)
                        }
                      /> */}
                      <Wallet
                        configurations={component.walletConfig}
                        onSelectAddress={(address) =>
                          handleInputChange(component.id, {
                            address,
                            balance: null,
                          })
                        }
                        onUpdateBalance={(balance) =>
                          handleInputChange(component.id, {
                            address: data[component.id]?.address || "",
                            balance,
                          })
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
                          <button
                            onClick={() => handleEditComponent(index)}
                            title="Edit"
                          >
                            <img src={edit} alt="edit"></img>
                          </button>
                          <button
                            onClick={() => handleDeleteComponent(component.id)}
                            title="Delete"
                          >
                            <img src={trash} alt="trash"></img>
                          </button>
                        </div>
                      </div>
                      <button
                        className="block p-2 w-full text-white bg-red-500 border border-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:border-red-700"
                        id={component.id}
                        style={{
                          ...(component.inputConfig ? JSON.parse(component.inputConfig) : {}),
                      }}
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
        <ToastContainer />
      </div>
    </>
  );
};

export default ConfigureInputsOutputs;
