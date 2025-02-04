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
    // Fetch and convert the file to Base64
    const base64File = await convertFileToBase64(fileUrl);

    return json(
      {
        fileName,
        base64File,
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

async function convertFileToBase64(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch the file from ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}
