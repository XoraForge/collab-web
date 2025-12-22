"use client";

import { useState } from "react";
import MainNav from "./sidenav-variants/MainNav";
import ExpandedDoubleNav from "./sidenav-variants/ExpandedDoubleNav";

export default function SideNav() {
  const [isExpanded, setIsExpanded] = useState(true);

  function handleExpandedTrue() {
    setIsExpanded(true);
  }
  function handleExpandedFalse() {
    setIsExpanded(false);
  }

  return (
    <section
      className={`flex bg-[#222222] h-full w-[250px] justify-between duration-200 ease-in-out transition-all ${
        isExpanded && "w-[350px]"
      }`}
    >
      {!isExpanded ? (
        <MainNav
          handleExpandedTrue={handleExpandedTrue}
          handleExpandedFalse={handleExpandedFalse}
        />
      ) : (
        <ExpandedDoubleNav
          handleExpandedTrue={handleExpandedTrue}
          handleExpandedFalse={handleExpandedFalse}
        />
      )}
    </section>
  );
}
