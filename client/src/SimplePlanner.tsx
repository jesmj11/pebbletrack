import { useState } from "react";

interface Task {
  id: string;
  title: string;
  subject: string;
  completed: boolean;
  dueDate: string;
}

function SimplePlanner() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Math Practice - Addition",
      subject: "Math",
      completed: false,
      dueDate: "2025-01-21"
    },
    {
      id: "2", 
      title: "Read Chapter 3",
      subject: "Reading",
      completed: true,
      dueDate: "2025-01-20"
    },
    {
      id: "3",
      title: "Science Experiment - Plants",
      subject: "Science", 
      completed: false,
      dueDate: "2025-01-22"
    }
  ]);

  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    dueDate: ""
  });

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title && newTask.subject) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        subject: newTask.subject,
        completed: false,
        dueDate: newTask.dueDate || new Date().toISOString().split('T')[0]
      };
      setTasks([...tasks, task]);
      setNewTask({ title: "", subject: "", dueDate: "" });
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f8fafc", 
      fontFamily: "system-ui, -apple-system, sans-serif" 
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <header style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "bold", 
            color: "#1e293b",
            marginBottom: "0.5rem"
          }}>
            Homeschool Planner
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
            Manage your daily learning tasks
          </p>
        </header>

        {/* Add New Task Form */}
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          marginBottom: "2rem"
        }}>
          <h2 style={{ marginBottom: "1rem", color: "#374151" }}>Add New Task</h2>
          <form onSubmit={addTask} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                style={{
                  flex: "2",
                  minWidth: "200px",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem"
                }}
                required
              />
              <input
                type="text"
                placeholder="Subject"
                value={newTask.subject}
                onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                style={{
                  flex: "1",
                  minWidth: "120px",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem"
                }}
                required
              />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem"
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.75rem 1.5rem",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                cursor: "pointer"
              }}
            >
              Add Task
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          overflow: "hidden"
        }}>
          <h2 style={{ 
            padding: "1.5rem", 
            margin: "0", 
            backgroundColor: "#f8fafc", 
            borderBottom: "1px solid #e5e7eb",
            color: "#374151"
          }}>
            Today's Tasks ({tasks.filter(t => !t.completed).length} remaining)
          </h2>
          
          {tasks.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
              No tasks yet. Add your first task above!
            </div>
          ) : (
            <div>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    padding: "1rem 1.5rem",
                    borderBottom: "1px solid #f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    backgroundColor: task.completed ? "#f0f9ff" : "white"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    style={{ transform: "scale(1.2)" }}
                  />
                  
                  <div style={{ flex: "1" }}>
                    <div style={{
                      fontSize: "1.1rem",
                      fontWeight: task.completed ? "normal" : "500",
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? "#6b7280" : "#1f2937"
                    }}>
                      {task.title}
                    </div>
                    <div style={{ 
                      fontSize: "0.9rem", 
                      color: "#6b7280",
                      marginTop: "0.25rem"
                    }}>
                      {task.subject} • Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.5rem 1rem",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Simple Stats */}
        <div style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#059669" }}>
              {tasks.filter(t => t.completed).length}
            </div>
            <div style={{ color: "#6b7280" }}>Completed</div>
          </div>
          
          <div style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc2626" }}>
              {tasks.filter(t => !t.completed).length}
            </div>
            <div style={{ color: "#6b7280" }}>Remaining</div>
          </div>
          
          <div style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}>
              {tasks.length}
            </div>
            <div style={{ color: "#6b7280" }}>Total Tasks</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimplePlanner;