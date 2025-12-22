"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

export interface currentProjectProps {
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  image: string;
  setImage: Dispatch<SetStateAction<string>>;
}

const ProjectContext = createContext<currentProjectProps | undefined>(
  undefined
);

export function useProjectContext() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error("useProjectContext must be used within a Project Provider");
  }

  return context;
}

export default function ProjectContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  return (
    <ProjectContext.Provider
      value={{
        name,
        setName,
        image,
        setImage,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
