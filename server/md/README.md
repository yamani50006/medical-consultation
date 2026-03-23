# Server Reference

## 1. الهدف من التعديل
1. جعل الحجز يعتمد على الجدول الذي يحدده كل طبيب بنفسه.
2. منع عرض أوقات ثابتة مشتركة بين جميع الأطباء.
3. منع الحجز في وقت غير متاح أو محجوز مسبقاً.

## 2. تعديل Prisma
1. تم إضافة موديل جديد باسم `DoctorAvailabilitySlot`.
2. الموديل يحتوي على:
   `doctorId`
   `weekday`
   `time`
3. تم ربطه بـ `DoctorProfile` عبر العلاقة:
   `availabilitySlots`
4. تم إنشاء migration:
   `server/prisma/migrations/0004_doctor_availability_slots`

## 3. منطق إدارة أوقات الطبيب
1. تم تحديث `DoctorsRepository` ليعيد `availabilitySlots` مع بيانات الطبيب.
2. تم تحديث `DoctorsService` ليقبل `availabilitySlots` عند تحديث ملف الطبيب.
3. عند حفظ الجدول يتم:
   حذف الجدول القديم
   إنشاء الجدول الجديد حسب المدخلات
4. يتم ترتيب الأوقات وتوحيدها قبل الحفظ.

## 4. منطق استخراج المواعيد المتاحة
1. تم إنشاء ملف utility جديد:
   `server/src/modules/doctors/doctorAvailability.util.js`
2. هذا الملف مسؤول عن:
   توحيد وترتيب أوقات الطبيب
   توليد المواعيد القادمة خلال عدد أيام محدد
   استبعاد الأوقات المحجوزة
   مطابقة وقت الحجز مع جدول الطبيب
3. تمت مراعاة توقيت المنصة عبر:
   `APPOINTMENT_TIMEZONE_OFFSET_MINUTES`

## 5. endpoint الجديد
1. تم إضافة endpoint جديد لجلب مواعيد الطبيب المتاحة:

```txt
GET /api/v1/doctors/:id/appointment-slots?days=14
```

2. إذا لم يكن لدى الطبيب جدول، يتم إرجاع قائمة فارغة.
3. إذا كان للطبيب جدول، يتم إرجاع المواعيد القادمة فقط.

## 6. التحقق أثناء الحجز
1. تم تعديل `AppointmentsService` قبل إنشاء الحجز.
2. التحقق الآن يمر بهذه الخطوات:
   التأكد أن الطبيب فعال ومقبول
   التأكد أن الموعد في المستقبل
   التأكد أن الطبيب لديه جدول مواعيد
   التأكد أن الموعد المطلوب موجود ضمن الجدول
   التأكد أن الموعد غير محجوز مسبقاً
3. إذا فشل أي شرط يتم إرجاع خطأ مناسب.

## 7. الملفات التي تم تعديلها
1. `server/prisma/schema.prisma`
2. `server/prisma/schema.baseline.prisma`
3. `server/prisma/migrations/0004_doctor_availability_slots/migration.sql`
4. `server/src/modules/doctors/doctors.repository.js`
5. `server/src/modules/doctors/doctors.service.js`
6. `server/src/modules/doctors/doctors.controller.js`
7. `server/src/modules/doctors/doctors.routes.js`
8. `server/src/modules/doctors/doctors.validator.js`
9. `server/src/modules/doctors/doctorAvailability.util.js`
10. `server/src/modules/appointments/appointments.repository.js`
11. `server/src/modules/appointments/appointments.service.js`

## 8. أوامر التحقق التي تم تنفيذها
1. تشغيل build:

```bash
npm run build
```

2. تشغيل migrations:

```bash
npm run prisma:deploy
```

3. التحقق من حالة Prisma:

```bash
npx prisma migrate status
```

## 9. ملاحظات مهمة
1. إذا لم يقم الطبيب بإضافة أي أوقات، فلن تظهر أي مواعيد للمريض.
2. إذا كان الطبيب قد أضاف أوقاتاً لكن جميعها محجوزة، فسترجع القائمة فارغة أيضاً.
3. يجب أن تستخدم أي واجهة مستقبلية نفس endpointات والعقود الحالية حتى يبقى السلوك موحداً.

## 10. تحديث ملف المريض
1. تم توسيع endpoint تحديث ملف المريض الحالي:

```txt
PATCH /api/v1/patients/me/profile
```

2. endpoint أصبح يدعم في نفس الطلب:
   `fullName`
   `profileImageUrl`
   بيانات المريض الطبية الحالية
3. هذا يسمح للموبايل بحفظ الاسم والصورة والبيانات الطبية من شاشة واحدة فقط.

## 11. منطق التحديث داخل السيرفر
1. تم تحديث validator في:
   `server/src/modules/patients/patients.validator.js`
2. validator الآن:
   يقبل `fullName`
   يقبل `profileImageUrl`
   يقبل `data:image/...` أو رابط صورة `http/https`
   يحول القيم الفارغة لبعض الحقول الطبية إلى `null`
3. تم تحديث service في:
   `server/src/modules/patients/patients.service.js`
4. service أصبح ينفذ:
   تحديث `patientProfile`
   وتحديث `user.fullName`
   وتحديث `user.profileImageUrl`
   ضمن نفس العملية

## 12. دعم صورة البروفايل
1. لأن صورة البروفايل يتم إرسالها من الموبايل كـ `data URL`، تم رفع حد `express.json` في:
   `server/src/app.js`
2. الحد الجديد يسمح بمرور صورة ملف شخصي مضغوطة بدون كسر الطلب.
3. ما زال التحقق في validator يقيّد الطول الأقصى للصورة للحفاظ على حجم مناسب.

## 13. الملفات التي تم تعديلها لهذا الجزء
1. `server/src/modules/patients/patients.validator.js`
2. `server/src/modules/patients/patients.service.js`
3. `server/src/app.js`

## 14. أوامر التحقق لهذا الجزء
1. تم تنفيذ:

```bash
npm run build
```

2. النتيجة كانت نجاح التحقق وبناء Prisma Client بدون أخطاء.
