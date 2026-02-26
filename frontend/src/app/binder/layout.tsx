import { BinderSidebar } from "@/components/binder-sidebar";

export default function BinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <BinderSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
