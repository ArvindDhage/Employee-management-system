import { Outlet } from "react-router-dom";
import ManagerSidebar from "./ManagerSidebar";
import ChatWidget from "./ChatWidget";   
 
const ManagerLayout = () => (
  <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
    <ManagerSidebar />
    <div style={{ marginLeft: 260, flexGrow: 1, minHeight: "100vh", overflowX: "hidden" }}>
      <Outlet />
    </div>
    <ChatWidget />   
  </div>
);
 
export default ManagerLayout;