/* eslint-disable @typescript-eslint/no-explicit-any */
/* app/routes/api/download.$fileId.ts */
import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma, telegram } from "~/services/telegram.server";
import { Api } from "telegram";
import bigInt from "big-integer";
import { PassThrough } from "stream";

async function getDocumentWithFileReference(messageId: string, chatId: string) {
  // First try getting from channel
  try {
    const channelResult = await telegram.invoke(
      new Api.channels.GetMessages({
        channel: chatId,
        id: [new Api.InputMessageID({ id: parseInt(messageId) })],
      })
    );

    if (
      !channelResult ||
      !(
        channelResult instanceof Api.messages.Messages ||
        channelResult instanceof Api.messages.MessagesSlice ||
        channelResult instanceof Api.messages.ChannelMessages
      )
    ) {
      throw new Error("Invalid response from Telegram channel");
    }

    const msg = channelResult.messages[0];
    if (!msg || !(msg instanceof Api.Message)) {
      throw new Error("Invalid message format from channel");
    }

    const media = msg.media;
    if (!media || !(media instanceof Api.MessageMediaDocument)) {
      throw new Error("No media found in channel message");
    }

    const doc = media.document;
    if (!doc || !(doc instanceof Api.Document)) {
      throw new Error("Invalid document format from channel");
    }

    if (!doc.fileReference) {
      throw new Error("No file reference found in channel document");
    }

    return doc;
  } catch (error) {
    // If channel fetch fails, try regular messages
    const messageResult = await telegram.invoke(
      new Api.messages.GetMessages({
        id: [new Api.InputMessageID({ id: parseInt(messageId) })],
      })
    );

    if (!messageResult || !(messageResult instanceof Api.messages.Messages)) {
      throw new Error("Invalid response from Telegram messages");
    }

    const msg = messageResult.messages[0];
    if (!msg || !(msg instanceof Api.Message)) {
      throw new Error("Invalid message format");
    }

    const media = msg.media;
    if (!media || !(media instanceof Api.MessageMediaDocument)) {
      throw new Error("No media found in message");
    }

    const doc = media.document;
    if (!doc || !(doc instanceof Api.Document)) {
      throw new Error("Invalid document format");
    }

    if (!doc.fileReference) {
      throw new Error("No file reference found");
    }

    return doc;
  }
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response("Invalid file ID", { status: 400 });
    }

    const file = await prisma.file.findUnique({
      where: { id },
      select: {
        name: true,
        type: true,
        size: true,
        fileId: true,
        accessHash: true,
        dcId: true,
        fileReference: true,
        messageId: true,
        id: true,
        chatId: true,
      },
    });

    if (!file) {
      return new Response("File not found in database", { status: 404 });
    }

    if (!file.messageId) {
      return new Response("Message ID is missing", { status: 400 });
    }

    if (!file.chatId) {
      return new Response("Chat ID is missing", { status: 400 });
    }

    try {
      // Try to get document with current file reference
      let currentDocument;
      try {
        currentDocument = await getDocumentWithFileReference(
          file.messageId,
          file.chatId
        );
      } catch (error) {
        console.log(
          "Initial document fetch failed, refreshing file reference...",
          error
        );

        // Try again after refreshing the reference
        const refreshResult = await getDocumentWithFileReference(
          file.messageId,
          file.chatId
        );

        if (!refreshResult.fileReference) {
          return new Response("Could not obtain valid file reference", {
            status: 500,
          });
        }

        // Update the file reference in database
        await prisma.file.update({
          where: { id: file.id },
          data: {
            fileReference: Buffer.from(refreshResult.fileReference),
          },
        });

        currentDocument = refreshResult;
      }

      // Create file location for download
      const inputFileLocation = new Api.InputDocumentFileLocation({
        id: bigInt(currentDocument.id.toString()),
        accessHash: bigInt(currentDocument.accessHash.toString()),
        fileReference: Buffer.from(currentDocument.fileReference),
        thumbSize: "", // Empty string for full file
      });

      // Stream the file
      const stream = new PassThrough();
      const chunkSize = 512 * 1024; // 512KB chunks
      let offset = bigInt(0);
      const totalSize = file.size;

      // Start streaming in background
      (async () => {
        try {
          while (offset.lesser(totalSize)) {
            const chunk = await telegram.invoke(
              new Api.upload.GetFile({
                location: inputFileLocation,
                offset,
                limit: chunkSize,
                precise: true,
              })
            );

            if (!(chunk instanceof Api.upload.File)) {
              stream.destroy(new Error("Invalid chunk type"));
              return;
            }

            if (!chunk.bytes || chunk.bytes.length === 0) {
              break;
            }

            if (!stream.write(Buffer.from(chunk.bytes))) {
              await new Promise((resolve) => stream.once("drain", resolve));
            }

            offset = offset.add(bigInt(chunk.bytes.length));
          }
          stream.end();
        } catch (error) {
          console.error("Streaming error:", error);
          stream.destroy(
            error instanceof Error
              ? error
              : new Error("Unknown streaming error")
          );
        }
      })();

      // Return the streaming response
      return new Response(stream as any, {
        status: 200,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(
            file.name
          )}"`,
          "Content-Length": file.size.toString(),
          "Cache-Control": "no-cache",
        },
      });
    } catch (error) {
      console.error("Download error:", error);
      return new Response(
        `Download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Download route error:", error);
    return new Response(
      `Server error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
};
