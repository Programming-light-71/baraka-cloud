import { Api } from "telegram";
import { telegram } from "~/services/telegram.server";

export async function refreshFileReference({
  messageId,
}: {
  messageId: string;
}) {
  const result = await telegram.invoke(
    new Api.messages.GetMessages({
      id: [new Api.InputMessageID({ id: parseInt(messageId) })],
    })
  );

  if (result instanceof Api.messages.MessagesNotModified) {
    return;
  }

  const message = result.messages[0];

  if (!message || !(message instanceof Api.Message)) {
    throw new Error("Message not found or invalid");
  }

  if (!(message.media instanceof Api.MessageMediaDocument)) {
    throw new Error("No document found in message");
  }

  const document = message.media.document as Api.Document;

  return {
    fileReference: document.fileReference,
    accessHash: document.accessHash,
    fileId: document.id,
  };
}
