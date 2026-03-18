import { AppointmentService } from "@/data/datasources/AppointmentRemoteDataSource";
import { AuthService } from "@/data/datasources/AuthRemoteDataSource";
import { ChatService } from "@/data/datasources/ChatRemoteDataSource";
import { DoctorService } from "@/data/datasources/DoctorRemoteDataSource";
import { NotificationService } from "@/data/datasources/NotificationRemoteDataSource";
import { PatientService } from "@/data/datasources/PatientRemoteDataSource";
import { PostService } from "@/data/datasources/PostRemoteDataSource";
import { AppointmentRepositoryImpl } from "@/data/repositories/AppointmentRepositoryImpl";
import { AuthRepositoryImpl } from "@/data/repositories/AuthRepositoryImpl";
import { ConversationRepositoryImpl } from "@/data/repositories/ConversationRepositoryImpl";
import { DoctorRepositoryImpl } from "@/data/repositories/DoctorRepositoryImpl";
import { NotificationRepositoryImpl } from "@/data/repositories/NotificationRepositoryImpl";
import { PatientRepositoryImpl } from "@/data/repositories/PatientRepositoryImpl";
import { PostRepositoryImpl } from "@/data/repositories/PostRepositoryImpl";
import { BookAppointmentUseCase } from "@/domain/usecases/appointments/BookAppointmentUseCase";
import { ListMyAppointmentsUseCase } from "@/domain/usecases/appointments/ListMyAppointmentsUseCase";
import { LoginUseCase } from "@/domain/usecases/auth/LoginUseCase";
import { ListConversationsUseCase } from "@/domain/usecases/chat/ListConversationsUseCase";
import { GetDoctorDetailsUseCase } from "@/domain/usecases/doctors/GetDoctorDetailsUseCase";
import { ListDoctorsUseCase } from "@/domain/usecases/doctors/ListDoctorsUseCase";
import { ListNotificationsUseCase } from "@/domain/usecases/notifications/ListNotificationsUseCase";
import { GetMyProfileUseCase } from "@/domain/usecases/patient/GetMyProfileUseCase";
import { ListPostsUseCase } from "@/domain/usecases/posts/ListPostsUseCase";

const services = {
  auth: new AuthService(),
  appointment: new AppointmentService(),
  chat: new ChatService(),
  doctor: new DoctorService(),
  notification: new NotificationService(),
  patient: new PatientService(),
  post: new PostService()
};

const repositories = {
  auth: new AuthRepositoryImpl(services.auth),
  appointments: new AppointmentRepositoryImpl(services.appointment),
  conversations: new ConversationRepositoryImpl(services.chat),
  doctors: new DoctorRepositoryImpl(services.doctor),
  notifications: new NotificationRepositoryImpl(services.notification),
  patient: new PatientRepositoryImpl(services.patient),
  posts: new PostRepositoryImpl(services.post)
};

const useCases = {
  login: new LoginUseCase(repositories.auth),
  listDoctors: new ListDoctorsUseCase(repositories.doctors),
  getDoctorDetails: new GetDoctorDetailsUseCase(repositories.doctors),
  listAppointments: new ListMyAppointmentsUseCase(repositories.appointments),
  bookAppointment: new BookAppointmentUseCase(repositories.appointments),
  listNotifications: new ListNotificationsUseCase(repositories.notifications),
  listConversations: new ListConversationsUseCase(repositories.conversations),
  getMyProfile: new GetMyProfileUseCase(repositories.patient),
  listPosts: new ListPostsUseCase(repositories.posts)
};

export const appContainer = {
  services,
  repositories,
  useCases
};
