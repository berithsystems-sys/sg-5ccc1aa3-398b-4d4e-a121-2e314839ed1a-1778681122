import Head from "next/head";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

// Default SEO values
const defaultTitle = "EBC HQ Accounting - Complete Church Management System";
const defaultDescription = "Comprehensive accounting and financial management system for Emmanuel Baptist Church headquarters and all branch churches. Multi-church support, consolidated reporting, GST compliance, and complete statutory reporting.";
const defaultImage = "/og-image.png";

export function SEOElements({
  title = defaultTitle,
  description = defaultDescription,
  image = defaultImage,
  url,
}: SEOProps) {
  const fullTitle = title === defaultTitle ? title : `${title} | EBC HQ Accounting`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {url && <meta property="og:url" content={url} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <link rel="icon" href="/favicon.ico" />
    </>
  );
}

export function SEO({
  title = defaultTitle,
  description = defaultDescription,
  image = defaultImage,
  url,
}: SEOProps) {
  const fullTitle = title === defaultTitle ? title : `${title} | EBC HQ Accounting`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {url && <meta property="og:url" content={url} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}