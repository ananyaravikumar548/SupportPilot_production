import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiArrowRight, FiCheck, FiLock, FiMail } from 'react-icons/fi';
import API from '../../api/auth';

export default function Login() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      console.log('LOGIN SUBMITTED', {
        email: data.email,
        passwordProvided: Boolean(data.password),
      });
      console.log('STEP 1 - Sending login request...');
      const response = await API.post('/token/', { email: data.email, password: data.password });
      console.log('STEP 2 - Token received:', response.data);
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      console.log('STEP 3 - Getting current user...');
      const userResponse = await API.get('/accounts/me/', {
        headers: { Authorization: `Bearer ${response.data.access}` },
      });
      console.log('STEP 4 - User received:', userResponse.data);
      login(userResponse.data);
      toast.success('Login Successful!');
      console.log('STEP 5 - Role:', userResponse.data.role);
      if (userResponse.data.role === 'admin') navigate('/admin/dashboard');
      else if (userResponse.data.role === 'agent_manager') navigate('/manager/dashboard');
      else if (userResponse.data.role === 'agent') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch (error) {
      console.error('LOGIN ERROR:', error);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Response:', error.response.data);
      }
      toast.error('Login Failed');
    }
  };

  const onInvalidSubmit = (formErrors) => {
    console.error('LOGIN VALIDATION ERROR:', formErrors);
  };

  const demoUsers = [
    { label: 'Admin Demo', email: 'admin@demo.com', password: 'password123' },
    { label: 'Manager Demo', email: 'manager@demo.com', password: 'password123' },
    { label: 'Agent 1', email: 'agent@demo.com', password: 'password123' },
    { label: 'Agent 2 (Billing)', email: 'agent2@demo.com', password: 'password123' },
    { label: 'Agent 3 (Tech)', email: 'agent3@demo.com', password: 'password123' },
    { label: 'Customer 1', email: 'customer@demo.com', password: 'password123' },
    { label: 'Customer 2', email: 'supportpilot.app@gmail.com', password: 'password123' },
  ];

  const fillDemoAccess = ({ email, password }) => {
    setValue('email', email, { shouldValidate: true, shouldDirty: true });
    setValue('password', password, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-emerald-50/60 to-slate-50 text-slate-900 lg:grid lg:grid-cols-[55%_45%]">
      <section className="relative hidden overflow-hidden border-r border-emerald-100 bg-white px-10 py-10 lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(16,185,129,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.07)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/40 bg-emerald-400/15 text-sm font-black text-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.2)]">SP</span>
            <span className="text-lg font-semibold tracking-tight">SupportPilot</span>
          </Link>
        </div>
        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-700">THE ENTERPRISE SUPPORT CONTROL PLANE</p>
          <h1 className="mt-5 text-5xl font-bold leading-tight tracking-[-0.04em] text-slate-900 xl:text-6xl">
            Move from ticket volume to <span className="text-emerald-600">resolved outcomes.</span>
          </h1>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[['>75%', 'Auto-resolution trigger'], ['3', 'Active support queues'], ['< 1h', 'Average assignment SLA']].map(([value, label]) => (
              <div key={label} className="border-l border-emerald-400/40 pl-4">
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold tracking-[0.16em] text-slate-500">TICKET LIFECYCLE</p>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> LIVE SYNC</span>
          </div>
          <div className="mt-5 flex items-center justify-between gap-2 text-[11px] font-bold">
            {['OPEN', 'ASSIGNED', 'RESOLVED'].map((status, index) => (
              <div key={status} className="flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${index === 2 ? 'bg-emerald-500 text-white' : 'border border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                  {index === 2 ? <FiCheck /> : index + 1}
                </span>
                <span className="hidden text-slate-600 xl:inline">{status}</span>
                {index < 2 && <span className="h-px w-8 bg-emerald-200 xl:w-16" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white/90 p-7 shadow-xl shadow-emerald-900/5 backdrop-blur-sm sm:p-10">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-emerald-600"><FiArrowLeft /> Back to home</Link>
          <div className="mb-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><FiLock /></div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to your SupportPilot workspace.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">Work email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3.5 text-slate-400" />
                <input {...register('email', { required: 'Email is required' })} type="email" placeholder="you@company.com" autoComplete="username" className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-400/10 ${errors.email ? 'border-red-500' : 'border-slate-200 focus:border-emerald-500'}`} />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">Password</label>
              <input {...register('password', { required: 'Password is required' })} type="password" placeholder="••••••••••" autoComplete="current-password" className={`w-full rounded-xl border bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-400/10 ${errors.password ? 'border-red-500' : 'border-slate-200 focus:border-emerald-500'}`} />
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-500"><input type="checkbox" className="accent-emerald-600" /> Keep me signed in</label>
              <Link to="/forgot-password" className="font-semibold text-emerald-700 hover:text-emerald-600">Forgot password?</Link>
            </div>
            <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-emerald-950 shadow-[0_0_24px_rgba(52,211,153,0.18)] transition hover:bg-emerald-400 hover:shadow-[0_0_32px_rgba(52,211,153,0.3)]">Sign in to workspace <FiArrowRight className="transition-transform group-hover:translate-x-1" /></button>
          </form>
          <div className="mt-8 border-t border-emerald-800/60 pt-6">
            <p className="text-[11px] font-bold tracking-[0.14em] text-slate-500">QUICK-FILL DEMO ACCESS</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {demoUsers.map((demoUser) => <button key={demoUser.email} type="button" onClick={() => fillDemoAccess(demoUser)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100">{demoUser.label}</button>)}
            </div>
          </div>
          <p className="mt-7 text-center text-xs text-slate-500">Need an account? <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-600">Register</Link></p>
        </div>
      </section>
    </main>
  );
}
