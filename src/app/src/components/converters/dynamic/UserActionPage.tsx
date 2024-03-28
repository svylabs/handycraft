import React, { useEffect, useState } from "react";
import "./ActionPage.scss";
import { useLocation, useParams } from "react-router-dom";
import { BASE_API_URL } from "~/components/constants";
import * as d3 from "d3";

interface Output {
  [key: string]: any;
}

const UserActionPage = () => {
  const location = useLocation();
  const { appId } = useParams<{ appId: string }>();
  const [output, setOutput] = useState<any>(location?.state?.output || {});
  const [components, setComponents] = useState(
    output?.component_definition || []
  );
  const [data, setData] = useState<{ [key: string]: any }>({});
  const [outputCode, setOutputCode] = useState<Output | string>();
  const [outputFormat, setOutputFormat] = useState<string>("json");
  const [graphType, setGraphType] = useState<string>("bar");
  const [graphOutput, setGraphOutput] = useState();
  // const [feedback, setFeedback] = useState(false);

  useEffect(() => {
    if (components.length === 0) {
      fetch(`${BASE_API_URL}/dynamic-component/${appId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Component detail: ", data);
          setComponents(data.component_definition || []);
          setOutput(data);
        });
    }
  }, []);

  useEffect(() => {
    if (outputFormat === "graph") {
      renderGraph();
    }
  }, [outputFormat, graphOutput, graphType]);

  const renderGraph = () => {
    d3.select("#graph-container").selectAll("*").remove();

    if (graphOutput && typeof graphOutput === "object") {
      const svgWidth = 500;
      const svgHeight = 400;
      const margin = { top: 20, right: 30, bottom: 50, left: 60 };
      const graphWidth = svgWidth - margin.left - margin.right;
      const graphHeight = svgHeight - margin.top - margin.bottom;

      const svg = d3
        .select("#graph-container")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

      const graph = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // const dataValues = Object.values(graphOutput);
      
      // const dataValues = Object.values(graphOutput).map((value) => {
      //   if (typeof value === "number") {
      //     return value;
      //   } else if (typeof value === "boolean") {
      //     return value ? true : 0;
      //   } else if (
      //     !isNaN(parseFloat(value as string)) &&
      //     isFinite(value as number)
      //   ) {
      //     return parseFloat(value as string);
      //   } else {
      //     return 0;
      //   }
      // });

      const dataValues = Object.values(graphOutput).map((value: any) => {
        if (typeof value === "number") {
          return value;
        } else if (typeof value === "boolean") {
          return value ? true : 0;
        } else if (
          typeof value === "string" &&
          !isNaN(parseFloat(value)) &&
          isFinite(parseFloat(value))
        ) {
          return parseFloat(value);
        } else if (
          Array.isArray(value) &&
          value.every((item: any) => typeof item === "number")
        ) {
          return value.reduce((acc: number, curr: number) => acc + curr, 0);
        } else if (typeof value === "object" && value !== null) {
          return Object.values(value).reduce((acc: number, curr: any) => {
            return acc + (typeof curr === "number" ? curr : 0);
          }, 0);
        } else {
          return 0;
        }
      });
      const dataLabels = Object.keys(graphOutput);

      const xScale = d3
        .scaleBand()
        .domain(dataLabels)
        .range([0, graphWidth])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(dataValues) || 0])
        .range([graphHeight, 0]);

      graph
        .append("g")
        .attr("transform", `translate(0, ${graphHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-20)")
        .style("text-anchor", "end");

      graph
        .append("g")
        .call(d3.axisLeft(yScale))
        .attr("transform", `translate(0, 0)`);

      graph
        .append("line")
        .attr("x1", 0)
        .attr("y1", graphHeight)
        .attr("x2", graphWidth)
        .attr("y2", graphHeight)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

      if (graphType === "bar") {
        graph
          .selectAll("rect")
          .data(dataValues)
          .enter()
          .append("rect")
          .attr("x", (d, i) => xScale(dataLabels[i]))
          .attr("y", (d) => yScale(d))
          .attr("width", xScale.bandwidth())
          .attr("height", (d) => graphHeight - yScale(d))
          .attr("fill", "steelblue")
          .on("mouseover", (event, d) => {
            d3.select(event.target).attr("fill", "orange");
            const xPos =
              parseFloat(d3.select(event.target).attr("x")) +
              xScale.bandwidth() / 2;
            const yPos = parseFloat(d3.select(event.target).attr("y")) + 10;
            graph
              .append("text")
              .attr("class", "tooltip")
              .attr("x", xPos)
              .attr("y", yPos)
              .attr("text-anchor", "middle")
              .text(d)
              .style("font-size", "12px");
          })
          .on("mouseout", (event) => {
            d3.select(event.target).attr("fill", "steelblue");
            graph.select(".tooltip").remove();
          });
      } else if (graphType === "line") {
        const line = d3
          .line()
          .x((d, i) => xScale(dataLabels[i]) + xScale.bandwidth() / 2)
          .y((d) => yScale(d))
          .curve(d3.curveLinear);

        graph
          .append("path")
          .datum(dataValues)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 2)
          .attr("d", line);

        graph
          .selectAll("circle")
          .data(dataValues)
          .enter()
          .append("circle")
          .attr("cx", (d, i) => xScale(dataLabels[i]) + xScale.bandwidth() / 2)
          .attr("cy", (d) => yScale(d))
          .attr("r", 4)
          .attr("fill", "steelblue")
          .on("mouseover", (event, d) => {
            d3.select(event.target).attr("fill", "orange");
            const xPos = parseFloat(d3.select(event.target).attr("cx")) + 60;
            const yPos = parseFloat(d3.select(event.target).attr("cy")) + 10;
            svg
              .append("text")
              .attr("class", "tooltip")
              .attr("x", xPos)
              .attr("y", yPos)
              .attr("text-anchor", "middle")
              .text(d)
              .style("font-size", "12px");
          })
          .on("mouseout", (event) => {
            d3.select(event.target).attr("fill", "steelblue");
            svg.select(".tooltip").remove();
          });
      }
    } else {
      console.log("Output code is not an object or is undefined.");
    }
  };

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
              {appId}
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
              {appId}
            </h1>
          </div>
          <ul className="whitespace-normal break-words">
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
            {
              outputFormat === "json" ? (
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
