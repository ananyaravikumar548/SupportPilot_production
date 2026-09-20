import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/auth";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  FiUsers,
  FiUserCheck,
  FiInbox,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

const CATEGORY_COLORS = [
  "#1f7a45",
  "#2563eb",
  "#7c3aed",
  "#ea580c",
  "#db2777",
  "#0891b2",
  "#65a30d",
  "#b91c1c",
];

function normalizeCollection(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

function getDateValue(item) {
  return item?.created_at || item?.createdAt || item?.updated_at || item?.updatedAt;
}

function getRangeLabel(range) {
  if (range === "30d") return "Last 30 days";
  if (range === "month") return "This month";
  return "Last 7 days";
}

function getRangeStart(range) {
  const now = new Date();
  const start = new Date(now);

  if (range === "30d") {
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  start.setDate(now.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return start;
}

function buildTrendData(tickets, range) {
  const start = getRangeStart(range);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    const iso = cursor.toISOString().slice(0, 10);
    buckets.push({
      key: iso,
      date: cursor.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      tickets: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const lookup = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  tickets.forEach((ticket) => {
    const rawDate = getDateValue(ticket);
    if (!rawDate) return;

    const created = new Date(rawDate);
    if (Number.isNaN(created.getTime())) return;

    created.setHours(0, 0, 0, 0);
    if (created < start || created > today) return;

    const key = created.toISOString().slice(0, 10);
    const bucket = lookup.get(key);
    if (bucket) {
      bucket.tickets += 1;
    }
  });

  return buckets;
}

function parseUsersPayload(data) {
  const userList = normalizeCollection(data);

  if (userList.length) {
    return {
      users: userList,
      totalCustomers: userList.filter((user) => user?.role === "customer").length,
      totalAgents: userList.filter((user) => user?.role === "agent").length,
    };
  }

  return {
    users: [],
    totalCustomers:
      data?.customers ??
      data?.total_customers ??
      data?.customer_count ??
      null,
    totalAgents:
      data?.agents ??
      data?.total_agents ??
      data?.agent_count ??
      null,
  };
}

function normalizeId(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value?._id || value?.id || "");
  }
  return String(value);
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [userCounts, setUserCounts] = useState({
    totalCustomers: null,
    totalAgents: null,
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("7d");

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    const [ticketsResult, usersResult] = await Promise.allSettled([
      API.get("/tickets/"),
      API.get("/accounts/users/"),
    ]);

    if (ticketsResult.status === "fulfilled") {
      setTickets(normalizeCollection(ticketsResult.value?.data));
    } else {
      console.error("Failed to fetch tickets:", ticketsResult.reason);
      setTickets([]);
    }

    if (usersResult.status === "fulfilled") {
      const parsedUsers = parseUsersPayload(usersResult.value?.data);
      setUsers(parsedUsers.users);
      setUserCounts({
        totalCustomers: parsedUsers.totalCustomers,
        totalAgents: parsedUsers.totalAgents,
      });
    } else {
      console.error("Failed to fetch users:", usersResult.reason);
      setUsers([]);
      setUserCounts({
        totalCustomers: null,
        totalAgents: null,
      });
    }

    if (
      ticketsResult.status === "rejected" ||
      usersResult.status === "rejected"
    ) {
      setError("Failed to load some dashboard data. Live values may be incomplete.");
    }

    setLoading(false);
  };

  const systemOverview = useMemo(() => {
    return {
      totalCustomers: userCounts.totalCustomers,
      totalAgents: userCounts.totalAgents,
      totalTickets: tickets.length,
      resolvedTickets: tickets.filter((ticket) => ticket.status === "RESOLVED").length,
      openTickets: tickets.filter((ticket) => ticket.status === "OPEN").length,
    };
  }, [tickets, userCounts]);

  const filteredTickets = useMemo(() => {
    const start = getRangeStart(range);

    return tickets.filter((ticket) => {
      const rawDate = getDateValue(ticket);
      if (!rawDate) return false;

      const created = new Date(rawDate);
      if (Number.isNaN(created.getTime())) return false;

      return created >= start;
    });
  }, [range, tickets]);

  const categoryData = useMemo(() => {
    const counts = filteredTickets.reduce((acc, ticket) => {
      const category = ticket?.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const total = filteredTickets.length || 1;

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], index) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100),
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }));
  }, [filteredTickets]);

  const trendData = useMemo(() => buildTrendData(tickets, range), [tickets, range]);

  const recentTickets = useMemo(() => {
    return tickets
      .slice()
      .sort((a, b) => {
        const aTime = new Date(getDateValue(a) || 0).getTime();
        const bTime = new Date(getDateValue(b) || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 8);
  }, [tickets]);

  const usersById = useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      const key = normalizeId(user?._id || user?.id);
      if (key) {
        map.set(key, user);
      }
    });
    return map;
  }, [users]);

  const getCustomerDisplay = (ticket) => {
    if (ticket?.customer_email) return ticket.customer_email;
    if (ticket?.customer?.email) return ticket.customer.email;

    const customerId = normalizeId(ticket?.customer_id || ticket?.customer);
    if (customerId && usersById.has(customerId)) {
      return usersById.get(customerId)?.email || customerId;
    }

    return customerId || "Not available";
  };

  const Card = ({ title, right, children, className = "" }) => (
    <div className={`bg-white border border-[#dfe5e1] rounded-[12px] overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-[#dfe5e1] flex items-center justify-between">
        <h3 className="text-[13.5px] font-bold text-slate-900">{title}</h3>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );

  const Tag = ({ tone = "neutral", children, className = "" }) => {
    const tones = {
      neutral: "bg-slate-100 text-slate-700",
      brand: "bg-[#eef4ef] text-[#14532d]",
      ok: "bg-green-50 text-green-700",
      warn: "bg-amber-50 text-amber-700",
      danger: "bg-red-50 text-red-700",
      info: "bg-blue-50 text-blue-700",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-[10.5px] font-bold ${tones[tone]} ${className}`}
      >
        {children}
      </span>
    );
  };

  const KpiTile = ({ icon: Icon, label, value, sub, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-white border border-[#dfe5e1] rounded-[12px] p-4 transition hover:border-[#1f7a45] ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-bold tracking-wide uppercase text-slate-500">
            {label}
          </div>
          <div className="mt-2 text-[26px] font-extrabold tracking-tight text-slate-900">
            {value}
          </div>
          {sub ? (
            <div className="mt-1 text-[11.5px] text-slate-500 leading-5">{sub}</div>
          ) : null}
        </div>
        <div className="h-9 w-9 rounded-[10px] bg-[#eef4ef] text-[#14532d] flex items-center justify-center border border-[#dfe5e1]">
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
    </button>
  );

  const statusPill = (status) => {
    if (status === "OPEN") return { tone: "info", label: "Open" };
    if (status === "RESOLVED") return { tone: "ok", label: "Resolved" };
    if (status === "IN_PROGRESS") return { tone: "warn", label: "In progress" };
    return { tone: "neutral", label: status || "Unknown" };
  };

  const resolutionData = [
    {
      name: "Resolved",
      value: systemOverview.resolvedTickets,
      fill: "#1f7a45",
    },
    {
      name: "Active",
      value: Math.max(systemOverview.totalTickets - systemOverview.resolvedTickets, 0),
      fill: "#2563eb",
    },
  ];

  const resolutionRate = systemOverview.totalTickets
    ? Math.round((systemOverview.resolvedTickets / systemOverview.totalTickets) * 100)
    : 0;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="bg-white border border-[#dfe5e1] rounded-[12px] px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-slate-500">Overview</div>
          <h2 className="text-[18px] font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="px-3 py-2 text-[12px] bg-white border border-[#dfe5e1] rounded-[10px] font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#1f7a45]/10 focus:border-[#1f7a45]"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile
          icon={FiUsers}
          label="Total Customers"
          value={loading ? "..." : userCounts.totalCustomers ?? "—"}
          sub="Backend user count"
        />
        <KpiTile
          icon={FiUserCheck}
          label="Total Agents"
          value={loading ? "..." : userCounts.totalAgents ?? "—"}
          sub="Support team accounts"
        />
        <KpiTile
          icon={FiInbox}
          label="Total Tickets"
          value={loading ? "..." : systemOverview.totalTickets}
          sub="Live ticket records"
          onClick={() => navigate("/admin/tickets")}
        />
        <KpiTile
          icon={FiCheckCircle}
          label="Resolved Tickets"
          value={loading ? "..." : systemOverview.resolvedTickets}
          sub={`Open now: ${loading ? "..." : systemOverview.openTickets}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card
          className="lg:col-span-5"
          title="Tickets by category"
          right={<Tag tone="brand">{getRangeLabel(range)}</Tag>}
        >
          {loading ? (
            <div className="h-52 flex items-center justify-center text-sm text-slate-500">
              Loading chart data...
            </div>
          ) : categoryData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-slate-400">
              No ticket categories available for this range
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-52 h-52 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[18px] font-extrabold text-slate-900">
                    {filteredTickets.length}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">
                    Total
                  </span>
                </div>
              </div>

              <div className="space-y-3 flex-1 text-[12px] w-full">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      {item.value} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card
          className="lg:col-span-7"
          title="Tickets trend"
          right={<Tag tone="neutral">{getRangeLabel(range)}</Tag>}
        >
          <div className="h-56 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-500">
                Loading trend data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis
                    dataKey="date"
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="tickets"
                    stroke="#1f7a45"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#1f7a45" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        <Card
          className="flex h-full flex-col lg:col-span-4"
          title="Resolution overview"
          right={<Tag tone="ok">{resolutionRate}% resolved</Tag>}
        >
          {loading ? (
            <div className="h-40 flex items-center justify-center text-sm text-slate-500">
              Loading overview...
            </div>
          ) : (
            <div className="flex min-h-[208px] items-center justify-around gap-5">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resolutionData}
                      innerRadius={52}
                      outerRadius={60}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      {resolutionData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[20px] font-extrabold text-slate-900">
                    {resolutionRate}%
                  </span>
                  <span className="text-[10px] font-bold text-[#14532d] uppercase tracking-wide">
                    Resolved
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#1f7a45]" />
                  <span className="text-slate-700 font-semibold">
                    Resolved:{" "}
                    <span className="text-slate-900 font-extrabold">
                      {systemOverview.resolvedTickets}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#2563eb]" />
                  <span className="text-slate-700 font-semibold">
                    Active:{" "}
                    <span className="text-slate-900 font-extrabold">
                      {systemOverview.totalTickets - systemOverview.resolvedTickets}
                    </span>
                  </span>
                </div>
                <div className="text-[11.5px] text-slate-500 leading-5">
                  Resolution view is calculated from live ticket status values.
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card
          className="flex h-full flex-col lg:col-span-8"
          title="Recent tickets"
          right={<Tag tone="neutral">{loading ? "Loading" : `${recentTickets.length} shown`}</Tag>}
        >
          <div className="overflow-x-auto">
            <table className="min-w-[620px] w-full table-fixed text-[12.5px]">
              <thead>
                <tr className="border-b border-[#dfe5e1] bg-[#f8faf9]">
                  <th className="w-[44%] text-left py-2.5 px-3 text-[10.5px] uppercase tracking-wide text-slate-600 font-extrabold">
                    Title
                  </th>
                  <th className="w-[20%] text-left py-2.5 px-3 text-[10.5px] uppercase tracking-wide text-slate-600 font-extrabold">
                    Category
                  </th>
                  <th className="w-[20%] text-left py-2.5 px-3 text-[10.5px] uppercase tracking-wide text-slate-600 font-extrabold">
                    Status
                  </th>
                  <th className="w-[16%] text-left py-2.5 px-3 text-[10.5px] uppercase tracking-wide text-slate-600 font-extrabold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      Loading tickets...
                    </td>
                  </tr>
                ) : recentTickets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  recentTickets.map((ticket) => {
                    const st = statusPill(ticket.status);
                    return (
                      <tr
                        key={ticket._id || ticket.id}
                        className="border-b border-[#eef2f0] hover:bg-[#fafbfa]"
                      >
                        <td className="max-w-0 truncate py-3 px-3 font-semibold text-slate-900" title={ticket.title}>
                          {ticket.title || "Untitled ticket"}
                        </td>
                        <td className="truncate py-3 px-3 text-slate-700">
                          {ticket.category || "Uncategorized"}
                        </td>

                        <td className="py-3 px-3">
                          <Tag tone={st.tone}>{st.label}</Tag>
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="px-3 py-2 rounded-[10px] text-[12px] font-bold bg-[#14532d] hover:bg-[#0f2b1d] text-white transition"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#dfe5e1] rounded-[14px] shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#dfe5e1] flex justify-between items-center">
              <div>
                <div className="text-[11px] text-slate-500">Ticket</div>
                <h2 className="text-[18px] font-extrabold tracking-tight text-slate-900">
                  Ticket details
                </h2>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="h-9 w-9 rounded-[10px] border border-[#dfe5e1] text-slate-600 hover:text-red-600 hover:border-red-200 transition"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-[10.5px] uppercase tracking-wide text-slate-500 font-bold">
                    Title
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedTicket.title}</p>
                </div>

                <div>
                  <p className="text-[10.5px] uppercase tracking-wide text-slate-500 font-bold">
                    Category
                  </p>
                  <p className="mt-1 text-slate-800">
                    {selectedTicket.category || "Uncategorized"}
                  </p>
                </div>

                <div>
                  <p className="text-[10.5px] uppercase tracking-wide text-slate-500 font-bold">
                    Status
                  </p>
                  <p className="mt-1 text-slate-800">{selectedTicket.status || "Unknown"}</p>
                </div>

                <div>
                  <p className="text-[10.5px] uppercase tracking-wide text-slate-500 font-bold">
                    Created at
                  </p>
                  <p className="mt-1 text-slate-800">
                    {getDateValue(selectedTicket)
                      ? new Date(getDateValue(selectedTicket)).toLocaleString()
                      : "Not available"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-[10.5px] uppercase tracking-wide text-slate-500 font-bold">
                    Description
                  </p>
                  <div className="mt-2 bg-[#f8faf9] border border-[#eef2f0] rounded-[12px] p-4 text-slate-700 leading-6">
                    {selectedTicket.description || "No description provided"}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-[10.5px] uppercase tracking-wide text-slate-500 font-bold">
                    Customer
                  </p>
                  <p className="mt-1 text-slate-800 break-all">
                    {getCustomerDisplay(selectedTicket)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-[10px] border border-[#dfe5e1] bg-white text-slate-700 font-semibold hover:bg-[#f8faf9]"
                >
                  Cancel
                </button>

                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-[10px] bg-[#14532d] hover:bg-[#0f2b1d] text-white font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}