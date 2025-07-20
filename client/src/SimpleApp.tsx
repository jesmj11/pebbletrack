import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function SimpleApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">Homeschool Planner</h1>
          <p className="text-gray-600 mb-6 text-center">
            Welcome to your education management platform
          </p>
          <div className="space-y-4">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              <a href="/api/login" className="block w-full">Sign In with Replit</a>
            </button>
            <div className="text-sm text-gray-500 text-center">
              Or browse features below
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium">For Parents</div>
                <div className="text-gray-600">Manage curriculum & track progress</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium">For Students</div>
                <div className="text-gray-600">Complete assignments & earn XP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default SimpleApp;