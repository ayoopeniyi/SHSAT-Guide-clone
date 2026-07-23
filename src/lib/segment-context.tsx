import { createContext, useContext, useState, ReactNode } from "react";

// Define available user segments/roles
export type UserSegment =
  | "default"
  | "student"
  | "parent"
  | "educator"
  | "tutor";

// Define the context shape
type SegmentContextType = {
  segment: UserSegment;
  setSegment: (segment: UserSegment) => void;
};

// Create the context with default values
const SegmentContext = createContext<SegmentContextType>({
  segment: "default",
  setSegment: () => {},
});

// Custom hook to use the segment context
export const useSegment = () => useContext(SegmentContext);

// Provider component
export const SegmentProvider = ({ children }: { children: ReactNode }) => {
  const [segment, setSegment] = useState<UserSegment>("default");

  return (
    <SegmentContext.Provider value={{ segment, setSegment }}>
      {children}
    </SegmentContext.Provider>
  );
};
