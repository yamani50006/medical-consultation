# Mobile Reference

## 1. الهدف من التعديل
1. جعل شاشة الحجز في تطبيق الموبايل تعتمد على أوقات كل طبيب الفعلية.
2. منع عرض أوقات ثابتة موحدة لكل الأطباء.
3. توفير واجهة للطبيب لتحديد جدول الحجز بنفسه.

## 2. شاشة حجز المريض
1. تم تعديل `BookingScreen` لتجلب الأوقات من السيرفر.
2. تم عرض الأيام كقائمة أفقية صغيرة ومتناسقة.
3. عند اختيار اليوم، تظهر الأوقات الخاصة بهذا اليوم فقط.
4. عند اختيار الوقت، يتم تعبئة `appointmentDate` تلقائياً.
5. تم تعطيل زر الحجز إذا لم يوجد وقت صالح.

## 3. التعامل مع عدم وجود مواعيد
1. إذا رجع endpoint المواعيد بقائمة فارغة، تظهر حالة فارغة واضحة للمستخدم.
2. إذا رجع endpoint المواعيد بـ `404`، يتم التعامل معه كأنه لا توجد مواعيد.
3. هذا يمنع ظهور خطأ عام في حالة عدم توفر جدول للطبيب.

## 4. شاشة تفاصيل الطبيب
1. تم تحديث `DoctorDetailsScreen` لعرض معاينة للمواعيد المتاحة.
2. إذا لم توجد مواعيد:
   يظهر تنبيه مناسب
   يتم تعطيل زر `حجز موعد`

## 5. شاشة ملف الطبيب
1. تم تحويل `DoctorProfileScreen` إلى شاشة إدارة جدول الحجز.
2. الطبيب يستطيع اختيار الأيام والساعات المتاحة.
3. يتم حفظ الجدول في السيرفر مباشرة.
4. أي تعديل ينعكس على المريض عند فتح شاشة الحجز.

## 6. الطبقة البيانية
1. تم إضافة أنواع جديدة:
   `DoctorAvailabilitySlotEntity`
   `DoctorAppointmentSlotEntity`
2. تم تحديث:
   `DoctorDto`
   `DoctorRepository`
   `DoctorRepositoryImpl`
   `DoctorRemoteDataSource`
3. تم إضافة mapper جديد لتحويل `appointment slots`.

## 7. الـ hooks والـ use cases
1. تم إضافة hook لجلب مواعيد الطبيب المتاحة:
   `useDoctorAppointmentSlotsQuery`
2. تم إضافة hook لجلب ملف الطبيب الحالي:
   `useMyDoctorProfileQuery`
3. تم إضافة mutation لتحديث جدول الطبيب:
   `useUpdateMyDoctorProfileMutation`
4. تم إضافة use cases جديدة لدعم هذه العمليات.

## 8. الملفات الأساسية التي تم تعديلها
1. `mobile/src/features/appointments/screens/BookingScreen.tsx`
2. `mobile/src/features/doctors/screens/DoctorDetailsScreen.tsx`
3. `mobile/src/features/doctor-panel/screens/DoctorProfileScreen.tsx`
4. `mobile/src/features/doctors/hooks/useDoctorQueries.ts`
5. `mobile/src/features/doctors/hooks/useDoctorProfileMutations.ts`
6. `mobile/src/domain/entities/Doctor.ts`
7. `mobile/src/domain/repositories/DoctorRepository.ts`
8. `mobile/src/data/dtos/doctor.dto.ts`
9. `mobile/src/data/mappers/doctor.mapper.ts`
10. `mobile/src/data/mappers/doctor-appointment-slot.mapper.ts`
11. `mobile/src/data/datasources/DoctorRemoteDataSource.ts`
12. `mobile/src/data/repositories/DoctorRepositoryImpl.ts`
13. `mobile/src/app/di/container.ts`
14. `mobile/src/app/di/query-keys.ts`

## 9. أوامر التحقق
1. تم تنفيذ:

```bash
npm run typecheck
```

2. النتيجة كانت نجاح التحقق بدون أخطاء TypeScript.

## 10. ملاحظات مهمة
1. إذا لم يحدد الطبيب أي مواعيد فلن تظهر للمريض أي أوقات للحجز.
2. إذا كانت كل الأوقات محجوزة فسيظهر نفس مكون الحالة الفارغة.
3. عنوان الـ API الافتراضي في الموبايل مضبوط في:
   `mobile/src/app/config/env.ts`
4. على أندرويد يتم تحويل `localhost` تلقائياً إلى `10.0.2.2`.

## 11. تعديل ملف المريض
1. تم إنشاء شاشة مستقلة لتعديل ملف المريض:
   `mobile/src/features/profile/screens/EditPatientProfileScreen.tsx`
2. الشاشة تسمح للمريض بتعديل:
   الاسم الكامل
   صورة البروفايل
   الجنس
   تاريخ الميلاد
   المدينة والمنطقة
   فصيلة الدم
   الأمراض المزمنة
   الأدوية الحالية
