import React, { useEffect, useState } from "react";
import flower from "../../photos/flower.png";
import "./ActionPage.scss";
import { BASE_API_URL } from "~/components/constants";
import { redirect } from "react-router-dom";
import * as d3 from "d3";

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
  const [graphOutput, setGraphOutput] = useState();

  const savedFormDataString = localStorage.getItem("formData");
  const savedFormData = savedFormDataString
    ? JSON.parse(savedFormDataString)
    : [];
  const [loadedData, setLoadedData] = useState(savedFormData);

  useEffect(() => {
    setLoadedData(savedFormData);
  }, []);

  useEffect(() => {
    if (outputFormat === "graph") {
      renderGraph();
    }
  }, [outputFormat, graphOutput, graphType]);

  const renderGraph = () => {
    d3.select("#graph-container").selectAll("*").remove();
  
    if (graphOutput && typeof graphOutput === "object") {
      const svg = d3
        .select("#graph-container")
        .append("svg")
        .attr("width", 500) 
        .attr("height", 400); 
  
      const dataValues = Object.values(graphOutput);
      const dataLabels = Object.keys(graphOutput);
  
      const xScale = d3
        .scaleBand()
        .domain(dataLabels)
        .range([50, 450])
        .padding(0.1);
  
      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(dataValues) || 0])
        .range([350, 50]);

      svg
        .append("g")
        .attr("transform", "translate(0,350)")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      const yAxisTicks = yScale.ticks();
      const yAxisLabelOffset = 50 / yAxisTicks.length;
  
      svg
        .selectAll(".y-label")
        .data(yAxisTicks)
        .enter()
        .append("text")
        .attr("class", "y-label")
        .attr("x", 40)
        .attr("y", (d) => yScale(d) + yAxisLabelOffset / 2)
        .text((d) => d.toFixed(2))
        .style("text-anchor", "end")
        .attr("alignment-baseline", "middle");
  
      svg
        .append("line")
        .attr("x1", 50)
        .attr("y1", 50)
        .attr("x2", 50)
        .attr("y2", 350)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
  
      if (graphType === "bar") {
        svg
          .selectAll("rect")
          .data(dataValues)
          .enter()
          .append("rect")
          .attr("x", (d, i) => xScale(dataLabels[i]))
          .attr("y", (d) => yScale(d))
          .attr("width", xScale.bandwidth())
          .attr("height", (d) => 350 - yScale(d))
          .attr("fill", "steelblue");
      } else if (graphType === "line") {
        const line = d3
          .line()
          .x((d, i) => xScale(dataLabels[i]) + xScale.bandwidth() / 2)
          .y((d) => yScale(d));
  
        svg
          .append("path")
          .datum(dataValues)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .attr("d", line);
      }
    } else {
      console.log("Output code is not an object or is undefined.");
    }
  };

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
      setGraphOutput(result);
      // setOutputCode(result);
    } catch (error) {
      console.log(`Error: ${error}`);
      setOutputCode(`Error: ${error}`);
    }
  };

  const formatOutput = (data: any) => {
    if (data === null || data === undefined) {
      console.error("Error: Data is null or undefined");
      return "Error: Data is null or undefined";
    }

    if (typeof data === "object") {
      if (Array.isArray(data)) {
        if (data.length > 0 && typeof data[0] === "object") {
          const tableHeaders = Object.keys(data[0]);
          return (
            <table>
              <thead>
                <tr>
                  {tableHeaders.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item: any, index: number) => (
                  <tr key={index}>
                    {tableHeaders.map((header) => (
                      <td key={header}>{formatOutput(item[header])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }
      } else {
        return (
          <table>
            <tbody>
              {Object.entries(data).map(([key, value]: [string, any]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{formatOutput(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
    }
    return data;
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

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg rounded-md flex flex-col gap-5 p-2 m-2 mt-3 md:m-5 md:p-5 lg:mt-8 lg:p-6 lg:mx-20 xl:mt-16 xl:mx-40 lg:p- xl:p-12">
      <div className="p-2 md:p-4 bg-gray-100">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-bold">
            Showing preview of the {savedFormData.title} app
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
        <ul className="">
          {components.map((component, index) => (
            <li key={index} className="mb-4">
              ID: {component.id}, Label: {component.label}, Type:{" "}
              {component.type}, Placement: {component.placement}
              {component.code && `, Code: ${component.code}`}
              <br />
              {component.type !== "button" && (
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
              {component.type === "button" && component.code && (
                <button
                  className="px-4 p-2 mt-2 font-semibold w-full md:w-40 overflow-x-hidden text-white bg-red-500 border border-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring focus:border-red-700"
                  id={component.id}
                  onClick={() => handleRun(component.code!, data)}
                >
                  {component.label}
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="flex justify-end">
          <button
            className="p-3 px-5 font-bold text-white bg-green-500 border border-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:border-green-700"
            onClick={saveClick}
          >
            Save
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold">Output Format:</h2>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded focus:outline-none"
          >
            <option value="json">JSON</option>
            <option value="table">Table</option>
              <option value="graph">Graph</option>
          </select>
        </div>

        {outputFormat === "graph" && (
            <div className="mb-4">
              <h2 className="text-xl font-bold">Graph Type:</h2>
              <div className="flex items-center mt-2">
                <input
                  type="radio"
                  id="barGraph"
                  name="graphType"
                  value="bar"
                  checked={graphType === "bar"}
                  onChange={() => setGraphType("bar")}
                  className="mr-2"
                />
                <label htmlFor="barGraph">Bar Graph</label>
                <input
                  type="radio"
                  id="lineGraph"
                  name="graphType"
                  value="line"
                  checked={graphType === "line"}
                  onChange={() => setGraphType("line")}
                  className="ml-4 mr-2"
                />
                <label htmlFor="lineGraph">Line Graph</label>
              </div>
            </div>
          )}

        <div className="mt-4">
          <h2 className="text-xl font-bold">Output:</h2>
          {outputFormat === "json" ? (
              <pre className="overflow-auto w-full mt-2 px-4 py-2 bg-gray-100 overflow-x-auto  border border-gray-300 rounded-lg">
                {outputCode
                  ? JSON.stringify(outputCode, null, 2)
                  : "No output available"}
              </pre>
            ) : outputFormat === "table" ? (
              <div className="overflow-auto w-full mt-2 px-4 py-2 bg-gray-100 overflow-x-auto  border border-gray-300 rounded-lg">
                {formatOutput(outputCode)}
              </div>
            ) : outputFormat === "graph" ? (
              <div
                id="graph-container"
                className="overflow-auto w-full mt-2 px-4 py-2 bg-gray-100 overflow-x-auto  border border-gray-300 rounded-lg"
              ></div>
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
