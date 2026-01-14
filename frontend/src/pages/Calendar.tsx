import { useEffect, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { getCalendarView } from "@/api/tasks";

export default function Calendar() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadTasks();
  }, [currentDate]);

  async function loadTasks() {
    try {
      setLoading(true);
      const startDate = new Date(currentDate);
      startDate.setDate(1); // First day of month
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); // Last day of month

      const data = await getCalendarView(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setTasks(data || []);
    } catch (err: any) {
      console.error("Failed to load calendar:", err);
      alert(`Failed to load calendar: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const firstDayOfWeek = monthStart.getDay();

  const getTasksForDate = (date: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), date).toISOString().split('T')[0];
    return tasks.filter(task => {
      const taskDate = new Date(task.dueAt).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-500">Loading calendar...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
            <p className="text-slate-600 mt-1">View and manage your tasks</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ← Previous
            </button>
            <h2 className="text-xl font-semibold text-slate-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-slate-50 p-3 text-center text-sm font-semibold text-slate-700">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white min-h-[100px]"></div>
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const dayTasks = getTasksForDate(date);
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), date).toDateString();

              return (
                <div
                  key={date}
                  className={`bg-white min-h-[100px] p-2 border-b border-r border-slate-100 ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                    {date}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task: any) => (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded truncate ${
                          task.completed
                            ? 'bg-green-100 text-green-800 line-through'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-slate-500">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Tasks</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tasks
              .filter(task => !task.completed)
              .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
              .slice(0, 20)
              .map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">{task.title}</div>
                    <div className="text-sm text-slate-600">
                      {task.lead?.name} • {new Date(task.dueAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    new Date(task.dueAt) < new Date()
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {new Date(task.dueAt) < new Date() ? 'Overdue' : 'Due'}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
