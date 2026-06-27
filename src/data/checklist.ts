import type { ChecklistItem, VetoItem } from '../types'

const COMMON_APPLIANCE_BRANDS = [
  'Haier（海尔）',
  'Midea（美的）',
  'Hisense（海信）',
  'Gree（格力）',
  'AUX（奥克斯）',
  'TCL',
  'Panasonic（松下）',
  'Siemens（西门子）',
  'LG',
  'Samsung（三星）'
]

export const baseScore = 100

export const vetoItems: VetoItem[] = [
  {
    id: 'veto-odor',
    label: '房间存在明显异味',
    how: '进门后先不要说话，安静站立 20 秒，闻房间、柜体和卫生间交界处是否有刺鼻味。',
    why: '异味往往意味着潮湿、通风差、霉菌或下水返味，后续处理成本高。'
  },
  {
    id: 'veto-mold',
    label: '墙体或天花板明显发霉',
    how: '重点看窗边、墙角、空调下方和卫生间外侧，是否有大片黑点、霉斑或潮湿痕迹。',
    why: '明显发霉通常不是一次性小问题，后续容易反复。'
  },
  {
    id: 'veto-leak',
    label: '存在正在漏水或明显漏水痕迹',
    how: '查看厨房、卫生间、窗边和天花板，是否有水滴、水印、鼓包或持续潮湿区域。',
    why: '漏水会影响家具、电器和居住安全，维修周期通常较长。'
  },
  {
    id: 'veto-aircon',
    label: '空调无法正常制冷',
    how: '开启空调并调到最低温，等待约 30 秒，若几乎没有冷风或明显异响，可直接判定。',
    why: '夏季无制冷会严重影响居住体验，且维修费用较高。'
  },
  {
    id: 'veto-landlord',
    label: '房东明确拒绝测试关键设备',
    how: '提出测试空调、热水、插座、门锁等基本请求，若被直接拒绝，可视为命中。',
    why: '拒绝基础测试意味着后续风险无法确认。'
  },
  {
    id: 'veto-network',
    label: '手机网络几乎无法联网',
    how: '打开常用网页或聊天工具，等待约 20 秒，若长时间转圈或频繁断网，可判定。',
    why: '基础通信都无法保证，日常生活和办公会受到明显影响。'
  },
  {
    id: 'veto-safety',
    label: '存在明显安全隐患',
    how: '查看门锁、电线、燃气、窗户和护栏，是否有裸线、破损、松动或无法正常关闭等情况。',
    why: '安全风险优先级最高，不适合继续考虑。'
  }
]

