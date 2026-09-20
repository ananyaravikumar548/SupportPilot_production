import { useContext, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  FiUser,
  FiMail,
  FiShield,
  FiCheckCircle,
  FiCalendar,
} from "react-icons/fi";

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="flex items-center gap-3 text-sm font-medium text-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
          <Icon className="text-[16px]" />
        </div>
        <span className="break-all">{value}</span>
      </div>
    </div>
  );
}

export default function CustomerProfile() {
  const { user } = useContext(AuthContext);

  const profile = useMemo(() => {
    const email = user?.email || "customer@example.com";
    const emailName = email.includes("@") ? email.split("@")[0] : "Customer";
    const displayName = user?.name || emailName;
    const initials = displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "C";

    return {
      displayName,
      email,
      role: user?.role || "customer",
      avatar: user?.avatar || "",
      initials,
      joined: user?.created_at
        ? new Date(user.created_at).toLocaleDateString()
        : "Recently joined",
    };
  }, [user]);

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Customer portal
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">My Profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Review your account details and current access information.
        </p>
      </div>

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.displayName}
                className="h-24 w-24 rounded-2xl border-2 border-indigo-500 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">
                {profile.initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-2xl font-bold text-slate-900">
                {profile.displayName}
              </h3>
              <p className="mt-1 break-all text-sm text-slate-500">{profile.email}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-semibold capitalize text-indigo-700">
                  {profile.role} account
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                  <FiCheckCircle className="text-[12px]" />
                  Active status
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoCard icon={FiUser} label="Display name" value={profile.displayName} />
            <InfoCard icon={FiMail} label="Email address" value={profile.email} />
            <InfoCard
              icon={FiShield}
              label="Role permission"
              value={profile.role.toUpperCase()}
            />
            <InfoCard icon={FiCalendar} label="Member since" value={profile.joined} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">Account summary</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This profile uses your authenticated account details from the portal.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Access
            </p>
            <h3 className="mt-2 text-lg font-bold">Customer permissions</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li>View and track your own tickets</li>
              <li>Create new support requests from navigation</li>
              <li>Monitor ticket status and updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
