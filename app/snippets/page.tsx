import { genPageMetadata } from 'app/seo'
import { allSnippets } from 'contentlayer/generated'
import { SnippetCard } from '~/components/cards/snippet'
import { Container } from '~/components/ui/container'
import { PageHeader } from '~/components/ui/page-header'
import { allCoreContent } from '~/utils/contentlayer'
import { sortPosts } from '~/utils/misc'

export let metadata = genPageMetadata({ title: 'Snippets' })

export default function Snippets() {
  let snippets = allCoreContent(sortPosts(allSnippets))

  return (
    <Container className="pt-4 lg:pt-12">
      <PageHeader
        title="Snippets"
        description={
          <>
            <p>
            本人收集的常用代码片段，旨在提升个人工作效率。这些代码结构简洁，具备非常强的可重用性。
根据您的需要，对这些片段进行复制、修改和使用。
            </p>
            {/* <p className="mt-3 italic">
              *Some snippets written by me, some are from the internet (Thanks to the open source
              community).
            </p> */}
          </>
        }
        className="border-b border-gray-200 dark:border-gray-700"
      />
      <div className="py-10">
        <div className="grid-cols-2 gap-x-6 gap-y-10 space-y-10 md:grid md:space-y-0">
          {snippets.map((snippet) => (
            <SnippetCard snippet={snippet} key={snippet.path} />
          ))}
        </div>
      </div>
    </Container>
  )
}
