"use client";

import React from "react";
import { motion } from "motion/react";
import { Sparkles, BookOpen, Users, TrendingUp, Shield } from "lucide-react";

export function ReveilleIntro() {
    return (
        <section className="py-16 md:py-24 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
                    {/* Reveille Avatar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="relative shrink-0"
                    >
                        <div className="relative">
                            <img
                                src="/pixel-reveille.png"
                                alt="Reveille - The First Lady of Aggieland"
                                className="w-72 h-72 md:w-72 md:h-72 lg:w-108 lg:h-108 object-contain drop-shadow-2xl"
                                style={{ imageRendering: "pixelated" }}
                            />
                            {/* Animated sparkles around Reveille */}
                            <motion.div
                                className="absolute -top-2 -right-2"
                                animate={{ rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Sparkles className="w-6 h-6 text-[#FFCF3F]" />
                            </motion.div>
                            <motion.div
                                className="absolute bottom-4 -left-4"
                                animate={{ rotate: [0, -15, 0], scale: [1, 1.1, 1] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            >
                                <Sparkles className="w-5 h-5 text-[#FFCF3F]" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Speech Bubble Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex-1 relative"
                    >
                        {/* Speech bubble */}
                        <div className="bg-popover border-2 border-primary rounded-2xl p-6 md:p-8 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
                            {/* Pointer - mobile (top) */}
                            <div className="absolute -top-3 left-1/2 w-5 h-5 bg-popover border-t-2 border-l-2 border-primary transform rotate-45 md:hidden" />
                            {/* Pointer - desktop (left) */}
                            <div className="absolute top-50 lg:top-40 -left-3 w-5 h-5 bg-popover border-b-2 border-l-2 border-primary transform rotate-45 hidden md:block" />

                            <h2 className="font-bold text-xl lg:text-2xl text-primary mb-4">
                                Howdy, Aggies! 🐾
                            </h2>

                            <p className="text-base lg:text-lg text-text-body dark:text-white/90 mb-6 leading-relaxed">
                                I&apos;m <strong className="text-primary">Reveille</strong>, and I&apos;m here to help you
                                navigate your academic journey at Texas A&M! <strong className="text-[#FFCF3F]">AggieSB+</strong> is
                                your ultimate schedule builder and course discovery tool.
                            </p>

                            {/* Feature list */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-text-heading dark:text-white">Find Easy Core Curriculum Courses</h3>
                                        <p className="text-xs text-text-body/70 dark:text-white/60">Discover courses ranked by easiness score</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                        <Users className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-text-heading dark:text-white">Professor Insights</h3>
                                        <p className="text-xs text-text-body/70 dark:text-white/60">AI-powered summaries from real reviews</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                        <TrendingUp className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-text-heading dark:text-white">Grade Data</h3>
                                        <p className="text-xs text-text-body/70 dark:text-white/60">Real GPA stats and A/B rate distributions</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                                        <Shield className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-text-heading dark:text-white">Compare & Decide</h3>
                                        <p className="text-xs text-text-body/70 dark:text-white/60">Side-by-side course & professor comparison</p>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-6 text-sm text-text-body/80 dark:text-white/70 italic">
                                Let&apos;s build the perfect schedule together. Gig &apos;em! 👍
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
