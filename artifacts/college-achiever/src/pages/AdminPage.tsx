import { useLocation } from "wouter";
import AdminGate from "@/components/AdminGate";

export default function AdminPage() {
  const [, navigate] = useLocation();
  return <AdminGate defaultOpen={true} onDismiss={() => navigate("/")} />;
}
