// static preview components for QuestionCard

export const RaySelectorStaticPreview = ({
  min,
  max,
  tick,
}: any) => {
  const width = 400;
  const height = 80;
  const padding = 50;
  const lineY = 40;
  const unit = (width - 2 * padding) / (max - min);
  const ticks: number[] = [];
  for (let v = min; v <= max + 1e-8; v += tick) ticks.push(Number(v.toFixed(8)));
  return (
    <div className="w-full max-w-full overflow-hidden">
      <svg width={width} height={height} className="w-full max-w-full h-auto" style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001", marginBottom: 2 }}>
        <line x1={padding - 15} y1={lineY} x2={width - padding + 15} y2={lineY} stroke="#333" strokeWidth="2" />
        <polygon points={`${padding - 15},${lineY} ${padding - 5},${lineY - 8} ${padding - 5},${lineY - 3} ${padding},${lineY - 3} ${padding},${lineY + 3} ${padding - 5},${lineY + 3} ${padding - 5},${lineY + 8}`} fill="#333" />
        <polygon points={`${width - padding + 15},${lineY} ${width - padding + 5},${lineY - 8} ${width - padding + 5},${lineY - 3} ${width - padding},${lineY - 3} ${width - padding},${lineY + 3} ${width - padding + 5},${lineY + 3} ${width - padding + 5},${lineY + 8}`} fill="#333" />
        {ticks.map((value, i) => {
          const x = padding + (value - min) * unit;
          return (
            <g key={i}>
              <line x1={x} y1={lineY - 5} x2={x} y2={lineY + 5} stroke="#333" strokeWidth="1" />
              <text x={x} y={lineY + 20} textAnchor="middle" fontSize="12" fill="#666">{value}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const GraphSelectorStaticPreview = ({
  xMin,
  xMax,
  yMin,
  yMax,
  points,
  showAxes = true,
  showLabels = true,
  xAxisLabel,
  yAxisLabel,
}: any) => {
  const width = 300;
  const height = 200;
  const padding = 40;
  const xScale = (width - 2 * padding) / (xMax - xMin);
  const yScale = (height - 2 * padding) / (yMax - yMin);
  const originPos = { x: padding + -xMin * xScale, y: height - padding - -yMin * yScale };
  return (
    <div className="border rounded-lg p-2 bg-gray-50 w/full max-w-full overflow-hidden">
      <svg width={width} height={height} className="bg-white border max-w-full h-auto">
        {[...Array(xMax - xMin + 1)].map((_, i) => (
          <line key={`v${i}`} x1={padding + i * xScale} y1={padding} x2={padding + i * xScale} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
        ))}
        {[...Array(yMax - yMin + 1)].map((_, i) => (
          <line key={`h${i}`} x1={padding} y1={padding + i * yScale} x2={width - padding} y2={padding + i * yScale} stroke="#e5e7eb" strokeWidth="1" />
        ))}
        {showAxes && (
          <>
            <line x1={padding - 15} y1={originPos.y} x2={width - padding + 15} y2={originPos.y} stroke="#374151" strokeWidth="2" />
            <polygon points={`${padding - 15},${originPos.y} ${padding - 5},${originPos.y - 5} ${padding - 5},${originPos.y + 5}`} fill="#374151" />
            <polygon points={`${width - padding + 15},${originPos.y} ${width - padding + 5},${originPos.y - 5} ${width - padding + 5},${originPos.y + 5}`} fill="#374151" />
            <line x1={originPos.x} y1={height - padding + 15} x2={originPos.x} y2={padding - 15} stroke="#374151" strokeWidth="2" />
            <polygon points={`${originPos.x},${height - padding + 15} ${originPos.x - 5},${height - padding + 5} ${originPos.x + 5},${height - padding + 5}`} fill="#374151" />
            <polygon points={`${originPos.x},${padding - 15} ${originPos.x - 5},${padding - 5} ${originPos.x + 5},${padding - 5}`} fill="#374151" />
          </>
        )}
        {points && points.map((point: any, idx: number) => (
          <circle key={idx} cx={padding + (point.x - xMin) * xScale} cy={height - padding - (point.y - yMin) * yScale} r="6" fill="#3b82f6" stroke="#374151" strokeWidth="2" />
        ))}
        {showLabels && (
          <>
            {[...Array(xMax - xMin + 1)].map((_, i) => {
              const value = xMin + i;
              if (value === 0) return null;
              return <text key={`xl${i}`} x={padding + i * xScale} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#6b7280">{value}</text>;
            })}
            {[...Array(yMax - yMin + 1)].map((_, i) => {
              const value = yMin + i;
              if (value === 0) return null;
              return <text key={`yl${i}`} x={padding - 20} y={height - padding - i * yScale + 4} textAnchor="middle" fontSize="12" fill="#6b7280">{value}</text>;
            })}
          </>
        )}
        {xAxisLabel && (
          <text x={originPos.x + (width - padding - originPos.x) / 2} y={height - 5} textAnchor="middle" fontSize="12" fill="#374151" fontWeight="500">{xAxisLabel}</text>
        )}
        {yAxisLabel && (
          <text x={10} y={originPos.y - (originPos.y - padding) / 2} textAnchor="middle" fontSize="12" fill="#374151" fontWeight="500" transform={`rotate(-90, 10, ${originPos.y - (originPos.y - padding) / 2})`}>{yAxisLabel}</text>
        )}
      </svg>
    </div>
  );
};


