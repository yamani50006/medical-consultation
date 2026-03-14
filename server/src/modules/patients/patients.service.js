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

    return this.patientsRepository.updateByUserId(userId, {
      gender: payload.gender ?? patient.gender,
      dateOfBirth: payload.dateOfBirth ?? patient.dateOfBirth,
      bloodType: payload.bloodType ?? patient.bloodType,
      chronicDiseases: payload.chronicDiseases ?? patient.chronicDiseases,
      currentMedications: payload.currentMedications ?? patient.currentMedications
    });
  }
}
