// routes/_index.tsx
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, NavLink, Outlet, redirect, useLocation } from "@remix-run/react";
import {
  ChartBarStacked,
  CloudDrizzle,
  FolderLock,
  Home,
  LayoutList,
  LogOut,
  MonitorUp,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

import { requireAuth } from "~/utils/backend-utils/AuthProtector";
import { destroySessionAndLogout } from "~/utils/backend-utils/CookieManager";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireAuth(request);
    if (user) {
      return null; // Allow access
    } else {
      return redirect("/login");
    }
  } catch (error) {
    return redirect("/login"); // Redirect if unauthorized
  }
}
export async function action({ request }: ActionFunctionArgs) {
  try {
    const user = await requireAuth(request);
    if (user) {
      const logoutHeader = await destroySessionAndLogout(request);
      return redirect("/login", {
        headers: {
          "Set-Cookie": logoutHeader,
        },
      });
    } else {
      return redirect("/login");
    }
  } catch (error) {
    return redirect("/login"); // Redirect if unauthorized
  }
}

export const meta: MetaFunction = () => {
  return [
    { title: "Baraka Cloud" },
    { name: "description", content: "Welcome to Baraka Cloud !" },
  ];
};

export default function DriveIndex() {
  const location = useLocation(); // Access the location object
  const pathname = location.pathname;

  useEffect(() => {
    toast.dismiss();
    toast.success("Welcome to Baraka Cloud!");
  }, []);
  return (
    <div className="min-h-screen h-full flex  ">
      {/* Sidebar */}
      <div className="w-60">
        <aside className="w-60 overflow-y-auto fixed top-0 left-0 h-screen  duration-200 transition-all bg-[#0D1248] p-4 rounded-e-3xl">
          {/* <h2>Drive</h2> */}
          <img
            src="/logo-dark.svg"
            alt="Remix Logo"
            className="pt-10 mx-auto hidden dark:block"
            width={100}
            height={100}
          />
          <img
            src="/logo-light.png"
            alt="Remix Logo"
            className="pt-10 mx-auto dark:hidden"
            width={100}
            height={100}
          />

          <nav className="mt-10  text-[#C1BEBE]">
            <ul className="space-y-7 xl:space-y-10 ps-3">
              <li>
                <NavLink
                  className={({ isActive }) =>
                    isActive && pathname === "/drive"
                      ? "active-link"
                      : "inactive-link"
                  }
                  to="/drive"
                >
                  <Home size={18} /> Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "active-link" : "inactive-link"
                  }
                  to="./my-drive"
                >
                  <CloudDrizzle size={18} /> My Drive
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "active-link" : "inactive-link"
                  }
                  to="/drive/request-files"
                >
                  <FolderLock size={18} />
                  Request Files
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "active-link" : "inactive-link"
                  }
                  to="/drive/shared-files"
                >
                  <MonitorUp size={18} />
                  Shared Files
                </NavLink>
              </li>

              <li>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "active-link" : "inactive-link"
                  }
                  to="/drive/starred"
                >
                  <Star size={18} />
                  Starred
                </NavLink>
              </li>

              <li>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "active-link" : "inactive-link"
                  }
                  to="/drive/trash"
                >
                  <Trash2 size={18} />
                  Trash
                </NavLink>
              </li>

              <li>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "active-link" : "inactive-link"
                  }
                  to="/drive/statistics"
                >
                  <ChartBarStacked size={18} />
                  Statistics
                </NavLink>
              </li>

              <li>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "active-link" : "inactive-link"
                  }
                  to="/drive/task"
                >
                  <LayoutList size={18} />
                  Task
                </NavLink>
              </li>

              <li>
                <Form method="post" reloadDocument>
                  <button
                    type="submit"
                    className="inactive-link  "
                    name="intent"
                    value="logout"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </Form>
              </li>
            </ul>
          </nav>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-2 md:p-4">
        <Outlet /> {/* This renders nested route content */}
        <Toaster />
      </main>
    </div>
  );
}
