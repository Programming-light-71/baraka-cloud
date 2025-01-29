import { Outlet } from "@remix-run/react";

const _auth = () => {
  return (
    <div className="w-full h-full relative text-black bg-[#d2dafa] min-h-screen">
      <img
        src="/logo-Light.png"
        alt="logo"
        className="w-36 absolute  drop-shadow-lg  p-5 filter saturate-150"
      />

      <div className="flex gap-20  flex-row justify-center h-full">
        <div className="min-w-[600px] z-40 bg-[#d2dafa] bg-opacity-70 rounded-lg flex justify-center items-center">
          <Outlet />
        </div>
        <div>
          <div className="w-72 min-h-[500px]  h-[calc(100vh-50%)]   bg-[#656ED3] -translate-x-12 -rotate-6 rounded-md absolute  -top-10 "></div>
          <div className="h-full min-h-screen w-72 bg-[#AFB3FF] rounded-md relative">
            <img
              src="/images/pc3DIcon.svg"
              className="w-[500px] drop-shadow-md max-w-none absolute left-1/2 transform top-1/2 -translate-y-1/2 -translate-x-1/2"
              alt="login page"
            />
          </div>
        </div>
      </div>
      <img
        src="/images/cornerShapeForAuth.svg"
        alt="logo"
        className="h-40 drop-shadow-md absolute bottom-0 left-0"
      />
    </div>
  );
};

export default _auth;
