/**
 * 网站内容配置文件
 *
 * 以后改网站内容，优先只改这个文件。
 * 不需要改 components 里的组件代码。
 *
 * 修改小提示：
 * 1. 文字内容：改引号里的中文即可。
 * 2. 图片路径：图片先放到 public/images/，这里写成 "/images/文件名.jpg"。
 * 3. 音乐路径：音乐先放到 public/audio/，这里写成 "/audio/文件名.wav"。
 * 4. 数组内容：复制一整段 { ... }，粘贴后修改文字和图片，就能新增一条。
 * 5. 删除内容：删除对应的一整段 { ... } 即可。
 */

/**
 * 后续接入真正后台 CMS 时，可以从这里开始替换。
 * 当前模式是 local-file，表示内容来自本文件。
 */
export const contentSource = {
  mode: "local-file",
  cmsReady: true,
  note: "未来可以把 data/site.ts 替换为 Supabase、Notion、Strapi 或自建后台接口。组件层不需要大改。"
};

/**
 * 首页和私密页基础信息
 */
export const couple = {
  // 两个人的名字，会显示在首页和加载页。
  leftName: "左边的人",
  rightName: "右边的人",

  // 私密页密码使用哈希保存。首次初始化密码由后台/Supabase 管理，不在页面明文显示。
  password: "",
  passwordHash: "dd745bd4519c28cc2132ecda8b8cc4b05abb98efa19aa808fad0304804c9a28c",
  passwordUpdatedAt: "",
  accessVersion: "initial",

  // 恋爱开始日期。格式必须是 YYYY-MM-DD，例如 "2024-05-20"。
  startDate: "2024-05-20",

  // 首页背景图。替换图片时，把新图放到 public/images/，再改这里。
  backgroundImage: "/images/hero-couple.jpg",

  // 首页大标题和副文案。
  heroLine: "两个人的日常",
  subLine: "不是为了把每一天写得很漂亮，只是怕以后忘了这些很小的瞬间。",
  nameConnector: "和",

  // 首页上的生活小纸条。想增加就复制一行。
  heroNotes: [
    "2026.05.28 / 香港 / 晴，傍晚有风",
    "便利店的汽水总是在傍晚最好喝。",
    "那天你一直按着被风吹起来的衣角。"
  ]
};

/**
 * 全站固定文案
 * 导航、按钮、标题、placeholder、footer 都在这里改。
 */
