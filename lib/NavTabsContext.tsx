import { createContext, useContext, useState } from "react";

export type NavTabsType = {
  title?: string;
  name: string;
  url: string;
};

export type ProviderProps = {
  navTabs: NavTabsType[];
  handleCreateTabs: (props: NavTabsType) => void;
  handleDeleteTabs: (props: NavTabsType) => void;
};

export const InitialNavTabs = [
  {
    name: "Dashboard",
    url: "/dashboard",
  },
];

const NavTabContext = createContext<ProviderProps | null>(null);

export function useNavTabContext() {
  const context = useContext(NavTabContext);

  if (!context)
    throw new Error("NavTabContext cannot be used outside the JSX scope");

  return context;
}

export default function NavTabsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navTabs, setNavTabs] = useState<NavTabsType[]>(InitialNavTabs);

  function handleCreateTabs(props: NavTabsType) {
    setNavTabs((prev) =>
      prev.find((val) => val.url === props.url) ? prev : [...prev, props]
    );
  }

  function handleDeleteTabs(props: NavTabsType) {
    setNavTabs((prev) => prev.filter((value) => value.url !== props.url));
  }

  return (
    <NavTabContext.Provider
      value={{ navTabs, handleCreateTabs, handleDeleteTabs }}
    >
      {children}
    </NavTabContext.Provider>
  );
}
