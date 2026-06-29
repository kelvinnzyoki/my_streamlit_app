
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  Clock,
  CreditCard,
  Dumbbell,
  Eye,
  Inbox,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import { AdminAPI, AuthAPI, ApiError, type FeedbackStatus } from "@/lib/api";
import styles from "./admin.module.css";

type TabKey = "overview" | "activity" | "users" | "feedback" | "programs" | "enrollments" | "workouts" | "subscriptions";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "activity", label: "All Activity" },
  { key: "users", label: "Users" },
  { key: "feedback", label: "Feedback" },
  { key: "programs", label: "Programs" },
  { key: "enrollments", label: "Enrollments" },
  { key: "workouts", label: "Workouts" },
  { key: "subscriptions", label: "Subscriptions" },
];

function unwrap(payload: any) {
  return payload?.data && typeof payload.data === "object" ? payload.data : payload || {};
}

function numberish(value: unknown) {
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const parsed = Number(cleaned || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const n = numberish(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function firstArray(...values: unknown[]) {
  for (const value of values) if (Array.isArray(value)) return value;
  return [];
}

function money(cents: unknown) {
  const amount = numberish(cents) / 100;
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);
}

function normalizeSummary(raw: any) {
  const data = unwrap(raw);
  const totals = data?.totals || data?.summary || data?.stats || {};
  const recent = data?.recent || {};
  const subscriptions = data?.subscriptions || {};

  return {
    ...data,
    totals,
    recent,
    subscriptions,
    totalUsers: firstNumber(data.totalUsers, totals.totalUsers, totals.users, data.usersTotal),
    newUsersToday: firstNumber(data.newUsersToday, totals.newUsersToday, totals.usersToday),
    verifiedUsers: firstNumber(data.verifiedUsers, totals.verifiedUsers, totals.emailVerifiedUsers),
    totalWorkoutLogs: firstNumber(data.totalWorkoutLogs, totals.totalWorkoutLogs, totals.workoutLogs, totals.workouts),
    workoutsToday: firstNumber(data.workoutsToday, totals.workoutsToday, totals.workoutLogsToday),
    totalPrograms: firstNumber(data.totalPrograms, totals.totalPrograms, totals.programs),
    activePrograms: firstNumber(data.activePrograms, totals.activePrograms),
    totalEnrollments: firstNumber(data.totalEnrollments, totals.totalEnrollments, totals.enrollments),
    activeEnrollments: firstNumber(data.activeEnrollments, totals.activeEnrollments),
    feedbackNew: firstNumber(data.feedbackNew, totals.feedbackNew, totals.newFeedback),
    feedbackTotal: firstNumber(data.feedbackTotal, totals.feedbackTotal, totals.feedback),
    successfulRevenueCents: firstNumber(data.successfulRevenueCents, totals.successfulRevenueCents, totals.revenueCents, totals.successRevenueCents, data.successfulPayments?._sum?.amountCents, totals.successfulPayments?._sum?.amountCents),
    totalRevenueCents: firstNumber(data.totalRevenueCents, totals.totalRevenueCents, totals.grossPaymentVolumeCents, totals.revenueGrossCents, data.totalPayments?._sum?.amountCents, totals.totalPayments?._sum?.amountCents),
    recentFeedback: firstArray(data.recentFeedback, recent.feedback, data.feedback),
    recentUsers: firstArray(data.recentUsers, recent.users),
    recentWorkouts: firstArray(data.recentWorkouts, recent.workouts),
    recentSubscriptions: firstArray(data.recentSubscriptions, recent.subscriptions),
  };
}

function shortDate(value: unknown) {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function dateTime(value: unknown) {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getUserFromPayload(payload: any) {
  return payload?.user || payload?.data?.user || payload?.data || payload;
}

function StatusPill({ status }: { status?: string }) {
  const clean = String(status || "UNKNOWN").toUpperCase();
  return <span className={`${styles.statusPill} ${styles[`status${clean}`] || ""}`}>{clean.replace(/_/g, " ")}</span>;
}

function ActivityIcon({ type }: { type?: string }) {
  const t = String(type || "").toUpperCase();
  if (t.includes("WORKOUT")) return <Dumbbell size={16} />;
  if (t.includes("PROGRAM")) return <BarChart3 size={16} />;
  if (t.includes("SUBSCRIPTION") || t.includes("PAYMENT")) return <CreditCard size={16} />;
  if (t.includes("FEEDBACK")) return <MessageSquare size={16} />;
  if (t.includes("NOTIFICATION")) return <Bell size={16} />;
  if (t.includes("AI")) return <Bot size={16} />;
  if (t.includes("ACHIEVEMENT")) return <Award size={16} />;
  return <Activity size={16} />;
}

export default function AdminPage() {
  const [authState, setAuthState] = useState<"checking" | "allowed" | "denied">("checking");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [summary, setSummary] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserData, setSelectedUserData] = useState<any>(null);
  const [userActivityLoading, setUserActivityLoading] = useState(false);

  async function verifyAdmin() {
    setAuthState("checking");
    try {
      const me = await AuthAPI.getCurrentUser();
      const user = getUserFromPayload(me);
      if (String(user?.role || "").toUpperCase() !== "ADMIN") {
        setAuthState("denied");
        return false;
      }
      setAuthState("allowed");
      return true;
    } catch {
      setAuthState("denied");
      return false;
    }
  }

  async function loadOverview() {
    setLoading(true);
    setError("");
    try {
      const allowed = await verifyAdmin();
      if (!allowed) return;
      const data = normalizeSummary(await AdminAPI.getSummary());
      setSummary(data);
      setFeedback(data.recentFeedback);
      setUsers(data.recentUsers);
      setWorkouts(data.recentWorkouts);
      setSubscriptions(data.recentSubscriptions);
      const act = unwrap(await AdminAPI.getActivity());
      setActivity(Array.isArray(act.activity) ? act.activity : []);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) setAuthState("denied");
      setError(err instanceof Error ? err.message : "Admin dashboard failed to load.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTab(tab: TabKey = activeTab) {
    if (authState !== "allowed") return;
    setTableLoading(true);
    setError("");
    try {
      if (tab === "activity") {
        const data = unwrap(await AdminAPI.getActivity());
        setActivity(Array.isArray(data.activity) ? data.activity : []);
      }
      if (tab === "users") {
        const data = unwrap(await AdminAPI.getUsers({ q: query, limit: 80 }));
        setUsers(Array.isArray(data.users) ? data.users : []);
      }
      if (tab === "feedback") {
        const data = unwrap(await AdminAPI.getFeedback({ status: feedbackStatus, limit: 80 }));
        setFeedback(Array.isArray(data.feedback) ? data.feedback : []);
      }
      if (tab === "programs") {
        const data = unwrap(await AdminAPI.getPrograms({ q: query, limit: 80 }));
        setPrograms(Array.isArray(data.programs) ? data.programs : []);
      }
      if (tab === "enrollments") {
        const data = unwrap(await AdminAPI.getEnrollments({ limit: 80 }));
        setEnrollments(Array.isArray(data.enrollments) ? data.enrollments : []);
      }
      if (tab === "workouts") {
        const data = unwrap(await AdminAPI.getWorkouts({ q: query, limit: 80 }));
        setWorkouts(Array.isArray(data.workouts) ? data.workouts : []);
      }
      if (tab === "subscriptions") {
        const data = unwrap(await AdminAPI.getSubscriptions({ limit: 80 }));
        setSubscriptions(Array.isArray(data.subscriptions) ? data.subscriptions : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load admin data.");
    } finally {
      setTableLoading(false);
    }
  }

  async function openUserActivity(user: any) {
    if (!user?.id) return;
    setSelectedUser(user);
    setSelectedUserData(null);
    setUserActivityLoading(true);
    setError("");
    try {
      const data = unwrap(await AdminAPI.getUserActivity(user.id, { limit: 100 }));
      setSelectedUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load user activity.");
    } finally {
      setUserActivityLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab !== "overview") loadTab(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, feedbackStatus]);

  const cards = useMemo(() => {
    const s = normalizeSummary(summary || {});
    return [
      { label: "Total Users", value: firstNumber(s.totalUsers), hint: `${firstNumber(s.newUsersToday)} joined today`, Icon: Users },
      { label: "Verified Users", value: firstNumber(s.verifiedUsers), hint: "Email verified accounts", Icon: ShieldCheck },
      { label: "Workout Logs", value: firstNumber(s.totalWorkoutLogs), hint: `${firstNumber(s.workoutsToday)} today`, Icon: Dumbbell },
      { label: "Active Programs", value: firstNumber(s.activePrograms), hint: `${firstNumber(s.totalPrograms)} total`, Icon: BarChart3 },
      { label: "Active Enrollments", value: firstNumber(s.activeEnrollments), hint: `${firstNumber(s.totalEnrollments)} total`, Icon: Activity },
      { label: "New Feedback", value: firstNumber(s.feedbackNew), hint: `${firstNumber(s.feedbackTotal)} total`, Icon: MessageSquare },
      { label: "Successful Revenue", value: money(s.successfulRevenueCents), hint: "From completed payments", Icon: CreditCard },
      { label: "Total Revenue", value: money(s.totalRevenueCents), hint: "All payment records", Icon: CreditCard },
    ];
  }, [summary]);

  async function updateFeedback(id: string, status: FeedbackStatus) {
    try {
      await AdminAPI.updateFeedbackStatus(id, status);
      setFeedback((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update feedback.");
    }
  }

  if (authState === "checking") {
    return <DashboardShell><section className={`page-section ${styles.centerState}`}><Loader2 className={styles.spin} size={28} /><h1>Checking admin access…</h1><p className="muted">Only authenticated FlowFit admins can open this page.</p></section></DashboardShell>;
  }

  if (authState === "denied") {
    return <DashboardShell><section className={`page-section ${styles.denied}`}><AlertTriangle size={34} /><h1>Admin access only</h1><p className="muted">This page is intentionally hidden from public navigation and is restricted to accounts with the ADMIN role.</p></section></DashboardShell>;
  }

  return (
    <DashboardShell>
      <section className={`page-section ${styles.page}`}>
        <div className={styles.hero}>
          <div>
            <p className="eyebrow">Private Admin Endpoint</p>
            <h1>FlowFit Control Room</h1>
            <p className="muted">Monitor every user action: signups, logins, workout logs, program enrollments, subscriptions, payments, feedback, notifications, body metrics, achievements, and AI coach use.</p>
          </div>
          <button type="button" className="secondary-btn" onClick={() => activeTab === "overview" ? loadOverview() : loadTab()}><RefreshCw size={16} />Refresh</button>
        </div>

        {error && <div className={styles.errorBox}><AlertTriangle size={18} /> {error}</div>}

        <div className={styles.tabs}>
          {TABS.map((tab) => <button key={tab.key} type="button" className={activeTab === tab.key ? styles.activeTab : ""} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>)}
        </div>

        {activeTab === "overview" && (
          <>
            <div className={styles.metricGrid}>{cards.map(({ label, value, hint, Icon }) => <article key={label} className={styles.metricCard}><Icon size={20} /><strong>{loading ? "—" : value ?? 0}</strong><span>{label}</span><small>{hint}</small></article>)}</div>
            <div className="grid grid-2">
              <Panel title="Latest Platform Activity" icon={<Activity size={18} />}><ActivityList items={activity.slice(0, 8)} /></Panel>
              <Panel title="Recent Users" icon={<Users size={18} />}><UserList items={users.slice(0, 7)} onViewActivity={openUserActivity} /></Panel>
            </div>
          </>
        )}

        {activeTab !== "overview" && (
          <div className={styles.tableShell}>
            <div className={styles.tableToolbar}>
              {(activeTab === "users" || activeTab === "programs" || activeTab === "workouts") && (
                <form onSubmit={(e) => { e.preventDefault(); loadTab(activeTab); }} className={styles.searchBox}>
                  <Search size={16} />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${activeTab}…`} />
                  <button className="secondary-btn" type="submit">Search</button>
                </form>
              )}
              {activeTab === "feedback" && <select value={feedbackStatus} onChange={(e) => setFeedbackStatus(e.target.value as FeedbackStatus | "ALL")}><option value="ALL">All feedback</option><option value="NEW">New</option><option value="REVIEWED">Reviewed</option><option value="RESOLVED">Resolved</option><option value="DISMISSED">Dismissed</option></select>}
              {tableLoading && <span className={styles.loadingInline}><Loader2 className={styles.spin} size={16} /> Loading…</span>}
            </div>
            {activeTab === "activity" && <ActivityList items={activity} />}
            {activeTab === "users" && <UserList items={users} onViewActivity={openUserActivity} />}
            {activeTab === "feedback" && <FeedbackList items={feedback} onStatus={updateFeedback} />}
            {activeTab === "programs" && <ProgramList items={programs} />}
            {activeTab === "enrollments" && <EnrollmentList items={enrollments} />}
            {activeTab === "workouts" && <WorkoutList items={workouts} />}
            {activeTab === "subscriptions" && <SubscriptionList items={subscriptions} />}
          </div>
        )}
      </section>

      {selectedUser && <UserActivityDrawer user={selectedUser} data={selectedUserData} loading={userActivityLoading} onClose={() => { setSelectedUser(null); setSelectedUserData(null); }} />}
    </DashboardShell>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <article className={`premium-card ${styles.panel}`}><div className={styles.panelHead}>{icon}<h2>{title}</h2></div>{children}</article>;
}

function Empty() { return <div className={styles.empty}><Inbox size={18} /> No records found.</div>; }

function UserList({ items, onViewActivity }: { items: any[]; onViewActivity?: (user: any) => void }) {
  if (!items?.length) return <Empty />;
  return <div className={styles.list}>{items.map((user) => <div key={user.id || user.email} className={styles.row}><div><strong>{user.name || "Unnamed user"}</strong><small>{user.email}</small></div><div className={styles.rowMeta}><StatusPill status={user.role || "USER"} />{user.isEmailVerified ? <span className={styles.ok}><CheckCircle2 size={13} /> Verified</span> : <span>Unverified</span>}<span>{shortDate(user.createdAt)}</span>{user._count && <span>{user._count.workoutLogs || 0} logs · {user._count.enrollments || 0} programs</span>}{onViewActivity && <button type="button" className={styles.iconButton} onClick={() => onViewActivity(user)}><Eye size={14} /> View everything</button>}</div></div>)}</div>;
}

function FeedbackList({ items, onStatus }: { items: any[]; onStatus: (id: string, status: FeedbackStatus) => void }) {
  if (!items?.length) return <Empty />;
  return <div className={styles.list}>{items.map((item) => <div key={item.id} className={styles.feedbackRow}><div className={styles.feedbackTop}><div><strong>{item.type || "suggestion"}</strong><small>{item.user?.email || item.user?.name || "Unknown user"} · {shortDate(item.createdAt)}</small></div><StatusPill status={item.status} /></div><p>{item.message}</p>{item.pageUrl && <small className={styles.pageUrl}>{item.pageUrl}</small>}<div className={styles.statusActions}>{(["REVIEWED", "RESOLVED", "DISMISSED"] as FeedbackStatus[]).map((status) => <button key={status} type="button" onClick={() => onStatus(item.id, status)}>{status.toLowerCase()}</button>)}</div></div>)}</div>;
}

function ProgramList({ items }: { items: any[] }) {
  if (!items?.length) return <Empty />;
  return <div className={styles.list}>{items.map((program) => <div key={program.id} className={styles.row}><div><strong>{program.name || program.title || "Program"}</strong><small>{program.user?.email ? `Created by ${program.user.email} · ` : ""}{program.category || "general"} · {program.difficulty || "intermediate"}</small></div><div className={styles.rowMeta}><span>{program.durationWeeks || 1} weeks</span><span>{program.daysPerWeek || 1} days/week</span><span>{program._count?.enrollments || 0} enrollments</span><StatusPill status={program.isActive ? "ACTIVE" : "INACTIVE"} /></div></div>)}</div>;
}

function EnrollmentList({ items }: { items: any[] }) {
  if (!items?.length) return <Empty />;
  return <div className={styles.list}>{items.map((enrollment) => <div key={enrollment.id} className={styles.row}><div><strong>{enrollment.program?.name || "Program enrollment"}</strong><small>{enrollment.user?.email || "Unknown user"} · {shortDate(enrollment.createdAt)}</small></div><div className={styles.rowMeta}><span>{enrollment.progress || 0}% progress</span><span>{enrollment.completedDays || 0} days done</span><StatusPill status={enrollment.isActive ? "ACTIVE" : "INACTIVE"} /></div></div>)}</div>;
}

function WorkoutList({ items }: { items: any[] }) {
  if (!items?.length) return <Empty />;
  return <div className={styles.list}>{items.map((log) => <div key={log.id} className={styles.row}><div><strong>{log.exercise?.name || log.exerciseName || "Workout log"}</strong><small>{log.user?.email || "Unknown user"} · {dateTime(log.createdAt || log.date)}</small></div><div className={styles.rowMeta}><span>{log.sets || 0} sets</span><span>{log.reps || 0} reps</span><span>{log.duration || 0} min</span><span>{Math.round(Number(log.caloriesBurned || 0))} kcal</span></div></div>)}</div>;
}

function SubscriptionList({ items }: { items: any[] }) {
  if (!items?.length) return <Empty />;
  return <div className={styles.list}>{items.map((sub) => <div key={sub.id} className={styles.row}><div><strong>{sub.user?.email || "Unknown user"}</strong><small>{sub.plan?.name || sub.plan?.slug || "Plan"} · {sub.interval || "MONTHLY"}</small></div><div className={styles.rowMeta}><StatusPill status={sub.status} /><span><Clock size={13} /> {shortDate(sub.currentPeriodEnd || sub.createdAt)}</span>{sub.payments?.[0] && <span>{money(sub.payments[0].amountCents)}</span>}</div></div>)}</div>;
}

function ActivityList({ items }: { items: any[] }) {
  if (!items?.length) return <Empty />;
  return <div className={styles.timeline}>{items.map((item, index) => <article key={`${item.type}-${item.createdAt}-${index}`} className={styles.timelineItem}><div className={styles.timelineIcon}><ActivityIcon type={item.type} /></div><div><strong>{item.label || item.type || "Activity"}</strong><p>{item.message || "No details"}</p>{item.meta?.assistant && <small className={styles.pageUrl}>Coach reply: {item.meta.assistant}</small>}<small>{dateTime(item.createdAt)}</small></div></article>)}</div>;
}

function UserActivityDrawer({ user, data, loading, onClose }: { user: any; data: any; loading: boolean; onClose: () => void }) {
  const counts = data?.user?._count || user?._count || {};
  return <div className={styles.drawerBackdrop} role="dialog" aria-modal="true"><aside className={styles.drawer}><div className={styles.drawerHead}><div><p className="eyebrow">User activity audit</p><h2>{data?.user?.name || user?.name || "Unnamed user"}</h2><small>{data?.user?.email || user?.email}</small></div><button type="button" className={styles.closeButton} onClick={onClose}><X size={18} /></button></div>{loading ? <div className={styles.centerMini}><Loader2 className={styles.spin} size={22} /> Loading full user activity…</div> : <><div className={styles.auditGrid}><span><strong>{counts.workoutLogs || 0}</strong> workouts</span><span><strong>{counts.enrollments || 0}</strong> programs</span><span><strong>{counts.feedback || 0}</strong> feedback</span><span><strong>{counts.notifications || 0}</strong> notices</span><span><strong>{data?.metrics?.length || 0}</strong> metrics</span><span><strong>{data?.coachHistory?.length || 0}</strong> AI chats</span></div><Panel title="Timeline" icon={<Activity size={18} />}><ActivityList items={data?.activity || []} /></Panel><Panel title="Workout logs" icon={<Dumbbell size={18} />}><WorkoutList items={data?.workoutLogs || []} /></Panel><Panel title="Programs" icon={<BarChart3 size={18} />}><EnrollmentList items={data?.enrollments || []} /></Panel><Panel title="Feedback" icon={<MessageSquare size={18} />}><FeedbackList items={data?.feedback || []} onStatus={() => {}} /></Panel></>}</aside></div>;
}
