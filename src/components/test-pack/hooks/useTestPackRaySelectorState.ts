import { useState } from "react";

export const useTestPackRaySelectorState = () => {
  const [rsQuestion, setRsQuestion] = useState("");
  const [rsNumberlineMin, setRsNumberlineMin] = useState(-10);
  const [rsNumberlineMax, setRsNumberlineMax] = useState(10);
  const [rsTickInterval, setRsTickInterval] = useState(1);
  const [rsRayType, setRsRayType] = useState("closed_right");
  const [rsRayEndpoint, setRsRayEndpoint] = useState(0);
  const [rsExplanation, setRsExplanation] = useState("");

  const resetRaySelectorState = () => {
    setRsQuestion("");
    setRsNumberlineMin(-10);
    setRsNumberlineMax(10);
    setRsTickInterval(1);
    setRsRayType("closed_right");
    setRsRayEndpoint(0);
    setRsExplanation("");
  };

  const validateRaySelector = () => {
    return (
      rsQuestion.trim().length > 0 &&
      rsNumberlineMin < rsNumberlineMax &&
      rsTickInterval > 0 &&
      rsRayEndpoint >= rsNumberlineMin &&
      rsRayEndpoint <= rsNumberlineMax &&
      ["closed_left", "open_left", "open_right", "closed_right"].includes(
        rsRayType,
      )
    );
  };

  return {
    rsQuestion,
    setRsQuestion,
    rsNumberlineMin,
    setRsNumberlineMin,
    rsNumberlineMax,
    setRsNumberlineMax,
    rsTickInterval,
    setRsTickInterval,
    rsRayType,
    setRsRayType,
    rsRayEndpoint,
    setRsRayEndpoint,
    rsExplanation,
    setRsExplanation,
    resetRaySelectorState,
    validateRaySelector,
  };
};