3. تم ربط الشاشة من صفحة `حسابي` عبر زر مباشر داخل بطاقة الملف الشخصي.
4. تم استخدام `expo-image-picker` لاختيار الصورة من الجهاز.
5. يتم تحويل الصورة إلى `data URL` ثم إرسالها مع طلب تحديث الملف.
6. عند نجاح الحفظ:
   يتم تحديث بيانات `patient profile`
   يتم تحديث `auth store` فوراً
   ينعكس الاسم والصورة مباشرة في الصفحة الرئيسية وصفحة حسابي

## 12. طبقة البيانات الخاصة بالمريض
1. تم توسيع `PatientRepository` ليضيف:
   `updateMyProfile`
2. تم تحديث:
   `PatientRemoteDataSource`
   `PatientRepositoryImpl`
   `appContainer`
3. تم إضافة use case جديد:
   `mobile/src/domain/usecases/patient/UpdateMyProfileUseCase.ts`
4. تم إضافة hook جديد:
   `mobile/src/features/profile/hooks/usePatientProfileMutations.ts`
5. هذا الـ hook مسؤول عن:
   تجهيز النموذج
   إعادة تعبئة القيم الحالية
   تحويل القيم الفارغة إلى `null`
   تنفيذ mutation
   مزامنة بيانات المستخدم بعد الحفظ

## 13. التحقق من صحة المدخلات
1. تم إضافة schema جديد:
   `mobile/src/features/profile/schemas/profile.schemas.ts`
2. schema يفرض:
   الاسم 3 أحرف على الأقل
   تاريخ الميلاد بصيغة `YYYY-MM-DD`
   التحقق أن التاريخ ليس في المستقبل
   حدود مناسبة لبقية الحقول الطبية
3. تم تعطيل زر الحفظ إذا لم توجد تعديلات أو إذا كانت القيم غير صالحة.

## 14. الملفات الأساسية التي تم تعديلها لهذا الجزء
1. `mobile/src/features/profile/screens/ProfileScreen.tsx`
2. `mobile/src/features/profile/screens/EditPatientProfileScreen.tsx`
3. `mobile/src/features/profile/hooks/usePatientProfileMutations.ts`
4. `mobile/src/features/profile/schemas/profile.schemas.ts`
5. `mobile/src/domain/repositories/PatientRepository.ts`
6. `mobile/src/domain/usecases/patient/UpdateMyProfileUseCase.ts`
7. `mobile/src/data/datasources/PatientRemoteDataSource.ts`
8. `mobile/src/data/repositories/PatientRepositoryImpl.ts`
9. `mobile/src/store/auth/auth.store.ts`
10. `mobile/src/navigation/types/index.ts`
11. `mobile/src/navigation/stacks/PatientStack.tsx`
12. `mobile/app.json`

## 15. أوامر التحقق لهذا الجزء
1. تم تنفيذ:

```bash
npm run typecheck
```

2. النتيجة كانت نجاح التحقق بدون أخطاء TypeScript.

## 16. البحث الذكي لاختيار الأطباء
1. تم تحويل صفحة الأطباء إلى بحث ذكي فعلي في:
   `mobile/src/features/doctors/screens/DoctorsListScreen.tsx`
2. البحث الآن لا يعتمد فقط على الاسم النصي، بل يفسر من النص:
   التخصص
   المدينة أو المنطقة
   نمط الاستشارة `أونلاين / حضوري`
   الحاجة إلى طبيب متاح الآن
   أسلوب الترتيب المناسب
3. أمثلة مدعومة:
   `قلب أونلاين الآن`
   `جلدية عدن`
   `أفضل طبيب أطفال`
   `أرخص دكتور أسنان`
4. تم عرض ملخص واضح للمريض يشرح كيف فُهم البحث قبل عرض النتائج.
5. تم عرض تخصصات مقترحة ديناميكية من السيرفر بدل التخصصات الثابتة.
6. تم دعم ترتيب ذكي للأطباء حسب `best_match` أو `top_rated` أو `price_low_to_high` أو `nearest` أو `most_consultations`.

## 17. طبقة البيانات للبحث الذكي
1. تم توسيع كيان الطبيب ليحمل:
   `recommendation.totalScore`
   `recommendation.reasons`
2. تم إضافة جلب فلاتر الأطباء من endpoint:
   `GET /doctors/filters`
3. تم تحديث:
   `DoctorRepository`
   `DoctorRemoteDataSource`
   `DoctorRepositoryImpl`
   `doctor.mapper`
4. تم إضافة use case جديد:
   `mobile/src/domain/usecases/doctors/GetDoctorFiltersUseCase.ts`
5. تم إضافة hook جديد:
   `mobile/src/features/doctors/hooks/useSmartDoctorSearch.ts`
6. هذا الـ hook مسؤول عن:
   تحليل النص
   استخراج دلالات البحث
   تجهيز query params
   دمج الفلاتر اليدوية مع الفهم الذكي
   ترتيب التخصصات المقترحة

## 18. تحسين عرض النتائج
1. تم تحديث بطاقة الطبيب في:
   `mobile/src/shared/components/DoctorCard.tsx`
2. البطاقة أصبحت تعرض:
   نسبة المطابقة الذكية
   السبب الأول للترشيح
3. هذا يجعل المريض يفهم لماذا ظهر الطبيب في النتائج، وليس فقط من هو الطبيب.

## 19. مرجع خريطة الطريق
1. تم إنشاء ملف مستقل لخطة تطوير البحث الذكي:
   `mobile/md/smart-doctor-search.md`
