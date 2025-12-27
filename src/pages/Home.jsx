import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Award, ArrowRight } from 'lucide-react';
import Button from '../components/Button';

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-auto flex flex-col home-hero">
            {/* Navigation */}
            <nav className="sticky top-0 flex-none w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 h-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex justify-between items-center h-full flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="bg-emerald-600 p-2 rounded-lg">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                                Academy
                            </span>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap order-2 sm:order-none w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
                            <Link to="/login" className="hidden sm:inline-flex w-full sm:w-auto">
                                <Button variant="ghost" className="text-slate-600 hover:text-emerald-600 px-3 py-1 text-sm sm:px-4 sm:py-2 w-full sm:w-auto">
                                    Log in
                                </Button>
                            </Link>
                            <Link to="/register" className="hidden sm:inline-flex w-full sm:w-auto">
                                <Button variant="primary" className="shadow-lg shadow-emerald-600/20 px-3 py-1.5 text-sm sm:px-6 sm:py-2 w-full sm:w-auto">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 relative flex flex-col justify-center items-center overflow-auto pt-14 sm:pt-0">
                <div className="absolute inset-0 -z-10 hero-bg bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-slate-50 to-slate-50"></div> 

                {/* Mobile: reduce heading size via utility for better overlap prevention */} 

                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full justify-center">

                    <div className="flex flex-col lg:flex-row items-center gap-12 h-full justify-center">
                        {/* Left: Hero Text */}
                        <div className="flex-1 text-center lg:text-left pt-8 lg:pt-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                New: Advanced Analytics
                            </div>

                            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                                Master Your Future with <br />
                                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                                    Modern Learning
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl lg:max-w-none mx-auto">
                                Unlock your potential with our comprehensive learning platform.
                                Take tests, track progress, and achieve your goals.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start w-full sm:w-auto">
                                <Link to="/register" className="w-full sm:w-auto">
                                    <Button size="lg" variant="primary" className="w-full sm:w-auto h-12 px-6 sm:px-8 text-base shadow-xl shadow-emerald-600/20 group">
                                        Start Now
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link to="/login" className="w-full sm:w-auto">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-6 sm:px-8 text-base bg-white hover:bg-slate-50">
                                        Login
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right: Compact Feature Grid */}
                        <div className="flex-1 w-full max-w-md lg:max-w-full">
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    {
                                        icon: BookOpen,
                                        title: "Comprehensive Assessments",
                                        desc: "Evaluate your readiness with industry-standard placement tests."
                                    },
                                    {
                                        icon: Users,
                                        title: "Interactive Learning",
                                        desc: "Engage with dynamic content and assessments."
                                    },
                                    {
                                        icon: Award,
                                        title: "Track Success",
                                        desc: "Monitor your progress with detailed analytics."
                                    }
                                ].map((feature, idx) => (
                                    <div key={idx} className="feature-card flex flex-col sm:flex-row items-start p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-100 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3 sm:mb-0 sm:mr-4 flex-none">
                                            <feature.icon className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 mb-1">{feature.title}</h3>
                                            <p className="text-sm text-slate-600 leading-snug">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="flex-none bg-white border-t border-slate-200 py-4">
                <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
                    <p>© 2025 Academy. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
