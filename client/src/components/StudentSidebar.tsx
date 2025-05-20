import { Link, useLocation } from "wouter";
import { PanelsTopLeft, CheckSquare, BookOpen, Calendar, TrendingUp } from "lucide-react";

const StudentSidebar = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  return (
    <aside className="w-16 md:w-64 bg-white shadow-md fixed h-full z-10">
      <nav className="py-4">
        <ul>
          <li className="mb-1">
            <Link href="/student/dashboard">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/student/dashboard") ? "bg-neutral-light" : ""
              }`}>
                <PanelsTopLeft className={`${isActive("/student/dashboard") ? "text-secondary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-secondary`} />
                <span className="hidden md:inline">PanelsTopLeft</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/student/tasks">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/student/tasks") ? "bg-neutral-light" : ""
              }`}>
                <CheckSquare className={`${isActive("/student/tasks") ? "text-secondary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-secondary`} />
                <span className="hidden md:inline">My Tasks</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/student/classes">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/student/classes") ? "bg-neutral-light" : ""
              }`}>
                <BookOpen className={`${isActive("/student/classes") ? "text-secondary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-secondary`} />
                <span className="hidden md:inline">My Classes</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/student/calendar">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/student/calendar") ? "bg-neutral-light" : ""
              }`}>
                <Calendar className={`${isActive("/student/calendar") ? "text-secondary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-secondary`} />
                <span className="hidden md:inline">Calendar</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/student/progress">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/student/progress") ? "bg-neutral-light" : ""
              }`}>
                <TrendingUp className={`${isActive("/student/progress") ? "text-secondary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-secondary`} />
                <span className="hidden md:inline">My Progress</span>
              </a>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default StudentSidebar;
