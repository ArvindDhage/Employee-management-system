import React from "react";
import logo from "../Assets/image.png";

export default function EMSLogo({ size = "md" }) {
  const sizes = {
    sm: 30,
    md: 45,
    lg: 60,
  };

  return (
    <img
      src={logo}
      alt="EMS Logo"
      style={{ width: sizes[size], height: "auto" }}
    />
  );
}
