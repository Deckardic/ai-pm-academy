import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, FileText, LogIn } from "lucide-react";
import { getAllModules, getAssignment, getLevel, getModule } from "@/entities/course/index.server";
import { LevelBadge, type Assignment, type Module } from "@/entities/course";
import { getSubmission } from "@/entities/progress/index.server";
import { getCurrentUser } from "@/entities/user/index.server";
import { AssignmentForm } from "@/features/submit-assignment";
import { routes } from "@/shared/config";
import { formatDuration } from "@/shared/lib";
import { Breadcrumbs, ButtonLink, Container, PageSkeleton, Skeleton } from "@/shared/ui";
import { LessonBody } from "@/widgets/lesson-body";

type Params = { level: string; module: string };

export function generateAssignmentParams(): Params[] {
  return getAllModules()
    .filter((mod) => mod.hasAssignment)
    .map((mod) => ({ level: mod.levelSlug, module: mod.slug }));
}

export async function generateAssignmentMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { level, module: mod } = await params;
  const data = getModule(level, mod);
  const assignment = data ? getAssignment(data) : null;
  return assignment
    ? { title: `Практика: ${assignment.title}`, description: assignment.deliverable }
    : {};
}

export function AssignmentPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<PageSkeleton size="narrow" />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Submission({ mod, assignment }: { mod: Module; assignment: Assignment }) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl bg-accent-soft p-5">
        <p className="text-[0.9375rem]">
          Войдите, чтобы сдать задание и открыть эталонное решение.
        </p>
        <ButtonLink href={routes.signIn(routes.moduleAssignment(mod.levelSlug, mod.slug))}>
          <LogIn aria-hidden /> Войти
        </ButtonLink>
      </div>
    );
  }
  const submission = await getSubmission(user.id, assignment.id);
  return (
    <div className="flex flex-col gap-12">
      <AssignmentForm
        assignmentId={assignment.id}
        checklist={assignment.checklist}
        initial={submission ? { text: submission.text, link: submission.link } : null}
      />
      {submission && assignment.solution ? (
        <section aria-labelledby="solution-title" className="border-t border-line pt-10">
          <h2 id="solution-title" className="sr-only">
            Эталонное решение
          </h2>
          <LessonBody source={assignment.solution} />
        </section>
      ) : null}
    </div>
  );
}

async function Content({ params }: { params: Promise<Params> }) {
  const { level: levelSlug, module: moduleSlug } = await params;
  const level = getLevel(levelSlug);
  const mod = getModule(levelSlug, moduleSlug);
  const assignment = mod ? getAssignment(mod) : null;
  if (!level || !mod || !assignment) notFound();

  return (
    <Container size="narrow" className="py-10 lg:py-14">
      <Breadcrumbs
        items={[
          { label: level.title, href: routes.level(level.slug) },
          { label: mod.title, href: routes.module(level.slug, mod.slug) },
          { label: "Практика", href: routes.moduleAssignment(level.slug, mod.slug) },
        ]}
      />
      <header className="mt-10 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-fg-muted">
          <LevelBadge levelId={level.id} title={level.title} />
          <span>Практическое задание</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-3.5" /> {formatDuration(assignment.durationMin)}
          </span>
        </div>
        <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
          {assignment.title}
        </h1>
        <p className="flex gap-2 text-lg text-fg-muted">
          <FileText aria-hidden className="mt-1.5 size-4 shrink-0" /> {assignment.deliverable}
        </p>
      </header>
      <div className="mt-8">
        <LessonBody source={assignment.body} />
      </div>
      <div className="mt-12">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <Submission mod={mod} assignment={assignment} />
        </Suspense>
      </div>
    </Container>
  );
}
