"use client"
import { useState } from 'react'
import type { Author } from 'contentlayer/generated'
import type { ReactNode } from 'react'
// import { CareerTimeline } from '~/components/author/career'
import { SocialAccounts } from '~/components/author/social-accounts'
import { ProfileCard } from '~/components/cards/profile'
import { Button } from '~/components/ui/button'
import { Container } from '~/components/ui/container'
import { Image } from '~/components/ui/image'
import { PageHeader } from '~/components/ui/page-header'
import { Twemoji } from '~/components/ui/twemoji'
import { SITE_METADATA } from '~/data/site-metadata'

interface Props {
  children?: ReactNode
  content: Omit<Author, '_id' | '_raw' | 'body'>
}

export function AuthorLayout({ children }: Props) {
  const [showQRModal, setShowQRModal] = useState(false);
  
  return (
    <Container className="pt-4 lg:pt-12">
      <PageHeader
        title="About"
        description="大家好！我是你们的新朋友，平时混迹于科技圈，爱捣鼓美食和剪辑。开了这个博客，想分享点我的生活碎片和开发经验，希望能给你的日常添点灵感和帮助到你！没什么严肃内容，就是幕后码字的我，想和你聊聊那些有趣的小事～"
        className="border-b border-gray-200 dark:border-gray-700"
      />
      <div className="py-8 md:grid md:grid-cols-3">
        <div className="pr-4">
          <ProfileCard />
        </div>
        <div className="md:col-span-2 md:pl-12 xl:pl-16">
          <div className="prose prose-lg dark:prose-invert">
            <div>
              <h2 className="mt-0">
                Hi there <Twemoji emoji="waving-hand" />
              </h2>
              <p>
                你好，我是 小乐学长，目前是<strong>中南大学的一名在读研究生</strong>。
                我对技术充满热情，尤其对<strong>全栈开发、大模型以及计算机视觉</strong>
                这些前沿领域非常感兴趣。我享受探索如何将这些技术结合起来，无论是构建端到端的应用，还是深入研究算法的奥秘。
                这个人博客对我而言，是一个记录学习过程、整理思路以及分享心得的平台。我认为，无论是动手实践、输出文字，还是与大家交流讨论，都是加深对这些复杂技术领域理解的绝佳方式。
                非常欢迎大家在这里留下你们的评论和想法，期待与各位交流学习！
              </p>
              <p>
                非常欢迎大家在我的文章下留下评论和想法 <Twemoji emoji="clinking-beer-mugs" />.
              </p>
            </div>
            <div>
              <div className="mb-[1em] mt-[2em] flex items-center justify-between [&>h2]:my-0">
                <h2>我的简历</h2>
                <Button as="a" href="/static/resume.pdf" target="_blank">
                  <span></span>
                  <Twemoji emoji="page-facing-up" />
                </Button>
              </div>
              {/* <CareerTimeline /> */}
            </div>
            {/* */}
            {/* <div>
              <h2>Tech stack</h2>
              <p>
                This blog is hosted on{' '}
                <a href="https://vercel.com/" target="_blank">
                  Vercel
                </a>
                , built with{' '}
                <a href="https://nextjs.org/" target="_blank">
                  Next.js
                </a>{' '}
                and{' '}
                <a href="https://tailwindcss.com/" target="_blank">
                  Tailwind CSS
                </a>{' '}
                using <strong>Tailwind Nextjs Starter Blog</strong>.
              </p>
              <p>
                A huge thanks to{' '}
                <a href="https://twitter.com/timlrxx" target="_blank">
                  Timothy Lin
                </a>{' '}
                for the minimal, lightweight, and super easy-to-customize blog starter.
              </p>
              <p>A few major over-engineering-changes from the original repo:</p>
              <ul>
                <li>
                  <Twemoji emoji="atom-symbol" /> Upgrading to <strong>React v18</strong>,{' '}
                  <strong>Next v14</strong>
                  (Using App router)
                </li>
                <li>
                  <Twemoji emoji="party-popper" /> Adopting <strong>Typescript</strong>, committing
                  with{' '}
                  <a href="https://www.conventionalcommits.org/" target="_blank">
                    Conventional Commits
                  </a>
                </li>
                <li>
                  <Twemoji emoji="bar-chart" /> Monitoring site with{' '}
                  <a href="https://umami.is/" target="_blank">
                    Umami
                  </a>{' '}
                  website analytics
                </li>
                <li>
                  <Twemoji emoji="eyes" /> Theming in dark mode with{' '}
                  <a
                    href="https://github.blog/changelog/2021-04-14-dark-and-dimmed-themes-are-now-generally-available/"
                    target="_blank"
                  >
                    Github dark dimmed
                  </a>{' '}
                  colors for better contrast
                </li>
                <li>
                  <Twemoji emoji="man-technologist" /> Making a lot of changes to the UI, new
                  homepage design, adding <code>ProfileCard</code>, <code>CareerTimeline</code>{' '}
                  components, adding <code>/snippets</code>, <code>/books</code>,{' '}
                  <code>/movies</code> page, etc.
                </li>
                <li>
                  <Twemoji emoji="inbox-tray" /> Bumping up <code>mdx-bundler</code>,{' '}
                  <code>rehype</code>/<code>remark</code> plugins and dependencies to the latest
                  version
                </li>
              </ul>
              <p>
                See my{' '}
                <a href="https://github.com/hta218/leohuynh.dev" target="_blank">
                  Github repository
                </a>{' '}
                for this blog.
              </p>
              <div>
                <h3>Legacy versions</h3>
                <p>I started this blog since 2019 and up until now it has 2 legacy versions:</p>
                <ul>
                  <li>
                    <code>v1</code> built with <strong>NextJS v13</strong> using Page router:{' '}
                    <a
                      href="https://leohuynhdev-git-v1-leo-huynhs-projects.vercel.app/"
                      target="_blank"
                    >
                      https://leohuynhdev-git-v1-leo-huynhs-projects.vercel.app/
                    </a>
                  </li>
                  <li>
                    <code>v0</code> built with <strong>Gatsby</strong>:{' '}
                    <a href="https://leo-blog-legacy.vercel.app/" target="_blank">
                      https://leo-blog-legacy.vercel.app/
                    </a>
                  </li>
                </ul>
              </div>
            </div> */}
            {/* <div>
              <h2>Assets</h2>
              <p>
                Most of the images in my blog are from{' '}
                <a href="https://unsplash.com/" target="_blank">
                  Unsplash
                </a>
                , gifs from{' '}
                <a href="https://giphy.com/" target="_blank">
                  GIPHY
                </a>
                , and illustrations are from{' '}
                <a href="https://storyset.com/" target="_blank">
                  Storyset
                </a>
                .
              </p>
              <p>
                Thanks for the free resources <Twemoji emoji="folded-hands" />.
              </p>
            </div> */}
            <div>
              <h2>联系我</h2>
              <p>
                通过 at 联系我
                <a href={`mailto:${SITE_METADATA.email}`}>{SITE_METADATA.email}</a> or social media:
              </p>
              <SocialAccounts />
            </div>
            <div>
              <h2>支持我</h2>
              <p>如果你觉得我做得还不错，就支持一下吧:</p>
              <div className="flex flex-col gap-4">
                <div 
                  onClick={() => setShowQRModal(true)}
                  className="cursor-pointer hover:opacity-90 transition-opacity [&_.image-container]:mx-0"
                >
                  <Image
                    src="/static/pay/wechat.jpg"
                    alt="Support me on Wechat"
                    width={297}
                    height={60}
                    style={{ height: 60, width: 'auto' }}
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">点击查看大图</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowQRModal(false)}
        >
          <div className="relative max-w-lg w-full">
            <div 
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowQRModal(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden p-4">
              <Image
                src="/static/pay/wechat.jpg"
                alt="Support me on Wechat QR Code"
                width={600}
                height={600}
                className="w-full h-auto"
              />
              <p className="text-center mt-4 text-lg">微信赞赏码</p>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}