export const siteText = {
  metadata: {
    title: "我们的生活记录",
    description: "一个温柔自然的情侣生活记录网站，收藏日常、旅行、照片、日记和纪念日。",
    openGraphDescription: "海风、树影、胶片和两个人认真生活的瞬间。"
  },

  // 顶部导航。href 不建议改，label 可以随便改中文。
  navigation: [
    { href: "/stories", label: "故事" },
    { href: "/album", label: "相册" },
    { href: "/diary", label: "日记" },
    { href: "/cities", label: "城市" },
    { href: "/#future", label: "以后" }
  ],

  contentPages: {
    homeLabel: "回到首页",
    storiesIntro: "按时间慢慢翻，像把几张旧照片重新放回信封里。",
    albumIntro: "不追求每张都完美，只留下当时的光、风和没说完的话。",
    diaryIntro: "有些日子没有大事，只是几句很小的记录，也值得留下。",
    citiesIntro: "城市不是打卡清单，是我们在哪里慢慢生活过的证据。"
  },

  hero: {
    togetherLabel: "已经一起走过",
    dayUnit: "天",
    scrollLabel: "往下看"
  },

  // 每个板块上方的小标题和大标题。
  sections: {
    story: { eyebrow: "慢慢发生的事", title: "我们的故事" },
    time: { eyebrow: "被风吹慢的时间", title: "最近的生活气味" },
    fragments: { eyebrow: "没有特意安排", title: "生活里的小片段" },
    album: { eyebrow: "照片里的风和光", title: "相册墙" },
    book: { eyebrow: "翻到某一天", title: "一本很轻的相册" },
    diary: { eyebrow: "一句话也可以", title: "双人日记" },
    message: { eyebrow: "今天想说", title: "留言板" },
    map: { eyebrow: "去过和想去的地方", title: "城市记录" }
  },

  // 故事详情页文案。所有按钮、标签都可以在这里改。
  storyDetail: {
    backLabel: "回到生活记录",
    openLabel: "翻开这一天",
    dateLabel: "日期",
    cityLabel: "城市",
    timeLabel: "时间",
    placeLabel: "地点",
    weatherLabel: "天气",
    musicLabel: "那天像这首歌",
    photoLabel: "那天留下来的照片",
    notFoundTitle: "这一天暂时没有记录",
    notFoundDescription: "可能还没写进 data/site.ts，也可能只是我们还在慢慢想起它。",
    notFoundBackLabel: "回首页"
  },

  // 私密密码页。
  gate: {
    eyebrow: "私人页面",
    title: "这是我们的小地方",
    description: "输入属于两个人的密码，看看这些被认真留下来的日常。",
    placeholder: "输入访问密码",
    submitLabel: "进入",
    error: "密码不对，再想想那个特别的数字。"
  },

  // 相册相关文案。
  album: {
    cloudTitle: "最近想洗出来的几张",
    cloudDescription: "照片先放在这里，等以后接上云端相册，也还是按同一份内容慢慢更新。",
    cloudButton: "挑几张新的",
    emptySlotTitle: "还空着",
    emptySlotHint: "留给下一次出门",
    emptySlotDateLabel: "以后",
    liveLabel: "轻微动态",
    closeLabel: "关闭照片",
    previousLabel: "上一页",
    nextLabel: "下一页"
  },

  // 双人日记输入区。
  diary: {
    authors: ["左边的人", "右边的人"],
    placeholder: "写下今天很小但想记住的一件事",
    button: "写进日记"
  },

  // 留言板输入区和默认留言。
  messageBoard: {
    placeholder: "留一句今天想说的话",
    sendLabel: "发送留言",
    justNowLabel: "刚刚",
    defaultNotes: [
      { id: "1", text: "今天也想把所有好看的云都拍给你。", date: "5月18日" },
      { id: "2", text: "下次见面要记得拥抱久一点。", date: "5月20日" }
    ]
  },

  // 纪念日板块文案。
  reminders: {
    eyebrow: "纪念日",
    title: "接下来想记住的日子",
    dayUnit: "天"
  },

  // 愿望清单板块文案。
  wishlist: {
    eyebrow: "以后一起做",
    title: "愿望清单",
    doneLabel: "完成"
  },

  // 城市地图文案。
  map: {
    note: "地图不是为了打卡很多地方，而是记住我们在哪些城市慢慢生活过。"
  },

  // 翻页相册文案。
  albumBook: {
    description: "有些照片不需要很完美，只要一看到，就能想起那天的天气和我们说过的话。"
  },

  // 音乐播放器。换音乐时改 src。
  player: {
    title: "夏天傍晚的歌",
    src: "/audio/soft-night.wav",
    volumeLabel: "音量",
    playLabel: "播放音乐",
    pauseLabel: "暂停音乐"
  },

  loading: {
    text: "正在翻开我们的生活记录"
  },

  footer: {
    text: "慢慢记录，慢慢生活。",
    contact: "联系方式可以在 data/site.ts 里修改"
  }
};

/**
 * 时间轴
 *
 * 新增一条故事：
 * 复制一个 { date, title, image, text }，粘贴到数组里。
 *
 * date 建议使用 "YYYY.MM"，例如 "2025.03"。
 * 页面会根据 date 自动排序。
 */
