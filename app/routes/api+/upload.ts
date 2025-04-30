import { uploadFile } from "~/services/upload.server";

import { ActionFunctionArgs } from "@remix-run/node";
import { requireAuth } from "~/utils/backend-utils/AuthProtector";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireAuth(request);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || typeof file.name !== "string" || file.size === 0) {
      return Response.json({ error: "Invalid file upload" }, { status: 400 });
    }

    const result = await uploadFile(file, user?.id);
    return Response.json({ success: true, file: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
