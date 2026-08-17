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
    <div className="flex h-screen overflow-hidden bg-slate-50 print:h-auto print:overflow-visible print:bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto print:overflow-visible print:w-full print:block">
        <main className="flex-1 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}