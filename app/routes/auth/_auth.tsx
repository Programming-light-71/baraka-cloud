import { Outlet } from "@remix-run/react";

const _auth = () => {
  return (
    <div>
      Auth Main Page
      <Outlet />
    </div>
  );
};

export default _auth;
