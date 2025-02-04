// routes/api/v1/login.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import { json } from "@remix-run/node";
import type {
  LoaderFunctionArgs as LoaderArgs,
  ActionFunctionArgs as ActionArgs,
} from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  return new Response("OTP API is working!", { status: 200 });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const username = formData.get("username");
  const otp = formData.get("otp");
  // const password = formData.get("password");

  // Perform login logic
  return Response.json({ success: true, username, otp });
};
