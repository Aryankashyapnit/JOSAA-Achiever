import { useLocation } from "wouter";
import AdminGate from "@/components/AdminGate";
import AdminCutoffsUpload from "@/pages/AdminCutoffsUpload";

export default function AdminCutoffsPage() {
  const [, navigate] = useLocation();
  return (
    <AdminGate
      defaultOpen={true}
      onDismiss={() => navigate("/")}
      contentOverride={<AdminCutoffsUpload />}
    />
  );
}
