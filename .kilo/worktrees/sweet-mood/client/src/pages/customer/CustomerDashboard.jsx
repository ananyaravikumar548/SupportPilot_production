import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiInbox,
  FiHelpCircle,
  FiPhoneCall,
  FiBookOpen,
  FiCpu,
} from "react-icons/fi";
import API from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";
import MyTickets from "./MyTickets";

function Card({ children, className = "", delay = 0, title, subtitle, right }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35, delay }}
      className={`overflow-hidden rounded-[12px] border border-[#dfe5e1] bg-white shadow-[0_2px_8px_rgba(16,24,40,0.08)] ${className}`}
    >
      {(title || subtitle || right) && (
        <div className="flex items-center justify-between border-b border-[#dfe5e1] px-5 py-4">
          <div>
            {title && (
              <h3 className="text-[13.5px] font-bold text-slate-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-[11.5px] text-slate-500">{subtitle}</p>
            )}
          </div>
          {right ? <div>{right}</div> : null}
        </div>
      )}

      <div className={title || subtitle || right ? "p-5" : "p-6"}>{children}</div>
    </motion.div>
  );
}

function StatTile({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-[10px] border border-[#dfe5e1] bg-[#f8faf9] p-4">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] ${color}`}
      >
        <Icon className="text-[18px]" />
      </div>

      <p className="text-[24px] font-extrabold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[11.5px] font-medium text-slate-500">{label}</p>
    </div>
  );
}

function HelpItem({ icon: Icon, title, description }) {
  return (
    <div className="rounded-[10px] border border-[#dfe5e1] bg-white p-5 transition hover:border-[#1f7a45] hover:bg-[#fafbfa]">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#eef4ef] text-[#14532d]">
        <Icon className="text-[20px]" />
      </div>

      <h3 className="text-[14px] font-bold text-slate-900">{title}</h3>

      <p className="mt-2 text-[12.5px] leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function OverviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-[#dfe5e1] bg-[#f8faf9] px-4 py-3">
      <span className="text-[12.5px] font-medium text-slate-500">{label}</span>
      <span className="text-[13px] font-bold text-slate-900">{value}</span>
    </div>
  );
}

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setError("");
      const response = await API.get("/tickets/");
      const ticketData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setTickets(ticketData);
    } catch (err) {
      console.error(err);
      setError("Unable to load customer dashboard data right now.");
      setTickets([]);
    }
  };

  const name = user?.email?.split("@")[0] || "Customer";

  const stats = [
    {
      label: "Total Tickets",
      value: tickets.length,
      icon: FiInbox,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Open Tickets",
      value: tickets.filter((ticket) => ticket.status === "OPEN").length,
      icon: FiFileText,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Resolved",
      value: tickets.filter((ticket) => ticket.status === "RESOLVED").length,
      icon: FiCheckCircle,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Avg Response",
      value: "<15 min",
      icon: FiClock,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "RESOLVED"
  ).length;
  const pendingTickets = tickets.filter(
    (ticket) =>
      ticket.status !== "OPEN" && ticket.status !== "RESOLVED"
  ).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 pb-8">
      <div className="overflow-hidden rounded-[12px] border border-[#dfe5e1] bg-white shadow-[0_2px_8px_rgba(16,24,40,0.08)]">
        <div className="flex items-center justify-between bg-[#0f2b1d] px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-[8px] bg-[#1f7a45] text-sm font-extrabold text-white">
                SA
              </div>

              <div>
                <p className="text-[14px] font-bold text-white">Support AI</p>
                <p className="font-mono text-[8px] tracking-[0.18em] text-white/50">
                  CUSTOMER PORTAL
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6 text-[12.5px] font-semibold">
              {/* <span className="text-white">My tickets</span> */}
            </div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f7a45] text-[12px] font-bold uppercase text-white">
            {name?.[0] || "C"}
          </div>
        </div>

        <div className="bg-[#f4f6f5] px-6 py-5">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] text-slate-500">Customer portal</p>
            <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">
              Welcome back, {name}
            </h1>
            <p className="max-w-2xl text-[13px] leading-6 text-slate-600">
              Create support requests, track ticket progress, and communicate with
              the support team from one place.
            </p>
            {error ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                <FiAlertCircle />
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <Card className="relative overflow-hidden xl:col-span-4" delay={0.05}>
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#eef4ef] opacity-80" />
          <div className="absolute right-10 bottom-6 h-24 w-24 rounded-full bg-[#f4f6f5]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef4ef] px-3 py-1 text-[11px] font-bold text-[#14532d]">
              <span className="h-2 w-2 rounded-full bg-[#1f7a45]" />
              Support team online
            </div>

            <h2 className="mt-5 text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">
              Fast support,
              <br />
              clear updates.
            </h2>

            <p className="mt-3 max-w-md text-[13px] leading-6 text-slate-500">
              Submit issues with the right context, follow status updates, and get
              faster resolution through a cleaner support workflow.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {stats.map(({ label, value, icon: Icon, color }) => (
                <StatTile
                  key={label}
                  label={label}
                  value={value}
                  icon={Icon}
                  color={color}
                />
              ))}
            </div>

            <div className="mt-6 rounded-[10px] border border-[#b7d9c0] bg-[#eef4ef] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[12.5px] font-semibold text-[#14532d]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1f7a45] animate-pulse" />
                  Team available now
                </div>

                <span className="text-[11.5px] text-[#14532d]">
                  Avg response: <strong>&lt; 15 min</strong>
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="xl:col-span-8">
          <Card
            delay={0.1}
            title="Account overview"
            subtitle="See your support activity at a glance."
            right={
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-bold text-slate-700">
                Customer
              </span>
            }
            className="h-full"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <OverviewRow label="Signed in as" value={user?.email || "Customer"} />
                <OverviewRow
                  label="Account role"
                  value={user?.role ? user.role.toUpperCase() : "CUSTOMER"}
                />
                <OverviewRow
                  label="Tickets requiring attention"
                  value={String(openTickets)}
                />
                <OverviewRow
                  label="Resolved requests"
                  value={String(resolvedTickets)}
                />
              </div>

              <div className="rounded-[12px] border border-[#dfe5e1] bg-[#f8faf9] p-5">
                <h3 className="text-[15px] font-bold text-slate-900">
                  Support summary
                </h3>
                <p className="mt-2 text-[12.5px] leading-6 text-slate-500">
                  Use this dashboard to monitor ticket progress. New issues can be
                  submitted from the dedicated ticket creation page in navigation.
                </p>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-[10px] bg-white p-4 text-center">
                    <p className="text-[22px] font-extrabold text-slate-900">
                      {totalTickets}
                    </p>
                    <p className="mt-1 text-[11.5px] text-slate-500">Total</p>
                  </div>
                  <div className="rounded-[10px] bg-white p-4 text-center">
                    <p className="text-[22px] font-extrabold text-blue-600">
                      {openTickets}
                    </p>
                    <p className="mt-1 text-[11.5px] text-slate-500">Open</p>
                  </div>
                  <div className="rounded-[10px] bg-white p-4 text-center">
                    <p className="text-[22px] font-extrabold text-emerald-600">
                      {resolvedTickets}
                    </p>
                    <p className="mt-1 text-[11.5px] text-slate-500">Resolved</p>
                  </div>
                </div>

                <div className="mt-5 rounded-[10px] border border-[#dfe5e1] bg-white px-4 py-3">
                  <p className="text-[12px] font-semibold text-slate-900">
                    Other statuses
                  </p>
                  <p className="mt-1 text-[12px] text-slate-500">
                    {pendingTickets} ticket(s) are currently in review, pending, or
                    another workflow state.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card
        delay={0.15}
        title="My tickets"
        subtitle="Track your open and resolved requests."
        right={
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-bold text-slate-700">
            Recent activity
          </span>
        }
      >
        <MyTickets />
      </Card>

      <div className="grid gap-5 xl:grid-cols-12">
        <Card
          delay={0.2}
          className="xl:col-span-8"
          title="Need help?"
          subtitle="Browse support resources before creating another ticket."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <HelpItem
              icon={FiBookOpen}
              title="Frequently asked questions"
              description="Find answers to common billing, login, and account-related issues."
            />

            <HelpItem
              icon={FiHelpCircle}
              title="Knowledge base"
              description="Browse step-by-step troubleshooting guides and documentation."
            />

            <HelpItem
              icon={FiPhoneCall}
              title="Contact support"
              description="Reach the support team if the issue needs immediate attention."
            />

            <HelpItem
              icon={FiFileText}
              title="Ticket guidelines"
              description="Learn how to submit detailed tickets for faster resolution."
            />
          </div>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="xl:col-span-4 overflow-hidden rounded-[12px] border border-[#dfe5e1] bg-[#14532d] text-white shadow-[0_2px_8px_rgba(16,24,40,0.08)]"
        >
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold">AI Support Assistant</h2>
              <FiCpu className="text-[22px] text-white/90" />
            </div>

            <p className="mt-2 text-[12.5px] leading-6 text-white/70">
              AI-powered ticket analysis will be available in the next milestone.
            </p>
          </div>

          <div className="p-5">
            <div className="rounded-[10px] bg-white/8 p-4">
              <p className="text-[12px] font-bold uppercase tracking-wide text-white/75">
                Upcoming features
              </p>

              <ul className="mt-4 space-y-3 text-[13px] text-white/90">
                <li>Automatic ticket categorization</li>
                <li>Priority prediction</li>
                <li>Smart resolution suggestions</li>
                <li>AI generated responses</li>
              </ul>
            </div>

            <div className="mt-4 rounded-[10px] border border-white/10 bg-white/5 px-4 py-3 text-[12px] text-white/70">
              Milestone 1 keeps the portal intentionally simple and focused on
              ticket submission and tracking.
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col justify-between gap-3 border-t border-[#dfe5e1] pt-5 text-[11.5px] text-slate-500 sm:flex-row">
        <span>Support AI Ticket Management System © 2026</span>

        <div className="flex gap-4">
          <a href="#" className="font-medium hover:text-[#14532d]">
            Privacy Policy
          </a>

          <a href="#" className="font-medium hover:text-[#14532d]">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
}
