import { AppointmentService } from "@/data/datasources/AppointmentRemoteDataSource";
import { AuthService } from "@/data/datasources/AuthRemoteDataSource";
import { ChatService } from "@/data/datasources/ChatRemoteDataSource";
import { ConsultationService } from "@/data/datasources/ConsultationRemoteDataSource";
import { DoctorService } from "@/data/datasources/DoctorRemoteDataSource";
import { NotificationService } from "@/data/datasources/NotificationRemoteDataSource";
import { PatientService } from "@/data/datasources/PatientRemoteDataSource";
import { PostService } from "@/data/datasources/PostRemoteDataSource";
import { AppointmentRepositoryImpl } from "@/data/repositories/AppointmentRepositoryImpl";
import { AuthRepositoryImpl } from "@/data/repositories/AuthRepositoryImpl";
import { ConversationRepositoryImpl } from "@/data/repositories/ConversationRepositoryImpl";
import { ConsultationRepositoryImpl } from "@/data/repositories/ConsultationRepositoryImpl";
import { DoctorRepositoryImpl } from "@/data/repositories/DoctorRepositoryImpl";
import { NotificationRepositoryImpl } from "@/data/repositories/NotificationRepositoryImpl";
import { PatientRepositoryImpl } from "@/data/repositories/PatientRepositoryImpl";
import { PostRepositoryImpl } from "@/data/repositories/PostRepositoryImpl";
import { BookAppointmentUseCase } from "@/domain/usecases/appointments/BookAppointmentUseCase";
import { ListMyAppointmentsUseCase } from "@/domain/usecases/appointments/ListMyAppointmentsUseCase";
import { LoginUseCase } from "@/domain/usecases/auth/LoginUseCase";
import { ListConversationsUseCase } from "@/domain/usecases/chat/ListConversationsUseCase";
import { ArchiveConsultationUseCase } from "@/domain/usecases/consultations/ArchiveConsultationUseCase";
import { CreateConsultationUseCase } from "@/domain/usecases/consultations/CreateConsultationUseCase";
import { GetConsultationDetailsUseCase } from "@/domain/usecases/consultations/GetConsultationDetailsUseCase";
import { ListMyConsultationsUseCase } from "@/domain/usecases/consultations/ListMyConsultationsUseCase";
import { MarkConsultationAsPaidUseCase } from "@/domain/usecases/consultations/MarkConsultationAsPaidUseCase";
import { RateConsultationUseCase } from "@/domain/usecases/consultations/RateConsultationUseCase";
import { ReopenConsultationUseCase } from "@/domain/usecases/consultations/ReopenConsultationUseCase";
import { GetDoctorAppointmentSlotsUseCase } from "@/domain/usecases/doctors/GetDoctorAppointmentSlotsUseCase";
import { GetDoctorDetailsUseCase } from "@/domain/usecases/doctors/GetDoctorDetailsUseCase";
import { GetDoctorFiltersUseCase } from "@/domain/usecases/doctors/GetDoctorFiltersUseCase";
import { GetMyDoctorProfileUseCase } from "@/domain/usecases/doctors/GetMyDoctorProfileUseCase";
import { ListDoctorsUseCase } from "@/domain/usecases/doctors/ListDoctorsUseCase";
import { UpdateMyDoctorProfileUseCase } from "@/domain/usecases/doctors/UpdateMyDoctorProfileUseCase";
import { ListNotificationsUseCase } from "@/domain/usecases/notifications/ListNotificationsUseCase";
import { MarkAllNotificationsAsReadUseCase } from "@/domain/usecases/notifications/MarkAllNotificationsAsReadUseCase";
import { MarkNotificationAsReadUseCase } from "@/domain/usecases/notifications/MarkNotificationAsReadUseCase";
import { GetMyProfileUseCase } from "@/domain/usecases/patient/GetMyProfileUseCase";
import { UpdateMyProfileUseCase } from "@/domain/usecases/patient/UpdateMyProfileUseCase";
import { ListPostsUseCase } from "@/domain/usecases/posts/ListPostsUseCase";

const services = {
  auth: new AuthService(),
  appointment: new AppointmentService(),
  chat: new ChatService(),
  consultation: new ConsultationService(),
  doctor: new DoctorService(),
  notification: new NotificationService(),
  patient: new PatientService(),
  post: new PostService()
};

const repositories = {
  auth: new AuthRepositoryImpl(services.auth),
  appointments: new AppointmentRepositoryImpl(services.appointment),
  conversations: new ConversationRepositoryImpl(services.chat),
  consultations: new ConsultationRepositoryImpl(services.consultation),
  doctors: new DoctorRepositoryImpl(services.doctor),
  notifications: new NotificationRepositoryImpl(services.notification),
  patient: new PatientRepositoryImpl(services.patient),
  posts: new PostRepositoryImpl(services.post)
};

const useCases = {
  login: new LoginUseCase(repositories.auth),
  listDoctors: new ListDoctorsUseCase(repositories.doctors),
  getDoctorFilters: new GetDoctorFiltersUseCase(repositories.doctors),
  getDoctorDetails: new GetDoctorDetailsUseCase(repositories.doctors),
  getDoctorAppointmentSlots: new GetDoctorAppointmentSlotsUseCase(repositories.doctors),
  getMyDoctorProfile: new GetMyDoctorProfileUseCase(repositories.doctors),
  updateMyDoctorProfile: new UpdateMyDoctorProfileUseCase(repositories.doctors),
  listAppointments: new ListMyAppointmentsUseCase(repositories.appointments),
  bookAppointment: new BookAppointmentUseCase(repositories.appointments),
  listConsultations: new ListMyConsultationsUseCase(repositories.consultations),
  getConsultationDetails: new GetConsultationDetailsUseCase(repositories.consultations),
  createConsultation: new CreateConsultationUseCase(repositories.consultations),
  markConsultationAsPaid: new MarkConsultationAsPaidUseCase(repositories.consultations),
  archiveConsultation: new ArchiveConsultationUseCase(repositories.consultations),
  reopenConsultation: new ReopenConsultationUseCase(repositories.consultations),
  rateConsultation: new RateConsultationUseCase(repositories.consultations),
  listNotifications: new ListNotificationsUseCase(repositories.notifications),
  markNotificationAsRead: new MarkNotificationAsReadUseCase(repositories.notifications),
  markAllNotificationsAsRead: new MarkAllNotificationsAsReadUseCase(repositories.notifications),
  listConversations: new ListConversationsUseCase(repositories.conversations),
  getMyProfile: new GetMyProfileUseCase(repositories.patient),
  updateMyProfile: new UpdateMyProfileUseCase(repositories.patient),
  listPosts: new ListPostsUseCase(repositories.posts)
};

export const appContainer = {
  services,
  repositories,
  useCases
};
