import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function SLAGaugeChart({ metPercentage = 92 }) {
  const data = [
    { name: 'Met', value: metPercentage },
    { name: 'Breached', value: 100 - metPercentage }
  ];

  return (
    <div className="relative w-36 h-36 flex items-center justify-center mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={45}
            outerRadius={65}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
          >
            <Cell fill="#10B981" />
            <Cell fill="#EF4444" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-slate-800">{metPercentage}%</span>
        <span className="text-[10px] text-emerald-600 font-semibold">SLA Met</span>
      </div>
    </div>
  );
}