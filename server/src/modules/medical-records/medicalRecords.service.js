import BaseService from "../../core/base/BaseService.js";
import MedicalRecordsRepository from "./medicalRecords.repository.js";
import UsersRepository from "../users/users.repository.js";

export default class MedicalRecordsService extends BaseService {
  constructor() {
    super();
    this.medicalRecordsRepository = new MedicalRecordsRepository();
    this.usersRepository = new UsersRepository();
  }

  async getMyMedicalRecord(userId) {
    const patient = this.ensureFound(
      await this.usersRepository.findPatientProfileByUserId(userId),
      "Patient profile not found",
      "PATIENT_PROFILE_NOT_FOUND"
    );

    return this.medicalRecordsRepository.upsertByPatientId(patient.id, {});
  }

  async updateMyMedicalRecord(userId, payload) {
    const patient = this.ensureFound(
      await this.usersRepository.findPatientProfileByUserId(userId),
      "Patient profile not found",
      "PATIENT_PROFILE_NOT_FOUND"
    );

    return this.medicalRecordsRepository.upsertByPatientId(patient.id, {
      allergies: payload.allergies ?? null,
      chronicDiseases: payload.chronicDiseases ?? null,
      surgeriesHistory: payload.surgeriesHistory ?? null,
      familyHistory: payload.familyHistory ?? null,
      lifestyleNotes: payload.lifestyleNotes ?? null
    });
  }

  async getPatientMedicalRecord(userId, role, patientId) {
    const patient = this.ensureFound(
      await this.usersRepository.findPatientProfileById(patientId),
      "Patient profile not found",
      "PATIENT_PROFILE_NOT_FOUND"
    );

    if (role === "DOCTOR") {
      const doctor = this.ensureFound(
        await this.usersRepository.findDoctorProfileByUserId(userId),
        "Doctor profile not found",
        "DOCTOR_PROFILE_NOT_FOUND"
      );
      const relationship = await this.usersRepository.doctorHasPatientRelationship(doctor.id, patient.id);

      this.ensure(
        Boolean(relationship),
        "Doctor can only access records for assigned patients",
        403,
        "MEDICAL_RECORD_FORBIDDEN"
      );
    } else if (role !== "ADMIN") {
      this.ensure(false, "Forbidden", 403, "MEDICAL_RECORD_FORBIDDEN");
    }

    return this.medicalRecordsRepository.upsertByPatientId(patient.id, {});
  }
}
