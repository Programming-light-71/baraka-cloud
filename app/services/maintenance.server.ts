import { telegram, prisma } from "./telegram.server";
import { refreshFileReference } from "./download.server";

export async function refreshExpiringFiles() {
  const files = await prisma.file.findMany({
    where: {
      expiresAt: {
        lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        gt: new Date(),
      },
    },
  });

  await Promise.all(
    files.map(async (file) => {
      if (file.messageId) {
        await refreshFileReference(file);
        await prisma.file.update({
          where: { id: file.id },
          data: { expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        });
      }
    })
  );
}
