import { ReactNode, useMemo, isValidElement, cloneElement } from "react";
import CMSPageContent, { getCmsRenderMode } from "./CMSPageContent";
import SEOHead from "./SEOHead";
import { useStoryblokPage } from "../hooks/useStoryblokPage";
import { mergePageSeo, SitePageDefinition } from "../utils/site";

interface PageCMSRouteProps {
  definition: SitePageDefinition;
  children: ReactNode;
  disableSeo?: boolean;
}

export default function PageCMSRoute({ definition, children, disableSeo = false }: PageCMSRouteProps) {
  const cms = useStoryblokPage(definition.storyblokSlug);
  const seo = useMemo(() => mergePageSeo(definition, cms.content), [cms.content, definition]);
  const renderMode = getCmsRenderMode(cms.content);
  const shouldReplace = cms.content && renderMode === "replace";

  // Pass cms content down to the page component if it's a valid React element
  const pageElement = isValidElement(children) 
    ? cloneElement(children, { content: cms.content } as any) 
    : children;

  return (
    <>
      {!disableSeo && <SEOHead seo={seo} path={definition.path} />}
      {cms.isLoading && (
        <div className="sr-only" role="status">
          Loading CMS content...
        </div>
      )}
      {cms.source === "fallback" && cms.reason && (
        <div className="sr-only" role="status">
          CMS fallback content is active: {cms.reason}.
        </div>
      )}
      {shouldReplace ? <CMSPageContent content={cms.content} /> : pageElement}
      {!shouldReplace && <CMSPageContent content={cms.content} />}
    </>
  );
}
