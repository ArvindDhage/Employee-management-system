import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ChatWidget from "./ChatWidget";   
 
const MainLayout = () => (
  <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
    <Sidebar />
    <div style={{ marginLeft: 220, flexGrow: 1, minHeight: "100vh", overflowX: "hidden" }}>
      <Outlet />
    </div>
    <ChatWidget /> 
  </div>
);
 
export default MainLayout;