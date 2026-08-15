import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Providers from "@/components/providers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Providers session={session}>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto bg-gray-50">{children}</div>
        </div>
      </div>
    </Providers>
  );
}