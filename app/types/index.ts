export type File = {
  id: string;

  folderId: string | null;

  userId: string;

  name: string;

  type: string;

  size: number;

  filePath: string;

  thumbnail: string | null;

  duration: number | null;

  isStarred: boolean;

  isShared: boolean;

  deletedAt: Date | null;

  createdAt: Date;
};
