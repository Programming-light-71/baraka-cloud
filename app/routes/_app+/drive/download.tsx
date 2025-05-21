import { json, ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const formData = new URLSearchParams(await request.text());
  const fileUrl = formData.get("fileUrl");
  const fileName = formData.get("fileName");
  const type = formData.get("type");

  if (!fileUrl || !fileName || !type) {
    return json({ error: "Missing required data" }, { status: 400 });
  }

  try {
    return json(
      {
        fileName,
        fileUrl,
        type,
      },
      { status: 200 }
    );
  } catch (error) {
    return json(
      { error: "Failed to fetch or convert the file" },
      { status: 500 }
    );
  }
};
