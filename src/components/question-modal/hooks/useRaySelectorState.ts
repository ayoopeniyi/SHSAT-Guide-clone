import { useState } from "react";

export const useRaySelectorState = () => {
  const [rayPrompt, setRayPrompt] = useState("");
  const [numberlineMin, setNumberlineMin] = useState("");
  const [numberlineMax, setNumberlineMax] = useState("");
  const [tickInterval, setTickInterval] = useState("");
  const [rayType, setRayType] = useState("closed_right");
  const [rayEndpoint, setRayEndpoint] = useState("");
  const [rayExplanation, setRayExplanation] = useState("");
  const [selectedRayType, setSelectedRayType] = useState<string | null>(null);
  const [selectedRayEndpoint, setSelectedRayEndpoint] = useState<number | null>(
    null,
  );

  const rayTypes = [
    { value: "closed_left", label: "◀●" },
    { value: "open_left", label: "◀○" },
    { value: "open_right", label: "○▶" },
    { value: "closed_right", label: "●▶" },
  ];

  const raySelectorValid =
    typeof rayPrompt === "string" &&
    rayPrompt.trim().length > 0 &&
    numberlineMin !== "" &&
    numberlineMax !== "" &&
    tickInterval !== "" &&
    !isNaN(Number(numberlineMin)) &&
    !isNaN(Number(numberlineMax)) &&
    !isNaN(Number(tickInterval)) &&
    Number(numberlineMin) < Number(numberlineMax) &&
    Number(tickInterval) > 0 &&
    rayEndpoint !== "" &&
    !isNaN(Number(rayEndpoint)) &&
    Number(rayEndpoint) >= Number(numberlineMin) &&
    Number(rayEndpoint) <= Number(numberlineMax) &&
    !!rayType;

  const resetRaySelectorState = () => {
    setRayPrompt("");
    setNumberlineMin("");
    setNumberlineMax("");
    setTickInterval("");
    setRayType("closed_right");
    setRayEndpoint("");
    setRayExplanation("");
    setSelectedRayType(null);
    setSelectedRayEndpoint(null);
  };

  return {
    rayPrompt,
    setRayPrompt,
    numberlineMin,
    setNumberlineMin,
    numberlineMax,
    setNumberlineMax,
    tickInterval,
    setTickInterval,
    rayType,
    setRayType,
    rayEndpoint,
    setRayEndpoint,
    rayExplanation,
    setRayExplanation,
    selectedRayType,
    setSelectedRayType,
    selectedRayEndpoint,
    setSelectedRayEndpoint,
    rayTypes,
    raySelectorValid,
    resetRaySelectorState,
  };
};
