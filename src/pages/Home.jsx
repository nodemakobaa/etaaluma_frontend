import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TestimonialSlider from '../components/TestimonialSlider';

const Home = () => {
  // Full Academic Management Features List
  const featuresList = [
    {
      title: "School & User Management",
      desc: "Complete digital administration for School profiles, Classes, Subjects, Teachers, and Students.",
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0l-3-3m3 3l3-3" />
        </svg>
      )
    },
    {
      title: "New & Old Curricula Support",
      desc: "Fully compliant with both new and existing secondary education curriculum frameworks in Tanzania.",
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: "Automated Index Number Generation",
      desc: "Instant and accurate generation of student examination Index Numbers in strict alphabetical order.",
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      )
    },
    {
      title: "Exam Processing & Control",
      desc: "Streamlined entry for Mid-Term, Terminal, and Annual exams with score locking and verification workflows.",
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "Academic Progress Reports",
      desc: "Generate comprehensive Student Progress Reports and annual academic performance summaries seamlessly.",
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Interactive Marks Matrix",
      desc: "A wide, clear grid view enabling academic departments to track and analyze marks across all subjects and classes.",
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* Header / Navigation Bar */}
      <Navbar />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-12">
        
        {/* HERO SECTION */}
        <section id="home" className="bg-white rounded-3xl p-8 md:p-14 text-center shadow-sm border border-slate-200 space-y-6 relative overflow-hidden">
          {/* Light Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-5">
            <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs md:text-sm font-semibold tracking-wide">
              🎓 Complete Academic Management Platform
            </span>

            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              Welcome to <span className="text-emerald-600">E-Taaluma</span> Management System
            </h1>

            <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              A modern, end-to-end academic management system designed to streamline school operations, examinations, and reporting for secondary schools across Tanzania.
            </p>

            <div className="pt-2">
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition transform hover:-translate-y-0.5"
              >
                <span>Register Your School Now</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          {/* for primary school, this is your link */}
          <div className="mt-4">
            <a
              href="https://front-end-for-primary.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white transition-all bg-emerald-600 rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 gap-2"
            >
              <span>Register Primary School</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">E-Taaluma Features</h2>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
              Everything you need to manage your institution's academic ecosystem efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-md transition duration-200 space-y-3"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS SLIDER SECTION */}
        <section className="bg-white rounded-3xl p-2 md:p-6 shadow-sm border border-slate-200">
          <TestimonialSlider />
        </section>

        {/* ABOUT & CONTACTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ABOUT US SECTION */}
          <section id="about" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">About E-Taaluma</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                E-Taaluma is engineered to simplify and digitize academic administration for both private and government secondary schools across Tanzania. Our mission is to enhance school administration, streamline teacher workflows, and deliver accurate academic reporting.
              </p>
            </div>
          </section>

          {/* CONTACTS SECTION */}
          <section id="contacts" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Contact Us</h2>
            </div>

            <div className="space-y-3 text-sm md:text-base text-slate-600">
              <div className="flex items-start gap-3">
                <span className="font-semibold text-slate-700 min-w-[70px]">Phone:</span>
                <span className="text-emerald-700 font-medium">+255 752 488 857 / +255 621 498 397 /+255 678 991 126</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700 min-w-[70px]">Email:</span>
                <a href="mailto:info@etaaluma.ac.tz" className="text-emerald-600 font-medium hover:underline">info@etaaluma.ac.tz</a>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default Home;