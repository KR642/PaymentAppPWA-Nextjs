import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="manifest" href='/manifest.json'/>
          
        </Head>
        <body>
          <style jsx global>{`
            body {
              margin: 0;
              padding: 0;
              background: linear-gradient(to right, #CB2B93, #9546C4, #5E61F4);
            }
          `}</style>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
