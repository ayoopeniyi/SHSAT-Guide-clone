import React from "react";

interface RaySelectorInteractivePreviewProps {
  min: string;
  max: string;
  tick: string;
  rayTypes: Array<{ value: string; label: string }>;
  selectedRayType: string | null;
  setSelectedRayType: (value: string | null) => void;
  selectedRayEndpoint: number | null;
  setSelectedRayEndpoint: (value: number | null) => void;
}

export const RaySelectorInteractivePreview: React.FC<
  RaySelectorInteractivePreviewProps
> = ({
  min,
  max,
  tick,
  rayTypes,
  selectedRayType,
  setSelectedRayType,
  selectedRayEndpoint,
  setSelectedRayEndpoint,
}) => {
  // Convert string values to numbers and validate
  const minNum = Number(min);
  const maxNum = Number(max);
  const tickNum = Number(tick);

  // Check if values are valid
  const isValidInput =
    min !== "" &&
    max !== "" &&
    tick !== "" &&
    !isNaN(minNum) &&
    !isNaN(maxNum) &&
    !isNaN(tickNum) &&
    minNum < maxNum &&
    tickNum > 0 &&
    (maxNum - minNum) / tickNum <= 1000; // Prevent too many ticks

  if (!isValidInput) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-center">
        <p className="text-gray-500">
          Please enter valid number line values (Min &lt; Max, Tick &gt; 0) to
          see the preview
        </p>
      </div>
    );
  }

  const width = 500;
  const height = 120;
  const padding = 50;
  const lineY = 50;
  const unit = (width - 2 * padding) / (maxNum - minNum);
  const ticks = [];

  // Safe tick calculation
  try {
    for (let v = minNum; v <= maxNum + 1e-8; v += tickNum) {
      ticks.push(Number(v.toFixed(8)));
      if (ticks.length > 1000) break; // Safety limit
    }
  } catch (error) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-center">
        <p className="text-red-500">
          Invalid tick interval. Please use a smaller value.
        </p>
      </div>
    );
  }

  // Drag logic
  const [dragging, setDragging] = React.useState(false);
  const svgRef = React.useRef(null);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedRayType) return;
    setDragging(true);
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    setDragging(false);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !selectedRayType) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = (svg as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    let value = minNum + (mouseX - padding) / unit;
    // Snap to nearest tick
    let closest = ticks.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
    );
    // Clamp
    closest = Math.max(minNum, Math.min(maxNum, closest));
    setSelectedRayEndpoint(closest);
  };
  // Remove ray
  const handleRemove = () => {
    setSelectedRayType(null);
    setSelectedRayEndpoint(null);
  };
  // Default endpoint if none
  const endpoint = selectedRayEndpoint ?? 0;
  const endpointX = padding + (endpoint - minNum) * unit;
  // Ray configs
  const rayConfigs = [
    { value: "closed_left", label: "◀●", dir: -1, open: false },
    { value: "open_left", label: "◀○", dir: -1, open: true },
    { value: "open_right", label: "○▶", dir: 1, open: true },
    { value: "closed_right", label: "●▶", dir: 1, open: false },
  ];

  return (
    <div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px #0001",
          marginBottom: 16,
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Number line with extended length for arrows */}
        <line
          x1={padding - 15}
          y1={lineY}
          x2={width - padding + 15}
          y2={lineY}
          stroke="#333"
          strokeWidth="2"
        />

        {/* Left arrow */}
        <polygon
          points={`${padding - 15},${lineY} ${padding - 5},${lineY - 8} ${padding - 5},${lineY - 3} ${padding},${lineY - 3} ${padding},${lineY + 3} ${padding - 5},${lineY + 3} ${padding - 5},${lineY + 8}`}
          fill="#333"
        />

        {/* Right arrow */}
        <polygon
          points={`${width - padding + 15},${lineY} ${width - padding + 5},${lineY - 8} ${width - padding + 5},${lineY - 3} ${width - padding},${lineY - 3} ${width - padding},${lineY + 3} ${width - padding + 5},${lineY + 3} ${width - padding + 5},${lineY + 8}`}
          fill="#333"
        />

        {/* Ticks and labels */}
        {ticks.map((value, i) => {
          const x = padding + (value - minNum) * unit;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={lineY - 5}
                x2={x}
                y2={lineY + 5}
                stroke="#333"
                strokeWidth="1"
              />
              <text
                x={x}
                y={lineY + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* Ray rendering */}
        {selectedRayType &&
          selectedRayEndpoint !== null &&
          (() => {
            const config = rayConfigs.find(
              (rc) => rc.value === selectedRayType,
            );
            if (!config) return null;

            // Calculate the number line bounds
            const lineStartX = padding; // Left bound of number line
            const lineEndX = padding + (maxNum - minNum) * unit; // Right bound of number line

            const rayStartX = config.dir === -1 ? lineStartX : endpointX;
            const rayEndX = config.dir === -1 ? endpointX : lineEndX;

            return (
              <g>
                {/* Ray line */}
                <line
                  x1={rayStartX}
                  y1={lineY}
                  x2={rayEndX}
                  y2={lineY}
                  stroke="#007bff"
                  strokeWidth="4"
                  opacity="0.7"
                />
                {/* Endpoint */}
                <circle
                  cx={endpointX}
                  cy={lineY}
                  r="6"
                  fill={config.open ? "white" : "#007bff"}
                  stroke="#007bff"
                  strokeWidth="2"
                />
                {/* Arrow */}
                {config.dir === -1 && (
                  <polygon
                    points={`${Math.max(rayStartX + 15, rayStartX + 10)},${lineY - 6} ${rayStartX},${lineY} ${Math.max(rayStartX + 15, rayStartX + 10)},${lineY + 6}`}
                    fill="#007bff"
                  />
                )}
                {config.dir === 1 && (
                  <polygon
                    points={`${Math.min(rayEndX - 15, rayEndX - 10)},${lineY - 6} ${rayEndX},${lineY} ${Math.min(rayEndX - 15, rayEndX - 10)},${lineY + 6}`}
                    fill="#007bff"
                  />
                )}
              </g>
            );
          })()}
      </svg>

      {/* Ray type selector */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Select Ray Type:</div>
        <div className="flex gap-2">
          {rayConfigs.map((rc) => (
            <button
              key={rc.value}
              className={`flex items-center justify-center h-16 w-24 rounded-md border-2 text-3xl transition-all duration-100 ${
                selectedRayType === rc.value
                  ? "bg-white border-blue-500"
                  : "bg-black border-black text-white hover:bg-gray-800"
              }`}
              onClick={() => {
                setSelectedRayType(rc.value);
                setSelectedRayEndpoint(selectedRayEndpoint ?? 0);
              }}
              type="button"
            >
              {rc.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center">
        <button
          className="w-32 py-2 rounded-md border-2 border-black bg-white text-black font-semibold text-lg hover:bg-gray-100"
          onClick={handleRemove}
          type="button"
          disabled={!selectedRayType}
        >
          Remove
        </button>
      </div>
    </div>
  );
};
