import { useState, useEffect, useMemo } from "react";
import { getLeaderboard } from "../hooks/useGamification";

interface AdminUser {
  email: string;
  name: string;
  avatar: string;
  joinDate: string;
}

function loadUsers(): Record<string, { name: string; hash: string; avatar: string; joinDate: string }> {
  try { return JSON.parse(localStorage.getItem("robotech_users_db") ?? "{}"); } catch { return {}; }
}

function loadProgress(): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i) ?? "";
    if (k.startsWith("robotech_prog_")) result[k] = JSON.parse(localStorage.getItem(k) ?? "{}");
  }
  return result;
}

function deleteUser(email: string) {
  const users = loadUsers();
  delete users[email.toLowerCase()];
  localStorage.setItem("robotech_users_db", JSON.stringify(users));
  // Also remove their gamification state
  const gam = JSON.parse(localStorage.getItem("robotech_gam_v2") ?? "{}");
  delete gam[email.toLowerCase()];
  localStorage.setItem("robotech_gam_v2", JSON.stringify(gam));
  const profiles = JSON.parse(localStorage.getItem("robotech_gam_profiles_v2") ?? "{}");
  delete profiles[email.toLowerCase()];
  localStorage.setItem("robotech_gam_profiles_v2", JSON.stringify(profiles));
}

interface AdminPanelProps {
  onLogout: () => void;
  theme: "dark" | "light";
}

type SortKey = "xp" | "level" | "streak" | "badges" | "name";

