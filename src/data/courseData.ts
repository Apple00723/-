import { ClinicalDrugInfo, QuizQuestion, SceneId } from '../types/vrCourse';

export interface SceneMeta {
  id: SceneId;
  number: string;
  actBadge: string;     // e.g. "第1幕", "穿梭幕", "基质幕", "第2幕"...
  actName: string;      // e.g. "第1幕 · 生化实验室"
  title: string;
  shortDesc: string;
  durationEst: string;
  voiceover: string;
  learningPoint: string;
}

export const COURSE_SCENES: SceneMeta[] = [
  {
    id: 'scene1_lab',
    number: '01',
    actBadge: '第1幕',
    actName: '第1幕 · 生化实验室',
    title: '生化实验室：宏观启航与引导',
    shortDesc: '未来微观医学实验室全景，启动纳米尺度缩放与VR手柄操作引导。',
    durationEst: '1.5 分钟',
    voiceover: '欢迎来到微观生物化学实验室。在人体内，无数的生命活动都依赖于“酶”这一高效的生物催化剂。而在临床药学中，超过一半的药物都是通过改变酶的活性来治疗疾病的。今天，我们将缩放到纳米尺度，亲自探究药物是如何阻断酶的作用的。',
    learningPoint: '理解酶在生命活动中的核心催化地位及临床药物靶向酶的普遍性与重大意义。'
  },
  {
    id: 'scene1_transition',
    number: '02',
    actBadge: '穿梭幕',
    actName: '穿梭幕 · 细胞膜跃迁',
    title: '纳米跃迁：跨越磷脂双分子层',
    shortDesc: '极速缩放到纳米尺度，穿透细胞膜磷脂双分子层与跨膜离子通道。',
    durationEst: '10 秒',
    voiceover: '正在启动量子尺度微观跃迁！视角极速穿透肝细胞磷脂双分子层，穿越细胞膜通道蛋白，进入细胞内液！',
    learningPoint: '体验从宏观人体器官跨越至纳米尺度的微观物理空间跃迁。'
  },
  {
    id: 'scene1_cytoplasm',
    number: '03',
    actBadge: '基质幕',
    actName: '基质幕 · 细胞内微环境',
    title: '微观基质：胶体环境与细胞骨架',
    shortDesc: '高浓度胶体微观环境，观察流动的微管骨架、ATP高能分子与水分子。',
    durationEst: '1 分钟',
    voiceover: '我们已成功抵达人体肝细胞的细胞质基质空间！请环顾四周，您看到的是充满活力的微观生命网络：发光的ATP高能分子、密集的微管细胞骨架、以及游离的水分子。正前方就是我们的目标：巨大的酶蛋白复合体。',
    learningPoint: '观察细胞质基质中的微环境成分：细胞骨架纤维、高能磷酸键分子(ATP)及溶剂水分子。'
  },
  {
    id: 'scene2_enzyme',
    number: '04',
    actBadge: '第2幕',
    actName: '第2幕 · 锁钥结合',
    title: '锁钥结合：底物与活性中心特异契合',
    shortDesc: '以 HMG-CoA 还原酶为原型（浅绿色），抓取底物卡入活性中心体验锁钥催化裂解。',
    durationEst: '约 2 分钟',
    voiceover: '看，这就是酶的“活性中心”。底物分子的三维形状与活性中心高度互补，就像钥匙插入锁孔一样。结合后，酶迅速催化反应生成产物。在正常情况下，这种高效的催化维系着人体的新陈代谢。',
    learningPoint: '理解酶与底物的三维立体互补契合（锁钥模型）以及催化裂解生成产物的动力学全过程。'
  },
  {
    id: 'scene3_competitive',
    number: '05',
    actBadge: '第3幕',
    actName: '第3幕 · 竞争性抑制',
    title: '竞争性抑制：以他汀类降脂药为例',
    shortDesc: '药物分子抢占活性中心，底物被物理排斥弹开；通过加大底物浓度可解除抑制。',
    durationEst: '约 3 分钟',
    voiceover: '这就是“竞争性抑制”！药物分子的结构与底物非常相似，它们像竞争对手一样争夺同一个活性中心。当药物抢先占领活性中心后，底物就无门而入。请注意看柱状图：如果我们大量增加底物浓度，底物靠“人海战术”依然可以把药物“挤”出来，恢复最大反应速率。',
    learningPoint: '竞争性抑制原理：结构高度相似、争夺活性中心、不可催化、Vmax不变而Km增大，靠增加底物浓度可解除抑制。'
  },
  {
    id: 'scene4_noncompetitive',
    number: '06',
    actBadge: '第4幕',
    actName: '第4幕 · 非竞争性抑制',
    title: '非竞争性抑制（别构调节机制）',
    shortDesc: '药物分子结合侧面别构位点，导致酶构象畸变，活性中心变形，加大底物完全无效。',
    durationEst: '约 3 分钟',
    voiceover: '现在观察“非竞争性抑制”。药物分子并没有去抢活性中心，而是选择结合了酶的“别构位点”。但这引发了连锁反应——酶的整体结构发生了畸变！此时活性中心就像变形的锁孔，底物再也无法契合。这种情况下，无论你投入多少底物，都无法挽回催化效率的丧失。',
    learningPoint: '临床药学知识点：结合别构位点改变酶构象，使活性中心失去催化能力；增加底物浓度无法解除抑制（Vmax降低，Km不变）。'
  },
  {
    id: 'scene5_kinetics',
    number: '07',
    actBadge: '第5幕',
    actName: '第5幕 · 对比总结与临床考核',
    title: '对比总结与临床考核关卡',
    shortDesc: '全景左右比对竞争性与非竞争性模型，完成他汀用药与米氏曲线配对考核，解锁生化达人勋章与学习报告。',
    durationEst: '约 2.5 分钟',
    voiceover: '太棒了！通过本次VR微观体验，你已经彻底掌握了酶的两种核心抑制机制及其在药物研发中的应用。记住，理解分子与靶点的互动，是开启现代精准药物治疗的关键钥匙。实验结束，感谢你的体验！',
    learningPoint: '系统对比两大抑制机制空间构象与动力学差异，完成他汀用药与米氏曲线配对考核，获得临床药学生化达人认证。'
  },
  {
    id: 'scene6_quiz',
    number: '08',
    actBadge: '第6幕',
    actName: '第6幕 · 临床自测',
    title: '临床药理考核：靶向药物案例辨析',
    shortDesc: '完成3道临床典型药物作用情景题，检验抑制剂机制掌握程度。',
    durationEst: '1.5 分钟',
    voiceover: '学以致用，沉浸式自测开启！请结合刚才在微观视界观察到的分子机制，回答以下临床药理学案例题。',
    learningPoint: '巩固生化与药理学核心考点，建立分子靶向机制与临床用药方案之间的直接思维连接。'
  }
];

