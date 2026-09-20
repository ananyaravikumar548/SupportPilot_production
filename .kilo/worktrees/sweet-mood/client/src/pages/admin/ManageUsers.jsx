import { mockUsers } from '../../mock/users';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function ManageUsers() {
  const customers = mockUsers.filter(u => u.role === 'customer');

  const handleDelete = (name) => {
    toast.info(`Deleted user ${name}`);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">User Management</h2>
          <p className="text-xs text-slate-500">View and manage system customers</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm">
          <FiPlus /> Add Customer
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {customers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 flex items-center gap-3">
                  <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-semibold text-slate-800">{user.name}</span>
                </td>
                <td className="py-3 px-4 text-slate-600">{user.email}</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-semibold capitalize">{user.role}</span></td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2 text-slate-400">
                    <button className="p-1 hover:text-emerald-600"><FiEdit2 /></button>
                    <button onClick={() => handleDelete(user.name)} className="p-1 hover:text-red-500"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}