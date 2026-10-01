import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Experience } from '@/components/Experience';
import { getProject, projects } from '@/data/projects';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const title = `${project.client} · ${project.title.en}`;
  return {
    title,
    description: project.summary.en,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title, description: project.summary.en, url: `/work/${project.slug}`, type: 'article' },
    twitter: { card: 'summary_large_image', title, description: project.summary.en },
  };
}

/** Case files are deep-linkable: the full experience renders with the case open. */
export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  return <Experience initialCase={slug} />;
}
