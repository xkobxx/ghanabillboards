import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSEO, SITE_NAME, BASE_URL, OG_IMAGE_DEFAULT, TWITTER_HANDLE } from '../config/seo';

interface SEOHeadProps {
  structuredData?: Record<string, unknown>;
}

export default function SEOHead({ structuredData }: SEOHeadProps) {
  const { pathname } = useLocation();
  const { title, description } = getSEO(pathname);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${BASE_URL}${pathname}`} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${BASE_URL}${pathname}`} />
      <meta property="og:image" content={OG_IMAGE_DEFAULT} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE_DEFAULT} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
