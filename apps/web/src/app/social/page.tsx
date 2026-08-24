"use client";

import { useEffect, useState } from "react";
import {
  getActivityFeed,
  getLeaderboard,
  getChallenges,
  joinChallenge,
  searchUsers,
  followUser,
  unfollowUser,
} from "@/lib/api";
import type {
  ActivityFeedItemContract,
  LeaderboardEntryContract,
  ChallengeContract,
  UserPublicProfileContract,
} from "@shared/types/api-contracts";
import { Card, Button, EmptyState, Avatar, Badge } from "@/components/ui";
import { AppShell } from "@/components/AppShell";

type Tab = "feed" | "leaderboard" | "challenges" | "search";

const TABS: { key: Tab; label: string }[] = [
  { key: "feed", label: "Feed" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "challenges", label: "Challenges" },
  { key: "search", label: "Find people" },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SocialPage() {
  const [tab, setTab] = useState<Tab>("feed");
  const [feed, setFeed] = useState<ActivityFeedItemContract[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryContract[]>([]);
  const [challenges, setChallenges] = useState<ChallengeContract[]>([]);
  const [searchResults, setSearchResults] = useState<UserPublicProfileContract[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setMessage(null);
    const run = async () => {
      try {
        if (tab === "feed") setFeed(await getActivityFeed());
        else if (tab === "leaderboard") setLeaderboard(await getLeaderboard());
        else if (tab === "challenges") setChallenges(await getChallenges());
      } catch {
        setMessage("Could not load data.");
      } finally {
        setLoading(false);
      }
    };
    if (tab !== "search") run();
    else setLoading(false);
  }, [tab]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      setSearchResults(await searchUsers(query.trim()));
    } catch {
      setMessage("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (user: UserPublicProfileContract) => {
    try {
      if (user.is_following) await unfollowUser(user.id);
      else await followUser(user.id);
      setSearchResults((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_following: !u.is_following } : u))
      );
    } catch {
      setMessage("Could not update follow status.");
    }
  };

  const handleJoin = async (challengeId: number) => {
    try {
      await joinChallenge(challengeId);
      setMessage("Joined challenge!");
      setChallenges(await getChallenges());
    } catch {
      setMessage("Could not join challenge.");
    }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-text">Social</h1>

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                tab === t.key ? "grad-primary text-white" : "bg-card text-text hover:bg-line"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "search" && (
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search users…"
              className="w-full rounded-2xl border border-line bg-card px-4 py-3 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
            />
            <Button onClick={handleSearch} className="!w-auto px-6">
              Search
            </Button>
          </div>
        )}

        {message && <p className="text-sm text-primary">{message}</p>}

        {loading ? (
          <p className="py-10 text-center text-muted">Loading…</p>
        ) : tab === "feed" ? (
          feed.length === 0 ? (
            <EmptyState icon="📣" title="No activity yet" message="Follow people to see their workouts here." />
          ) : (
            <div className="space-y-3">
              {feed.map((item, i) => (
                <Card key={i} className="flex items-center gap-3">
                  <Avatar name={item.full_name} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-text">{item.full_name}</p>
                    <p className="text-xs text-muted">
                      {item.workout_name ?? "Workout"} · {item.set_count} sets
                    </p>
                    {item.notes && <p className="text-xs italic text-muted">{item.notes}</p>}
                  </div>
                  <span className="shrink-0 text-[11px] text-muted">{timeAgo(item.performed_at)}</span>
                </Card>
              ))}
            </div>
          )
        ) : tab === "leaderboard" ? (
          leaderboard.length === 0 ? (
            <EmptyState icon="🏆" title="No rankings yet" message="Complete workouts to earn XP and appear here." />
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <Card key={entry.user_id} className="flex items-center gap-3">
                  <span className="w-8 shrink-0 text-center text-base font-extrabold text-primary">#{i + 1}</span>
                  <Avatar name={entry.full_name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-text">{entry.full_name}</p>
                    <p className="text-xs text-muted">
                      Level {entry.level} · {entry.streak_days}d streak
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-primary">{entry.total_xp} XP</span>
                </Card>
              ))}
            </div>
          )
        ) : tab === "challenges" ? (
          challenges.length === 0 ? (
            <EmptyState icon="🎯" title="No challenges yet" message="Check back soon for new community challenges." />
          ) : (
            <div className="space-y-3">
              {challenges.map((c) => (
                <Card key={c.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-text">{c.title}</p>
                      {c.description && <p className="mt-0.5 text-xs text-muted">{c.description}</p>}
                    </div>
                    <Badge>{c.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {c.start_date} — {c.end_date} · goal {c.target_workouts} workouts
                  </p>
                  {typeof c.my_workouts_completed === "number" && (
                    <p className="mt-1 text-xs font-semibold text-primary">
                      Your progress: {c.my_workouts_completed}/{c.target_workouts}
                    </p>
                  )}
                  <Button variant="ghost" className="mt-3" onClick={() => handleJoin(c.id)}>
                    Join challenge
                  </Button>
                </Card>
              ))}
            </div>
          )
        ) : searchResults.length === 0 ? (
          <EmptyState icon="🔎" title="Find people" message="Search by name to find and follow other members." />
        ) : (
          <div className="space-y-2">
            {searchResults.map((u) => (
              <Card key={u.id} className="flex items-center gap-3">
                <Avatar name={u.full_name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text">{u.full_name}</p>
                  <p className="text-xs text-muted">
                    Level {u.level} · {u.streak_days}d streak
                  </p>
                </div>
                <button
                  onClick={() => toggleFollow(u)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                    u.is_following ? "bg-line text-text" : "grad-primary text-white"
                  }`}
                >
                  {u.is_following ? "Following" : "Follow"}
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
