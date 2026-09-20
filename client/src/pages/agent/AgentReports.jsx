import StatCard from '../../components/cards/StatCard';
import { FiCheckCircle, FiClock, FiStar } from 'react-icons/fi';

export default function AgentReports() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-800">Agent Performance Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Tickets Resolved This Week" value="48" change="14%" isPositive={true} icon={FiCheckCircle} />
        <StatCard title="Avg Resolution Time" value="1h 45m" change="10%" isPositive={true} icon={FiClock} />
        <StatCard title="Customer Satisfaction Score" value="4.9/5.0" change="2%" isPositive={true} icon={FiStar} />
      </div>
    </div>
  );
}