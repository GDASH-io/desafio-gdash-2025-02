import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DoubleLineChartComponentProps<T> {
  data: T[];
  xAxisKey:string;
  leftDataKey:string;
  rightDataKey:string;
  leftYAxisLabel?: string;
  rightYAxisLabel?: string;
  leftLineColor?: string;
  leftDotColor?: string;
  leftActiveDotColor?: string;
  rightLineColor?: string;
  rightDotColor?: string;
  rightActiveDotColor?: string;
  leftLegendLabel?: string;
  rightLegendLabel?: string;
  leftTooltipLabel?: string;
  rightTooltipLabel?: string;
  leftTooltipUnit?: string;
  rightTooltipUnit?: string;
}

function DoubleLineChartComponent<T>({ 
  data, 
  xAxisKey,
  leftDataKey,
  rightDataKey,
  leftYAxisLabel = '',
  rightYAxisLabel = '',
  leftLineColor = '#f59250',
  leftDotColor = '#fd751a',
  leftActiveDotColor = '#b96000',
  rightLineColor = '#0064b7',
  rightDotColor = '#4fa6ed',
  rightActiveDotColor = '#004e8d',
  leftLegendLabel,
  rightLegendLabel,
  leftTooltipLabel,
  rightTooltipLabel,
  leftTooltipUnit = '',
  rightTooltipUnit = ''
}: DoubleLineChartComponentProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
        <XAxis
          dataKey={xAxisKey}
          style={{ fontSize: "12px" }}
        />
        <YAxis
          yAxisId="left"
          style={{ fontSize: "12px" }}
          label={{
            value: leftYAxisLabel,
            angle: -90,
            position: "insideLeft",
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          style={{ fontSize: "12px" }}
          label={{
            value: rightYAxisLabel,
            angle: 90,
            position: "insideRight",
          }}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === leftDataKey) {
              return [
                `${value}${leftTooltipUnit}`, 
                leftTooltipLabel || String(leftDataKey)
              ];
            }
            if (name === rightDataKey) {
              return [
                `${value}${rightTooltipUnit}`, 
                rightTooltipLabel || String(rightDataKey)
              ];
            }
            return [value, name];
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          formatter={(value: string) => {
            if (value === leftDataKey) {
              return leftLegendLabel || String(leftDataKey);
            }
            if (value === rightDataKey) {
              return rightLegendLabel || String(rightDataKey);
            }
            return value;
          }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey={leftDataKey}
          stroke={leftLineColor}
          strokeWidth={3}
          dot={{ fill: leftDotColor, r: 5 }}
          activeDot={{ r: 7, fill: leftActiveDotColor }}
          animationDuration={1000}
          name={leftDataKey}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey={rightDataKey}
          stroke={rightLineColor}
          strokeWidth={3}
          dot={{ fill: rightDotColor, r: 5 }}
          activeDot={{ r: 7, fill: rightActiveDotColor }}
          animationDuration={1000}
          name={rightDataKey}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default DoubleLineChartComponent