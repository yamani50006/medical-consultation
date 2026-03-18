import { Result } from "@/core/base/Result";

export abstract class BaseRepository {
  protected async execute<T>(operation: () => Promise<T>): Promise<Result<T>> {
    try {
      return { success: true, data: await operation() };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}

