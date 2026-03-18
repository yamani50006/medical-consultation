import { IAuthRepository, LoginPayload } from "@/domain/repositories/AuthRepository";

export class LoginUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  execute(payload: LoginPayload) {
    return this.repository.login(payload);
  }
}

