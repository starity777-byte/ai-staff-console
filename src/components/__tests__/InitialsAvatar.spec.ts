import { beforeAll, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import InitialsAvatar from '@/components/InitialsAvatar.vue'

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    })
  })
})

function styleOf(name: string, size?: number | 'small') {
  const wrapper = mount(InitialsAvatar, { props: { name, size } })
  const avatar = wrapper.find('.ant-avatar')
  return { text: wrapper.text(), style: avatar.attributes('style') ?? '', className: avatar.classes() }
}

describe('InitialsAvatar', () => {
  it('shows the first character of a Chinese name', () => {
    expect(styleOf('小智').text).toBe('小')
    expect(styleOf(' 星河 ').text).toBe('星')
    expect(styleOf('管理员').text).toBe('管')
    expect(styleOf('   ').text).toBe('?')
  })

  it('picks a stable background color from the name', () => {
    const first = styleOf('小智')
    const second = styleOf('小智')
    const other = styleOf('星河')
    expect(first.style).toMatch(/background-color:/i)
    expect(first.style).toBe(second.style)
    expect(other.style).toMatch(/background-color:/i)
    expect(other.style).not.toBe(first.style)
    expect(styleOf('小智', 'small').className).toContain('ant-avatar-sm')
  })
})
