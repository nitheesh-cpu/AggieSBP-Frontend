"use client";

import React, { useEffect, useState } from "react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { motion } from "motion/react";
import { getSchedules, Schedule } from "@/lib/api";
import { User, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    return (
        <SessionAuth>
            <ProfileContent />
        </SessionAuth>
    );
}

function ProfileContent() {
    const session = useSessionContext();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    // We only run this effect if we are definitely authenticated
    useEffect(() => {
        async function loadData() {
            if (session.loading || !session.doesSessionExist) return;

            try {
                const data = await getSchedules();
                setSchedules(data);
            } catch (error) {
                console.error("Failed to load schedules:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [session]);

    const userId = !session.loading && session.doesSessionExist ? session.userId : "";

    return (
        <div
            className="min-h-screen relative flex flex-col"
            style={{
                background: "var(--app-bg-gradient)",
            }}
        >
            {/* Ambient background */}
            <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                style={{
                    background: "var(--app-bg-ambient)",
                }}
            />

            <Navigation variant="glass" />

            <main className="flex-grow pt-24 px-6 relative z-10">
                <div className="max-w-4xl mx-auto space-y-8 pb-20">

                    {/* Header / User Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white/50 dark:bg-black/50 backdrop-blur-md border border-[#500000]/10 dark:border-[#FFCF3F]/10 rounded-2xl p-8 flex items-center gap-6 shadow-sm"
                    >
                        <div className="h-20 w-20 rounded-full bg-[#500000]/5 dark:bg-[#FFCF3F]/10 flex items-center justify-center shrink-0">
                            <User className="h-10 w-10 text-[#500000] dark:text-[#FFCF3F]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-heading dark:text-white mb-2">Student Profile</h1>
                            <p className="text-body dark:text-gray-400 font-mono text-sm break-all">
                                ID: {userId}
                            </p>
                        </div>
                    </motion.div>

                    {/* Schedules Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-heading dark:text-white flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Saved Schedules
                            </h2>
                            <Link href="/courses">
                                <Button className="bg-[#500000] text-white hover:bg-[#330000] dark:bg-[#FFCF3F] dark:text-black dark:hover:bg-[#FFD966]">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Schedule
                                </Button>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-40 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : schedules.length === 0 ? (
                            <div className="bg-white/40 dark:bg-black/40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">No schedules saved yet.</p>
                                <Link href="/courses">
                                    <Button variant="outline">Start Planning</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {schedules.map((schedule, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-border/50 dark:border-white/10 rounded-xl p-6 hover:shadow-lg transition-all"
                                    >
                                        <h3 className="font-semibold text-lg mb-2">{schedule.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            {schedule.selected_courses?.length || 0} courses selected
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {schedule.selected_courses?.slice(0, 3).map((course: any, cIdx: number) => (
                                                <span key={cIdx} className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-xs font-mono">
                                                    {course.subject} {course.course_number}
                                                </span>
                                            ))}
                                            {(schedule.selected_courses?.length || 0) > 3 && (
                                                <span className="px-2 py-1 text-xs text-gray-500">+{(schedule.selected_courses?.length || 0) - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                </div>
            </main>
            <Footer />
        </div>
    );
}
