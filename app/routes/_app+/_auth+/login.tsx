import { ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  console.log(form);
  return request.method === "post"
    ? new Response(null, {
        status: 303,
        headers: {
          Location: "/",
        },
      })
    : {};
}
const login = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome Back! </h1>
      <Form method="post">
        <label className="block mt-4" htmlFor="email">
          Email :
          <Input
            className="w-[437px] h-[50px] bg-[#eff3fb] rounded-[10px] border-2 border-[#656ed3]"
            type="email"
            name="email"
            id="email"
            placeholder="Email / Phone ..."
            required
          />
        </label>
        <Button
          type="submit"
          className="mt-2 text-white w-[437px] h-[34px] bg-[#656ed3] rounded-[10px]"
        >
          Login
        </Button>
      </Form>
    </div>
  );
};

export default login;
