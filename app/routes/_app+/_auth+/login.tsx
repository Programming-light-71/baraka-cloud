import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { AuthManager } from "~/utils/backend-utils/Queries/AuthManagement";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") return;
  try {
    const form = await request.formData();
    const email = form.get("email");
    if (email) {
      const authResponse = await AuthManager({ email: email as string });
      // console.log(authResponse);
      if (
        !(authResponse instanceof Response) &&
        authResponse.success &&
        authResponse.data.otp
      ) {
        return redirect(
          ((("/otp?email=" +
            email +
            "&otp=" +
            authResponse.data.otp) as string) +
            "&userId=" +
            authResponse.data.id) as string
        );
      }
    }
    return {};
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      {
        success: false,
        error: "Internal Server Error; Login failed",
        details: error,
      },
      { status: 500 }
    );
  }
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