export const story = [
  {
    slug: "late-night-walk",
    date: "2024.05",
    city: "香港",
    time: "晚上十点以后",
    place: "香港 / 便利店门口到海边那条路",
    weather: "晴，夜风很轻",
    music: "很小声的夏天傍晚",
    meta: "香港 / 晚上十点 / 便利店门口",
    title: "第一次一起散步到很晚",
    image: "/images/story-01.jpg",
    text: "买完汽水以后没有马上回家，就沿着路灯一直走。你说这条路好像没有尽头，我当时偷偷希望它真的长一点。",
    detailText: "那天其实没有发生什么特别大的事情。我们只是站在便利店门口，把还冒着冷气的汽水打开，然后慢慢往前走。路边有一点潮湿的味道，车灯从身后经过的时候，你的影子会短短地落到我旁边。我记得你说，晚一点回去也没关系。后来很多次散步，我都会想起那句话，好像从那天开始，我们就学会了把普通晚上过得很长。"
  },
  {
    slug: "summer-seaside",
    date: "2024.08",
    city: "厦门",
    time: "下午快要变成傍晚",
    place: "海边台阶",
    weather: "蓝色傍晚，风很大",
    music: "有海浪声的慢歌",
    meta: "海边 / 蓝色傍晚 / 风很大",
    title: "夏天的海边",
    image: "/images/story-02.jpg",
    text: "拖鞋里进了很多沙，照片也有点糊。你一直按着衣角，我一直笑，后来我们坐在台阶上把一瓶水分着喝完。",
    detailText: "海风把所有声音都吹得有点远。照片里看不出来，当时你的头发一直被吹乱，拖鞋里也全是沙。我们没有急着去下一个地方，就坐在台阶上，看天一点一点暗下来。那瓶水喝到最后已经不冰了，但我们还是分着喝完。后来每次看到浅蓝色的傍晚，我都会想起你一直按着衣角的样子。"
  },
  {
    slug: "winter-drink",
    date: "2024.12",
    city: "上海",
    time: "下午四点半",
    place: "靠窗的座位",
    weather: "冬天，玻璃上有一点雾气",
    music: "很安静的室内歌",
    meta: "冬天 / 靠窗座位 / 热饮放凉了",
    title: "冬天里的一杯热饮",
    image: "/images/story-03.jpg",
    text: "我们在靠窗的位置坐了很久，热饮放到不烫才想起来喝。聊了明年的旅行，也聊晚上吃什么，普通得很安心。",
    detailText: "那家店的窗户正对着一条不太热闹的街。我们坐下的时候饮料还很烫，后来聊着聊着就凉了。你把杯套转来转去，说冬天适合慢一点。我们没有说什么很重要的话，只是聊明年想去哪里、晚上吃什么、哪部电影还没看。现在想起来，安心大概就是这样，不需要被特别记录，但值得被留下。"
  },
  {
    slug: "small-trip",
    date: "2025.03",
    city: "陌生城市",
    time: "周六早上",
    place: "陌生城市的街口",
    weather: "多云，空气里有早点的味道",
    music: "列车上适合听的歌",
    meta: "临时买票 / 周末 / 行李很轻",
    title: "临时决定的小旅行",
    image: "/images/story-04.jpg",
    text: "没有做太多攻略，只订了车票。最喜欢的不是景点，是我们在陌生街口站着查路线，又因为路边小店太香临时改变计划。",
    detailText: "我们出发得很突然，行李也很轻。到的时候手机还有一半电，路线查到一半，就被街边小店的味道打断了。那天很多计划都没有按原来的来，但反而记得更清楚。记得你站在路口看地图，记得我们为了买一杯热豆浆多走了两条街，也记得回程车窗外慢慢变暗的天。"
  }
];

// 时间轴自动排序结果。组件读取这个，不需要手动改。
export const timeline = [...story].sort((a, b) => a.date.localeCompare(b.date));

/**
 * 相册
 *
 * src：图片路径。
 * title：照片标题。
 * ratio：照片比例，常用 "3/4"、"4/3"、"1/1"、"16/10"。
 * live：是否开启轻微动态效果，true 开启，false 关闭。
 */
export const photos = [
  { src: "/images/photo-01.jpg", title: "树影落在肩上", date: "2024.06", place: "小路边", note: "走到一半停下来拍的，你说这张像夏天。", ratio: "3/4", live: true },
  { src: "/images/photo-02.jpg", title: "海边的下午", date: "2024.08", place: "海边", note: "风很大，笑声也很大。", ratio: "4/3", live: false },
  { src: "/images/photo-03.jpg", title: "雨后散步", date: "2024.09", place: "回家路上", note: "鞋子湿了，但我们谁都没想打车。", ratio: "2/3", live: true },
  { src: "/images/photo-04.jpg", title: "车站前的风", date: "2024.11", place: "车站", note: "那天赶车有点狼狈，后来反而一直记得。", ratio: "5/4", live: false },
  { src: "/images/photo-05.jpg", title: "傍晚的汽水", date: "2025.01", place: "便利店", note: "冰柜灯亮起来的时候，夏天好像提前到了。", ratio: "3/2", live: true },
  { src: "/images/photo-06.jpg", title: "回家的列车", date: "2025.02", place: "靠窗座位", note: "你睡着了，我拍了窗外很慢的云。", ratio: "3/4", live: false },
  { src: "/images/photo-07.jpg", title: "周末的阳光", date: "2025.04", place: "房间里", note: "没有出门的一天，也很值得留下。", ratio: "4/5", live: true },
  { src: "/images/photo-08.jpg", title: "一起吃过的晚饭", date: "2025.05", place: "街角小店", note: "我们后来去了很多城市，但还是会想起这顿饭。", ratio: "16/10", live: false }
];

/**
 * 相册空位
 *
 * 用来给未来照片预留位置，让相册看起来像还在继续生长。
 * 想减少空位就删掉几行，想增加就复制一行。
 */
