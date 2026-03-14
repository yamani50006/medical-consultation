import { Activity, ArrowRight, CalendarClock, ShieldCheck, Stethoscope } from "lucide-react";
import { startTransition, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animateHeroIntro } from "../animations/gsapAnimations";
import AnimatedButton from "../components/shared/AnimatedButton";
import AnimatedCard from "../components/shared/AnimatedCard";
import AnimatedCounter from "../components/shared/AnimatedCounter";
import FadeInSection from "../components/shared/FadeInSection";
import RevealSection from "../components/shared/RevealSection";
import Badge from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import { listDoctors } from "../features/doctors/doctors.api";
import { listPosts } from "../features/posts/posts.api";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const featureCards = [
  {
    icon: ShieldCheck,
    title: "صلاحيات آمنة حسب الدور",
    copy: "تجربة المدير والطبيب والمريض مفصولة بوضوح مع حماية كاملة للمسارات الخاصة."
  },
  {
    icon: Activity,
    title: "استشارات منظمة",
    copy: "يمكن للمريض إرسال طلب استشارة بينما يتابع الطبيب الرد وتحديث الحالة بشكل منظم."
  },
  {
    icon: CalendarClock,
    title: "إدارة المواعيد",
    copy: "حجز المواعيد ومراجعتها وتحديثها من خلال واجهة احترافية وسريعة."
  }
];

const statCards = [
  { label: "أطباء معتمدون", value: 24, suffix: "+" },
  { label: "استشارات منجزة", value: 320, suffix: "+" },
  { label: "متوسط وقت الرد", value: 12, suffix: " س" }
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const featuresRef = useScrollAnimation("[data-animate-item]", { y: 28, stagger: 0.1 });
  const [doctors, setDoctors] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => animateHeroIntro(heroRef.current), []);

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      try {
        const [doctorsResponse, postsResponse] = await Promise.all([
          listDoctors({ page: 1, limit: 3 }),
          listPosts({ page: 1, limit: 3 })
        ]);

        if (!cancelled) {
          startTransition(() => {
            setDoctors(doctorsResponse.data.data);
            setPosts(postsResponse.data.data);
            setLoading(false);
          });
        }
      } catch (error) {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-12">
      <section
        ref={heroRef}
        className="relative overflow-hidden rounded-[36px] border border-border/60 bg-gradient-to-br from-white/75 via-white/55 to-cyan-50/70 px-6 py-12 shadow-card backdrop-blur-xl dark:from-slate-950/80 dark:via-slate-950/60 dark:to-cyan-950/30 sm:px-10 lg:px-12"
      >
        <div className="absolute inset-0 bg-grid-fade opacity-70 dark:opacity-30" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Badge variant="default" data-hero-badge>
              منصة احترافية للاستشارات الطبية
            </Badge>
            <div className="space-y-4">
              <h1
                data-hero-title
                className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              >
                تجربة عيادة رقمية أكثر سلاسة للمريض والطبيب والإدارة.
              </h1>
              <p data-hero-copy className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                تجمع المنصة بين الوضوح الطبي والتجربة الحديثة، من المنشورات الطبية والاستشارات النصية إلى الموافقات
                الإدارية وإدارة المواعيد.
              </p>
            </div>

            <div data-hero-actions className="flex flex-wrap gap-3">
              <AnimatedButton asChild size="lg">
                <Link to="/register/patient">
                  ابدأ الآن
                  <ArrowRight className="size-4" />
                </Link>
              </AnimatedButton>
              <AnimatedButton asChild size="lg" variant="secondary">
                <Link to="/posts">استكشف المنشورات الطبية</Link>
              </AnimatedButton>
            </div>

            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              {statCards.map((item) => (
                <Card key={item.label} className="rounded-[26px] bg-card/75">
                  <CardContent className="space-y-2 p-5">
                    <AnimatedCounter
                      value={item.value}
                      suffix={item.suffix}
                      className="block font-display text-3xl font-semibold"
                    />
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div data-hero-preview className="grid gap-4">
            <AnimatedCard className="rounded-[30px] bg-slate-950 px-0 text-white dark:bg-slate-900">
              <div className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="border-white/15 bg-white/10 text-white">
                    معاينة مباشرة
                  </Badge>
                  <Stethoscope className="size-5 text-cyan-300" />
                </div>
                <div className="space-y-3">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-slate-400">جدول المواعيد</p>
                    <div className="mt-3 flex items-end gap-2">
                      {[46, 70, 54, 84, 62, 94].map((bar, index) => (
                        <div
                          key={bar}
                          className="w-7 rounded-full bg-gradient-to-t from-teal-500 to-cyan-300"
                          style={{ height: `${bar}px`, opacity: 0.55 + index * 0.06 }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-slate-400">مسار الرد على الاستشارة</p>
                    <div className="mt-4 space-y-3">
                      <div className="ml-auto max-w-[78%] rounded-[22px] rounded-br-md bg-cyan-400/20 px-4 py-3 text-sm">
                        أرسل المريض الأعراض وحدد تخصص القلب.
                      </div>
                      <div className="max-w-[82%] rounded-[22px] rounded-bl-md bg-white/10 px-4 py-3 text-sm">
                        قبل الطبيب الاستشارة ورد بالخطوات التالية.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      <RevealSection className="space-y-6">
        <div className="max-w-2xl space-y-3">
          <Badge variant="secondary">التجربة الأساسية</Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight">مصممة لتكون دقيقة وسريعة وراقية.</h2>
          <p className="text-muted-foreground">
            يركّز الإصدار الأول على تدفقات عمل واضحة وحركة بصرية أنيقة بدون تعقيد يشتت المستخدم.
          </p>
        </div>

        <div ref={featuresRef} className="grid gap-4 lg:grid-cols-3">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedCard key={feature.title} index={index} className="rounded-[30px]" data-animate-item>
                <div className="space-y-5 p-6">
                  <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{feature.copy}</p>
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      </RevealSection>

      <FadeInSection className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary">الأطباء</p>
              <h2 className="font-display text-3xl font-semibold tracking-tight">أطباء معتمدون</h2>
            </div>
          </div>
          <div className="grid gap-4">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="rounded-[28px] p-6">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="mt-4 h-4 w-56" />
                    <Skeleton className="mt-3 h-16 w-full" />
                  </Card>
                ))
              : doctors.map((doctor, index) => (
                  <AnimatedCard key={doctor.id} index={index} className="rounded-[28px]">
                    <div className="space-y-4 p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-display text-xl font-semibold">{doctor.user.fullName}</h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                        </div>
                        <Badge variant="success">موثق</Badge>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{doctor.bio}</p>
                    </div>
                  </AnimatedCard>
                ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-primary">المحتوى</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight">نصائح طبية حديثة</h2>
          </div>
          <div className="grid gap-4">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="rounded-[28px] p-6">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="mt-4 h-4 w-28" />
                    <Skeleton className="mt-3 h-16 w-full" />
                  </Card>
                ))
              : posts.map((post, index) => (
                  <AnimatedCard key={post.id} index={index} className="rounded-[28px]">
                    <div className="space-y-4 p-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge>{post.specialization}</Badge>
                        <span className="text-sm text-muted-foreground">{post.doctor?.user?.fullName}</span>
                      </div>
                      <h3 className="font-display text-xl font-semibold">{post.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">{post.content}</p>
                    </div>
                  </AnimatedCard>
                ))}
          </div>
        </div>
      </FadeInSection>
    </div>
  );
}
