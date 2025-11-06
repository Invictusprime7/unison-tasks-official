import * as React from "react";

export type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

export const SidebarContextProvider = React.createContext<SidebarContext | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContextProvider);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}