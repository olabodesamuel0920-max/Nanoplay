// src/app/(admin)/admin/challenges/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { createRoundAndMatches, settleChallengeRound } from "@/app/actions/admin";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Shield, Trophy, FileCheck, ShieldAlert, Plus, Save } from "lucide-react";
import styles from "./page.module.css";

export default function AdminChallengesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  // Challenge Rounds
  const [rounds, setRounds] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  // Create Round Form
  const [newRoundNum, setNewRoundNum] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [match1Home, setMatch1Home] = useState("");
  const [match1Away, setMatch1Away] = useState("");
  const [match1Kickoff, setMatch1Kickoff] = useState("");
  
  const [match2Home, setMatch2Home] = useState("");
  const [match2Away, setMatch2Away] = useState("");
  const [match2Kickoff, setMatch2Kickoff] = useState("");
  
  const [match3Home, setMatch3Home] = useState("");
  const [match3Away, setMatch3Away] = useState("");
  const [match3Kickoff, setMatch3Kickoff] = useState("");

  // Score inputs for active rounds
  // Key: matchId, Value: { homeScore: string, awayScore: string }
  const [scores, setScores] = useState<{ [matchId: string]: { homeScore: string; awayScore: string } }>({});

  // Feedback States
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadChallengesData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Fetch active/upcoming rounds
    const { data: roundsData } = await supabase
      .from("challenge_rounds")
      .select("*")
      .order("round_number", { ascending: false });
    setRounds(roundsData || []);

    // Fetch all matches for these rounds
    const { data: matchesData } = await supabase
      .from("challenge_matches")
      .select("*")
      .order("matchday", { ascending: true });
    setMatches(matchesData || []);

    // Preset score inputs for existing matches
    const scoreInputs: typeof scores = {};
    matchesData?.forEach((m) => {
      scoreInputs[m.id] = {
        homeScore: m.home_score !== null ? m.home_score.toString() : "",
        awayScore: m.away_score !== null ? m.away_score.toString() : "",
      };
    });
    setScores(scoreInputs);
    setLoading(false);
  };

  useEffect(() => {
    loadChallengesData();
  }, []);

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    const roundNumVal = parseInt(newRoundNum);
    if (isNaN(roundNumVal) || !startDate || !endDate) {
      setMessage({ type: "error", text: "Please enter valid round details." });
      setActionLoading(false);
      return;
    }

    try {
      const res = await createRoundAndMatches({
        roundNumber: roundNumVal,
        startDate,
        endDate,
        matches: [
          { homeTeam: match1Home, awayTeam: match1Away, kickoffTime: match1Kickoff, matchday: 1 },
          { homeTeam: match2Home, awayTeam: match2Away, kickoffTime: match2Kickoff, matchday: 2 },
          { homeTeam: match3Home, awayTeam: match3Away, kickoffTime: match3Kickoff, matchday: 3 },
        ],
      });

      if (res.success) {
        setMessage({ type: "success", text: res.message });
        // Clear form
        setNewRoundNum("");
        setStartDate("");
        setEndDate("");
        setMatch1Home(""); setMatch1Away(""); setMatch1Kickoff("");
        setMatch2Home(""); setMatch2Away(""); setMatch2Kickoff("");
        setMatch3Home(""); setMatch3Away(""); setMatch3Kickoff("");
        await loadChallengesData();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create round." });
    }
    setActionLoading(false);
  };

  const handleScoreChange = (matchId: string, side: "home" | "away", value: string) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [side === "home" ? "homeScore" : "awayScore"]: value,
      },
    }));
  };

  const handleSettleRound = async (roundId: string) => {
    setActionLoading(true);
    setMessage(null);

    // Get matches for this round
    const roundMatches = matches.filter((m) => m.round_id === roundId);
    
    // Build scores payload
    const resultsPayload: Array<{ matchId: string; homeScore: number; awayScore: number }> = [];

    for (const m of roundMatches) {
      const matchScore = scores[m.id];
      const hScore = parseInt(matchScore?.homeScore);
      const aScore = parseInt(matchScore?.awayScore);

      if (isNaN(hScore) || isNaN(aScore)) {
        setMessage({
          type: "error",
          text: `Please enter valid scores for match: ${m.home_team} vs ${m.away_team}.`,
        });
        setActionLoading(false);
        return;
      }

      resultsPayload.push({
        matchId: m.id,
        homeScore: hScore,
        awayScore: aScore,
      });
    }

    try {
      const res = await settleChallengeRound(roundId, resultsPayload);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        await loadChallengesData();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to settle round." });
    }
    setActionLoading(false);
  };

  const adminNav = [
    { name: "Overview", path: "/admin", icon: Shield, active: false },
    { name: "Challenges", path: "/admin/challenges", icon: Trophy, active: true },
    { name: "KYC & Payouts", path: "/admin/kyc-payouts", icon: FileCheck, active: false },
    { name: "Security & Fraud", path: "/admin/security", icon: ShieldAlert, active: false },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-center" style={{ flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <div
              className="animate-spin rounded-full"
              style={{ width: "32px", height: "32px", border: "2px solid #D4A853", borderTopColor: "transparent" }}
              role="status"
              aria-label="Loading"
            />
            <div className="font-data" style={{ fontSize: "12px", color: "#94a3b8" }}>Loading challenge configurations</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.adminHeader}>
            <div>
              <h1 className={styles.title}>Challenge Organizer</h1>
              <p className={styles.subtitle}>Create challenge rounds and settle match scorecards.</p>
            </div>
          </div>

          {/* Admin Tabs */}
          <div className={styles.tabNav}>
            {adminNav.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={[styles.tabItem, tab.active ? styles.tabActive : ""].join(" ")}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>

          {message && (
            <div className={message.type === "success" ? styles.successAlert : styles.errorAlert}>
              {message.text}
            </div>
          )}

          <div className={styles.grid}>
            {/* Left Column: Create Challenge Round Form */}
            <div className={styles.column}>
              <GlassCard className={styles.card}>
                <div className={styles.cardHeader}>
                  <Plus className={styles.cardIcon} />
                  <h3 className={styles.cardTitle}>Create Prediction Round</h3>
                </div>

                <form onSubmit={handleCreateRound} className={styles.form}>
                  <Input
                    label="Round Number"
                    type="number"
                    placeholder="e.g. 1"
                    value={newRoundNum}
                    onChange={(e) => setNewRoundNum(e.target.value)}
                    required
                  />

                  <div className={styles.formRow}>
                    <Input
                      label="Start Date"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                    <Input
                      label="End Date"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Matchday 1 definition */}
                  <div className={styles.sectionHeader}>Matchday 1 Match Details</div>
                  <div className={styles.formRow}>
                    <Input
                      label="Home Team"
                      type="text"
                      placeholder="Chelsea"
                      value={match1Home}
                      onChange={(e) => setMatch1Home(e.target.value)}
                      required
                    />
                    <Input
                      label="Away Team"
                      type="text"
                      placeholder="Arsenal"
                      value={match1Away}
                      onChange={(e) => setMatch1Away(e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    label="Kickoff Time"
                    type="datetime-local"
                    value={match1Kickoff}
                    onChange={(e) => setMatch1Kickoff(e.target.value)}
                    required
                  />

                  {/* Matchday 2 definition */}
                  <div className={styles.sectionHeader}>Matchday 2 Match Details</div>
                  <div className={styles.formRow}>
                    <Input
                      label="Home Team"
                      type="text"
                      placeholder="Real Madrid"
                      value={match2Home}
                      onChange={(e) => setMatch2Home(e.target.value)}
                      required
                    />
                    <Input
                      label="Away Team"
                      type="text"
                      placeholder="Barcelona"
                      value={match2Away}
                      onChange={(e) => setMatch2Away(e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    label="Kickoff Time"
                    type="datetime-local"
                    value={match2Kickoff}
                    onChange={(e) => setMatch2Kickoff(e.target.value)}
                    required
                  />

                  {/* Matchday 3 definition */}
                  <div className={styles.sectionHeader}>Matchday 3 Match Details</div>
                  <div className={styles.formRow}>
                    <Input
                      label="Home Team"
                      type="text"
                      placeholder="Man City"
                      value={match3Home}
                      onChange={(e) => setMatch3Home(e.target.value)}
                      required
                    />
                    <Input
                      label="Away Team"
                      type="text"
                      placeholder="Man United"
                      value={match3Away}
                      onChange={(e) => setMatch3Away(e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    label="Kickoff Time"
                    type="datetime-local"
                    value={match3Kickoff}
                    onChange={(e) => setMatch3Kickoff(e.target.value)}
                    required
                  />

                  <Button type="submit" variant="premium" loading={actionLoading} className={styles.submitBtn}>
                    Create Challenge Round
                  </Button>
                </form>
              </GlassCard>
            </div>

            {/* Right Column: Active Rounds & Settlement */}
            <div className={styles.column}>
              <div className={styles.sectionTitle}>Active & Upcoming Challenges</div>
              
              {rounds.length === 0 ? (
                <div className={styles.noRounds}>No challenge rounds scheduled yet.</div>
              ) : (
                <div className={styles.roundsList}>
                  {rounds.map((round) => {
                    const roundMatches = matches.filter((m) => m.round_id === round.id);

                    return (
                      <GlassCard key={round.id} className={styles.roundCard} hoverEffect={false}>
                        <div className={styles.roundCardHeader}>
                          <span className={styles.roundNum}>Round #{round.round_number}</span>
                          <span className={["badge", round.status === "active" ? "badge-success" : round.status === "completed" ? "badge-info" : "badge-warning"].join(" ")}>
                            {round.status.toUpperCase()}
                          </span>
                        </div>

                        <div className={styles.matchesScoreGrid}>
                          {roundMatches.map((match) => {
                            const isMatchdayFinished = match.status === "finished";

                            return (
                              <div key={match.id} className={styles.matchScoreItem}>
                                <div className={styles.matchdayText}>Matchday {match.matchday}</div>
                                <div className={styles.scoreRow}>
                                  <span className={styles.teamText}>{match.home_team}</span>
                                  <input
                                    type="number"
                                    className={styles.scoreInput}
                                    placeholder="0"
                                    value={scores[match.id]?.homeScore || ""}
                                    onChange={(e) => handleScoreChange(match.id, "home", e.target.value)}
                                    disabled={round.status === "completed" || isMatchdayFinished}
                                  />
                                  <span className={styles.vsText}>vs</span>
                                  <input
                                    type="number"
                                    className={styles.scoreInput}
                                    placeholder="0"
                                    value={scores[match.id]?.awayScore || ""}
                                    onChange={(e) => handleScoreChange(match.id, "away", e.target.value)}
                                    disabled={round.status === "completed" || isMatchdayFinished}
                                  />
                                  <span className={styles.teamText}>{match.away_team}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {round.status !== "completed" && (
                          <div className={styles.settleRow}>
                            <Button
                              onClick={() => handleSettleRound(round.id)}
                              variant="premium"
                              loading={actionLoading}
                              className={styles.settleBtn}
                            >
                              <Save size={16} />
                              <span>Settle Round Scores</span>
                            </Button>
                          </div>
                        )}
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
