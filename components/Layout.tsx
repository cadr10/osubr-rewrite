import React, { ReactNode } from "react";
import Header from "./Header";

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => (
  <div className="main-container">
    <Header />
    {props.children}
    
    <style jsx global>{`
      button {
        cursor: pointer;
      }
    `}</style>
    <style jsx>{`
      .laxyout {
        padding: auto;
      }
    `}</style>
  </div>
);

export default Layout;
