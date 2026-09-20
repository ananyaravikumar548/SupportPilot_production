import StatCard from '../../components/cards/StatCard';
import { FiTrendingUp, FiPieChart, FiBarChart } from 'react-icons/fi';

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-800">System Analytics & Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Overall SLA Target Met" value="92%" change="3%" isPositive={true} icon={FiTrendingUp} />
        <StatCard title="AI Classification Precision" value="91.6%" change="1.2%" isPositive={true} icon={FiPieChart} />
        <StatCard title="Avg Time to First Response" value="11 Mins" change="4%" isPositive={true} icon={FiBarChart} />
      </div>
    </div>
  );
}