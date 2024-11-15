export function transformTimestamps(
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date | null,
) {
  return {
    created_at: {
      seconds: createdAt.getTime() / 1000,
      nanos: createdAt.getTime(),
    },
    updated_at: {
      seconds: updatedAt.getTime() / 1000,
      nanos: updatedAt.getTime(),
    },
    deleted_at: {
      seconds: deletedAt ? deletedAt.getTime() / 1000 : 0,
      nanos: deletedAt ? deletedAt.getTime() : 0,
    },
  };
}
