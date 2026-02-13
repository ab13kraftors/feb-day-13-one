import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "./supabase-client";
import type { Session } from "@supabase/supabase-js";

interface Tasks {
  id: number;
  created_at: string;
  title: string;
  description: string;
}

export default function TaskManager({ session }: { session: Session }) {
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState<Tasks[]>([]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("email", session.user.email)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching tasks:", error.message);
    } else {
      console.log("Tasks:", data);
    }
    setTasks(data || []);
  };

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newTask.title || !newTask.description) {
      alert("Please fill in both title and description.");
      return;
    }

    const userEmail = session?.user?.email;

    if (!userEmail) {
      alert("User session not found. Please log in again.");
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .insert({
        ...newTask,
        email: userEmail,
      })
      .single();
    if (error) {
      console.error("Encounter an error", error.message);
    } else {
      sendNotificationToUser(userEmail, newTask.title, newTask.description);

      setNewTask({ title: "", description: "" });
      fetchTasks();
    }
  };

  const sendNotificationToUser = async (
    email: string,
    title: string,
    description: string,
  ) => {
    const { data, error } = await supabase.functions.invoke(
      "send-email-notification",
      {
        body: {
          to: [email],
          subject: "New Task Added: " + title,
          description: description,
        },
      },
    );
    if (error) console.error("Error:", error);
    else console.log("Email sent:", data);
  };

  const editTask = (id: number) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      const newTitle = prompt("Enter new title", taskToEdit.title);
      const newDescription = prompt(
        "Enter new description",
        taskToEdit.description,
      );
      if (newTitle && newDescription) {
        supabase
          .from("tasks")
          .update({ title: newTitle, description: newDescription })
          .eq("id", id)
          .then(({ error }) => {
            if (error) {
              console.error("Error updating task:", error.message);
            }
            fetchTasks();
          });
      }
    }
  };

  const deleteTask = (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating task:", error.message);
          }
          fetchTasks();
        });
    }
  };

  useEffect(() => {
    const channel = supabase.channel("tasks-channel");
    channel.on(
      "postgres_changes", 
      {event:"INSERT", schema:"public", table:"tasks"},
      (payload) =>{
        
      }
    )
  })
  return (
    <>
      <h2>Task Manager</h2>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, title: e.target.value }))
          }
        />

        <textarea
          placeholder="Task description"
          value={newTask.description}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, description: e.target.value }))
          }
        />

        <button type="submit" className="add-button">
          Add Task
        </button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li className="task-item" key={task.id}>
            <div className="task-text">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
            </div>
            <div className="task-btns">
              <button className="edit-btn" onClick={() => editTask(task.id)}>
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