export const photoPlaceholders = [
  { ratio: "3/4", note: "给下一次海边" },
  { ratio: "4/5", note: "给一张路灯下的背影" },
  { ratio: "1/1", note: "给没有计划的周末" },
  { ratio: "16/10", note: "给以后一起看的晚霞" }
];

/**
 * 生活碎片
 *
 * 这里放不一定有大事件、但很像“我们”的小瞬间。
 * time：发生的大概时间，可以写日期、季节、天气。
 * place：地点，可以很具体，也可以只写“回家路上”。
 * text：一句真正想记住的话。
 */
export const lifeFragments = [
  { time: "周二 18:42", place: "地铁口", text: "你把耳机分给我一只，歌刚好唱到最轻的那句。" },
  { time: "下过雨的晚上", place: "回家路上", text: "路灯照在积水里，我们绕开水坑，又故意踩进很浅的那一个。" },
  { time: "夏天快结束", place: "便利店门口", text: "汽水开盖的时候冒了一点气，你说像这个夏天在偷偷叹气。" },
  { time: "没有安排的周末", place: "房间里", text: "窗帘被风吹起来，阳光落到桌角，我们谁都没有急着出门。" },
  { time: "凌晨 00:16", place: "聊天框", text: "本来只是说晚安，后来又多聊了二十分钟今天看到的云。" }
];

/**
 * 时间感片段
 *
 * 用来让页面更像长期打开过的纪念册，而不是一次性设计稿。
 * season：季节或月份。
 * weather：天气和空气感。
 * city：城市或具体位置。
 * line：一句生活记录。
 */
export const timeAtmosphere = [
  { season: "初夏", weather: "晴，傍晚风很软", city: "香港", line: "楼下水果店把西瓜摆到门口，我们路过的时候买了一小盒。" },
  { season: "雨后", weather: "地面还有水汽", city: "回家路上", line: "公交站牌下面有一点点风，你把伞收起来，又重新打开。" },
  { season: "周末", weather: "房间里有阳光", city: "窗边", line: "没有出门，也没有计划，只是把歌放得很小声。" }
];

/**
 * 愿望清单
 * 每一行就是一个愿望。
 */
export const wishes = [
  "在海边看一次很慢的日出",
  "一起去一个没有赶行程的小岛",
  "拍一卷真正的胶片",
  "在陌生城市吃路边小店",
  "每年写一封给未来的信",
  "把房间布置成有植物和阳光的样子"
];

/**
 * 纪念日
 *
 * date 必须使用 YYYY-MM-DD，例如 "2026-05-20"。
 */
export const anniversaries = [
  { title: "恋爱纪念日", date: "2026-05-20", note: "不用太隆重，认真吃一顿饭就很好" },
  { title: "第一次一起旅行", date: "2026-08-16", note: "想再回到那个有海风的下午" },
  { title: "冬天约会日", date: "2026-12-24", note: "热饮、电影、慢慢走回家" }
];

/**
 * 城市记录
 *
 * x 和 y 是地图上的位置百分比：
 * x 越大越靠右，y 越大越靠下。
 */
export const trips = [
  { city: "香港", x: 73, y: 69, caption: "坐渡轮的时候，风把头发吹得很乱" },
  { city: "厦门", x: 66, y: 61, caption: "海边、白墙、慢下来的下午" },
  { city: "上海", x: 70, y: 48, caption: "走过很多路，也拍了很多背影" },
  { city: "东京", x: 82, y: 41, caption: "想去便利店买夜宵，再慢慢散步回住处" }
];

/**
 * 双人日记默认内容
 *
 * 页面里新写的日记会保存在浏览器本地。
 * 这里控制首次打开时显示的默认内容。
 */
export const diarySeeds = [
  { by: "左边的人", text: "今天看到一片很像夏天的云，第一反应还是想拍给你。", date: "2026.05.12" },
  { by: "右边的人", text: "路过那家甜品店，已经记下她下次想吃的口味。", date: "2026.05.18" }
];

/**
 * 前台和后台共用的完整内容对象
 *
 * Admin 本地后台会以这个对象作为默认值，修改后保存到浏览器 localStorage。
 * 未来接数据库时，可以保持这个结构不变，只替换读取/保存来源。
 */
export const siteContent = {
  contentSource,
  couple,
  siteText,
  story,
  photos,
  photoPlaceholders,
  lifeFragments,
  timeAtmosphere,
  wishes,
  anniversaries,
  trips,
  diarySeeds
};
