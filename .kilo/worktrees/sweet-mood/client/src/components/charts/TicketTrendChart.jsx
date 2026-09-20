import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export default function TicketTrendChart({ data }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
          <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="tickets" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}