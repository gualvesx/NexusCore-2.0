import { createContext, useContext, useState, ReactNode } from "react";

interface FilterContextType {
  selectedClass: string;
  searchTerm: string;
  category: string;
  alertsOnly: boolean;
  dateRange: { start: string; end: string };
  setSelectedClass: (value: string) => void;
  setSearchTerm: (value: string) => void;
  setCategory: (value: string) => void;
  setAlertsOnly: (value: boolean) => void;
  setDateRange: (range: { start: string; end: string }) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [alertsOnly, setAlertsOnly] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const clearFilters = () => {
    setSelectedClass("all");
    setSearchTerm("");
    setCategory("all");
    setAlertsOnly(false);
    setDateRange({ start: "", end: "" });
  };

  return (
    <FilterContext.Provider
      value={{
        selectedClass,
        searchTerm,
        category,
        alertsOnly,
        dateRange,
        setSelectedClass,
        setSearchTerm,
        setCategory,
        setAlertsOnly,
        setDateRange,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};
