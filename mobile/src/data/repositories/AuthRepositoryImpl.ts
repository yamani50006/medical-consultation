import { mapUserDtoToEntity } from "@/data/mappers/auth.mapper";
import { AuthService } from "@/data/datasources/AuthRemoteDataSource";
import {
  IAuthRepository,
  LoginPayload,
  RegisterDoctorPayload,
  RegisterPatientPayload
} from "@/domain/repositories/AuthRepository";

export class AuthRepositoryImpl implements IAuthRepository {
  constructor(private readonly service = new AuthService()) {}

  async login(payload: LoginPayload) {
    const response = await this.service.login(payload);
    return {
      token: response.data.data.token,
      user: mapUserDtoToEntity(response.data.data.user)
    };
  }

  async registerPatient(payload: RegisterPatientPayload) {
    const response = await this.service.registerPatient(payload);
    return {
      token: response.data.data.token,
      user: mapUserDtoToEntity(response.data.data.user)
    };
  }

  async registerDoctor(payload: RegisterDoctorPayload) {
    const response = await this.service.registerDoctor(payload);
    return {
      user: mapUserDtoToEntity(response.data.data.user)
    };
  }

  async getMe() {
    const response = await this.service.getMe();
    return mapUserDtoToEntity(response.data.data);
  }
}

