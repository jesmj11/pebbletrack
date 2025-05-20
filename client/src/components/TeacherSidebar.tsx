import { Link, useLocation } from "wouter";
import { PanelsTopLeft, Users, BookOpen, FileText, BarChart, Settings } from "lucide-react";

const TeacherSidebar = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  return (
    <aside className="w-16 md:w-64 bg-white shadow-md fixed h-full z-10">
      <nav className="py-4">
        <ul>
          <li className="mb-1">
            <Link href="/teacher/dashboard">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/teacher/dashboard") ? "bg-neutral-light" : ""
              }`}>
                <PanelsTopLeft className={`${isActive("/teacher/dashboard") ? "text-primary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-primary`} />
                <span className="hidden md:inline">PanelsTopLeft</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/teacher/students">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/teacher/students") ? "bg-neutral-light" : ""
              }`}>
                <Users className={`${isActive("/teacher/students") ? "text-primary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-primary`} />
                <span className="hidden md:inline">Students</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/teacher/classes">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/teacher/classes") ? "bg-neutral-light" : ""
              }`}>
                <BookOpen className={`${isActive("/teacher/classes") ? "text-primary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-primary`} />
                <span className="hidden md:inline">Classes</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/teacher/assignments">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/teacher/assignments") ? "bg-neutral-light" : ""
              }`}>
                <FileText className={`${isActive("/teacher/assignments") ? "text-primary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-primary`} />
                <span className="hidden md:inline">Assignments</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/teacher/reports">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/teacher/reports") ? "bg-neutral-light" : ""
              }`}>
                <BarChart className={`${isActive("/teacher/reports") ? "text-primary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-primary`} />
                <span className="hidden md:inline">Reports</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/settings">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/settings") ? "bg-neutral-light" : ""
              }`}>
                <Settings className={`${isActive("/settings") ? "text-primary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-primary`} />
                <span className="hidden md:inline">Settings</span>
              </a>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default TeacherSidebar;
