import React, { useState, useRef } from "react";

interface GraphSelectorPoint {
  x: number;
  y: number;
  is_correct: boolean;
  point_label?: string;
}

interface GraphSelectorInteractivePreviewProps {
  xMin: string;
  xMax: string;
  yMin: string;
  yMax: string;
  gridInterval: string;
  showAxes: boolean;
  showLabels: boolean;
  snapToGrid: boolean;
  maxSelectablePoints: string;
  availablePoints: GraphSelectorPoint[];
  selectedPoints: GraphSelectorPoint[];
  onPointsChange: (points: GraphSelectorPoint[]) => void;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const GraphSelectorInteractivePreview: React.FC<
  GraphSelectorInteractivePreviewProps
> = ({
  xMin,
  xMax,
  yMin,
  yMax,
  gridInterval,
  showAxes,
  showLabels,
  snapToGrid,
  maxSelectablePoints,
  availablePoints,
  selectedPoints,
  onPointsChange,
  xAxisLabel,
  yAxisLabel,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Convert string values to numbers and validate
  const xMinNum = Number(xMin);
  const xMaxNum = Number(xMax);
  const yMinNum = Number(yMin);
  const yMaxNum = Number(yMax);
  const intervalNum = Number(gridInterval);
  const maxPoints = Number(maxSelectablePoints);

  // Check if values are valid
  const isValidInput =
    xMin !== "" &&
    xMax !== "" &&
    yMin !== "" &&
    yMax !== "" &&
    gridInterval !== "" &&
    !isNaN(xMinNum) &&
    !isNaN(xMaxNum) &&
    !isNaN(yMinNum) &&
    !isNaN(yMaxNum) &&
    !isNaN(intervalNum) &&
    xMinNum < xMaxNum &&
    yMinNum < yMaxNum &&
    intervalNum > 0;

  if (!isValidInput) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-center">
        <p className="text-gray-500">
          Please enter valid coordinate values (xMin &lt; xMax, yMin &lt; yMax,
          interval &gt; 0) to see the preview
        </p>
      </div>
    );
  }

  // SVG dimensions and scaling
  const svgWidth = 600;
  const svgHeight = 400;
  const padding = 80;
  const graphWidth = svgWidth - 2 * padding;
  const graphHeight = svgHeight - 2 * padding;

  const xScale = graphWidth / (xMaxNum - xMinNum);
  const yScale = graphHeight / (yMaxNum - yMinNum);

  // Convert coordinate to SVG position
  const coordToSvg = (x: number, y: number) => ({
    x: padding + (x - xMinNum) * xScale,
    y: svgHeight - padding - (y - yMinNum) * yScale,
  });

  // Convert SVG position to coordinate
  const svgToCoord = (svgX: number, svgY: number) => {
    let x = xMinNum + (svgX - padding) / xScale;
    let y = yMinNum + (svgHeight - padding - svgY) / yScale;

    // Snap to grid if enabled
    if (snapToGrid) {
      x = Math.round(x / intervalNum) * intervalNum;
      y = Math.round(y / intervalNum) * intervalNum;
    }

    return { x, y };
  };

  // Handle click on graph
  const handleGraphClick = (e: React.MouseEvent) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const svgY = e.clientY - rect.top;

    const coord = svgToCoord(svgX, svgY);

    // Check bounds
    if (
      coord.x < xMinNum ||
      coord.x > xMaxNum ||
      coord.y < yMinNum ||
      coord.y > yMaxNum
    ) {
      return;
    }

    // Check if point already exists at this coordinate
    const existingIndex = selectedPoints.findIndex(
      (p) => Math.abs(p.x - coord.x) < 0.01 && Math.abs(p.y - coord.y) < 0.01,
    );

