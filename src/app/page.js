import Image from "next/image";
import Map from "./components/map";
import RealtimeData from "./components/index";
import SideBar from "./components/sideBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6 flex flex-col">
      <h1 className="text-5xl font-extrabold text-center text-gray-800 drop-shadow-lg mb-6">
        Smart Dustbins
      </h1>
      <div className="flex flex-grow gap-6">
        <div className=" ">
          <SideBar />
        </div>
        <div className=" flex-grow bg-white shadow-2xl rounded-2xl p-6">
          {/* <RealtimeData /> */}
          <Map />
        </div>
      </div>
      {/* <footer className="text-center text-gray-700 mt-8 p-4 border-t border-gray-300">
        <p className="text-sm">Made with ❤️ by Vivek Yadav</p>
      </footer> */}
    </div>
  );
}
