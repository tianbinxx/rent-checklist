import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'

import App from './App.vue'

describe('App 回归测试', () => {
  const mountApp = () =>
    mount(App, {
      global: {
        plugins: [ElementPlus]
      }
    })

  it('命中一票否决项后应立即将分数归零', async () => {
    const wrapper = mountApp()
    const vetoInput = wrapper.find('input[type="checkbox"]')

    await vetoInput.setValue(true)
    await nextTick()

    expect(wrapper.text()).toContain('0分')
    expect(wrapper.text()).toContain('建议：不要租')
  })

  it('重置后应恢复初始状态', async () => {
    const wrapper = mountApp()
    const vetoInput = wrapper.find('input[type="checkbox"]')

    await vetoInput.setValue(true)
    await nextTick()
    await wrapper.get('button.el-button--primary').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('100分')
    expect(vetoInput.element).not.toBeChecked()
  })
})
