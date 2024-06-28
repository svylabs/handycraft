import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Wallet from "../Web3/DropdownConnectedWallet";
import Graph from "../outputPlacement/GraphComponent";
import Table from "../outputPlacement/TableComponent";
import TextOutput from "../outputPlacement/TextOutput";
import Loading from "../loadingPage/Loading";
import Swap from "../Web3/Swap/WalletSwap";

interface Props {
  components: any[];
  data: { [key: string]: any };
  setData: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
  setOutputCode: React.Dispatch<React.SetStateAction<any>>;
}

const App: React.FC<Props> = ({ components, data, setData, setOutputCode }) => {
  const [loading, setLoading] = useState(false);

  const existingFormData = localStorage.getItem("formData");
  const existingData = existingFormData ? JSON.parse(existingFormData) : {};
  const [loadedData, setLoadedData] = useState(existingData);
  
  useEffect(() => {
    setLoadedData(existingData);
  }, []);

  console.log(loadedData);

  const web3 = new Web3(window.ethereum);

  const injectedContracts = loadedData.contractDetails?.reduce((contracts, contract) => {
    contracts[contract.name] = new web3.eth.Contract(contract.abi, contract.address);
    return contracts;
  }, {}) || {};

  const mcLib = {
    web3: web3,
    injectedContracts: injectedContracts,
  };
  console.log(mcLib);

  // const mcLib = {
  //   // only display ContractName: (abi, address),
  //   injectedContracts: loadedData.contractDetails.reduce((contracts, contract) => {
  //     contracts[contract.name] = {
  //       abi: contract.abi,
  //       address: contract.address,
  //     };
  //     return contracts;
  //   }, {}),
  // };
  
  useEffect(() => {
    console.log(components);
    components.forEach((component) => {
      if (component.events) {
        component.events.forEach((event) => {
          if (event.eventsCode) {
            executeOnLoadCode(event.eventsCode);
          }
        });
      }
    });
  }, [components]);

  const executeOnLoadCode = async (code) => {
    try {
      setLoading(true);
      // const config = web3.config;
      const config = mcLib.web3.config;
      console.log(config);
      const result = await eval(code);
      if (typeof result === "object") {
        setData((prevData) => ({ ...prevData, ...result }));
        setOutputCode((prevOutputCode) => ({ ...prevOutputCode, ...result }));
      }
    } catch (error) {
      console.error("Error executing onLoad code:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (id: string, value: any) => {
    setData((prevInputValues) => ({
      ...prevInputValues,
      [id]: value,
    }));
  };

  // const handleSwapChange = (id: string, swapData: any) => {
  //   // Check if the new swap data is different from the existing data
  //   if (data[id] !== swapData) {
  //     setData((prevData) => ({
  //       ...prevData,
  //       [id]: swapData,
  //     }));
  //   }
  // };


  const handleRun = async (code: string, data: { [key: string]: string }) => {
    try {
      setLoading(true);
      // const config = web3.config;
      const config = mcLib.web3.config;
      console.log(config);
      // console.log("code: ", code);
      // console.log(typeof code)
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <ul className="whitespace-normal break-words lg:text-lg">
          {components.map((component, index) => (
            <li key={index} className="mb-4">
              {(component.placement === "input" ||
                component.placement === "output") && (
                  <div>
                    <label className="text-slate-500 font-semibold text-lg xl:text-xl">
                      {component.label}:
                    </label>
                  </div>
                )}

              {/* display the output data where developers/users want */}
              {component.placement === "output" && (
                <div key={component.id}>
                  {(() => {
                    switch (component.type) {
                      case "text":
                        return <TextOutput data={data[component.id]} />;
                      case "json":
                        return (
                          <pre
                            className="overflow-auto w-full mt-2 px-4 py-2 bg-gray-100 overflow-x-auto border border-gray-300 rounded-lg"
                          // style={{
                          //   ...(component.config && typeof component.config === 'string'
                          //     ? JSON.parse(component.config).styles
                          //     : {}),
                          // }}
                          >
                            {data[component.id]
                              ? `${component.id}: ${JSON.stringify(data[component.id], null, 2)}`
                              : ""}
                          </pre>
                        );
                      case "table":
                        return <Table data={data[component.id]} />;
                      case "graph":
                        return (
                          <div>
                            <Graph
                              key={`graph-${component.id}`}
                              output={data[component.id]}
                              configurations={
                                JSON.parse(component.config).custom
                                  .graphConfig
                              }
                              graphId={`graph-container-${component.id}`}
                            />
                          </div>
                        );
                      default:
                        return null;
                    }
                  })()}
                </div>
              )}

              {component.placement === "input" &&
                (component.type === "text" ||
                  component.type === "number" ||
                  component.type === "file") && (
                  <input
                    className="w-full px-4  p-2 mt-1 border bg-slate-200 border-gray-300 rounded focus:outline-none"
                    style={{
                      ...(component.config &&
                        typeof component.config === "string"
                        ? JSON.parse(component.config).styles
                        : {}),
                    }}
                    type={component.type}
                    id={component.id}
                    value={data[component.id] || ""}
                    onChange={(e) =>
                      handleInputChange(component.id, e.target.value)
                    }
                  />
                )}
              {component.type === "swap" && (
                <div
                  style={{
                    ...(component.config &&
                      typeof component.config === "string"
                      ? JSON.parse(component.config).styles
                      : {}),
                  }}
                >
                  <Swap
                    configurations={
                      JSON.parse(component.config).custom.swapConfig
                    }
                    onSwapChange={(swapData) =>
                      handleInputChange(component.id, swapData)
                    }
                  />
                </div>
              )}
              {component.type === "dropdown" && (
                <select
                  className="block w-full p-2 mt-1 border bg-slate-200 border-gray-300 rounded-md focus:outline-none"
                  id={component.id}
                  value={data[component.id]}
                  onChange={(e) =>
                    handleInputChange(component.id, e.target.value)
                  }
                  style={{
                    ...(component.config &&
                      typeof component.config === "string"
                      ? JSON.parse(component.config).styles
                      : {}),
                  }}
                >
                  {component.config &&
                    JSON.parse(
                      component.config
                    ).custom.optionsConfig.values.map((option, idx) => (
                      <option key={idx} value={option.trim()}>
                        {option.trim()}
                      </option>
                    ))}
                </select>
              )}
              {component.type === "radio" && (
                <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3">
                  {component.config &&
                    JSON.parse(
                      component.config
                    ).custom.optionsConfig.values.map((option, idx) => {
                      const optionWidth = option.trim().length * 8 + 48;

                      return (
                        <div
                          key={idx}
                          className={`flex flex-shrink-0 items-center mr-2 md:mr-3 ${optionWidth > 200 ? "overflow-x-auto md:h-8" : ""
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
                    })}
                </div>
              )}
              {component.type === "checkbox" && (
                <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3">
                  {component.config &&
                    JSON.parse(
                      component.config
                    ).custom.optionsConfig.values.map((option, idx) => {
                      const optionWidth = option.trim().length * 8 + 48;

                      return (
                        <div
                          key={idx}
                          className={`flex flex-shrink-0 items-center mr-2 md:mr-3 ${optionWidth > 200 ? "overflow-x-auto md:h-8" : ""
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
                    })}
                </div>
              )}
              {component.type === "slider" && (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id={component.id}
                    className="w-full md:w-[60%] h-8"
                    name={component.label}
                    min={
                      JSON.parse(component.config).custom.sliderConfig
                        .interval.min
                    }
                    max={
                      JSON.parse(component.config).custom.sliderConfig
                        .interval.max
                    }
                    step={
                      JSON.parse(component.config).custom.sliderConfig
                        .step
                    }
                    value={
                      data[component.id] ||
                      JSON.parse(component.config).custom.sliderConfig
                        .value
                    }
                    onChange={(e) =>
                      handleInputChange(component.id, e.target.value)
                    }
                  // style={{
                  //   ...(component.config && typeof component.config === 'string'
                  //     ? JSON.parse(component.config).styles
                  //     : {}),
                  // }}
                  />
                  <span className="font-semibold">
                    {data[component.id] ||
                      JSON.parse(component.config).custom.sliderConfig
                        .value}
                  </span>
                </div>
              )}
              {component.type === "walletDropdown" && (
                <div>
                  <Wallet
                    configurations={
                      JSON.parse(component.config).custom.walletConfig
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
                <button
                  className="block px-4 p-2 mt-2 font-semibold text-white bg-red-500 border border-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring focus:border-red-700"
                  style={{
                    ...(component.config &&
                      typeof component.config === "string"
                      ? JSON.parse(component.config).styles
                      : {}),
                  }}
                  id={component.id}
                  onClick={() => handleRun(component.code!, data)}
                >
                  {component.label}
                </button>
              )}
            </li>
          ))}
        </ul>

        {/* display all output data one after one */}
        {/* {components.map((component, index) => (
          <div key={index} className="mb-5">
            {component.placement === "output" && component.type === "text" && (
              <TextOutput data={data[component.id]} />
            )}
            {component.placement === "output" && component.type === "json" && (
              <pre className="overflow-auto w-full mt-2 px-4 py-2 bg-gray-100 overflow-x-auto  border border-gray-300 rounded-lg">
                {data[component.id]
                  ? `${component.id}: ${JSON.stringify(data[component.id], null, 2)}`
                  : ""}
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
        ))} */}
      </div>
      {loading && <Loading />}
    </>
  );
};

export default App;
