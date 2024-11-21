export function transformTimestamps(
  createdAt: Date | null,
  updatedAt: Date | null,
  deletedAt: Date | null,
) {
  return {
    created_at: {
      seconds: createdAt ? createdAt.getTime() / 1000 : 0,
      nanos: createdAt ? createdAt.getTime() : 0,
    },
    updated_at: {
      seconds: updatedAt ? updatedAt.getTime() / 1000 : 0,
      nanos: updatedAt ? updatedAt.getTime() : 0,
    },
    deleted_at: {
      seconds: deletedAt ? deletedAt.getTime() / 1000 : 0,
      nanos: deletedAt ? deletedAt.getTime() : 0,
    },
  };
}
