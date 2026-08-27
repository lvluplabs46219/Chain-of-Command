import { useState } from "react";
import { FeaturedCoursesCarousel } from "./FeaturedCoursesCarousel";
import {
  GraduationCap,
  Scale,
  Gavel,
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
  FileText,
  MessageSquare,
  ShieldAlert,
  Award,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  Sparkles
} from "lucide-react";

export function AcquitAcademy() {
  const [activeCourse, setActiveCourse] = useState<string | null>(null);

  const courses = [
    {
      id: "level-1",
      title: "Level 1: Survival in Court",
      description: "Essential rules for representing yourself. Learn courtroom behavior, ethics, and how to speak to a judge without getting held in contempt.",
      duration: "45 mins",
      progress: 60,
      badge: "Courtroom Basics",
      lessons: [
        { id: "1-1", title: "Who's Who in the Courtroom", completed: true, duration: "8 mins" },
        { id: "1-2", title: "Courtroom Behavior & Dress Code", completed: true, duration: "5 mins" },
        { id: "1-3", title: "How to Speak: The 3-Minute Rule", completed: true, duration: "12 mins" },
        { id: "1-4", title: "Pro Se Ethics & Candor to the Tribunal", completed: false, duration: "10 mins" },
        { id: "1-5", title: "Your Rights as a Pro Se Litigant", completed: false, duration: "10 mins" },
      ]
    },
    {
      id: "level-2",
      title: "Level 2: Indiana Criminal Procedure",
      description: "From arrest to sentencing. Understand the timeline, how to read your docket, and calculate important deadlines.",
      duration: "1 hr 15 mins",
      progress: 0,
      badge: "Indiana Procedure",
      lessons: [
        { id: "2-1", title: "The Criminal Timeline", completed: false, duration: "15 mins" },
        { id: "2-2", title: "Decoding Your CCS / Docket", completed: false, duration: "10 mins" },
        { id: "2-3", title: "Marion County Local Rules", completed: false, duration: "20 mins" },
        { id: "2-4", title: "Evidence Basics & Admissibility", completed: false, duration: "15 mins" },
        { id: "2-5", title: "Calculating Deadlines", completed: false, duration: "15 mins" },
      ]
    },
    {
      id: "level-3",
      title: "Level 3: Courtroom Skills",
      description: "Interactive simulations to practice your skills before you step into the courtroom.",
      duration: "Interactive",
      progress: 0,
      badge: "Trial Skills",
      lessons: [
        { id: "3-1", title: "Hearing Prep Simulator", type: "simulation", completed: false, duration: "10 mins" },
        { id: "3-2", title: "Exhibit Handling Workshop", type: "interactive", completed: false, duration: "15 mins" },
        { id: "3-3", title: "Cross-Examination Basics", type: "simulation", completed: false, duration: "20 mins" },
      ]
    }
  ];

  if (activeCourse) {
    const course = courses.find(c => c.id === activeCourse);
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_10px_30px_rgba(47,78,69,.05)]">
          <button 
            onClick={() => setActiveCourse(null)}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white/70 hover:text-white/70 transition mb-4"
          >
            <ChevronLeft size={14} /> Back to Curriculum
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.03)] text-white/70">
              <GraduationCap size={20} />
            </div>
            <div>
              <h2 className="font-['Fraunces'] text-2xl font-semibold text-white/70">{course?.title}</h2>
              <p className="text-xs text-white/70">{course?.description}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] overflow-hidden">
              <div className="bg-[rgba(255,255,255,0.03)] p-6 text-white flex items-center justify-center aspect-video relative group cursor-pointer">
                <PlayCircle size={48} className="text-white/70 opacity-80 group-hover:opacity-100 transition" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-semibold text-white/70">
                  <span>Lesson 1.4: Pro Se Ethics</span>
                  <span>10:00</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-white/70 mb-2">Pro Se Ethics & Candor to the Tribunal</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-6">
                  As a self-represented litigant, you are bound by the same ethical rules as licensed attorneys. You must not make false statements of fact or law to the court.
                </p>

                <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4 border border-white/10 mb-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                    <Scale size={14} /> Primary Authority
                  </div>
                  <p className="text-sm font-semibold text-white/70 mb-1">Indiana Rules of Professional Conduct, Rule 3.3</p>
                  <blockquote className="border-l-2 border-white/10 pl-3 py-1 my-2 text-xs italic text-white/70">
                    "A lawyer shall not knowingly make a false statement of fact or law to a tribunal or fail to correct a false statement of material fact or law previously made..."
                  </blockquote>
                  <a href="#" className="flex items-center gap-1 text-[11px] font-bold text-white/70 hover:underline">
                    View in Law Library <ExternalLink size={12} />
                  </a>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <button className="text-xs font-bold text-white/70 hover:text-white/70">Previous Lesson</button>
                  <button className="flex items-center gap-2 rounded-lg bg-[rgba(255,255,255,0.03)] px-4 py-2 text-xs font-bold text-white/70 hover:bg-[rgba(255,255,255,0.03)] transition">
                    Mark Complete & Continue <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
              <h3 className="font-bold text-white/70 mb-4 text-sm flex items-center justify-between">
                Course Lessons
                <span className="text-[10px] bg-[rgba(255,255,255,0.03)] text-white/70 px-2 py-1 rounded-md">{course?.progress}% Complete</span>
              </h3>
              
              <div className="space-y-2">
                {course?.lessons.map((lesson, idx) => (
                  <button 
                    key={lesson.id}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition text-left ${
                      lesson.id === "1-4" 
                        ? "bg-[rgba(255,255,255,0.03)] border border-white/10" 
                        : "hover:bg-[rgba(255,255,255,0.03)] border border-transparent"
                    }`}
                  >
                    <div className="mt-0.5">
                      {lesson.completed ? (
                        <CheckCircle2 size={16} className="text-white/70" />
                      ) : lesson.type === "simulation" ? (
                        <MessageSquare size={16} className="text-white/70" />
                      ) : (
                        <PlayCircle size={16} className="text-white/70" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${lesson.id === "1-4" ? "text-white/70" : "text-white/70"}`}>
                        {idx + 1}. {lesson.title}
                      </p>
                      <p className="text-[10px] text-white/70 mt-0.5">{lesson.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] border border-white/10 p-5 text-center">
              <Sparkles size={24} className="text-white/70 mx-auto mb-2" />
              <h4 className="font-bold text-white/70 text-sm mb-2">Hearing Prep Simulator</h4>
              <p className="text-xs text-white/70 mb-4">Practice answering common questions a judge might ask before your actual hearing.</p>
              <button className="w-full flex justify-center items-center gap-2 rounded-lg bg-[rgba(255,255,255,0.03)] px-4 py-2 text-xs font-bold text-white hover:bg-[rgba(255,255,255,0.03)] transition">
                Start Simulation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_10px_30px_rgba(47,78,69,.05)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-white/70">
              <GraduationCap size={14} /> Self-Representation Education
            </div>
            <h2 className="mt-1 font-['Fraunces'] text-2xl font-semibold text-white/70">
              Acquit Academy
            </h2>
            <p className="mt-1 text-xs text-white/70 max-w-2xl">
              Learn how to represent yourself effectively. Understand court rules, courtroom behavior, ethics, and procedures. Interactive lessons designed to help you prepare for court.
            </p>
          </div>
        </div>
      </div>

      <FeaturedCoursesCarousel courses={courses} onSelect={setActiveCourse} />

      <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-4">All Courses</h3>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.id} className="flex flex-col rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] overflow-hidden hover:shadow-md transition">
            <div className="p-5 border-b border-white/10 flex-1">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center gap-1 rounded-md bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-[10px] font-bold text-white/70">
                  <Award size={12} className="text-white/70" />
                  {course.badge}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-white/70">
                  <Clock size={12} /> {course.duration}
                </span>
              </div>
              
              <h3 className="text-base font-bold text-white/70 mb-2">{course.title}</h3>
              <p className="text-xs text-white/70 leading-relaxed line-clamp-3">{course.description}</p>
            </div>
            
            <div className="p-5 bg-[rgba(255,255,255,0.03)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-white/70">Course Progress</span>
                <span className="text-[10px] font-bold text-white/70">{course.progress}%</span>
              </div>
              <div className="h-2 w-full bg-[rgba(255,255,255,0.03)] rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-[rgba(255,255,255,0.03)] rounded-full transition-all duration-500" 
                  style={{ width: course.progress + "%" }}
                />
              </div>
              
              <button 
                onClick={() => setActiveCourse(course.id)}
                className="w-full flex justify-center items-center gap-2 rounded-lg bg-[rgba(255,255,255,0.03)] px-4 py-2.5 text-xs font-bold text-white/70 hover:bg-[rgba(255,255,255,0.03)] transition"
              >
                {course.progress > 0 ? "Continue Learning" : "Start Course"}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-center">
         <p className="text-[11px] text-white/70 max-w-4xl mx-auto leading-relaxed">
            Acquit Academy provides legal information and education for self-represented people. It is not a law school, does not grant degrees, and does not create an attorney-client relationship. Laws and rules change - always verify with official sources.
         </p>
      </div>
    </div>
  );
}
