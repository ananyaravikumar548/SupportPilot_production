import { motion } from 'framer-motion';

export default function StatCard({ title, value, change, isPositive, icon: Icon, onClick }) {
  const cardContent = (
    <>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
          {change && (
            <p className={`text-xs mt-2 font-medium flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{isPositive ? '↑' : '↓'}</span> {change} <span className="text-slate-400 font-normal">from yesterday</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {onClick && <p className="mt-3 text-xs font-semibold text-indigo-600">View tickets →</p>}
    </>
  );

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-soft ${onClick ? 'cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500' : ''}`}
    >
      {onClick ? (
        <button type="button" onClick={onClick} className="w-full text-left focus:outline-none">
          {cardContent}
        </button>
      ) : cardContent}
    </motion.div>
  );
}