export interface PPTStepInfo {
  step: number;               // 1 to 18
  sceneId: SceneId;
  tabLabel: string;           // e.g. "01 实验室", "04 放入底物"
  title: string;              // e.g. "抓取底物放入活性中心"
  subtitle: string;           // e.g. "锁钥模型契合 · 形成 ES 复合物"
  currentDescription: string; // What the current state shows
  targetName: string;         // The exact physical target framed by the yellow box!
  targetPosition: { x: string; y: string }; // Screen % position for the blinking yellow box
  nextActionPrompt: string;   // e.g. "点击将底物放入活性中心"
  voiceover: string;          // Voice narration text
}

export const PPT_STEPS: PPTStepInfo[] = [
  {
    step: 1,
    sceneId: 'scene1_lab',
    tabLabel: '01 实验室',
    title: '生化实验室宏观导览',
    subtitle: '宏观启航 · 准备纳米跃迁',
    currentDescription: '微观生物化学实验室全景，正中央是通往人体肝细胞的纳米跃迁通道。',
    targetName: '细胞膜跃迁通道',
    targetPosition: { x: '50%', y: '50%' },
    nextActionPrompt: '点击中央通道：穿透细胞膜',
    voiceover: '欢迎来到微观生物化学实验室。在人体内，无数生命活动都依赖酶的催化。点击中央跃迁通道，我们将穿透细胞膜缩放到纳米尺度。'
  },
  {
    step: 2,
    sceneId: 'scene1_cytoplasm',
    tabLabel: '02 细胞质',
    title: '细胞质基质微环境',
    subtitle: 'ATP高能分子与微管骨架',
    currentDescription: '已抵达肝细胞内液，正前方是今天核心靶标：巨大的 HMG-CoA 还原酶蛋白复合体。',
    targetName: '靶酶蛋白复合体',
    targetPosition: { x: '50%', y: '48%' },
    nextActionPrompt: '点击锁定酶复合体催化口袋',
    voiceover: '我们已进入肝细胞内液！周围流淌着发光的ATP高能分子与微管骨架。正前方就是核心靶标酶蛋白复合体。点击锁定它的催化口袋。'
  },
  {
    step: 3,
    sceneId: 'scene2_enzyme',
    tabLabel: '03 活性中心',
    title: '酶活性口袋空间认知',
    subtitle: '特异构象与锁孔空间准备',
    currentDescription: '活性中心呈现精密的立体凹槽口袋，犹如等待特定钥匙插入的锁孔。',
    targetName: '催化活性口袋 (锁孔)',
    targetPosition: { x: '50%', y: '48%' },
    nextActionPrompt: '点击左侧黄色底物分子 (S)',
    voiceover: '看，这就是酶的活性中心，其立体三维形状犹如精密的锁孔。点击左侧黄色底物分子，准备观察锁钥契合。'
  },
  {
    step: 4,
    sceneId: 'scene2_enzyme',
    tabLabel: '04 放入底物',
    title: '抓取底物嵌入活性口袋',
    subtitle: '几何互补 · 形成 ES 复合物',
    currentDescription: '黄色天然底物分子 (S) 与活性口袋空间完美吻合，正在滑入口袋。',
    targetName: '底物分子 (S)',
    targetPosition: { x: '33%', y: '58%' },
    nextActionPrompt: '点击底物：精准嵌合入活性中心',
    voiceover: '黄色底物分子的几何形状与口袋完美吻合。点击底物，观察它精准滑入活性中心形成酶-底物复合物。'
  },
  {
    step: 5,
    sceneId: 'scene2_enzyme',
    tabLabel: '05 诱导契合',
    title: '底物锁死在活性中心凹槽',
    subtitle: '催化反应中间态 · 速率 50%',
    currentDescription: '底物分子牢牢嵌合在活性口袋内部，催化三联体氨基酸正在积聚裂解能量！',
    targetName: '活性中心内部 (ES复合物)',
    targetPosition: { x: '50%', y: '48%' },
    nextActionPrompt: '点击反应核心：裂解为双产物',
    voiceover: '底物已精准就位！催化微环境已经就绪。现在点击反应核心，触发化学键裂解生成产物！'
  },
  {
    step: 6,
    sceneId: 'scene2_enzyme',
    tabLabel: '06 催化裂解',
    title: '化学键断裂生成双产物释放',
    subtitle: '100% Vmax 最大催化速率达成',
    currentDescription: '底物裂解为两个产物分子并释放！催化速率瞬间达到 100% Vmax！',
    targetName: '释放的双产物 (P1+P2)',
    targetPosition: { x: '50%', y: '46%' },
    nextActionPrompt: '点击右侧空间异构体分子',
    voiceover: '催化成功！化学键断裂生成双产物分子并飞速释放，柱状图显示催化速率冲至100%满负荷状态！点击右侧空间异构体分子进行对比。'
  },
  {
    step: 7,
    sceneId: 'scene2_enzyme',
    tabLabel: '07 异构测试',
    title: '测试空间立体异构体',
    subtitle: '非特异性构象分子尝试硬塞',
    currentDescription: '异构体分子虽然化学成分相似，但空间立体朝向完全不对，尝试强行塞入口袋。',
    targetName: '空间异构体分子',
    targetPosition: { x: '67%', y: '58%' },
    nextActionPrompt: '点击异构体：尝试塞入活性口袋',
    voiceover: '现在测试空间异构体。这个分子三维构象不匹配。点击异构体，尝试强行将它塞入酶的口袋。'
  },
  {
    step: 8,
    sceneId: 'scene2_enzyme',
    tabLabel: '08 位阻排斥',
    title: '空间位阻碰撞排斥弹开',
    subtitle: '验证酶促反应立体专一性',
    currentDescription: '因几何构型无法契合，异构体受到强烈空间位阻，被红光能量屏障弹飞！',
    targetName: '红色碰撞能量屏障',
    targetPosition: { x: '50%', y: '48%' },
    nextActionPrompt: '点击进入竞争性抑制机制 (他汀药物)',
    voiceover: '看！因为空间位阻严重冲突，异构体被红光屏障狠狠弹飞！这生动证实了酶催化具有绝对的立体专一性。点击进入竞争性抑制机制。'
  },
  {
    step: 9,
    sceneId: 'scene3_competitive',
    tabLabel: '09 他汀登场',
    title: '阿托伐他汀 (立普妥) 现身',
    subtitle: '分子结构类似底物 · 争夺活性中心',
    currentDescription: '红色阿托伐他汀分子登场，它的关键功能基团构型与底物极其相似。',
    targetName: '阿托伐他汀药瓶与药物分子 (I)',
    targetPosition: { x: '72%', y: '55%' },
    nextActionPrompt: '点击他汀药物：抢占活性口袋',
    voiceover: '进入竞争性抑制！降脂药阿托伐他汀登场。注意看，它的头部构型与天然底物非常相似。点击他汀分子，观察它如何争夺口袋。'
  },
  {
    step: 10,
    sceneId: 'scene3_competitive',
    tabLabel: '10 药物死锁',
    title: '他汀分子死锁催化活性中心',
    subtitle: '催化速率腰斩骤降至 20%',
    currentDescription: '他汀牢牢卡死在催化中心，形成死锁！酶活性受到严重阻断，速率腰斩至 20%！',
    targetName: '被他汀占据死锁的活性口袋',
    targetPosition: { x: '50%', y: '48%' },
    nextActionPrompt: '点击底物分子：测试被药物排斥',
    voiceover: '他汀药物抢先死锁了活性中心！催化速率暴跌至百分之二十。这就是药物降低胆固醇合成的直接机理。点击底物测试结合。'
  },
  {
    step: 11,
    sceneId: 'scene3_competitive',
    tabLabel: '11 底物被拒',
    title: '天然底物被药物物理阻挡弹开',
    subtitle: '竞争性互斥 · 底物无门而入',
    currentDescription: '底物尝试进入活性中心，但被药物占据的空间强行挡在门外弹开。',
    targetName: '被弹开的天然底物分子',
    targetPosition: { x: '35%', y: '56%' },
    nextActionPrompt: '点击浓度调节阀：底物浓度拉满 100%',
    voiceover: '底物完全无法进入，被阻挡在外！但因为这是竞争性抑制，我们可以用浓度优势来破局。点击浓度调节阀，将底物浓度拉满至百分之百！'
  },
  {
    step: 12,
    sceneId: 'scene3_competitive',
    tabLabel: '12 底物对冲',
    title: '大剂量底物人海战术冲挤药物',
    subtitle: '数量优势将他汀药物强行挤出口袋',
    currentDescription: '底物浓度拉满至 100%，大量底物分子包围酶蛋白，靠数量优势强行将药物挤飞！',
    targetName: '被挤飞的他汀药物分子',
    targetPosition: { x: '66%', y: '42%' },
    nextActionPrompt: '点击恢复的催化中心：确认 Vmax 不变',
    voiceover: '大剂量底物对冲成功！底物分子靠压倒性的人海战术成功把药物挤了出去，催化速率恢复至百分之九十！这证明竞争性抑制的最大反应速率V-max保持不变！'
  },
  {
    step: 13,
    sceneId: 'scene4_noncompetitive',
    tabLabel: '13 别构分子',
    title: '非竞争性抑制机制引入',
    subtitle: '蓝色重金属 / 别构抑制剂现身',
    currentDescription: '蓝色重金属/别构分子出现，它完全不屑于去抢催化口袋，瞄准的是侧面别构位点。',
    targetName: '蓝色别构抑制剂分子',
    targetPosition: { x: '28%', y: '55%' },
    nextActionPrompt: '点击别构分子：结合酶侧面别构位点',
    voiceover: '现在探索非竞争性抑制。蓝色别构抑制剂登场。它不去抢催化口袋，而是瞄准酶侧面的非催化别构位点。点击别构分子将它结合至侧面位点。'
  },
  {
    step: 14,
    sceneId: 'scene4_noncompetitive',
    tabLabel: '14 结合别构',
    title: '结合酶侧面非催化别构位点',
    subtitle: '应力向活性中心传导 · 隐蔽破坏',
    currentDescription: '蓝色抑制剂卡入侧面别构口袋，剧烈的分子内应力波正向活性中心传导！',
    targetName: '侧面别构位点 (Allosteric Cleft)',
    targetPosition: { x: '66%', y: '52%' },
    nextActionPrompt: '点击活性中心：观察蛋白质构象畸变',
    voiceover: '别构结合卡死！虽然催化口袋空着，但分子内应力正传导至活性中心。点击活性中心，观察灾难性的三维构象形变！'
  },
  {
    step: 15,
    sceneId: 'scene4_noncompetitive',
    tabLabel: '15 构象畸变',
    title: '酶三维构象剧烈扭曲狭窄变形',
    subtitle: '催化凹槽物理毁坏 · 速率断崖锁死 10%',
    currentDescription: '别构结合引发整体构象畸变，催化活性凹槽扁平狭窄，底物再也无法放入，速率锁死 10%！',
    targetName: '畸变狭窄的活性中心凹槽',
    targetPosition: { x: '50%', y: '48%' },
    nextActionPrompt: '点击底物分子：尝试塞入变形口袋',
    voiceover: '看这剧烈的构象畸变！活性凹槽严重扁平狭窄，锁孔已经被物理损坏！反应速度暴跌锁死在百分之十。点击底物分子尝试结合。'
  },
  {
    step: 16,
    sceneId: 'scene4_noncompetitive',
    tabLabel: '16 逆转无效',
    title: '底物碰撞弹开 · 超量底物依然无效',
    subtitle: 'Vmax 永久降低 · 动力学铁律证实',
    currentDescription: '底物无法对准变形口袋剧烈碰撞弹开！哪怕将底物拉满至 100%，也完全无法恢复反应！',
    targetName: '变形口袋与碰撞屏障',
    targetPosition: { x: '50%', y: '48%' },
    nextActionPrompt: '点击进入全景动力学实验室与自测',
    voiceover: '底物发生碰撞弹开！即使把底物浓度拉满到百分之百，也无法恢复催化活性。这无可辩驳地证实：非竞争性抑制导致V-max永久降低，增加底物完全无法逆转！点击进入自测。'
  },
  {
    step: 17,
    sceneId: 'scene5_kinetics',
    tabLabel: '17 动力对比',
    title: '米氏方程与双倒数图全景比对',
    subtitle: '竞争性 vs 非竞争性 药理动力学指纹',
    currentDescription: '全景比对两种抑制机制：竞争性抑制使 Km 增大但 Vmax 不变；非竞争性抑制使 Vmax 降低但 Km 不变！',
    targetName: '双倒数图 (Lineweaver-Burk) 看板',
    targetPosition: { x: '50%', y: '45%' },
    nextActionPrompt: '点击开启执业医师与临床药理真题自测',
    voiceover: '来到全景动力学实验室。在双倒数图中：竞争性抑制纵轴交点不变、横轴右移；非竞争性抑制纵轴交点上移、横轴交点不变。点击开启真题自测！'
  },
  {
    step: 18,
    sceneId: 'scene5_kinetics',
    tabLabel: '18 临床自测',
    title: '国家执业医师真题自测与通关',
    subtitle: '降脂药机制 · 药物解救案例通关',
    currentDescription: '完成临床高频真题测试，验证对竞争性与非竞争性抑制机制的掌握深度！',
    targetName: '临床考核真题试卷',
    targetPosition: { x: '50%', y: '50%' },
    nextActionPrompt: '开启真题作答',
    voiceover: '太棒了！现在请作答临床药学真题，检验你对两大抑制机制和临床药物靶向原理的掌握程度！'
  }
];

