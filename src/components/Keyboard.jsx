import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const KeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      // Ctrl + Shift shortcuts
      if (e.ctrlKey && e.shiftKey) {
        switch (key) {
          case "e":
            e.preventDefault();
            navigate("/dashboard/explore");
            break;
          case "t":
            e.preventDefault();
            navigate("/dashboard/tasks");
            break;
          case "b":
            e.preventDefault();
            navigate("/dashboard/my-bought-projects");
            break;
          case "p":
            e.preventDefault();
            navigate("/dashboard/projects");
            break;
          case "c":
            e.preventDefault();
            navigate("/dashboard/chat");
            break;
          case "f":
            e.preventDefault();
            navigate("/dashboard/friends");
            break;
          case "m":
            e.preventDefault();
            navigate("/dashboard/meetings");
            break;
          case "r":
            e.preventDefault();
            navigate("/dashboard/profile");
            break;
        }
      }

      // Ctrl only shortcuts (optional)
      else if (e.ctrlKey && !e.shiftKey) {
        switch (key) {
          case "e":
            e.preventDefault();
            navigate("/dashboard/explore");
            break;
          case "t":
            e.preventDefault();
            navigate("/dashboard/tasks");
            break;
          case "m":
            e.preventDefault();
            navigate("/dashboard/meetings");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return null;
};

export default KeyboardShortcuts;