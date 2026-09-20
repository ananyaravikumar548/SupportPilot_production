import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { mockUsers } from '../../mock/users';
import { toast } from 'react-toastify';
import { FiLock, FiMail, FiShield } from 'react-icons/fi';
import API from "../../api/auth";

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      console.log("STEP 1 - Sending login request...");

      const response = await API.post("/token/", {
        email: data.email,
        password: data.password,
      });

      console.log("STEP 2 - Token received:", response.data);

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      console.log("STEP 3 - Getting current user...");

      const userResponse = await API.get("/accounts/me/", {
        headers: {
          Authorization: `Bearer ${response.data.access}`,
        },
      });

      console.log("STEP 4 - User received:", userResponse.data);

      login(userResponse.data);

      toast.success("Login Successful!");

      console.log("STEP 5 - Role:", userResponse.data.role);

      if (userResponse.data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (userResponse.data.role === "agent") {
        navigate("/agent/dashboard");
      } else {
        navigate("/customer/dashboard");
      }

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Response:", error.response.data);
      }

      toast.error("Login Failed");
    }
  };

  const baseInput =
    "w-full rounded-[10px] border-[1.5px] bg-white px-3 py-[11px] text-[14px] text-slate-900 " +
    "placeholder:text-slate-400 focus:outline-none focus:ring-4";

  const okInput =
    "border-[#dfe5e1] focus:border-[#1f7a45] focus:ring-[#1f7a45]/10";

  const errInput =
    "border-red-600 bg-red-50 focus:border-red-600 focus:ring-red-200";

  return (
    <div className="min-h-screen bg-[#f4f6f5] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-[#dfe5e1] bg-white shadow-[0_10px_35px_rgba(16,24,40,0.10)]">
        <div className="grid lg:grid-cols-2">
          {/* Left brand panel (hidden on mobile like the reference) */}
          <div className="relative hidden lg:flex flex-col justify-between bg-[#0f2b1d] p-12 text-white overflow-hidden">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute right-6 -top-20 h-52 w-52 rounded-full bg-white/5" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="h-10 w-10 rounded-[10px] bg-[#1f7a45] flex items-center justify-center font-extrabold tracking-tight">
                SA
              </div>
              <div className="leading-tight">
                <div className="text-[17px] font-bold tracking-tight">Support AI</div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.22em] text-white/55">
                  AI TICKET RESOLUTION
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-10">
              <h1 className="text-[30px] font-bold leading-tight tracking-tight">
                Support that resolves itself.
              </h1>
              <p className="mt-4 max-w-sm text-[14px] leading-7 text-white/65">
                Every ticket classified, prioritised and routed the moment it arrives —
                so your engineers spend their time on the problems that actually need them.
              </p>

              <div className="mt-8 flex gap-10">
                <div>
                  <div className="text-[22px] font-bold">4.2h</div>
                  <div className="mt-1 text-[11px] text-white/55">Avg resolution</div>
                </div>
                <div>
                  <div className="text-[22px] font-bold">67%</div>
                  <div className="mt-1 text-[11px] text-white/55">AI resolved</div>
                </div>
                <div>
                  <div className="text-[22px] font-bold">92%</div>
                  <div className="mt-1 text-[11px] text-white/55">Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="relative z-10 text-[11.5px] text-white/45">
              Internal system · Authorised personnel only
            </div>
          </div>

          {/* Right form panel */}
          <div className="flex items-center justify-center p-8 sm:p-12">
            <div className="w-full max-w-sm">
              <div className="mb-6">
                <h2 className="text-[23px] font-bold tracking-tight text-slate-900">Sign in</h2>
                <p className="mt-1 text-[13.5px] text-slate-600">
                  Use your organisation account to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-900 mb-1.5">
                    Work email
                  </label>
                  <input
                    {...register("email", { required: "Email is required" })}
                    type="email"
                    placeholder="you@company.com"
                    className={`${baseInput} ${errors.email ? errInput : okInput}`}
                    autoComplete="username"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-[11.5px] text-red-700">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-900 mb-1.5">
                    Password
                  </label>
                  <input
                    {...register("password", { required: "Password is required" })}
                    type="password"
                    placeholder="••••••••••"
                    className={`${baseInput} ${errors.password ? errInput : okInput}`}
                    autoComplete="current-password"
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-[11.5px] text-red-700">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-[13px] text-slate-600 select-none">
                    <input
                      type="checkbox"
                      className="h-[15px] w-[15px] accent-[#14532d]"
                    />
                    Keep me signed in
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-[13px] font-semibold text-[#1f7a45] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-[10px] bg-[#14532d] py-3 text-[14.5px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2b1d]"
                >
                  Sign in
                </button>
              </form>

              <div className="mt-6 border-t border-[#dfe5e1] pt-5 text-[11.5px] leading-6 text-slate-500">
                Access is provisioned by your IT administrator. Need an account?{" "}
                <Link to="/register" className="font-semibold text-[#1f7a45] hover:underline">
                  Register
                </Link>
                .
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}