import { Button } from "../ui/button";
import { useAuthStore } from "../../stores/authStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const TeacherDashboardNav = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      toast.error("Failed to logout");
    }
  };
  return ( 
    <div>
      <div className="flex justify-between items-center mb-8">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          onClick={() => (window.location.href = "/")}
        >
          ← Back to Home
        </button>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default TeacherDashboardNav;