export const checklistItems: ChecklistItem[] = [
  {
    id: 'room-light',
    kind: 'status',
    category: '房间',
    title: '采光是否充足',
    score: -3,
    uncheckableScore: -1,
    how: '白天拉开窗帘，站在房间中间看是否需要立刻开灯才能看清环境。',
    why: '自然光差会明显影响居住舒适度。'
  },
  {
    id: 'room-sound',
    kind: 'status',
    category: '房间',
    title: '隔音是否可接受',
    score: -4,
    uncheckableScore: -1,
    how: '关上门窗后安静站立约 20 秒，听是否能清楚听见楼道、电梯或邻居说话声。',
    why: '隔音差会长期影响睡眠和休息。'
  },
  {
    id: 'room-sun',
    kind: 'status',
    category: '房间',
    title: '是否存在明显西晒风险',
    score: -2,
    uncheckableScore: -0.5,
    how: '询问朝向并站到窗边感受日照，下午看房时尤其注意是否有强烈直晒。',
    why: '西晒会让房间夏天更热，空调成本更高。'
  },
  {
    id: 'room-window',
    kind: 'status',
    category: '房间',
    title: '窗户开合与密封是否正常',
    score: -3,
    uncheckableScore: -1,
    how: '手动开关窗户一次，感受是否费力、松动，关闭后看边缘是否有明显缝隙。',
    why: '窗户问题会影响通风、噪音和下雨天渗水风险。'
  },
  {
    id: 'room-wall',
    kind: 'status',
    category: '房间',
    title: '墙面与顶面是否有明显裂纹或起皮',
    score: -3,
    uncheckableScore: -0.5,
    how: '看床头、窗边和天花板四角，是否有大面积开裂、起皮或补漆痕迹。',
    why: '表面状态差往往意味着维护不到位。'
  },
  {
    id: 'room-floor',
    kind: 'status',
    category: '房间',
    title: '地面是否平整牢固',
    score: -2,
    uncheckableScore: -0.5,
    how: '在房内来回走几步，感受是否有明显松动、鼓起或踩踏异响。',
    why: '地面问题会影响家具稳定性和日常体验。'
  },

  {
    id: 'furniture-bed',
    kind: 'status',
    category: '家具',
    title: '床架是否稳固',
    score: -3,
    uncheckableScore: -1,
    missingScore: -8,
    supportsMissing: true,
    how: '手扶床架轻轻晃动，或者坐到床边一次，感受是否明显摇晃或异响。',
    why: '床架不稳会直接影响休息质量。'
  },
  {
    id: 'furniture-mattress',
    kind: 'status',
    category: '家具',
    title: '床垫是否明显塌陷',
    score: -4,
    uncheckableScore: -1,
    missingScore: -6,
    supportsMissing: true,
    how: '坐下再起身一次，观察床垫是否明显下陷且回弹很差。',
    why: '床垫状态会长期影响睡眠和腰背舒适度。'
  },
  {
    id: 'furniture-wardrobe',
    kind: 'status',
    category: '家具',
    title: '衣柜是否配置且能正常使用',
    score: -3,
    uncheckableScore: -1,
    missingScore: -5,
    supportsMissing: true,
    how: '打开柜门并看内部，确认有无柜体、是否卡顿、门板是否歪斜。',
    why: '衣柜缺失或损坏会影响日常收纳。'
  },
  {
    id: 'furniture-desk',
    kind: 'status',
    category: '家具',
    title: '书桌是否配置且尺寸够用',
    score: -2,
    uncheckableScore: -0.5,
    missingScore: -3,
    supportsMissing: true,
    how: '观察桌面是否能放下电脑和基本物品，并轻按桌角确认是否稳固。',
    why: '没有合适书桌会影响办公、学习和吃饭。'
  },
  {
    id: 'furniture-chair',
    kind: 'status',
    category: '家具',
    title: '椅子是否配置且稳固',
    score: -1,
    uncheckableScore: -0.5,
    missingScore: -2,
    supportsMissing: true,
    how: '轻压椅背或短暂坐下，确认椅脚是否晃动、椅面是否明显不平。',
    why: '椅子虽然不是最高优先级，但长期缺失也会影响使用。'
  },

  {
    id: 'appliance-ac-brand',
    kind: 'status',
    category: '家电',
    title: '空调是否配置且属于常见品牌',
    score: -3,
    uncheckableScore: -1,
    missingScore: -15,
    supportsMissing: true,
    brandReferences: COMMON_APPLIANCE_BRANDS,
    how: '查看空调机身品牌标识，如果不认识，可以现场搜索确认是否为常见品牌。',
    why: '陌生品牌不一定有问题，但后续维修和稳定性风险通常更高。'
  },
  {
    id: 'appliance-ac-cooling',
    kind: 'status',
    category: '家电',
    title: '空调是否能快速制冷',
    score: -6,
    uncheckableScore: -1,
    how: '开启空调，设置最低温度，等待约 30 秒，感受是否有明显冷风吹出。',
    why: '这是现场最关键的空调验证动作之一。'
  },
  {
    id: 'appliance-fridge-brand',
    kind: 'status',
    category: '家电',
    title: '冰箱是否配置且属于常见品牌',
    score: -4,
    uncheckableScore: -1,
    missingScore: -10,
    supportsMissing: true,
    brandReferences: COMMON_APPLIANCE_BRANDS,
    how: '查看冰箱门体或侧边品牌标识，如果品牌不认识，建议立即搜索确认。',
    why: '冰箱属于高频家电，品牌可信度影响后续维护和使用体验。'
  },
  {
    id: 'appliance-fridge-power',
    kind: 'status',
    category: '家电',
    title: '冰箱能否正常通电并启动',
    score: -4,
    uncheckableScore: -1,
    how: '打开冰箱门看内部照明，贴近机身听是否有启动声，确认并非完全断电。',
    why: '无法启动通常意味着需要维修或更换。'
  },
  {
    id: 'appliance-fridge-position',
    kind: 'choice',
    category: '家电',
    title: '冰箱摆放位置是否合理',
    uncheckableScore: -0.5,
    how: '看冰箱实际放在哪里，重点留意是否紧挨睡眠区域。',
    why: '冰箱压缩机长期工作，若放在卧室，噪音更容易影响休息。',
    options: [
      {
        value: 'kitchen',
        label: '独立厨房',
        score: 0,
        description: '最理想，噪音和热量影响最小。'
      },
      {
        value: 'living-room',
        label: '客厅',
        score: -1,
        description: '可接受，但会占用公共区域。'
      },
      {
        value: 'dining-room',
        label: '餐厅',
        score: -1,
        description: '一般可接受。'
      },
      {
        value: 'bedroom',
        label: '卧室',
        score: -4,
        description: '压缩机噪音可能长期影响睡眠。'
      }
    ]
  },
  {
    id: 'appliance-washer-brand',
    kind: 'status',
    category: '家电',
    title: '洗衣机是否配置且属于常见品牌',
    score: -3,
    uncheckableScore: -1,
    missingScore: -8,
    supportsMissing: true,
    brandReferences: COMMON_APPLIANCE_BRANDS,
    how: '查看洗衣机面板或机身标签的品牌标识，不认识的品牌建议现场搜索。',
    why: '常用品牌通常售后更稳定，配件也更容易找。'
  },
  {
    id: 'appliance-washer-power',
    kind: 'status',
    category: '家电',
    title: '洗衣机能否正常通电启动',
    score: -4,
    uncheckableScore: -1,
    how: '按下电源键，观察面板是否点亮，是否能进入基本程序界面。',
    why: '至少要先确认设备不是坏机或完全断电。'
  },
  {
    id: 'appliance-heater-brand',
    kind: 'status',
    category: '家电',
    title: '热水器是否配置且属于常见品牌',
    score: -2,
    uncheckableScore: -1,
    missingScore: -6,
    supportsMissing: true,
    brandReferences: COMMON_APPLIANCE_BRANDS,
    how: '查看热水器机身品牌，若不熟悉，建议用手机快速确认品牌信息。',
    why: '常见品牌在安全性和售后方面更容易让人放心。'
  },
  {
    id: 'appliance-heater-panel',
    kind: 'status',
    category: '家电',
    title: '热水器面板或指示灯是否正常',
    score: -3,
    uncheckableScore: -1,
    how: '看热水器显示面板、指示灯或开关状态，确认不是完全无反应。',
    why: '这是现场最容易做的热水器基础检查。'
  },
  {
    id: 'appliance-lights',
    kind: 'status',
    category: '家电',
    title: '灯具是否能正常点亮',
    score: -2,
    uncheckableScore: -0.5,
    how: '将房内常用灯具逐个打开，确认没有明显闪烁或完全不亮。',
    why: '照明问题虽然易修，但能直接反映维护情况。'
  },
  {
    id: 'appliance-sockets',
    kind: 'status',
    category: '家电',
    title: '插座是否能正常通电',
    score: -3,
    uncheckableScore: -1,
    how: '使用充电器或小电器插入 1 至 2 个常用插座，确认是否能正常供电。',
    why: '插座故障会直接影响生活与办公。'
  },
  {
    id: 'appliance-network',
    kind: 'status',
    category: '家电',
    title: '网络是否能正常访问',
    score: -3,
    uncheckableScore: -1,
    how: '使用手机连接现有 Wi-Fi 或直接测试蜂窝网络，打开网页等待约 20 秒观察。',
    why: '基础网络可用性对生活和远程办公都很重要。'
  },

  {
    id: 'kitchen-hood',
    kind: 'status',
    category: '厨房',
    title: '油烟机是否能正常工作',
    score: -4,
    uncheckableScore: -1,
    missingScore: -8,
    supportsMissing: true,
    how: '按下油烟机开关键，听是否有明显启动声，并观察是否能切换档位。',
    why: '油烟机是厨房基础设备，后续使用频率高。'
  },
  {
    id: 'kitchen-gas',
    kind: 'status',
    category: '厨房',
    title: '燃气灶是否能正常点火',
    score: -4,
    uncheckableScore: -1,
    missingScore: -6,
    supportsMissing: true,
    how: '若房东允许，轻按旋钮测试点火，观察是否能正常打火并稳定燃烧。',
    why: '燃气灶关系到做饭便利性与安全性。'
  },
  {
    id: 'kitchen-cabinet',
    kind: 'status',
    category: '厨房',
    title: '橱柜内是否存在发霉或受潮痕迹',
    score: -4,
    uncheckableScore: -0.5,
    how: '打开橱柜门，看转角、底板和靠墙位置是否有黑点、水印或潮湿痕迹。',
    why: '橱柜受潮通常意味着厨房通风差或历史漏水。'
  },
  {
    id: 'kitchen-sink',
    kind: 'status',
    category: '厨房',
    title: '水槽排水是否顺畅',
    score: -3,
    uncheckableScore: -1,
    how: '打开水龙头约 10 秒，再关掉，观察水槽是否能快速排空、没有明显积水。',
    why: '排水慢会让厨房更容易返味和积污。'
  },
  {
    id: 'kitchen-grease',
    kind: 'status',
    category: '厨房',
    title: '厨房是否存在明显油污',
    score: -2,
    uncheckableScore: -0.5,
    how: '看灶台、墙砖、油烟机外壳和橱柜把手，是否有厚重油渍或长期未清洁痕迹。',
    why: '明显油污说明交付前清洁质量较差。'
  },
  {
    id: 'kitchen-counter',
    kind: 'status',
    category: '厨房',
    title: '台面是否完整无裂缝',
    score: -2,
    uncheckableScore: -0.5,
    how: '查看台面边角和水槽周边，是否有裂缝、缺角或明显鼓起。',
    why: '台面损坏会影响日常使用和清洁。'
  },
  {
    id: 'kitchen-pest',
    kind: 'status',
    category: '厨房',
    title: '是否存在明显蟑螂痕迹',
    score: -5,
    uncheckableScore: -0.5,
    how: '看橱柜角落、水槽下方和墙角，是否有蟑螂尸体、黑色颗粒或虫卵痕迹。',
    why: '虫害处理周期长，入住后会非常麻烦。'
  },

  {
    id: 'bath-shower',
    kind: 'status',
    category: '卫生间',
    title: '花洒水压是否正常',
    score: -3,
    uncheckableScore: -1,
    how: '打开花洒约 10 秒，感受水流是否发散无力，冷热切换是否正常。',
    why: '花洒水压直接影响洗澡体验。'
  },
  {
    id: 'bath-hotwater',
    kind: 'status',
    category: '卫生间',
    title: '热水是否能在 1 分钟内出来',
    score: -3,
    uncheckableScore: -1,
    how: '将水调到热水方向，等待约 30 至 60 秒，确认是否能稳定出热水。',
    why: '热水慢通常意味着设备或管路状态一般。'
  },
  {
    id: 'bath-basin-drain',
    kind: 'status',
    category: '卫生间',
    title: '洗手盆排水是否顺畅',
    score: -2,
    uncheckableScore: -1,
    how: '打开水龙头约 10 秒，观察洗手盆排水是否迅速，是否出现明显积水。',
    why: '排水不畅会带来返味和清洁问题。'
  },
  {
    id: 'bath-toilet',
    kind: 'status',
    category: '卫生间',
    title: '马桶冲水是否正常',
    score: -3,
    uncheckableScore: -1,
    how: '按下冲水键一次，观察冲水是否有力，是否能顺利回水。',
    why: '马桶问题会直接影响居住基本体验。'
  },
  {
    id: 'bath-basin-condition',
    kind: 'status',
    category: '卫生间',
    title: '洗手盆是否完好且使用顺手',
    score: -2,
    uncheckableScore: -0.5,
    how: '查看盆体是否有裂纹，再实际洗一下手，感受大小是否明显局促难用。',
    why: '洗手盆太小或有裂纹，日常使用会很不方便。'
  },
  {
    id: 'bath-drain-odor',
    kind: 'status',
    category: '卫生间',
    title: '地漏是否存在明显反味',
    score: -3,
    uncheckableScore: -0.5,
    how: '靠近地漏位置闻一下，再离开几步回头判断是否能闻到明显异味。',
    why: '地漏反味会显著降低居住舒适度。'
  },

  {
    id: 'safety-door-lock',
    kind: 'status',
    category: '安全',
    title: '门锁是否能正常反锁',
    score: -5,
    uncheckableScore: -1,
    how: '进门后尝试关门反锁一次，确认门锁不卡顿、锁舌能完全弹出。',
    why: '门锁是最基础的安全保障。'
  },
  {
    id: 'safety-window-lock',
    kind: 'status',
    category: '安全',
    title: '窗锁是否完整可用',
    score: -3,
    uncheckableScore: -1,
    how: '查看窗锁是否完整，再实际拨动一次，确认能锁住窗扇。',
    why: '低楼层和临街房源尤其要重视窗锁。'
  },
  {
    id: 'safety-peephole',
    kind: 'status',
    category: '安全',
    title: '猫眼或门外视野是否正常',
    score: -2,
    uncheckableScore: -0.5,
    how: '从猫眼向外看一次，确认视野清楚、无遮挡、装置没有损坏。',
    why: '门外可视能力是非常实用的安全细节。'
  },
  {
    id: 'safety-fire',
    kind: 'status',
    category: '安全',
    title: '烟感或灭火器等消防配置是否可见',
    score: -3,
    uncheckableScore: -0.5,
    how: '查看房内、走廊或厨房附近，是否能看到烟感、灭火器等基础消防配置。',
    why: '消防配置虽不常用，但关键时刻非常重要。'
  },

  {
    id: 'landlord-fee',
    kind: 'status',
    category: '房东',
    title: '房东是否愿意说明费用构成',
    score: -3,
    uncheckableScore: -1,
    how: '直接询问房租、押金、物业、水电、网络等费用，观察对方是否说得清楚。',
    why: '费用解释含糊，后续容易产生额外争议。'
  },
  {
    id: 'landlord-repair',
    kind: 'status',
    category: '房东',
    title: '房东是否愿意说明维修责任',
    score: -2,
    uncheckableScore: -1,
    how: '直接问空调、热水器、门锁等故障由谁维修，是否能明确回答。',
    why: '维修责任不清晰，入住后最容易扯皮。'
  },
  {
    id: 'landlord-contract',
    kind: 'status',
    category: '房东',
    title: '合同关键条款是否表达清晰',
    score: -4,
    uncheckableScore: -1,
    how: '重点问租期、退租、违约、涨租和押金返还规则，确认对方是否能讲明白。',
    why: '合同条款不清晰会带来最大的后续纠纷风险。'
  },
  {
    id: 'landlord-inventory',
    kind: 'status',
    category: '房东',
    title: '是否能提供明确交付清单',
    score: -2,
    uncheckableScore: -1,
    how: '询问是否有家具电器清单或交付明细，确认不是口头含糊承诺。',
    why: '有交付清单更方便后续核对设备责任。'
  }
]
