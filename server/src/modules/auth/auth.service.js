import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import { comparePassword, hashPassword } from "../../core/utils/hash.util.js";
import { signToken } from "../../core/utils/jwt.util.js";
import AuthRepository from "./auth.repository.js";

export default class AuthService extends BaseService {
  constructor() {
    super();
    this.authRepository = new AuthRepository();
  }

  async registerPatient(payload) {
    const existing = await this.authRepository.findByEmail(payload.email);
    if (existing) {
      throw new AppError("Email is already registered", 409, "EMAIL_EXISTS");
    }

    const hashedPassword = await hashPassword(payload.password);

    const user = await this.authRepository.createPatientAccount(
      {
        fullName: payload.fullName,
        email: payload.email,
        password: hashedPassword,
        role: "PATIENT",
        status: "ACTIVE"
      },
      {
        gender: payload.gender,
        dateOfBirth: payload.dateOfBirth,
        bloodType: payload.bloodType || null,
        chronicDiseases: payload.chronicDiseases || null,
        currentMedications: payload.currentMedications || null
      }
    );

    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email
    });

    return { token, user };
  }

  async registerDoctor(payload) {
    const existing = await this.authRepository.findByEmail(payload.email);
    if (existing) {
      throw new AppError("Email is already registered", 409, "EMAIL_EXISTS");
    }

    const hashedPassword = await hashPassword(payload.password);

    const user = await this.authRepository.createDoctorAccount(
      {
        fullName: payload.fullName,
        email: payload.email,
        password: hashedPassword,
        role: "DOCTOR",
        status: "PENDING"
      },
      {
        specialization: payload.specialization,
        yearsOfExperience: payload.yearsOfExperience,
        bio: payload.bio,
        licenseNumber: payload.licenseNumber,
        isVerified: false,
        approvalStatus: "PENDING"
      }
    );

    return { user };
  }

  async login(payload) {
    const user = await this.authRepository.findByEmail(payload.email);
    if (!user) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await comparePassword(payload.password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    if (user.status !== "ACTIVE") {
      const message =
        user.status === "PENDING"
          ? "Your account is pending approval"
          : "Your account was rejected or disabled";
      throw new AppError(message, 403, "ACCOUNT_NOT_ACTIVE");
    }

    if (user.role === "DOCTOR" && user.doctorProfile?.approvalStatus !== "APPROVED") {
      throw new AppError("Doctor account is not approved yet", 403, "DOCTOR_NOT_APPROVED");
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email
    });

    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      patientProfile: user.patientProfile || null,
      doctorProfile: user.doctorProfile || null
    };

    return { token, user: safeUser };
  }

  async getMe(userId) {
    const user = await this.authRepository.findSafeById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return user;
  }
}
