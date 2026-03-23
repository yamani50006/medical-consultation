import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import PatientsRepository from "./patients.repository.js";

export default class PatientsService extends BaseService {
  constructor() {
    super();
    this.patientsRepository = new PatientsRepository();
  }

  async getMyProfile(userId) {
    const patient = await this.patientsRepository.findByUserId(userId);
    if (!patient) {
      throw new AppError("Patient profile not found", 404, "PATIENT_PROFILE_NOT_FOUND");
    }
    return patient;
  }

  async updateMyProfile(userId, payload) {
    const patient = await this.patientsRepository.findByUserId(userId);
    if (!patient) {
      throw new AppError("Patient profile not found", 404, "PATIENT_PROFILE_NOT_FOUND");
    }

    const profileData = {
      gender: payload.gender ?? patient.gender,
      dateOfBirth: payload.dateOfBirth ?? patient.dateOfBirth,
      city: payload.city !== undefined ? payload.city : patient.city,
      region: payload.region !== undefined ? payload.region : patient.region,
      bloodType: payload.bloodType !== undefined ? payload.bloodType : patient.bloodType,
      chronicDiseases: payload.chronicDiseases !== undefined ? payload.chronicDiseases : patient.chronicDiseases,
      currentMedications: payload.currentMedications !== undefined ? payload.currentMedications : patient.currentMedications
    };

    const userData = {
      ...(payload.fullName !== undefined ? { fullName: payload.fullName } : {}),
      ...(Object.prototype.hasOwnProperty.call(payload, "profileImageUrl")
        ? { profileImageUrl: payload.profileImageUrl }
        : {})
    };

    return this.patientsRepository.updateProfileAndUserByUserId(userId, {
      profileData,
      userData
    });
  }
}
