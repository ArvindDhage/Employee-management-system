import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const SIDEBAR_WIDTH = 220;

export default function MainLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>

      <Sidebar />

      <div
        style={{
          flexGrow: 1,
          marginLeft: SIDEBAR_WIDTH,
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
        }}
      >
        <Navbar />

        {/* All pages go here */}
        <div style={{ padding: "20px" }}>
          {children}
        </div>
      </div>

    </div>
  );
}
