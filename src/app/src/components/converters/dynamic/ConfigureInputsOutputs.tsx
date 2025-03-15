import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import trash from "../../photos/trash-can-regular.svg";
import arrow from "../../photos/angle-right-solid.svg";
import preview from "../../photos/eye-regular.svg";
import edit from "../../photos/pen-to-square-solid.svg";
import Wallet from "./Web3/DropdownConnectedWallet";
import Swap from "./Web3/Swap/WalletSwap";
import OverviewModal from "./Renderer/OverviewModal";
import JsonViewer from './Renderer/JsonViewer';
import useDebounce from './Renderer/useDebounce';

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
  events?: Event[] | undefined;
  children?: CustomComponent[];
}

interface Event {
  type: string;
  code: string;
}

interface App {
  id: string;
  label: string;
  components: CustomComponent[];
}

const ConfigureInputsOutputs: React.FC = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [currentApp, setCurrentApp] = useState<App | null>(null);
  const [currentComponent, setCurrentComponent] = useState<CustomComponent>({
    id: "",
    label: "",
    type: "text",
    placement: "input",
    code: "",
    config: "",
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
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [loadedData, setLoadedData] = useState<any>({});
  const [localConfig, setLocalConfig] = useState("");
  const debouncedConfig = useDebounce(localConfig, 2000);

  const [config, setConfig] = useState<any>({
    styles: {
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
    },
    custom: {
      graphConfig: {
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
      },
      optionsConfig: {
        message:
          "Please enter options separated by commas. Do not add a comma after the last option.",
        values: ["text1"],
      },
      sliderConfig: {
        message:
          "Please specify the range of values. You can customize the minimum, maximum, value and step values below.",
        interval: {
          min: 1,
          max: 100,
        },
        value: 50,
        step: 1,
      },
      transactionConfig: {
        message: "For 'transaction' or 'address', provide 'value' with optional 'baseUrl'. For other types or no type, 'value' is treated as the full link.",
        type: 'transaction | address | null',
        value: '',
        baseUrl: '',
      },
      swapConfig: {
        heading: "Swap",
        fromTokenLabel: "From Token",
        toTokenLabel: "To Token",
        amountLabel: "Amount",
        estimatedAmountLabel: "Estimated Amount",
        maxEstimationBorrowLabel: "Max Borrow Amount",
        tokens: [
          {
            chainId: 137,
            name: "Wrapped Matic",
            symbol: "WMATIC",
            decimals: 18,
            address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            logoURI:
              "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png",
            listType: "from",
          },
          {
            chainId: 137,
            name: "Dai - PoS",
            symbol: "DAI",
            decimals: 18,
            address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
            logoURI:
              "https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/dai.svg",
            listType: "to",
          },
          {
            chainId: 137,
            name: "USD Coin",
            symbol: "USDC",
            decimals: 6,
            address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
            logoURI:
              "https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/usdc.svg",
            listType: "both",
          },
          {
            chainId: 137,
            name: "Uniswap",
            symbol: "UNI",
            decimals: 18,
            address: "0xb33eaad8d922b1083446dc23f610c2567fb5180f",
            logoURI:
              "https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/uni.svg",
            listType: "both",
          },
          {
            chainId: 137,
            name: "Tether USD - PoS",
            symbol: "USDT",
            decimals: 6,
            address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            logoURI:
              "https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/usdt.svg",
            listType: "from",
          },
        ],
      },
    },
  });

  let initialConfig = {};

  useEffect(() => {
    const existingFormData = localStorage.getItem("formData");
    const existingData = existingFormData ? JSON.parse(existingFormData) : {};
    setLoadedData(existingData);

    const savedComponents = getDataFromLocalStorage("components");
    if (savedComponents && Array.isArray(savedComponents)) {
      setComponents(savedComponents);
    }
  }, []);
  // console.log(loadedData)
  // console.log(components)

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
    const componentToEdit = components[index];
    // setCurrentComponent({
    //   ...components[index],
    //   config: components[index].config || JSON.stringify(config, null, 2),
    // });
    setCurrentComponent(componentToEdit);
    setLocalConfig(componentToEdit.config ? JSON.stringify(componentToEdit.config, null, 2) : JSON.stringify(initialConfig, null, 2));
    setEvents(componentToEdit.events || []);
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
        // type: "button",
        type: value === "action" ? "button" : "text",
      }));
    } else {
      setCurrentComponent((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  // const handleAddApp = () => {
  //   const newApp: App = {
  //     id: `app-${Date.now()}`,
  //     label: `App ${apps.length + 1}`,
  //     components: [],
  //   };
  //   setApps((prevApps) => [...prevApps, newApp]);
  //   setCurrentApp(newApp);
  // };

  // const handleSelectApp = (app: App) => {
  //   setCurrentApp(app);
  // };

  // const handleAddComponent = () => {
  //   if (!currentApp) return; // Ensure there is a current app selected

  //   // Check for both ID and Label fields
  //   if (!currentComponent.id.trim() || !currentComponent.label.trim()) {
  //     toast.error("Please provide both ID and Label.");
  //     return;
  //   }

  //   // Check for type when placement is "output"
  //   if (
  //     currentComponent.placement === "output" &&
  //     !currentComponent.type?.trim()
  //   ) {
  //     toast.error("Please select a type for output placement.");
  //     return;
  //   }

  //   // Check for code when placement is "action"
  //   if (
  //     currentComponent.placement === "action" &&
  //     !currentComponent.code?.trim()
  //   ) {
  //     toast.error("Please provide code for action placement.");
  //     return;
  //   }

  //   // Create a new component with a unique ID
  //   const newComponent: CustomComponent = {
  //     ...currentComponent,
  //     id: `component-${Date.now()}`, // Unique ID for the component
  //     children: [], // Initialize children as an empty array
  //   };

  //   // Update the current app's components
  //   setApps((prevApps) =>
  //     prevApps.map((app) =>
  //       app.id === currentApp.id
  //         ? { ...app, components: [...app.components, newComponent] }
  //         : app
  //     )
  //   );

  //   // Reset current component state
  //   setCurrentComponent({
  //     id: "",
  //     label: "",
  //     type: "text",
  //     placement: "input",
  //     code: "",
  //     config: "",
  //     events: [],
  //   });

  //   // Optionally, you can save the updated apps to local storage
  //   saveDataToLocalStorage("apps", apps);
  // };

  // const renderApps = () => {
  //   return apps.map((app) => (
  //     <div key={app.id} className="app-container">
  //       <h3 onClick={() => handleSelectApp(app)}>{app.label}</h3>
  //       {currentApp?.id === app.id && renderComponents(app.components)}
  //     </div>
  //   ));
  // };

  // const renderComponents = (components: CustomComponent[]) => {
  //   return components.map((component, index) => (
  //     <div key={index} className="component-container">
  //       <div>
  //         ID: {component.id}, Label: {component.label}, Type: {component.type}, Placement: {component.placement}
  //         <button onClick={() => handleEditComponent(index)}>Edit</button>
  //         <button onClick={() => handleDeleteComponent(component.id)}>Delete</button>
  //       </div>
  //       {component.children && component.children.length > 0 && (
  //         <div>{renderComponents(component.children)}</div>
  //       )}
  //     </div>
  //   ));
  // };

  const handleAddComponent = () => {
    // Check for both ID and Label fields
    if (!currentComponent.id.trim() || !currentComponent.label.trim()) {
      toast.error("Please provide both ID and Label.");
      return;
    }

    // Check for type when placement is "output"
    if (
      currentComponent.placement === "output" &&
      !currentComponent.type?.trim()
    ) {
      toast.error("Please select a type for output placement.");
      return;
    }

    // Check for code when placement is "action"
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

    const newComponent = {
      ...currentComponent,
      config:
        currentComponent.placement === "input" ||
          currentComponent.placement === "action" ||
          currentComponent.placement === "output"
          ? currentComponent.config || JSON.stringify(config, null, 2)
          : "",
      events: [...events],
    };

    if (existingIndex !== -1) {
      // Update existing field
      updatedComponents[existingIndex] = newComponent;
    } else {
      // Add new field
      updatedComponents.push(newComponent);
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
    });
    setLocalConfig(JSON.stringify(initialConfig, null, 2));

    // Refresh the page
    window.location.reload();
  };

  const handlePreview = async () => {
    if (components.length > 0) {
      console.log(components);
      window.location.href = "/app/preview";
    } else {
      toast.error("Oops! Your component list is empty. Add fields to preview.");
    }
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

  const updateTextareaNumber = () => {
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
  };

  useEffect(() => {
    updateTextareaNumber();
  });

  useEffect(() => {
    updateTextareaNumber();
  }, [currentComponent.type, currentComponent.placement, currentEvent]);

  const handleAddEvent = () => {
    if (currentEvent && eventCode.trim() !== "") {
      if (editIndex !== -1) {
        const updatedEvents = [...events];
        updatedEvents[editIndex] = {
          type: currentEvent,
          code: eventCode,
        };
        setEvents(updatedEvents);
        setEditIndex(-1);
      } else {
        setEvents([...events, { type: currentEvent, code: eventCode }]);
      }
      setCurrentEvent("");
      setEventCode("");
    } else {
      toast.error("Please provide both event and code.");
    }
  };

  const handleEditEvent = (index: number) => {
    setCurrentEvent(events[index].type);
    setEventCode(events[index].code);
    setEditIndex(index);
  };

  const handleDeleteEvent = (index: number) => {
    const updatedEvents = [...events];
    updatedEvents.splice(index, 1);
    setEvents(updatedEvents);
  };

  // console.log(currentComponent);

  const renderConfig = () => {
    const updateInitialConfig = () => {
      // let initialConfig = {};

      switch (currentComponent.type) {
        case 'text':
        case 'number':
        case 'file':
        case 'json':
        case 'walletDropdown':
        case 'button':
        case 'table':
        // case 'transactionLink':
        case 'description':
          initialConfig = { styles: { ...config.styles } };
          break;
        case 'dropdown':
        case 'radio':
        case 'checkbox':
          initialConfig = { styles: { ...config.styles }, optionsConfig: { ...config.custom.optionsConfig } };
          break;
        case 'slider':
          initialConfig = { styles: { ...config.styles }, sliderConfig: { ...config.custom.sliderConfig } };
          break;
        case 'swap':
          initialConfig = { styles: { ...config.styles }, swapConfig: { ...config.custom.swapConfig } };
          break;
        case 'graph':
          initialConfig = { styles: { ...config.styles }, graphConfig: { ...config.custom.graphConfig } };
          break;
        case 'transactionLink':
          initialConfig = { styles: { ...config.styles }, transactionConfig: { ...config.custom.transactionConfig } };
          break;
        default:
          initialConfig = {};
      }

      setLocalConfig(JSON.stringify(initialConfig, null, 2));
    };

    useEffect(() => {
      updateInitialConfig();
    }, [currentComponent.type]);

    useEffect(() => {
      updateInitialConfig();
    }, []);

    useEffect(() => {
      if (debouncedConfig) {
        try {
          const parsedConfig = JSON.parse(debouncedConfig);
          setCurrentComponent((prevState) => ({
            ...prevState,
            config: parsedConfig,
          }));
        } catch (error) {
          toast.error("Invalid JSON format. Please provide valid JSON.");
        }
      }
    }, [debouncedConfig]);

    const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = e.target;
      setLocalConfig(value);
    };

    return (
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
            value={localConfig}
            onChange={handleConfigChange}
          ></textarea>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg rounded-md flex flex-col gap-5 p-2 m-2 mt-3 md:m-5 md:p-5 lg:p-6 lg:mx-20 md:mt-2 xl:mx-40 xl:p-12">
        <div className="p-1 md:p-4 bg-gray-100 rounded">
          <div className="relative flex overflow-auto gap-5 md:gap-8 lg:gap-5 xl:gap-2 border-b pb-5 items-center">
            <Link to="/app/inbuilt/New-App" className="group">
              <p className="flex gap-2 items-center text-[#414A53]">
                <span className="bg-[#31A05D] text-white p-1 px-3 md:px-3 rounded-full font-bold">
                  1
                </span>
                Configure basic details
                <img className="w-5 h-5" src={arrow} alt="arrow"></img>
                <span className="absolute bottom-0 ml-1 h-[2px] w-[7rem] lg:w-[9rem] xl:w-[12.5rem] bg-[#31A05D] opacity-0 group-hover:opacity-55 transition-opacity"></span>
              </p>
            </Link>
            <Link to="/app/configure/contracts" className="group">
              <p className="flex gap-2 items-center text-[#414A53]">
                <span className="bg-[#31A05D] text-white  p-1 px-3 md:px-3 rounded-full font-bold">
                  2
                </span>
                Configure Contracts
                <img className="w-5 h-5" src={arrow} alt="arrow"></img>
                <span className="absolute bottom-0 h-[2px] w-[8rem] lg:w-[8rem] xl:w-[11rem] bg-[#31A05D] opacity-0 group-hover:opacity-55 transition-opacity"></span>
              </p>
            </Link>
            <p className="flex gap-2 items-center text-[#414A53]">
              <span className="bg-[#31A05D] text-white  p-1 px-3 md:px-3 rounded-full font-bold">
                3
              </span>
              Configure layout
              <img className="w-5 h-5" src={arrow} alt="arrow"></img>
              <span className="absolute bottom-0 h-[2px] w-[8rem] lg:w-[8rem] xl:w-[10.5rem] bg-[#31A05D]"></span>
            </p>
            <p className="flex gap-2 items-center text-[#414A53]">
              <span className="bg-[#DADBE2]  p-1 px-3 md:px-3 rounded-full font-bold">
                4
              </span>
              Preview the app
              <img className="w-5 h-5" src={arrow} alt="arrow"></img>
            </p>
            <p className="flex gap-2 items-center text-[#414A53]">
              <span className="bg-[#DADBE2]  p-1 px-3 md:px-3 rounded-full font-bold">
                5
              </span>
              Publish the app
            </p>
          </div>

          {/* <div>
            <button onClick={handleAddApp}>Add New App</button>
            {renderApps()}
            {currentApp && (
              <div>
                <h4>Add Component to {currentApp.label}</h4>
                <input
                  type="text"
                  placeholder="Component ID"
                  value={currentComponent.id}
                  onChange={(e) => setCurrentComponent({ ...currentComponent, id: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Component Label"
                  value={currentComponent.label}
                  onChange={(e) => setCurrentComponent({ ...currentComponent, label: e.target.value })}
                />
                <button onClick={handleAddComponent}>Add Component</button>
              </div>
            )}
          </div> */}

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
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="json">JSON</option>
                  <option value="file">File</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="radio">Radio</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="slider">Slider</option>
                  <option value="walletDropdown">Connected Wallet</option>
                  <option value="swap">Swap</option>
                </select>
              </label>
              {renderConfig()}
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
              {renderConfig()}
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
                  <option value="description">Description Field</option>
                  <option value="transactionLink">Transaction Link</option>
                </select>
              </label>
              {renderConfig()}
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

          {/* {currentComponent.placement === "input" && ( */}
          {(currentComponent.placement === "input" || currentComponent.placement === "output") && (
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
                      <p className="text-lg font-semibold">{event.type}:</p>
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
                    <pre className="p-2 bg-gray-200 rounded-md whitespace-normal break-words md:whitespace-pre-line">
                      {event.code}
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

          <button
            className="block justify-end mt-4 bg-gradient-to-r from-slate-400 to-slate-500 text-white rounded-md text-lg p-2  px-4 font-medium shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setShowContractDetails(!showContractDetails)}
            title="Click to View Contract Information"
          >
            Contract Details
          </button>

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
                  {/* {component.config && `, Configuration : ${component.config}`} */}
                  {component.config && `, Configuration : ${JSON.stringify(component.config)}`}
                  {component.code && `, Code: ${component.code}`}
                  {component.events &&
                    component.events.map((eventObj, index) => (
                      <div key={index} className="mt-3">
                        <p className="text-lg font-semibold">
                          {eventObj.type}:
                        </p>
                        <pre className="p-2 bg-gray-200 rounded-md whitespace-normal break-words md:whitespace-pre-line">
                          {eventObj.code}
                        </pre>
                      </div>
                    ))}
                  <br />
                  {(component.type === "text" ||
                    component.type === "number" ||
                    component.type === "file" ||
                    component.type === "table" ||
                    component.type === "description" ||
                    component.type === "transactionLink" ||
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
                      {console.log(component.config)}
                      {console.log(typeof component.config)} */}
                        {/* {console.log(JSON.parse(component.config).styles)} */}
                        {/* JSON.parse(component.sliderConfig).interval.min */}
                        {/* {console.log(component.config)} */}
                        <input
                          className="block w-full p-2 mt-1 border bg-slate-200 border-gray-300 rounded-md focus:outline-none"
                          // style={{
                          //   ...(component.config &&
                          //     typeof component.config === "string"
                          //     ? JSON.parse(component.config).styles
                          //     : {}),
                          // }}
                          style={{
                            ...(component.config && typeof component.config.styles === 'object'
                              ? component.config.styles
                              : {}),
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
                  {(component.type === "json") && (
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
                      <div
                        style={{
                          ...(component.config && typeof component.config.styles === 'object'
                            ? component.config.styles
                            : {}),
                        }}
                        id={component.id}
                      >
                        <JsonViewer
                          jsonData={data[component.id]}
                          setJsonData={(updatedData) => handleInputChange(component.id, updatedData)}
                        />
                      </div>
                    </div>
                  )}
                  {component.type === "swap" && (
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
                      <div
                        style={{
                          ...(component.config && typeof component.config.styles === 'object'
                            ? component.config.styles
                            : {}),
                        }}
                      >
                        <Swap
                          configurations={
                            // JSON.parse(component.config).custom.swapConfig
                            component.config.swapConfig
                          }
                          onSwapChange={(swapData) =>
                            handleInputChange(component.id, swapData)
                          }
                          data={null} //data={undefined}
                        />
                      </div>
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
                        style={{
                          ...(component.config && typeof component.config.styles === 'object'
                            ? component.config.styles
                            : {}),
                        }}
                      >
                        {/* Options for dropdown */}
                        {component.config && component.config.optionsConfig && component.config.optionsConfig.values.map((option, idx) => (
                          <option key={idx} value={option.trim()}>
                            {option.trim()}
                          </option>
                        ))}
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
                        {component.config && component.config.optionsConfig &&
                          component.config
                            .optionsConfig.values.map((option, idx) => {
                              const optionWidth = option.trim().length * 8 + 48;

                              return (
                                <div
                                  key={idx}
                                  className={`flex flex-shrink-0 items-center mr-2 md:mr-3 ${optionWidth > 200
                                    ? "overflow-x-auto md:h-8"
                                    : ""
                                    } lg:text-lg h-7 md:w-[10.75rem] lg:w-[12.75rem] xl:w-[14.75rem] relative`}
                                >
                                  <input
                                    type="radio"
                                    id={`${component.id}_${idx}`}
                                    name={component.id}
                                    value={option.trim()}
                                    checked={data[component.id] === option}
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
                            })}
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
                        {component.config && component.config.optionsConfig &&
                          component.config
                            .optionsConfig.values.map((option, idx) => {
                              const optionWidth = option.trim().length * 8 + 48;

                              return (
                                <div
                                  key={idx}
                                  className={`flex flex-shrink-0 items-center mr-2 md:mr-3 ${optionWidth > 200
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
                            })}
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
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            id={component.id}
                            className="w-full h-9 cursor-pointer" //md:w-[60%]
                            name={component.label}
                            min={
                              component.config.sliderConfig
                                .interval.min
                            }
                            max={
                              component.config.sliderConfig
                                .interval.max
                            }
                            step={
                              component.config.sliderConfig
                                .step
                            }
                            value={
                              data[component.id] ||
                              component.config.sliderConfig
                                .value
                            }
                            onChange={(e) =>
                              handleInputChange(component.id, e.target.value)
                            }
                          />
                          <span className="font-semibold">
                            {data[component.id] ||
                              component.config.sliderConfig
                                .value}
                          </span>
                        </div>
                        {/* <p className="text-sm text-gray-500 flex items-center">
                          <svg className="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4 -4" />
                          </svg>
                          <span>Recommended: <strong className="text-blue-600">{component.config.sliderConfig.value}</strong></span>
                        </p> */}
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
                        configurations={JSON.parse(component.config).custom.walletConfig}
                        onSelectAddress={(address) =>
                          handleInputChange(component.id, address)
                        }
                      /> */}
                      <Wallet
                        configurations={
                          // JSON.parse(component.config).custom.walletConfig
                          loadedData.networkDetails || loadedData.network_details
                        }
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
                        className="block px-4 p-2 mt-2 font-semibold text-white bg-red-500 border border-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring focus:border-red-700"
                        id={component.id}
                        style={{
                          ...(component.config && typeof component.config.styles === 'object'
                            ? component.config.styles
                            : {}),
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
        {/* <ToastContainer /> */}
        {showContractDetails && <OverviewModal onClose={() => setShowContractDetails(false)} />}
      </div>
    </>
  );
};

export default ConfigureInputsOutputs;