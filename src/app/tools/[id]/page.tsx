import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { ToolWorkspaceClient } from '@/components/junction/tool-workspace-client';
import { ALL_TOOLS, getPublicToolCategory } from '@/lib/tools-data';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';
import { isBuildToolAvailable } from '@/lib/tool-capabilities';
import { buildToolMetadata, SITE_NAME, SITE_URL } from '@/lib/seo-config';
import { ToolEditorialContent } from '@/components/junction/tool-editorial-content';
import { getToolEditorial } from '@/lib/tool-editorial';
import { AdSenseUnit } from '@/components/adsense-unit';
import { ADSENSE_SLOTS } from '@/lib/ad-slots';
import { MainFooter } from '@/components/landing/main-footer';
import { getToolSeoProfile } from '@/lib/seo-strategy';

export const dynamicParams = false;

type ToolPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return BUILD_PUBLIC_TOOLS.map((tool) => ({ id: tool.id }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { id } = await params;
  const tool = ALL_TOOLS.find((item) => item.id === id);
  if (!tool || !isBuildToolAvailable(id)) return { title: 'Tool Not Found | AJN PDF', robots: { index: false, follow: false } };
  return buildToolMetadata(tool);
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { id } = await params;
  const tool = BUILD_PUBLIC_TOOLS.find((item) => item.id === id);
  if (!tool) notFound();

  const editorial = getToolEditorial(tool);
  const category = getPublicToolCategory(tool);
  const categoryPath = category === 'conversion' ? '/conversion-tools' : category === 'image' ? '/image-tools' : '/pdf-utilities';
  const categoryLabel = category === 'conversion' ? 'Conversion Tools' : category === 'image' ? 'Image Tools' : 'PDF Tools';
  const seo = getToolSeoProfile(tool);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: tool.name,
        description: seo.description,
        url: `${SITE_URL}/tools/${tool.id}`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web Browser',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [...tool.benefits, ...tool.useCases],
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
      },
      {
        '@type': 'FAQPage',
        mainEntity: editorial.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      {
        '@type': 'HowTo',
        name: `How to use ${tool.name} online`,
        description: seo.description,
        totalTime: 'PT5M',
        step: tool.instructions.map((instruction, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: instruction,
          text: instruction,
          url: `${SITE_URL}/tools/${tool.id}#step-${index + 1}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: categoryLabel, item: `${SITE_URL}${categoryPath}` },
          { '@type': 'ListItem', position: 3, name: tool.name, item: `${SITE_URL}/tools/${tool.id}` },
        ],
      },
    ],
  };

  return (
    <>
      <Script
        id={`tool-schema-${tool.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolWorkspaceClient id={id} />
      <ToolEditorialContent tool={tool} />
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-12">
        <div className="border-t border-black/5 pt-10">
          <AdSenseUnit slot={ADSENSE_SLOTS.toolContent} width={200} height={300} className="min-h-[300px]" />
        </div>
      </div>
      <MainFooter />
    </>
  );
}
