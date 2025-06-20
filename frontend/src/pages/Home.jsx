import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Promt from "../components/Promt";
import { LogOut, PanelTopOpen, SquarePen } from "lucide-react";
import { useNavigate } from "react-router";
import { logoutUser } from "../features/auth/authThunks";
import logo from "../../public/logo.webp";

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logout successfully");
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white overflow-hidden">
      <div
        className={`${
          isSidebarOpen
            ? "w-50 lg:w-60 fixed md:relative top-0 left-0 h-full z-100"
            : "w-0"
        }`}
      >
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col ${
          isSidebarOpen ? "w-[82%]" : "w-full"
        } `}
      >
        {/* Header for mobile */}
        <div
          className={` ${
            isSidebarOpen ? "hidden-visible" : ""
          }  w-full border-b border-gray-800 bg-transparent left-0 flex  justify-between p-1.5 px-4`}
        >
          <div className="flex gap-1"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          >
            <div
              className={`flex items-center gap-1.5 text-[18px] font-bold ${
                isSidebarOpen ? "hidden" : ""
              } text-gray-200 py-1`}
            >
              <img src={logo} alt="DeepSeek Logo" className="h-7 rounded-lg" />
              NexAi
            </div>
            <button
              
              className="cursor-pointer rounded-xl active:scale-95  p-1.5"
            >
              {isSidebarOpen ? (
                <PanelTopOpen className="w-6 h-6 rotate-90" />
              ) : (
                <PanelTopOpen className="w-6 h-6 -rotate-90" />
              )}
            </button>
             
           
          </div>
            <button
              className="cursor-pointer flex items-center gap-1.5 active:scale-95 text-sm rounded-xl px-2"
              onClick={() => {
                navigate("/");
              }}
            >
              <SquarePen className="w-6 h-6" />
              New Chat
            </button>
        </div>

        {/* Message area */}
        <div className="flex-1 flex items-center justify-center">
          <Promt />
        </div>
      </div>

    </div>
  );
}

export default Home;
