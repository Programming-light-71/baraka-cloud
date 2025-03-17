import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import DHeader from "~/components/drive/dHeader";

import Dash_Recent_Files from "~/components/drive/index/Dash_Recent_Files";
import Loading from "~/components/drive/Loading/Loading";
import { requireAuth } from "~/utils/backend-utils/AuthProtector";
import { getFilesByUserId } from "~/utils/backend-utils/Queries/controllers/fIle.controller";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);

  const files = await getFilesByUserId(user?.id, 10, 0, {
    type: { startsWith: "video" },
  });

  return { success: true, data: files };
}
export default function Videos() {
  const { data, success } = useLoaderData<typeof loader>();

  if (!success) {
    return <Loading />;
  }
  return (
    <div>
      <DHeader
        pageName="Videos"
        // pathname={pathname}
        // actionData={actionResult}
        isSearch
        // btn={}
      />

      {success && Array.isArray(data) ? (
        <Dash_Recent_Files secName="" secBtnName="My Drive" data={data} />
      ) : (
        <div>Error loading files</div>
      )}
    </div>
  );
}
