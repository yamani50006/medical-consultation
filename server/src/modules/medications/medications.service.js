import BaseService from "../../core/base/BaseService.js";
import MedicationsRepository from "./medications.repository.js";
import UsersRepository from "../users/users.repository.js";

export default class MedicationsService extends BaseService {
  constructor() {
    super();
    this.medicationsRepository = new MedicationsRepository();
    this.usersRepository = new UsersRepository();
  }

  async addMedications(userId, treatmentPlanId, payload) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
    const treatmentPlan = this.ensureFound(
      await this.medicationsRepository.findTreatmentPlanById(treatmentPlanId),
      "Treatment plan not found",
      "TREATMENT_PLAN_NOT_FOUND"
    );

    this.ensure(
      treatmentPlan.doctorId === doctor.id,
      "You can only manage medications for your own treatment plans",
      403,
      "MEDICATIONS_FORBIDDEN"
    );
    this.ensure(
      treatmentPlan.status === "ACTIVE",
      "Medications can only be changed for active treatment plans",
      400,
      "TREATMENT_PLAN_NOT_ACTIVE"
    );

    return this.medicationsRepository.createManyForTreatmentPlan(treatmentPlanId, payload.items);
  }

  async listTreatmentPlanMedications(userId, role, treatmentPlanId) {
    const treatmentPlan = this.ensureFound(
      await this.medicationsRepository.findTreatmentPlanById(treatmentPlanId),
      "Treatment plan not found",
      "TREATMENT_PLAN_NOT_FOUND"
    );

    await this.assertTreatmentPlanAccess(userId, role, treatmentPlan);

    return this.medicationsRepository.listByTreatmentPlan(treatmentPlanId);
  }

  async updateMedication(userId, medicationId, payload) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
    const medication = this.ensureFound(
      await this.medicationsRepository.findByIdWithTreatmentPlan(medicationId),
      "Medication not found",
      "MEDICATION_NOT_FOUND"
    );

    this.ensure(
      medication.treatmentPlan.doctorId === doctor.id,
      "You can only update medications in your own treatment plans",
      403,
      "MEDICATIONS_FORBIDDEN"
    );
    this.ensure(
      medication.treatmentPlan.status === "ACTIVE",
      "Medications can only be changed for active treatment plans",
      400,
      "TREATMENT_PLAN_NOT_ACTIVE"
    );

    return this.medicationsRepository.update(medicationId, {
      medicationName: payload.medicationName ?? medication.medicationName,
      dosage: payload.dosage ?? medication.dosage,
      frequency: payload.frequency ?? medication.frequency,
      durationInDays: payload.durationInDays ?? medication.durationInDays,
      notes: payload.notes ?? medication.notes
    });
  }

  async deleteMedication(userId, medicationId) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
    const medication = this.ensureFound(
      await this.medicationsRepository.findByIdWithTreatmentPlan(medicationId),
      "Medication not found",
      "MEDICATION_NOT_FOUND"
    );

    this.ensure(
      medication.treatmentPlan.doctorId === doctor.id,
      "You can only delete medications in your own treatment plans",
      403,
      "MEDICATIONS_FORBIDDEN"
    );
    this.ensure(
      medication.treatmentPlan.status === "ACTIVE",
      "Medications can only be changed for active treatment plans",
      400,
      "TREATMENT_PLAN_NOT_ACTIVE"
    );

    return this.medicationsRepository.delete(medicationId);
  }

  async assertTreatmentPlanAccess(userId, role, treatmentPlan) {
    if (role === "ADMIN") {
      return;
    }

    if (role === "PATIENT") {
      const patient = this.ensureFound(
        await this.usersRepository.findPatientProfileByUserId(userId),
        "Patient profile not found",
        "PATIENT_PROFILE_NOT_FOUND"
      );

      this.ensure(
        treatmentPlan.patientId === patient.id,
        "You can only access medications assigned to you",
        403,
        "MEDICATIONS_FORBIDDEN"
      );
      return;
    }

    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );

    this.ensure(
      treatmentPlan.doctorId === doctor.id,
      "You can only access medications in your own treatment plans",
      403,
      "MEDICATIONS_FORBIDDEN"
    );
  }
}
