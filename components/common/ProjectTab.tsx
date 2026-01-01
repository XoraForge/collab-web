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
        className={`duration-200 ease-in-out font-medium ${
          isActive === title
            ? "text-(--text)"
            : "text-(--text)/50 hover:text-(--text)"
        }`}
      >
        {title}
      </p>
    </div>
  );
}
