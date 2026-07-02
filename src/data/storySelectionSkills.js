export const storySelectionSkills = {
  sleep: {
    label: '晚安助眠选题 Skills',
    ageRange: '2-4 岁',
    defaultCategory: '温馨睡前故事',
    categories: {
      温馨睡前故事: {
        intent: '用亲子连接、家庭安全感和柔和结尾，帮助孩子自然入睡。',
        standards: ['冲突低', '结尾圆满', '亲子关系稳定', '画面温暖', '不制造分离焦虑'],
        avoid: ['强烈反派', '惩罚恐吓', '突然惊吓', '开放式危险结尾'],
        structure: '日常小事件 -> 轻微情绪波动 -> 被理解/被陪伴 -> 安心入睡',
      },
      小动物睡前故事: {
        intent: '用小动物角色降低理解门槛，把合作、分享、温暖迁移到睡前场景。',
        standards: ['动物行为拟人但简单', '场景自然', '动作少而清楚', '问题轻量', '夜晚收束'],
        avoid: ['捕食追逐', '动物受伤细节', '复杂生态知识', '强竞争'],
        structure: '小动物遇到小困难 -> 朋友帮助 -> 环境变安静 -> 一起晚安',
      },
      安抚故事: {
        intent: '通过重复句式、身体放松和安全暗示，直接服务入睡与情绪安抚。',
        standards: ['第二人称可听', '重复句式', '节奏慢', '身体放松指令', '安全感明确'],
        avoid: ['剧情反转', '高兴奋动作', '复杂角色', '强烈提问'],
        structure: '确认安全 -> 逐步放松 -> 重复安抚 -> 轻柔结束',
      },
      哄睡白噪音: {
        intent: '以稳定自然声或环境声承载轻提示，降低刺激并延长入睡陪伴。',
        standards: ['声音稳定', '提示词极少', '无突发声', '循环自然', '适合低音量播放'],
        avoid: ['尖锐声', '强节拍', '明显旋律钩子', '对白过多'],
        structure: '环境声建立 -> 轻提示进入 -> 声音稳定循环 -> 自然淡出',
      },
    },
  },
  growth: {
    label: '成长启蒙选题 Skills',
    ageRange: '2-4 岁',
    defaultCategory: '礼貌习惯',
    categories: {
      礼貌习惯: {
        intent: '把“请、谢谢、轮流、打招呼”放进具体生活情境。',
        standards: ['单一行为目标', '即时正反馈', '可模仿台词', '不说教'],
        avoid: ['羞辱孩子', '成人长篇道理', '复杂规则'],
        structure: '不会做 -> 看见示范 -> 试一次 -> 获得积极反馈',
      },
      独立成长: {
        intent: '让孩子体验“我可以自己试试”的成就感。',
        standards: ['任务足够小', '失败可被接住', '步骤清楚', '结果可见'],
        avoid: ['强迫独立', '过度比较', '超龄任务'],
        structure: '想依赖 -> 小尝试 -> 被支持 -> 完成一小步',
      },
      情绪管理: {
        intent: '帮助孩子识别情绪、命名情绪，并学一个可执行调节动作。',
        standards: ['情绪单一', '命名准确', '动作简单', '成人共情'],
        avoid: ['否定情绪', '压抑哭闹', '复杂心理解释'],
        structure: '情绪出现 -> 被看见 -> 命名 -> 做一个调节动作',
      },
      幼儿园适应: {
        intent: '降低入园陌生感，建立可预期的集体生活流程。',
        standards: ['场景真实', '流程可预期', '分离温和', '老师友好'],
        avoid: ['渲染哭闹', '夸大纪律', '陌生威胁'],
        structure: '进入新场景 -> 找到一个熟悉锚点 -> 完成小互动 -> 放心等待接回',
      },
    },
  },
  cognition: {
    label: '认知启蒙选题 Skills',
    ageRange: '2-4 岁',
    defaultCategory: '动物认知',
    categories: {
      动物认知: {
        intent: '用声音、动作、外形三个线索认识常见动物。',
        standards: ['一个故事认识一类重点', '拟声词清楚', '动作可模仿'],
        avoid: ['冷僻动物', '复杂分类', '捕食细节'],
        structure: '看见动物 -> 听声音 -> 模仿动作 -> 说出特点',
      },
      交通工具: {
        intent: '认识交通工具用途，同时建立基础安全规则。',
        standards: ['用途明确', '声音适量', '规则一句话', '场景日常'],
        avoid: ['事故情节', '危险驾驶', '复杂路线'],
        structure: '看到工具 -> 知道用途 -> 学一个规则 -> 安全到达',
      },
      身体认知: {
        intent: '认识身体部位和基础照护动作。',
        standards: ['部位少', '动作温和', '照护正向', '可跟做'],
        avoid: ['医学恐惧', '疼痛细节', '羞耻表达'],
        structure: '认识部位 -> 做动作 -> 感受变化 -> 照顾自己',
      },
      自然认知: {
        intent: '把天气、季节、植物等自然现象变成可观察线索。',
        standards: ['观察具体', '季节明确', '语言有画面', '不做复杂因果'],
        avoid: ['灾害恐吓', '抽象科学术语', '过密知识点'],
        structure: '发现变化 -> 观察细节 -> 连接生活 -> 温和收束',
      },
    },
  },
};

export function getSelectionSkill(groupId, category) {
  const profile = storySelectionSkills[groupId];
  if (!profile) return undefined;

  const categoryName = category && profile.categories[category] ? category : profile.defaultCategory;
  return {
    ...profile,
    categoryName,
    current: profile.categories[categoryName],
  };
}