    if (existingIndex >= 0) {
      // Remove existing point
      const newPoints = selectedPoints.filter((_, i) => i !== existingIndex);
      onPointsChange(newPoints);
    } else {
      // Add new point if under limit
      if (!maxSelectablePoints || selectedPoints.length < maxPoints) {
        // Check if this coordinate matches an available point
        const availablePoint = availablePoints.find(
          (p) =>
            Math.abs(p.x - coord.x) < 0.01 && Math.abs(p.y - coord.y) < 0.01,
        );

        const newPoint: GraphSelectorPoint = {
          x: coord.x,
          y: coord.y,
          is_correct: availablePoint?.is_correct || false,
          point_label: availablePoint?.point_label,
        };

        onPointsChange([...selectedPoints, newPoint]);
      }
    }
  };

  // Generate grid lines
  const generateGridLines = () => {
    const lines = [];

    // Vertical grid lines
    for (
      let x = Math.ceil(xMinNum / intervalNum) * intervalNum;
      x <= xMaxNum;
      x += intervalNum
    ) {
      const svgPos = coordToSvg(x, 0);
      lines.push(
        <line
          key={`v-${x}`}
          x1={svgPos.x}
          y1={padding}
          x2={svgPos.x}
          y2={svgHeight - padding}
          stroke="#e5e7eb"
          strokeWidth="1"
        />,
      );
    }

    // Horizontal grid lines
    for (
      let y = Math.ceil(yMinNum / intervalNum) * intervalNum;
      y <= yMaxNum;
      y += intervalNum
    ) {
      const svgPos = coordToSvg(0, y);
      lines.push(
        <line
          key={`h-${y}`}
          x1={padding}
          y1={svgPos.y}
          x2={svgWidth - padding}
          y2={svgPos.y}
          stroke="#e5e7eb"
          strokeWidth="1"
        />,
      );
    }

    return lines;
  };

  // Generate tick marks and labels
  const generateTicks = () => {
    const ticks = [];

    if (showLabels) {
      // X-axis ticks
      for (
        let x = Math.ceil(xMinNum / intervalNum) * intervalNum;
        x <= xMaxNum;
        x += intervalNum
      ) {
        if (Math.abs(x) < 0.001) continue; // Skip origin
        const svgPos = coordToSvg(x, 0);
        ticks.push(
          <g key={`x-tick-${x}`}>
            <line
              x1={svgPos.x}
              y1={originPos.y - 5}
              x2={svgPos.x}
              y2={originPos.y + 5}
              stroke="#374151"
              strokeWidth="2"
            />
            <text
              x={svgPos.x}
              y={svgHeight - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#374151"
            >
              {x}
            </text>
          </g>,
        );
      }

      // Y-axis ticks
      for (
        let y = Math.ceil(yMinNum / intervalNum) * intervalNum;
        y <= yMaxNum;
        y += intervalNum
      ) {
        if (Math.abs(y) < 0.001) continue; // Skip origin
        const svgPos = coordToSvg(0, y);
        ticks.push(
          <g key={`y-tick-${y}`}>
            <line
              x1={originPos.x - 5}
              y1={svgPos.y}
              x2={originPos.x + 5}
              y2={svgPos.y}
              stroke="#374151"
              strokeWidth="2"
            />
            <text
              x={padding - 20}
              y={svgPos.y + 4}
              textAnchor="middle"
              fontSize="12"
              fill="#374151"
            >
              {y}
            </text>
          </g>,
        );
      }
    }

    return ticks;
  };

  const originPos = coordToSvg(0, 0);

  return (
    <div className="space-y-4">
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
          cursor: "crosshair",
        }}
        onClick={handleGraphClick}
      >
        {/* Grid lines */}
        {generateGridLines()}

        {/* Axes */}
        {showAxes && (
          <>
            {/* Define arrow markers */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
              </marker>
            </defs>

            {/* X-axis line with arrows on both ends */}
            <line
              x1={padding - 15}
              y1={originPos.y}
              x2={svgWidth - padding + 15}
              y2={originPos.y}
              stroke="#374151"
              strokeWidth="2"
            />
            {/* Left arrow on X-axis */}
            <polygon
              points={`${padding - 15},${originPos.y} ${padding - 5},${originPos.y - 5} ${padding - 5},${originPos.y + 5}`}
              fill="#374151"
            />
            {/* Right arrow on X-axis */}
            <polygon
              points={`${svgWidth - padding + 15},${originPos.y} ${svgWidth - padding + 5},${originPos.y - 5} ${svgWidth - padding + 5},${originPos.y + 5}`}
              fill="#374151"
            />

            {/* Y-axis line with arrows on both ends */}
            <line
              x1={originPos.x}
              y1={svgHeight - padding + 15}
              x2={originPos.x}
              y2={padding - 15}
              stroke="#374151"
              strokeWidth="2"
            />
            {/* Bottom arrow on Y-axis */}
            <polygon
              points={`${originPos.x},${svgHeight - padding + 15} ${originPos.x - 5},${svgHeight - padding + 5} ${originPos.x + 5},${svgHeight - padding + 5}`}
              fill="#374151"
            />
            {/* Top arrow on Y-axis */}
            <polygon
              points={`${originPos.x},${padding - 15} ${originPos.x - 5},${padding - 5} ${originPos.x + 5},${padding - 5}`}
              fill="#374151"
            />
          </>
        )}

        {/* Tick marks and labels */}
        {generateTicks()}

        {/* Origin label removed */}

        {/* Available points (show as light dots) */}
        {availablePoints.map((point, index) => {
          const svgPos = coordToSvg(point.x, point.y);
          const isSelected = selectedPoints.some(
            (p) =>
              Math.abs(p.x - point.x) < 0.01 && Math.abs(p.y - point.y) < 0.01,
          );

          return (
            <circle
              key={`available-${index}`}
              cx={svgPos.x}
              cy={svgPos.y}
              r="4"
              fill={isSelected ? "#3b82f6" : "#d1d5db"}
              stroke="#374151"
              strokeWidth="1"
              style={{ cursor: "pointer" }}
            />
          );
        })}

        {/* Selected points */}
        {selectedPoints.map((point, index) => {
          const svgPos = coordToSvg(point.x, point.y);
          return (
            <g key={`selected-${index}`}>
              <circle
                cx={svgPos.x}
                cy={svgPos.y}
                r="6"
                fill="#3b82f6"
                stroke="#1e40af"
                strokeWidth="2"
                style={{ cursor: "pointer" }}
              />
              {point.point_label && (
                <text
                  x={svgPos.x}
                  y={svgPos.y - 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#1e40af"
                  fontWeight="bold"
                >
                  {point.point_label}
                </text>
              )}
            </g>
          );
        })}
        {/* Axis Labels positioned outside graph */}
        {xAxisLabel && (
          <text
            x={originPos.x + (svgWidth - padding - originPos.x) / 2}
            y={svgHeight - 10}
            textAnchor="middle"
            fontSize="14"
            fill="#374151"
            fontWeight="500"
          >
            {xAxisLabel}
          </text>
        )}

        {yAxisLabel && (
          <text
            x={15}
            y={originPos.y - (originPos.y - padding) / 2}
            textAnchor="middle"
            fontSize="14"
            fill="#374151"
            fontWeight="500"
            transform={`rotate(-90, 15, ${originPos.y - (originPos.y - padding) / 2})`}
          >
            {yAxisLabel}
          </text>
        )}
      </svg>

      {/* Controls */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Selected: {selectedPoints.length}
          {maxSelectablePoints && ` / ${maxPoints}`}
        </div>
        <div className="flex gap-4">
          <div>Click to select/deselect points</div>
          {selectedPoints.length > 0 && (
            <button
              onClick={() => onPointsChange([])}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
