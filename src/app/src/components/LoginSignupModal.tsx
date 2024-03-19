import React, { useState, useEffect, useRef } from "react";
import { BASE_API_URL } from "./constants";

const LoginSignupModal = ({ closeModal }: { closeModal: () => void }) => {
  const [userData, setUserData] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserData();

    // Add event listener to handle clicks outside the modal
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [closeModal]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/auth/user`, {
        credentials: "include",
      });
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const userData = await response.json();
          setUserData(userData);
        } else {
          console.error("Response is not valid JSON");
        }
      } else {
        console.error("Failed to fetch user data:", response.status);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-md p-4 md:p-8 w-full max-w-md">
        <span
          className="absolute font-bold top-0 right-0 cursor-pointer bg-slate-500 text-2xl rounded-full  pb-1 px-2.5 m-1 transition duration-300 hover:bg-gray-700 hover:text-white hover:scale-110"
          onClick={closeModal}
        >
          &times;
        </span>

        {userData && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Welcome, {userData.login}
            </h2>
            <p className="text-gray-600 mb-4">
              Created on: {userData.created_on}
            </p>
            <img
              className="mx-auto w-32 h-32 rounded-full object-cover mb-4"
              src={userData.avatar_url}
              alt="User Avatar"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginSignupModal;
