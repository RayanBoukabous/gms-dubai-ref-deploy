import { NewsDetailPage } from '@/components/pages/OtherPages'

export default function NewsDetail({ params }: { params: { slug: string } }) {
  return <NewsDetailPage slug={params.slug} />
}
