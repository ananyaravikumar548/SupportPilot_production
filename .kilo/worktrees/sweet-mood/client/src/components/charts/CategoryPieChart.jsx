import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CategoryPieChart({ data }) {
  return (
    <div className="w-full h-48 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-base font-bold text-slate-800">Total</span>
        <span className="text-[10px] text-slate-400 font-medium uppercase">100%</span>
      </div>
    </div>
  );
}