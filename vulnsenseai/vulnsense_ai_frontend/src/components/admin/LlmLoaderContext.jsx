import { createContext, useContext, useState } from "react";
import LlmLoader from "./LLMLoader.jsx";

const LlmLoaderContext = createContext();

export function LlmLoaderProvider({ children }) {
  const [llmloading, setLlmLoading] = useState(false);

  return (
    <LlmLoaderContext.Provider value={{ llmloading, setLlmLoading }}>
      {children}
      {llmloading && <LlmLoader />} 
    </LlmLoaderContext.Provider>
  );
}

export function useLlmLoader() {
  return useContext(LlmLoaderContext);
}
