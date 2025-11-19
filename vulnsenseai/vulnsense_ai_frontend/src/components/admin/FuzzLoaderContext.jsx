import { createContext, useContext, useState } from "react";
import FuzzLoader from "./FuzzLoader.jsx";

const FuzzLoaderContext = createContext();

export function FuzzLoaderProvider({ children }) {
  const [fuzzloading, setFuzzLoading] = useState(false);

  return (
    <FuzzLoaderContext.Provider value={{ fuzzloading, setFuzzLoading }}>
      {children}
      {fuzzloading && <FuzzLoader />} 
    </FuzzLoaderContext.Provider>
  );
}

export function useFuzzLoader() {
  return useContext(FuzzLoaderContext);
}