export default function AdminPanel({ onLogout, theme }: AdminPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [leaderboard, setLeaderboard] = useState(getLeaderboard());
  const [sortKey, setSortKey] = useState<SortKey>("xp");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const db = loadUsers();
    const list: AdminUser[] = Object.entries(db)
      .filter(([email]) => email !== "admin@robotech.com")
      .map(([email, v]) => ({ email, name: v.name, avatar: v.avatar, joinDate: v.joinDate }));
    setUsers(list);
    setLeaderboard(getLeaderboard());
  }, [tick]);

  const stats = useMemo(() => {
    const realUsers = leaderboard.filter(r => !r.email.startsWith("_demo_"));
    const totalXp = realUsers.reduce((s, r) => s + r.xp, 0);
    const avgLevel = realUsers.length ? Math.round(realUsers.reduce((s, r) => s + r.level, 0) / realUsers.length) : 0;
    const topStreak = Math.max(0, ...realUsers.map(r => r.streak));
    return { count: users.length, totalXp, avgLevel, topStreak };
  }, [users, leaderboard]);

  const gamMap = useMemo(() => {
    const m: Record<string, ReturnType<typeof getLeaderboard>[0]> = {};
    for (const r of leaderboard) m[r.email] = r;
    return m;
  }, [leaderboard]);

  const sorted = useMemo(() => {
    let list = users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
    list = list.sort((a, b) => {
      const ga = gamMap[a.email];
      const gb = gamMap[b.email];
      let va = 0, vb = 0;
      if (sortKey === "name") { va = a.name.charCodeAt(0); vb = b.name.charCodeAt(0); }
      else if (sortKey === "xp")     { va = ga?.xp     ?? 0; vb = gb?.xp     ?? 0; }
      else if (sortKey === "level")  { va = ga?.level   ?? 0; vb = gb?.level   ?? 0; }
      else if (sortKey === "streak") { va = ga?.streak  ?? 0; vb = gb?.streak  ?? 0; }
      else if (sortKey === "badges") { va = ga?.badges  ?? 0; vb = gb?.badges  ?? 0; }
      return sortAsc ? va - vb : vb - va;
    });
    return list;
  }, [users, search, sortKey, sortAsc, gamMap]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(false); }
  };

  const handleDelete = (email: string) => {
    deleteUser(email);
    setConfirmDelete(null);
    setTick(t => t + 1);
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? <i className={`fas fa-caret-${sortAsc ? "up" : "down"}`} /> : <i className="fas fa-sort" style={{ opacity: 0.4 }} />;

  return (
    <div className="admin-panel" data-theme={theme}>
      {/* Header */}
      <header className="admin-header">
        <div className="admin-logo">
          <span>🛡️</span>
          <div>
            <strong>لوحة إدارة RoboTech</strong>
            <span>بيانات المستخدمين والإحصائيات</span>
          </div>
        </div>
        <div className="admin-header-right">
          <span className="admin-badge">Admin</span>
          <button className="admin-logout" onClick={onLogout}>
            <i className="fas fa-sign-out-alt" /> تسجيل خروج
          </button>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <i className="fas fa-users" />
            <div>
              <strong>{stats.count}</strong>
              <span>مستخدم مسجّل</span>
            </div>
          </div>
          <div className="admin-stat-card gold">
            <i className="fas fa-star" />
            <div>
              <strong>{stats.totalXp.toLocaleString()}</strong>
              <span>إجمالي XP المكتسبة</span>
            </div>
          </div>
          <div className="admin-stat-card purple">
            <i className="fas fa-trophy" />
            <div>
              <strong>{stats.avgLevel}</strong>
              <span>متوسّط المستوى</span>
            </div>
          </div>
          <div className="admin-stat-card fire">
            <i className="fas fa-fire" />
            <div>
              <strong>{stats.topStreak}</strong>
              <span>أعلى streak أيام</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="admin-search-row">
          <div className="admin-search-box">
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder="ابحث باسم المستخدم أو البريد..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              dir="rtl"
            />
          </div>
          <span className="admin-count">{sorted.length} مستخدم</span>
        </div>

        {/* Table */}
        {sorted.length === 0 ? (
          <div className="admin-empty">
            <i className="fas fa-user-slash" />
            <p>{search ? "لا نتائج مطابقة للبحث" : "لا يوجد مستخدمون مسجّلون بعد"}</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th onClick={() => handleSort("name")} className="sortable">
                    الاسم <SortIcon k="name" />
                  </th>
                  <th>البريد</th>
                  <th>الانضمام</th>
                  <th onClick={() => handleSort("xp")} className="sortable">
                    XP <SortIcon k="xp" />
                  </th>
                  <th onClick={() => handleSort("level")} className="sortable">
                    المستوى <SortIcon k="level" />
                  </th>
                  <th onClick={() => handleSort("badges")} className="sortable">
                    شارات <SortIcon k="badges" />
                  </th>
                  <th onClick={() => handleSort("streak")} className="sortable">
                    Streak <SortIcon k="streak" />
                  </th>
                  <th>حذف</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((u, i) => {
                  const g = gamMap[u.email];
                  return (
                    <tr key={u.email}>
                      <td className="admin-rank">{i + 1}</td>
                      <td>
                        <div className="admin-user-cell">
                          <span className="admin-avatar">{u.avatar}</span>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="admin-email">{u.email}</td>
                      <td>{u.joinDate}</td>
                      <td><span className="admin-xp-pill">{(g?.xp ?? 0).toLocaleString()}</span></td>
                      <td>
                        <span className="admin-level-chip">{g?.level ?? 1}</span>
                      </td>
                      <td>{g?.badges ?? 0} 🏅</td>
                      <td>
                        {(g?.streak ?? 0) > 0
                          ? <span className="admin-streak"><i className="fas fa-fire" /> {g?.streak}</span>
                          : <span style={{ opacity: 0.4 }}>—</span>}
                      </td>
                      <td>
                        <button
                          className="admin-del-btn"
                          onClick={() => setConfirmDelete(u.email)}
                          title="حذف المستخدم"
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="admin-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-confirm" onClick={e => e.stopPropagation()}>
            <i className="fas fa-triangle-exclamation" style={{ color: "#fa5252", fontSize: 32 }} />
            <h3>حذف المستخدم؟</h3>
            <p>سيتم حذف <strong>{users.find(u => u.email === confirmDelete)?.name}</strong> وجميع بياناته نهائياً.</p>
            <div className="admin-confirm-btns">
              <button className="admin-confirm-cancel" onClick={() => setConfirmDelete(null)}>إلغاء</button>
              <button className="admin-confirm-delete" onClick={() => handleDelete(confirmDelete!)}>
                <i className="fas fa-trash" /> حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
