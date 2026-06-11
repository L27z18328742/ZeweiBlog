import type { NextRequest } from 'next/server'
import { compilePostMDX } from '~/utils/compile-mdx'

export const maxDuration = 60

// POST { bodyRaw } → compiles MDX and returns { code } for live preview.
export async function POST(request: NextRequest) {
  try {
    let { bodyRaw } = await request.json()
    if (typeof bodyRaw !== 'string') {
      return Response.json({ message: 'Missing `bodyRaw`' }, { status: 400 })
    }
    let { code } = await compilePostMDX(bodyRaw)
    return Response.json({ code })
  } catch (e) {
    console.error(e)
    let message = e instanceof Error ? e.message : 'MDX 编译失败'
    return Response.json({ message }, { status: 400 })
  }
}
