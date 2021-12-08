import Head from 'next/head'
import Header from '../components/Header'
import Layout from '../components/Layout'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
      </Head>
      <Layout>
        <Header />
      </Layout>
    </div>
  )
}
