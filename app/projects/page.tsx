import { genPageMetadata } from 'app/seo'
import { ProjectCard } from '~/components/cards/project'
import { Container } from '~/components/ui/container'
import { PageHeader } from '~/components/ui/page-header'
import { PROJECTS } from '~/data/projects'

export let metadata = genPageMetadata({ title: 'Projects' })

export default async function Projects() {
  let workProjects = PROJECTS.filter(({ type }) => type === 'work')
  let sideProjects = PROJECTS.filter(({ type }) => type === 'self')

  return (
    <Container className="pt-4 lg:pt-12">
      <PageHeader
        title="Projects"
        description="嘿，大家好！接着聊聊我的“作品集”～这里有我的一些开源项目，还有跟小伙伴们在工作中一起搞定的成果。项目种类挺杂的，有我纯粹兴趣驱动的“玩票”之作，也有为了解决实际问题开发的实用小工具。欢迎来看看，说不定能找到点灵感！😉"
        className="border-b border-gray-200 dark:border-gray-700"
      />
      <div className="py-5 md:py-10">
        <h3 className="mb-6 text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 md:text-3xl">
          Work
        </h3>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {workProjects.map((pro) => (
            <ProjectCard key={pro.title} project={pro} />
          ))}
        </div>
      </div>
      <div className="mt-6 border-t border-gray-200 py-5 dark:border-gray-700 md:mt-10 md:py-10">
        <h3 className="mb-6 text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 md:mb-8 md:text-3xl">
          Side projects
        </h3>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {sideProjects.map((pro) => (
            <ProjectCard key={pro.title} project={pro} />
          ))}
        </div>
      </div>
    </Container>
  )
}
