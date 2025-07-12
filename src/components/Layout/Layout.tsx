import s from "./Layout.module.css";
import React from "react";
import Navbar from "./Navbar/Navbar";
import BackgroundCarousel from "../BackgroundCarousel/BackgroundCarousel";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={s.layout}>
      <Navbar />
      <BackgroundCarousel />
      {children}
    </div>
  );
};

export default Layout;
