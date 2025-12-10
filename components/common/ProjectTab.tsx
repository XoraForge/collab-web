import React, { SetStateAction } from "react";

export default function ProjectTab({
  title,
  isActive,
  setIsActive,
}: {
  title: string;
  isActive: string;
  setIsActive: React.Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="cursor-pointer" onClick={() => setIsActive(title)}>
      <p
        className={`text-[#ffffff50] duration-200 ease-in-out hover:text-[#ffffff] font-medium ${
          isActive == title && "text-white"
        }`}
      >
        {title}
      </p>
    </div>
  );
}
