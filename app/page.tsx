import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            GearGuard Dashboard
          </h1>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
          
          <div className="space-y-2">
            <p>
              <span className="font-medium">Name:</span> {session.user.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {session.user.email}
            </p>
            <p>
              <span className="font-medium">Role:</span>{" "}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {session.user.role}
              </span>
            </p>
            {session.user.departmentName && (
              <p>
                <span className="font-medium">Department:</span>{" "}
                {session.user.departmentName}
              </p>
            )}
            {session.user.isTechnician && (
              <p className="text-green-600 font-medium">
                ✓ Technician Account
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-gray-600">
              This is your protected dashboard. Only authenticated users can see this page.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}