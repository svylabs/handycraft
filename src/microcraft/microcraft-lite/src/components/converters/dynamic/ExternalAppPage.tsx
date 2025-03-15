import DynamicApp from '@svylabs/microcraft-lib';
import React, { useEffect, useState, useRef } from "react";
import "./ActionPage.scss";
import { redirect, useLocation, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
// import { BASE_API_URL } from "~/components/constants";
import Loading from "./loadingPage/Loading";
import App from "./Renderer/App";
import { randomUUID } from 'crypto';
import AppCarousel from './Carousel';
import { FaChevronDown } from 'react-icons/fa';
import { on } from 'events';
import { WasmGlue } from './wasm/WasmGlue';
// import { net } from "web3";

interface RecentApp {
  name: string;
  description: string;
  path: string;
  lastUsed: Date;
  type: 'app' | 'list';
  parent?: string;
}

interface App {
  name: string;
  description: string;
  path: string;
}

interface Output {
  [key: string]: any;
}

const ExternalAppPage = () => {
  const location = useLocation();
  const [output, setOutput] = useState<any>(location?.state?.output || {});
  const queryParams = new URLSearchParams(location.search);
  const [components, setComponents] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [data, setData] = useState<{ [key: string]: any }>({});
  const [outputCode, setOutputCode] = useState<Output | string>();
  const [loading, setLoading] = useState(false);
  const [externalAppUrl, setExternalAppUrl] = useState("");
  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [runId, setRunId] = useState("");
  const [recentApps, setRecentApps] = useState<RecentApp[]>(JSON.parse(localStorage.getItem("recentApps") || "[]"));
  const [showRecentApps, setShowRecentApps] = useState(false);
  const [appList, setAppList] = useState<any>({});
  const [selectedAppIndex, setSelectedAppIndex] = useState(-1);
  const [dropdownWidth, setDropdownWidth] = useState("18rem");
  const [wasms, setWasms] = useState<{}>({});
  const [navigationPaths, setNavigationPaths] = useState<{ path: string; name: string }[]>([]);

  const isAuthenticated = () => {
    if (localStorage.getItem("userDetails")) {
      return true;
    }
    return false;
  };

  const fetchGithubContent = async (url: string, branch: string, type: "json" | "str" | "blob" = "json") => {
    //console.log(url);
    const contentUrl = url + ((branch !== undefined && branch !== "") ? "?ref=" + branch : "");
    console.log(contentUrl)
    const res = await fetch(contentUrl);
    const appRawData = await res.json();
    if (!res.ok) {
      toast.error("Error loading external app / functions");
      console.log(res);
      setLoading(false);
      return;
    }
    console.log(appRawData);
    if (type === "str") {
      return atob(appRawData.content);
    } else if (type === "json") {
      const data = JSON.parse(atob(appRawData.content));
      return data;
    }
    return appRawData;
  };

  useEffect(() => {
    const source = queryParams.get("source") || "";
    const urlPath = queryParams.get("path") || "";
    console.log(source, urlPath);
    if (source === "github" && urlPath !== undefined) {
      setExternalAppUrl(urlPath);
      loadApp(urlPath);
    }
    if (source === "local") {
      loadAppFromLocal(urlPath);
    }
  }, []);

  // Load recent apps from local storage on component mount
  useEffect(() => {
    const storedApps = localStorage.getItem("recentApps");
    const parsedApps: RecentApp[] = storedApps ? JSON.parse(storedApps) : [];
    setRecentApps(parsedApps);
  }, []);

  // Function to toggle recent apps visibility
  const toggleRecentApps = () => {
    setShowRecentApps(!showRecentApps);
  };

  const onAppSelected = async (index: number) => {
    if (index >= appList.apps?.length || index < 0) {
      return;
    }
    const app = appList.apps[index];
    const resolvedPath = app.path.startsWith("https://")
      ? app.path
      : externalAppUrl + (externalAppUrl.endsWith("/") ? "" : "/") + app.path;

    console.log("On app selected: loading: ", resolvedPath);

    await loadApp(resolvedPath);

    // Update recent apps logic
    const newApp: RecentApp = {
      name: app.name,
      description: app.description,
      path: resolvedPath,
      lastUsed: new Date(),
      type: 'app',
      parent: appList.path
    };
    updateRecentApps(newApp);

  }

  const loadAppList = async (data: any) => {
    if (data.type === 'list') {
      console.log("Loading app list: ", data);
      setAppList(data);

      // Add the list to navigation paths without duplicates
      const newPath = { path: data.path, name: data.name };
      if (!navigationPaths.some(nav => nav.path === newPath.path)) {
        setNavigationPaths(prev => [...prev, newPath]);
      }

      // Update the last used time for the list
      const newList: RecentApp = {
        name: data.name,
        description: data.description,
        path: data.path,
        lastUsed: new Date(),
        type: 'list'
      };
      // Update recent apps with the new list
      updateRecentApps(newList);
    }
  };

  const updateRecentApps = (newApp: RecentApp) => {
    const updatedApps = recentApps.filter(app => app.name !== newApp.name); // Remove existing app with the same name
    updatedApps.unshift(newApp); // Add the new app to the front
    if (updatedApps.length > 10) {
      updatedApps.splice(10); // Keep only the latest 10
    }
    setRecentApps(updatedApps);
    localStorage.setItem("recentApps", JSON.stringify(updatedApps));
  };

  const timeSinceLastUsed = (lastUsed: Date) => {
    const now = new Date();
    const diff = Math.abs(now.getTime() - new Date(lastUsed).getTime());
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const loadAppFromLocal = async (localPath) => {
    setLoading(true);
    setData({});
    try {
      if (!localPath) {
        setLoading(false);
        return;
      }
      let url = "/applet/app.json";
      const data = await (await fetch(url + "?base_path=" + localPath)).json();
      const appName = data.name;
      const appDescription = data.description;
      const components = data.components;
      const contractDetails = data.contracts || [];
      const networkDetails = data.networks || [];

      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        if (component.type === "button") {
          if (component.codeRef !== undefined) {
            const codeRefParts = component.codeRef.split("#");
            const relPath = codeRefParts[0];
            //const entryPoint = codeRefParts[1];
            let codeUrl = `/applet/files?base_path=${localPath}&file_path=${relPath}`
            const data = await (await fetch(codeUrl)).text();
            component.code = data;
          }
        }
        if (component.events && component.events.length > 0) {
          for (let j = 0; j < component.events.length; j++) {
            const event = component.events[j];
            if (event.codeRef !== undefined) {
              const codeRefParts = event.codeRef.split("#");
              const relPath = codeRefParts[0];
              //const entryPoint = codeRefParts[1];
              let codeUrl = `/applet/files?base_path=${localPath}&file_path=${relPath}`
              const data = await (await fetch(codeUrl)).text();
              event.code = data;
            }
          }
        }
      }
      for (let i = 0; i < contractDetails.length; i++) {
        const contract = contractDetails[i];
        if (contract.abiRef !== undefined) {
          const codeRefParts = contract.abiRef.split("#");
          const relPath = codeRefParts[0];
          //const entryPoint = codeRefParts[1];
          let codeUrl = `/applet/files?base_path=${localPath}&file_path=${relPath}`
          const data = await (await fetch(codeUrl)).json();
          contract.abi = data;
        }
      }
      const libs = data.libs || [];
      const wasmLibs = {};
      for (let i = 0; i < libs.length; i++) {
        const lib = libs[i];
        if (lib.type === "wasm") {
          if (lib.url !== undefined) {
            const codeRefParts = lib.url.split("#");
            const relPath = codeRefParts[0];
            //const entryPoint = codeRefParts[1];
            let wasmUrl = `/applet/files?base_path=${localPath}&file_path=${relPath}`
            wasmLibs[lib.name] = new WasmGlue();
            await wasmLibs[lib.name].loadWasm(wasmUrl);
          }
        }
      }
      setWasms(wasmLibs);
      setAppDescription(appDescription);
      setAppName(appName);
      setComponents(components);
      setContracts(contractDetails);
      setNetworks(networkDetails);
    } catch (error) {
      console.error("Error loading external app: ", error);
      toast.error("Error loading external app. Please try again.");
    } finally {
      setLoading(false);
      setRunId(crypto.randomUUID());
    }
  }

  const isEmpty = (str: string | null | undefined) => {
    if (str === undefined || str === null || str === "") {
      return true;
    }
    return false;
  }

  const loadApp = async (appPath?: string, subAppPath?: string) => {
    setShowRecentApps(false);
    setLoading(true);
    setData({});
    const path = appPath || externalAppUrl;
    try {
      if (!path) {
        setLoading(false);
        return;
      }
      if (path.indexOf("github.com/") === -1) {
        toast.error("Please enter a valid github url");
        setLoading(false);
        return;
      }
      const parts = path.split("github.com/");
      const repoParts = parts[1].split("/");
      const repoOwner = repoParts[0];
      const repoName = repoParts[1];
      let appPath = "";
      let branch = "";
      //console.log("Loading ", path, "Repo parts", repoParts);
      if (repoParts.length >= 4) {
        if (repoParts.length > 4) {
          appPath = repoParts.slice(4).join("/");
          appPath += "/";
        }
        branch = repoParts[3];
      }
      let url = "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contents/" + appPath + "app.json";
      //console.log("Loading....", url);
      const data = await fetchGithubContent(url, branch);
      if (data.type === 'list') {
        data.path = path;
        await loadAppList(data);

        if (subAppPath) {
          console.log("Sub app path: ", subAppPath);
          const subAppIndex = data.apps.findIndex((app: any) => {
            if (app.path.startsWith("https://")) {
              return app.path === subAppPath;
            } else {
              return subAppPath === path + (path.endsWith("/") ? "" : "/") + app.path;
            }
          });
          console.log("Sub app index: ", subAppIndex);
          if (subAppIndex != -1) {
            setSelectedAppIndex(subAppIndex);
          } else {
            setSelectedAppIndex(0);
          }
        } else {
          setSelectedAppIndex(0);
        }
      } else {
        const appName = data.name;
        const appDescription = data.description;
        const components = data.components;
        const contractDetails = data.contracts || [];
        const networkDetails = data.networks || [];

        for (let i = 0; i < components.length; i++) {
          const component = components[i];
          if (component.type === "button") {
            if (component.codeRef !== undefined && isEmpty(component.code)) {
              const codeRefParts = component.codeRef.split("#");
              const relPath = codeRefParts[0];
              //const entryPoint = codeRefParts[1];
              let codeUrl = "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contents/" + appPath + relPath;
              const data = await fetchGithubContent(codeUrl, branch, "str");
              component.code = data;
            }
          }
          if (component.events && component.events.length > 0) {
            for (let j = 0; j < component.events.length; j++) {
              const event = component.events[j];
              if (event.codeRef !== undefined && isEmpty(event.code)) {
                const codeRefParts = event.codeRef.split("#");
                const relPath = codeRefParts[0];
                //const entryPoint = codeRefParts[1];
                let codeUrl = "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contents/" + appPath + relPath;
                const data = await fetchGithubContent(codeUrl, branch, "str");
                event.code = data;
              }
            }
          }
        }
        for (let i = 0; i < contractDetails.length; i++) {
          const contract = contractDetails[i];
          if (contract.abiRef !== undefined && isEmpty(contract.abi)) {
            const codeRefParts = contract.abiRef.split("#");
            const relPath = codeRefParts[0];
            //const entryPoint = codeRefParts[1];
            let codeUrl = "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contents/" + appPath + relPath;
            const data = await fetchGithubContent(codeUrl, branch, "json");
            contract.abi = data;
          }
        }
        const libs = data.libs || [];
        const wasmLibs = {};
        for (let i = 0; i < libs.length; i++) {
          const lib = libs[i];
          if (lib.type === "wasm") {
            if (lib.url !== undefined) {
              const codeRefParts = lib.url.split("#");
              const relPath = codeRefParts[0];
              //const entryPoint = codeRefParts[1];
              let wasmUrl = "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contents/" + appPath + relPath;
              let wasmContent = await fetchGithubContent(wasmUrl, branch, "blob");
              console.log(wasmContent);
              wasmLibs[lib.name] = new WasmGlue();
              await wasmLibs[lib.name].loadWasm(wasmContent.download_url);
            }
          }
        }
        setWasms(wasmLibs);
        setAppDescription(appDescription);
        setAppName(appName);
        setComponents(components);
        setContracts(contractDetails);
        setNetworks(networkDetails);

        // Add the app to recent apps after loading
        const newApp: RecentApp = {
          name: appName,
          description: appDescription,
          path: path,
          lastUsed: new Date(),
          type: 'app'
        };
        updateRecentApps(newApp);

        // Add the app to navigation paths without duplicates
        const newPath = { path: path, name: appName };
        if (!navigationPaths.some(nav => nav.path === newPath.path)) {
          setNavigationPaths(prev => [...prev, newPath]);
        }


      }
    } catch (error) {
      console.error("Error loading external app: ", error);
      toast.error("Error loading external app. Please try again.");
    } finally {
      setLoading(false);
      setRunId(crypto.randomUUID());
    }
  }

  useEffect(() => {

  }, [runId]);

  useEffect(() => {
    onAppSelected(selectedAppIndex);
  }, [selectedAppIndex]);

  const adjustDropdownWidth = () => {
    const screenWidth = window.innerWidth;
    //if (screenWidth <= 320) setDropdownWidth("18rem");
    if (screenWidth <= 375) setDropdownWidth("18rem");
    else if (screenWidth <= 500) setDropdownWidth("22rem");
    else if (screenWidth <= 768) setDropdownWidth("46rem");
    else setDropdownWidth("52rem");
  };

  useEffect(() => {
    adjustDropdownWidth(); // Adjust on initial load
    window.addEventListener("resize", adjustDropdownWidth); // Adjust on window resize
    return () => window.removeEventListener("resize", adjustDropdownWidth); // Cleanup
  }, []);

//   const resolvePathToName = (path: string) => {
//     console.log("path:- ",path);
//   const parts = path.split('/'); // Split the path into parts
//   console.log("parts:- ", parts);
//   let currentPath = '';
//   const hierarchy: string[] = [];

//   // Iterate through each part of the path
//   for (const part of parts) {
//     currentPath += currentPath ? `/${part}` : part; // Build the full path
//     console.log("currentPath:- ", currentPath);
//     const found = navigationPaths.find(nav => nav.path === currentPath);
//     console.log("found:- ", found);
//     if (found) {
//       hierarchy.push(found.name); // Add to hierarchy if path exists
//       console.log("hierarchy:- ", hierarchy);
//     }
//   }

//   return hierarchy.join(' › '); // Return joined names for display
// };

const resolvePathToName = (path: string) => {
  console.log("path:- ", path);
  const parts = path.split('/'); // Split the path into parts
  console.log("parts:- ", parts);
  let currentPath = '';
  const hierarchy: string[] = [];
  let lastPushedPath = '';

  for (const part of parts) {
    currentPath += currentPath ? `/${part}` : part; // Build the full path
    console.log("currentPath:- ", currentPath);
    
    const found = navigationPaths.find(nav => nav.path === currentPath);
    console.log("found:- ", found);
    
    if (found) {
      if (!lastPushedPath || currentPath.startsWith(lastPushedPath)) {
        // Add the name to the hierarchy only if it's part of the path
        hierarchy.push(found.name);
        lastPushedPath = currentPath; // Update the last pushed path
        console.log("hierarchy (pushed):- ", hierarchy);
      } else {
        // Handle when previous path should be removed
        hierarchy.splice(-1, 1, found.name); // Replace the last entry
        lastPushedPath = currentPath;
        console.log("hierarchy (replaced):- ", hierarchy);
      }
    }
  }

  return hierarchy.join(' › '); // Return joined names for display
};


  console.log("navigationPaths:- ", navigationPaths);

  // function submitFeedback() {
  //   setFeedback(false);
  //   window.location.href = "/";
  // }

  return (
    <>
      <div className="image-pdf px-4 min-h-[85.6vh] flex flex-col pb-10">
        <ToastContainer />
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-5 text-xs md:text-base font-bold py-2 lg:mx-auto">
          <div className="relative flex">
            <input
              className="w-full py-2 px-4 rounded border border-gray-300 focus:outline-none focus:border-blue-500 pr-12"
              type="url"
              size={80}
              placeholder="Enter github url of the app here"
              value={externalAppUrl}
              onChange={(e) => setExternalAppUrl(e.target.value.trim())}
              onFocus={() => {
                if (recentApps.length > 0) { // Show recent apps only if there are any
                  toggleRecentApps();
                }
              }}
              id="output"
            />
            <div className="relative">
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded"
                onClick={toggleRecentApps}
              >
                <FaChevronDown
                  className={`text-slate-700 transition-transform ${showRecentApps ? 'rotate-180' : 'rotate-0'
                    }`}
                />
              </button>

              {showRecentApps && (
                <div
                  style={{ width: dropdownWidth }}
                  className="absolute right-0 mt-12 bg-white rounded-lg shadow-lg overflow-y-auto max-h-64 z-[9999] transform transition-all duration-300 scale-100"
                >
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Recently Opened Apps</h3>
                  </div>
                  <ul className="space-y-4 p-4">
                    {recentApps.map((app, index) => (
                      <li
                        key={index}
                        className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 hover:shadow-md transition-shadow"
                      >
                        <a
                          onClick={async () => {
                            setExternalAppUrl(app.parent || app.path); // Set the input field to the app.path
                            if (app.parent) {
                              await loadApp(app.parent, app.path); // Load the parent list
                            } else {
                              setAppList({}); // Clear the app list
                              setSelectedAppIndex(-1); // Clear the selected app index
                              await loadApp(app.path); // Load the app
                            }
                            setShowRecentApps(false);
                          }}
                          className="block cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium text-gray-800 mb-1">{app.name}</h4>
                              <span className={`ml-2 text-xs font-semibold ${app.type === 'app' ? 'text-blue-500' : 'text-green-500'}`}>
                                {app.type === 'app' ? 'App' : 'List'}
                              </span>
                            </div>
                            {app.lastUsed && (
                              <span className="text-xs text-gray-400">
                                {timeSinceLastUsed(app.lastUsed)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{app.description}</p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
          <div className="mx-auto">
            <button
              className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600"
              onClick={() => { setRunId(crypto.randomUUID()); setAppList({}); loadApp() }}
            // onClick={() => { 
            //   setRunId(crypto.randomUUID()); 
            //   loadApp(); // Only call loadApp without resetting appList
            // }}
            >
              Load App
            </button>
          </div>
        </div>

        {/* App List */}
        {(appList.apps?.length > 0) && (
          <AppCarousel name={appList.name} description={appList.description} apps={appList.apps} onAppSelected={onAppSelected} selectedAppIndex={selectedAppIndex} />
        )}

        <div className=" bg-gray-100 shadow-lg rounded-md flex flex-col gap-5 p-2 pt-3 md:p-3 lg:pt-8 lg:p-6 lg:mx-20 xl:mx-40">
          {(output.approval_status || "pending") === "pending" && (
            <div className="bg-yellow-200 text-yellow-800 p-2 rounded-md md:text-sm flex justify-center items-center animate-pulse">
              <p>
                <span className="font-bold text-lg mr-2">⚠️ Wallet Support:</span>
                This page currently works only with Metamask wallet extension on desktop browser. If you are loading this page from mobile browser, please install Metamask app, and open the link from Metamask browser.
              </p>
            </div>
          )}
          <div className="px-2 text-wrap">
            {/* Conditional Navigation Path */}
            {/* {(appList.type === 'list' || appList.parent) && (
              <nav className="mb-4 bg-gray-100 p-2 rounded-md shadow-sm" title='Navigation Path'>
                <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
                  {navigationPath.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <a
                        className={`${index < navigationPath.length - 1
                          ? "text-yellow-600 cursor-pointer hover:underline hover:text-yellow-700"
                          : "text-yellow-600 cursor-default"
                          } transition-all duration-300 font-medium`}
                        onClick={() => index < navigationPath.length - 1 && handleNavigationClick(index)} // Prevent click for the last item
                        {...(index < navigationPath.length - 1 && { title: `Go to ${item}` })} // Add title only for non-last items
                      >
                        {item}
                      </a>
                      {index < navigationPath.length - 1 && (
                        <span className="mx-2 text-gray-600 font-bold">›</span> //&gt;
                      )}
                    </div>
                  ))}
                </div>
              </nav>
            )} */}

            {(appList.type === 'list' || appList.parent) && (
              <nav className="mb-4 bg-gray-100 p-2 rounded-md shadow-sm" title='Navigation Path'>
                <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
                  {navigationPaths.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <a
                        className={`${index < navigationPaths.length - 1
                          ? "text-yellow-600 cursor-pointer hover:underline hover:text-yellow-700"
                          : "text-yellow-600 cursor-default"
                          } transition-all duration-300 font-medium`}
                      // onClick={() => index < navigationPaths.length - 1 && handleNavigationClick(index)} // Prevent click for the last item
                      >
                        {resolvePathToName(item.path)}
                      </a>
                      {index < navigationPaths.length - 1 && (
                        <span className="mx-2 text-gray-600 font-bold">›</span>
                      )}
                    </div>
                  ))}
                </div>
              </nav>
            )}

            <div className="flex flex-col md:flex-row md:justify-between mb-4 md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto">
              <h1 className="font-semibold text-lg md:text-xl">{appName}</h1>
              <h3 className="text-sm md:text-base lg:text-lg">{appDescription}</h3>
            </div>
            {(components.length > 0) && (
              // <App
              //   components={components}
              //   data={data}
              //   setData={setData}
              //   contracts={contracts || []}
              //   networks={networks || []}
              //   debug={setOutputCode}
              // />
              <DynamicApp
                runId={runId}
                components={components}
                updateData={setData}
                contracts={contracts || []}
                networks={networks || []}
                debug={setOutputCode}
                whitelistedJSElements={{ fetch: fetch.bind(globalThis), alert: alert.bind(globalThis), ...wasms }}
              />
            )}
          </div>
        </div>
      </div>
      {loading && <Loading />}
    </>
  );
};

export default ExternalAppPage;
