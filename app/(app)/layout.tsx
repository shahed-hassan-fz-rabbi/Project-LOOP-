import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}