// ========================
// 统一响应格式
// ========================

export class Result<T = any> {
  code: number;
  message: string;
  data: T;

  static ok<T>(data: T, message = 'success'): Result<T> {
    return { code: 0, message, data };
  }

  static fail(message = 'fail', code = -1): Result {
    return { code, message, data: null };
  }

  static page<T>(items: T[], total: number, page: number, size: number) {
    return {
      code: 0,
      message: 'success',
      data: { items, total, page, size, pages: Math.ceil(total / size) },
    };
  }
}
