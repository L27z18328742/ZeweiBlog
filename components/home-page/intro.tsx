import { Twemoji } from '~/components/ui/twemoji'

export function Intro() {
  return (
    <h1 className="text-neutral-900 dark:text-neutral-200">
      我是 <span className="font-medium">小乐学长</span> - 一名充满热情的全栈工程师
      <span className="hidden font-medium">中南大学</span>
      {/* <span className="absolute ml-1.5 inline-flex pt-[3px]">
        <Twemoji emoji="flag-vietnam" />
      </span> */}
    </h1>
  )
}
