import React from "react";

export const metadata = {
  title: "Admin — SiteName",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-6">
        <aside className="mb-6">
          <h2 className="text-xl font-bold">Admin</h2>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