export const CLINICAL_DRUGS: ClinicalDrugInfo[] = [
  {
    name: '阿托伐他汀 (立普妥)',
    englishName: 'Atorvastatin',
    type: 'competitive',
    targetEnzyme: 'HMG-CoA 还原酶',
    clinicalUse: '治疗高胆固醇血症，预防动脉粥样硬化及冠心病',
    mechanism: '分子结构类似 HMG-CoA，竞争性占领催化口袋，阻断胆固醇体内从头合成。',
    formula: 'C33H35FN2O5'
  },
  {
    name: '甲氨蝶呤 (MTX)',
    englishName: 'Methotrexate',
    type: 'competitive',
    targetEnzyme: '二氢叶酸还原酶 (DHFR)',
    clinicalUse: '广谱抗肿瘤药（白血病、骨肉瘤）及类风湿关节炎免疫抑制',
    mechanism: '化学构象与天然叶酸极其类似，与DHFR亲和力比叶酸高1000倍，抑制DNA原料四氢叶酸合成。',
    formula: 'C20H22N8O5'
  },
  {
    name: '乙酰唑胺',
    englishName: 'Acetazolamide',
    type: 'noncompetitive',
    targetEnzyme: '碳酸酐酶 (Carbonic Anhydrase)',
    clinicalUse: '治疗青光眼（降低眼压）、急性高原反应与水肿利尿',
    mechanism: '作用于酶结构活性中心邻近的配位位点，破坏锌离子催化微环境，导致Vmax大幅下降。',
    formula: 'C4H6N4O3S2'
  },
  {
    name: '别构非竞争抑制剂 (例:依非韦伦)',
    englishName: 'Efavirenz (NNRTI)',
    type: 'noncompetitive',
    targetEnzyme: 'HIV-1 逆转录酶',
    clinicalUse: '抗人类免疫缺陷病毒（艾滋病高效抗反转录病毒治疗HAART）',
    mechanism: '结合于逆转录酶手掌区疏水别构口袋，导致催化三联体立体位移，阻断病毒复制。',
    formula: 'C14H9ClF3NO2'
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '临床上使用他汀类药物降低胆固醇，其作用机制属于以下哪种类型？',
    options: [
      '竞争性抑制（与HMG-CoA争夺活性中心，Km增大，Vmax不变）',
      '非竞争性抑制（结合别构位点，Km不变，Vmax降低）',
      '不可逆抑制（共价结合破坏酶结构）',
      '反竞争性抑制（仅与酶-底物复合物结合）'
    ],
    correctIndex: 0,
    explanation: '他汀类药物化学结构包含类似 HMG-CoA 的侧链，可与天然底物竞争酶的活性口袋，属于经典的竞争性抑制。随着底物浓度提高，抑制效应可被逆转（Km增大，Vmax不变）。',
    clinicalNote: '临床医生提示：他汀类主要竞争抑制胆固醇合成限速酶，为心脑血管疾病基石用药。'
  },
  {
    id: 2,
    question: '在酶促反应动力学中，若加入某种抑制剂后，双倒数图（Lineweaver-Burk）与纵轴的交点上移，而与横轴交点保持不变，说明该抑制剂为：',
    options: [
      '竞争性抑制剂（Km增加，-1/Km右移）',
      '非竞争性抑制剂（1/Vmax增大，-1/Km不变）',
      '无抑制作用',
      '激活剂（Vmax增大，交点下移）'
    ],
    correctIndex: 1,
    explanation: '在双倒数图中，纵轴交点为 1/Vmax，横轴交点为 -1/Km。纵轴交点上移意味着 1/Vmax 变大，即 Vmax 减小；横轴交点不变意味着 Km 保持恒定。这正符合“非竞争性抑制”特征！',
    clinicalNote: '生化与药理考试必考：非竞争性抑制不影响底物结合亲和力(Km不变)，但降低催化转化数(Vmax降低)。'
  },
  {
    id: 3,
    question: '当患者服用一种竞争性抑制剂药物后，若要克服这种药物对靶酶的阻断效应，最有效的临床药理方案是：',
    options: [
      '显著增加体内天然底物的前体供应或提高底物浓度',
      '注射别构激活剂',
      '降低反应温度',
      '加入等量的非竞争性抑制剂'
    ],
    correctIndex: 0,
    explanation: '竞争性抑制剂与底物结合同一催化活性中心，两者的结合是互斥且动态平衡的。当体系中底物浓度 [S] 远远大于抑制剂浓度 [I] 时，酶几乎全部被底物结合，反应速度可恢复至正常的 Vmax。',
    clinicalNote: '例如临床有机磷中毒抢救时使用解磷定（针对胆碱酯酶恢复），或在甲氨蝶呤大剂量抗癌后使用亚叶酸钙（还原型叶酸底物前体）进行解救！'
  }
];
