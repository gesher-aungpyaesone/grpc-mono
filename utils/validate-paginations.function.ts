import { RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';

export const validateSort = (
  sort: string | undefined,
  fields: string[],
): [string, 'asc' | 'desc'] | undefined => {
  if (sort) {
    try {
      const parsedSort = JSON.parse(sort) as [string, 'ASC' | 'DESC'];
      if (Array.isArray(parsedSort) && parsedSort.length === 2) {
        const [field, order] = parsedSort;
        if (
          typeof field === 'string' &&
          fields.includes(field) &&
          (order === 'ASC' || order === 'DESC')
        ) {
          if (order === 'ASC') {
            return [field, 'asc'];
          } else if (order === 'DESC') {
            return [field, 'desc'];
          }
        }
        throw new RpcException({
          code: grpc.status.INVALID_ARGUMENT,
          message: JSON.stringify({
            sort: ['sort must be object like [field_name, "ASC" | "DESC"]'],
          }),
        });
      }
    } catch (error) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: JSON.stringify({
          sort: ['sort must be object like [field_name, "ASC" | "DESC"]'],
        }),
      });
    }
  }
  return undefined;
};

export const validateRange = (
  range: string | undefined,
): [number, number] | undefined => {
  if (range) {
    try {
      const parsedRange = JSON.parse(range) as [number, number];
      if (parsedRange.length === 2 && !parsedRange.some(isNaN)) {
        const [start, end] = parsedRange;
        if (start <= end && start >= 0 && end >= 0) {
          return [start, end];
        }
      }
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: JSON.stringify({
          range: [
            'sort must be object like [start, end] where start <= end and both are non-negative integers',
          ],
        }),
      });
    } catch (error) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: JSON.stringify({
          range: [
            'sort must be object like [start, end] where start <= end and both are non-negative integers',
          ],
        }),
      });
    }
  }
  return undefined;
};

export const validateFilter = (
  filter: string | undefined,
  fields: string[],
): { [key: string]: any } | undefined => {
  if (filter) {
    // try {
    const parsedFilter = JSON.parse(filter);

    if (typeof parsedFilter === 'object' && parsedFilter !== null) {
      const filterKeys = Object.keys(parsedFilter);

      for (const key of filterKeys) {
        if (
          !fields.includes(key) &&
          key !== 'q' &&
          key !== 'exclude' &&
          key !== 'is_allowed_all'
        ) {
          throw new RpcException({
            code: grpc.status.INVALID_ARGUMENT,
            message: JSON.stringify({
              filter: [`invalid field '${key}' in filter`],
            }),
          });
        }
      }

      return parsedFilter;
    }
    throw new RpcException({
      code: grpc.status.INVALID_ARGUMENT,
      message: JSON.stringify({
        filter: ['filter must be a valid object with field names and values'],
      }),
    });
    // } catch (error) {
    //   throw new RpcException({
    //     code: grpc.status.INVALID_ARGUMENT,
    //     message: JSON.stringify({
    //       filter: ['filter must be a valid JSON object'],
    //     }),
    //   });
    // }
  }

  // Return undefined if no filter is provided
  return undefined;
};
