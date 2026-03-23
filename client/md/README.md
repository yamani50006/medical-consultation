# Client Reference

## الهدف
1. هذا المجلد مخصص ليكون مرجعاً سريعاً لأي تعديلات تخص واجهة `client`.
2. في مهمة تفعيل الحجوزات الحالية لم يتم تنفيذ تعديل مباشر داخل `client`.
3. تم تنفيذ التعديلات الأساسية داخل `server` و`mobile`.

## حالة `client` في هذه المهمة
1. لا يوجد endpoint جديد تم استهلاكه من `client` ضمن هذه المرحلة.
2. لا توجد شاشات أو مكونات تم ربطها هنا بنظام مواعيد الطبيب.
3. المرجع الأساسي للتعديلات الحالية موجود في:
   [server/md/README.md](/Users/yamani/Documents/freelancer projects/استشارات طبيه/server/md/README.md)
   [mobile/md/README.md](/Users/yamani/Documents/freelancer projects/استشارات طبيه/mobile/md/README.md)

## إذا أردت ربط `client` لاحقاً بنظام المواعيد
1. استدعِ endpoint المواعيد المتاحة:

```txt
GET /api/v1/doctors/:id/appointment-slots?days=14
```

2. استدعِ ملف الطبيب الحالي للطبيب المسجل:

```txt
GET /api/v1/doctors/me/profile
```

3. حدّث جدول مواعيد الطبيب عبر:

```txt
PATCH /api/v1/doctors/me/profile
```

4. أرسل `availabilitySlots` بهذا الشكل:

```json
{
  "availabilitySlots": [
    { "weekday": 0, "time": "10:00" },
    { "weekday": 0, "time": "10:30" },
    { "weekday": 1, "time": "14:00" }
  ]
}
```

## ملاحظة
1. إذا قررت لاحقاً بناء شاشة ويب لإدارة جدول الطبيب أو شاشة ويب لحجز المريض، استخدم نفس العقود الموجودة في `server`.
