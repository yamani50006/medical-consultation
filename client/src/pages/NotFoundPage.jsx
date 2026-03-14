import { Link } from "react-router-dom";
import FadeInSection from "../components/shared/FadeInSection";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

export default function NotFoundPage() {
  return (
    <FadeInSection className="mx-auto max-w-2xl">
      <Card className="rounded-[36px]">
        <CardContent className="space-y-6 p-10 text-center">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary">
            404
          </span>
          <div className="space-y-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight">الصفحة غير موجودة</h1>
            <p className="text-muted-foreground">المسار الذي طلبته غير موجود في هذه الواجهة حالياً.</p>
          </div>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link to="/">العودة للرئيسية</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/posts">فتح المنشورات</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </FadeInSection>
  );
}
