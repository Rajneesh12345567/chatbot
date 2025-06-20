import { PanelTopClose, SquarePen, LogOut, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import logo from "../../public/logo.webp";
import icon from "../../public/icon.webp";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/auth/authThunks";
import { toast } from "react-hot-toast";

function Sidebar({ setIsSidebarOpen, isSidebarOpen }) {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axiosClient.get("/chat/allChats");
        if (res.data.success) {
          setChats(res.data.chats);
        }
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };
    fetchChats();
  }, []);

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const handleNewChatClick = () => {
    navigate("/");
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    // Get and parse localStorage data
    const persistedAuth = localStorage.getItem("persist:auth");
    if (persistedAuth) {
      const parsedAuth = JSON.parse(persistedAuth);
      const user = JSON.parse(parsedAuth.user);
      setFirstName(user.firstName); // Example: Sonu
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    if (loading) return; // Prevent multiple clicks

    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err?.message || "Logout failed");
    }
  };

  return (
    <div
      className={`h-full ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } overflow-auto transition-transform flex flex-col justify-between px-4 relative bg-[#2d2d2d] z-50`}
    >
      {/* Header */}
      <div>
        <div className="flex border-b border-gray-600 p-2 justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-[18px] font-bold text-gray-200 py-1">
            <img src={logo} alt="DeepSeek Logo" className="h-7 rounded-lg" />
            NexAi
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="cursor-pointer md:hidden active:scale-95 rounded-xl p-1.5"
          >
            <PanelTopClose className="w-6 h-6 -rotate-90" />
          </button>
        </div>

        <button
          className="cursor-pointer bg-blue-800 active:scale-98 text-gray-300 px-3 rounded-xl p-1.5 w-full flex items-center gap-2"
          onClick={handleNewChatClick}
        >
          <SquarePen className="w-5 h-5" /> New Chat
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full mt-3 px-3 py-1.5 pl-8.5 rounded-xl bg-[#424242] text-white placeholder-gray-400 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute top-5 left-2 w-5 h-5 text-gray-400" />
        </div>
        {/* Chat List */}
        <div className="flex-1 overflow-auto h-[82%]  py-3 space-y-1">
          {chats.length > 0 ? (
            chats.filter((chat) => {
              const messageText =
                chat.messages?.[0]?.parts?.[0]?.text?.toLowerCase() || "";
              return messageText.includes(searchTerm.toLowerCase());
            }).length > 0 ? (
              chats
                .filter((chat) => {
                  const messageText =
                    chat.messages?.[0]?.parts?.[0]?.text?.toLowerCase() || "";
                  return messageText.includes(searchTerm.toLowerCase());
                })
                .map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => handleChatClick(chat._id)}
                    className="cursor-pointer px-3 py-2 rounded-xl hover:bg-[#424242] active:scale-98 hover:font-semibold  text-gray-200 truncate"
                    title={chat.messages?.[0]?.parts?.[0]?.text || "Empty Chat"}
                  >
                    {chat.messages?.[0]?.parts?.[0]?.text?.slice(0, 30) ||
                      "New Chat"}
                  </div>
                ))
            ) : (
              <div className="text-gray-500 text-sm mt-20 text-center">
                No chats found
              </div>
            )
          ) : (
            <div className="text-gray-500 text-sm mt-20 text-center">
              No chat history yet
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pb-2 border-t border-gray-600">
        <div className="flex items-center gap-2 pl-2 cursor-pointer my-3">
          <img src={icon} alt="profile" className="rounded-full w-8 h-8" />
          <span className="text-gray-300 font-bold">
            {" "}
            {firstName ? firstName : "My Profile"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          disabled={loading}
          className={`w-full flex items-center gap-2 text-white text-sm px-3 py-2 rounded-lg transition duration-300 cursor-pointer 
    ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#726e6e]"}`}
        >
          <LogOut />
          {loading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}

export default React.memo(Sidebar);
