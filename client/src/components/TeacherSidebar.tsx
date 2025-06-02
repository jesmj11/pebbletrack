import { Link, useLocation } from "wouter";
import { PanelsTopLeft, Users, Calendar, BarChart, Settings } from "lucide-react";

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
            <Link href="/">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                location === "/" ? "bg-neutral-light" : ""
              }`}>
                <PanelsTopLeft className={`${location === "/" ? "text-primary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-primary`} />
                <span className="hidden md:inline">Dashboard</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/students">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/students") ? "bg-neutral-light" : ""
              }`}>
                <Users className={`${isActive("/students") ? "text-primary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-primary`} />
                <span className="hidden md:inline">Students</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/planner">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/planner") ? "bg-neutral-light" : ""
              }`}>
                <Calendar className={`${isActive("/planner") ? "text-primary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-primary`} />
                <span className="hidden md:inline">Planner</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/reports">
              <a className={`flex items-center px-4 py-3 text-neutral-darkest hover:bg-neutral-light group transition-colors ${
                isActive("/reports") ? "bg-neutral-light" : ""
              }`}>
                <BarChart className={`${isActive("/reports") ? "text-primary" : "text-neutral-dark"} mr-3 h-5 w-5 group-hover:text-primary`} />
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
