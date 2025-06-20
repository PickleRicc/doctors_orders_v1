import { Html, Head, Main, NextScript } from 'next/document'

/**
 * Custom Document component to modify the initial HTML structure
 * Uses Next.js Document API to add custom head elements including fonts
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Roboto Font - Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
