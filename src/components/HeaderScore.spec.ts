import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'

import HeaderScore from './HeaderScore.vue'

describe('HeaderScore', () => {
  const mountHeader = () =>
    mount(HeaderScore, {
      global: {
        plugins: [ElementPlus]
      },
      props: {
        scoreDisplay: '88',
        scoreColor: 'warning',
        recommendation: '可以考虑',
        progressPercentage: 88,
        searchKeyword: '',
        visibleItemCount: 12,
        answeredItemCount: 4,
        totalItemCount: 38,
        hasVeto: false,
        allCollapsed: false
      }
    })

  it('不应渲染意外的孤立字符，并且搜索输入框应保持可清空', () => {
    const wrapper = mountHeader()
    const input = wrapper.find('input')
    const elInput = wrapper.findComponent({ name: 'ElInput' })

    expect(wrapper.text()).not.toContain('>')
    expect(input.attributes('placeholder')).toBe('搜索检查项，例如：空调 / 合同 / 厨房')
    expect(elInput.props('clearable')).toBe(true)
  })

  it('顶部进度标签应保持 5 个关键节点', () => {
    const wrapper = mountHeader()

    expect(wrapper.findAll('.progress-labels span')).toHaveLength(5)
  })
})
