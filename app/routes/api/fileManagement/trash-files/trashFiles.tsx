// routes/api/v1/login.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import { json } from "@remix-run/node";
import type {
  LoaderFunctionArgs as LoaderArgs,
  ActionFunctionArgs as ActionArgs,
} from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  return new Response("Trash Files API is working!", { status: 200 });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const username = formData.get("username");
  // const password = formData.get("password");

  // Perform login logic
  return json({ success: true, username });
};
