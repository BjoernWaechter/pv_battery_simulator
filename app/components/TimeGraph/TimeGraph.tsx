
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import * as d3 from 'd3'

const time_fmt_iso_day = d3.timeFormat('%Y-%m-%d')
const fmt_human_day = d3.timeFormat("%Y-%m-%d");

interface ChartLine {
    name: string;
    dataKey: string;
    dot: boolean;
}


interface TimeGraphProps {
    id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Array<any>;
    minWidth: number;
    height: string|number;
    lines: Array<ChartLine>;
}

const colors = ["#BB0000", "#00AA00", "#0000AA"]

const TimeGraph: React.FC<TimeGraphProps> = ({ id, data, minWidth, height, lines}) => (
    <ResponsiveContainer minWidth={minWidth} height={height}>
        <LineChart id={id} data={data} margin={{ top: 5, right: 5, bottom: 15, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis xAxisId="0" type="number" domain={['dataMin', 'dataMax']} dataKey="date" interval="preserveStart" allowDuplicatedCategory={false} tickFormatter={t => fmt_human_day(new Date(t)) } angle={-15} tickMargin={10} />
            <YAxis />
            <Tooltip labelFormatter={t => time_fmt_iso_day(new Date(t)) } />
            <Legend verticalAlign="top" height={36}/>
            {lines.map((l, idx)=> (
                <Line key={l.name} name={l.name} dataKey={l.dataKey} isAnimationActive={false} stroke={colors[idx]} fill={colors[idx]} dot={l.dot}/>
            ))}
        </LineChart>
    </ResponsiveContainer>
  );
  
  export default TimeGraph;