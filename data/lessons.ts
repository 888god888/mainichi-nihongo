export type Word = {
  japanese: string;
  reading: string;
  meaning: string;
};

export type Grammar = {
  title: string;
  meaning: string;
  pattern: string;
  example: string;
  reading: string;
  translation: string;
};

export type Lesson = {
  words: Word[];
  grammar: Grammar[];
};

// 第一階段先提供七天 N5 教材。資料與介面分離，後續可直接擴充 N4～N1。
export const n5Lessons: Lesson[] = [
  {
    words: [
      { japanese: "日", reading: "ひ／にち", meaning: "太陽、日子" },
      { japanese: "月", reading: "つき／げつ", meaning: "月亮、月份" },
      { japanese: "火", reading: "ひ／か", meaning: "火" },
      { japanese: "水", reading: "みず／すい", meaning: "水" },
      { japanese: "木", reading: "き／もく", meaning: "樹木" },
      { japanese: "金", reading: "かね／きん", meaning: "金錢、黃金" },
      { japanese: "土", reading: "つち／ど", meaning: "土、土地" },
      { japanese: "山", reading: "やま", meaning: "山" },
      { japanese: "川", reading: "かわ", meaning: "河川" },
      { japanese: "田", reading: "た", meaning: "田地" },
    ],
    grammar: [
      { title: "A は B です", meaning: "A 是 B", pattern: "名詞＋は＋名詞＋です", example: "私（わたし）は学生（がくせい）です。", reading: "わたし は がくせい です", translation: "我是學生。" },
      { title: "～か", meaning: "表示疑問：……嗎？", pattern: "句子＋か", example: "田中（たなか）さんは先生（せんせい）ですか。", reading: "たなかさん は せんせい ですか", translation: "田中先生是老師嗎？" },
      { title: "A の B", meaning: "A 的 B", pattern: "名詞＋の＋名詞", example: "これは私（わたし）の本（ほん）です。", reading: "これ は わたし の ほん です", translation: "這是我的書。" },
    ],
  },
  {
    words: [
      { japanese: "人", reading: "ひと", meaning: "人" },
      { japanese: "女", reading: "おんな", meaning: "女性" },
      { japanese: "男", reading: "おとこ", meaning: "男性" },
      { japanese: "子供", reading: "こども", meaning: "小孩" },
      { japanese: "学生", reading: "がくせい", meaning: "學生" },
      { japanese: "先生", reading: "せんせい", meaning: "老師" },
      { japanese: "会社員", reading: "かいしゃいん", meaning: "公司職員" },
      { japanese: "日本人", reading: "にほんじん", meaning: "日本人" },
      { japanese: "台湾人", reading: "たいわんじん", meaning: "台灣人" },
      { japanese: "友達", reading: "ともだち", meaning: "朋友" },
    ],
    grammar: [
      { title: "～も", meaning: "也、同樣", pattern: "名詞＋も", example: "私（わたし）も台湾人（たいわんじん）です。", reading: "わたし も たいわんじん です", translation: "我也是台灣人。" },
      { title: "～じゃありません", meaning: "不是……", pattern: "名詞＋じゃありません", example: "私（わたし）は先生（せんせい）じゃありません。", reading: "わたし は せんせい じゃ ありません", translation: "我不是老師。" },
      { title: "だれ／どなた", meaning: "誰／哪一位", pattern: "だれ（一般）・どなた（禮貌）", example: "あの人（ひと）はだれですか。", reading: "あの ひと は だれ ですか", translation: "那個人是誰？" },
    ],
  },
  {
    words: [
      { japanese: "食べる", reading: "たべる", meaning: "吃" },
      { japanese: "飲む", reading: "のむ", meaning: "喝" },
      { japanese: "見る", reading: "みる", meaning: "看" },
      { japanese: "聞く", reading: "きく", meaning: "聽、詢問" },
      { japanese: "読む", reading: "よむ", meaning: "閱讀" },
      { japanese: "書く", reading: "かく", meaning: "寫" },
      { japanese: "話す", reading: "はなす", meaning: "說話" },
      { japanese: "行く", reading: "いく", meaning: "去" },
      { japanese: "来る", reading: "くる", meaning: "來" },
      { japanese: "帰る", reading: "かえる", meaning: "回去、回家" },
    ],
    grammar: [
      { title: "～を", meaning: "標示動作的對象", pattern: "名詞＋を＋動詞", example: "本（ほん）を読（よ）みます。", reading: "ほん を よみます", translation: "讀書。" },
      { title: "～で", meaning: "在某場所做動作", pattern: "場所＋で＋動詞", example: "図書館（としょかん）で勉強（べんきょう）します。", reading: "としょかん で べんきょう します", translation: "在圖書館念書。" },
      { title: "～へ／に", meaning: "往某地、到某地", pattern: "場所＋へ／に＋行きます", example: "会社（かいしゃ）へ行（い）きます。", reading: "かいしゃ へ いきます", translation: "去公司。" },
    ],
  },
  {
    words: [
      { japanese: "今日", reading: "きょう", meaning: "今天" },
      { japanese: "明日", reading: "あした", meaning: "明天" },
      { japanese: "昨日", reading: "きのう", meaning: "昨天" },
      { japanese: "朝", reading: "あさ", meaning: "早上" },
      { japanese: "昼", reading: "ひる", meaning: "中午、白天" },
      { japanese: "夜", reading: "よる", meaning: "晚上" },
      { japanese: "今", reading: "いま", meaning: "現在" },
      { japanese: "時", reading: "じ", meaning: "點鐘" },
      { japanese: "分", reading: "ふん／ぷん", meaning: "分鐘" },
      { japanese: "半", reading: "はん", meaning: "一半、半點" },
    ],
    grammar: [
      { title: "～ます", meaning: "動詞的禮貌現在／未來式", pattern: "動詞ます形", example: "毎朝（まいあさ）七時（しちじ）に起（お）きます。", reading: "まいあさ しちじ に おきます", translation: "每天早上七點起床。" },
      { title: "～ません", meaning: "禮貌否定：不……", pattern: "動詞ます形－ます＋ません", example: "今日（きょう）は働（はたら）きません。", reading: "きょう は はたらきません", translation: "今天不工作。" },
      { title: "～ました", meaning: "禮貌過去式：做了……", pattern: "動詞ます形－ます＋ました", example: "昨日（きのう）、映画（えいが）を見（み）ました。", reading: "きのう えいが を みました", translation: "昨天看了電影。" },
    ],
  },
  {
    words: [
      { japanese: "大きい", reading: "おおきい", meaning: "大的" },
      { japanese: "小さい", reading: "ちいさい", meaning: "小的" },
      { japanese: "新しい", reading: "あたらしい", meaning: "新的" },
      { japanese: "古い", reading: "ふるい", meaning: "舊的" },
      { japanese: "高い", reading: "たかい", meaning: "高的、昂貴的" },
      { japanese: "安い", reading: "やすい", meaning: "便宜的" },
      { japanese: "良い", reading: "いい／よい", meaning: "好的" },
      { japanese: "悪い", reading: "わるい", meaning: "不好的" },
      { japanese: "静か", reading: "しずか", meaning: "安靜的" },
      { japanese: "元気", reading: "げんき", meaning: "有精神、健康" },
    ],
    grammar: [
      { title: "い形容詞＋です", meaning: "……是（某種性質）", pattern: "い形容詞＋です", example: "この本（ほん）は新（あたら）しいです。", reading: "この ほん は あたらしい です", translation: "這本書是新的。" },
      { title: "～くないです", meaning: "い形容詞的否定", pattern: "い形容詞－い＋くないです", example: "この料理（りょうり）は辛（から）くないです。", reading: "この りょうり は からくない です", translation: "這道菜不辣。" },
      { title: "な形容詞＋な＋名詞", meaning: "用な形容詞修飾名詞", pattern: "な形容詞＋な＋名詞", example: "ここは静（しず）かな町（まち）です。", reading: "ここ は しずかな まち です", translation: "這裡是安靜的城鎮。" },
    ],
  },
  {
    words: [
      { japanese: "学校", reading: "がっこう", meaning: "學校" },
      { japanese: "会社", reading: "かいしゃ", meaning: "公司" },
      { japanese: "駅", reading: "えき", meaning: "車站" },
      { japanese: "病院", reading: "びょういん", meaning: "醫院" },
      { japanese: "銀行", reading: "ぎんこう", meaning: "銀行" },
      { japanese: "店", reading: "みせ", meaning: "商店" },
      { japanese: "家", reading: "いえ", meaning: "家、房子" },
      { japanese: "部屋", reading: "へや", meaning: "房間" },
      { japanese: "入口", reading: "いりぐち", meaning: "入口" },
      { japanese: "出口", reading: "でぐち", meaning: "出口" },
    ],
    grammar: [
      { title: "ここ／そこ／あそこ", meaning: "這裡／那裡／更遠的那裡", pattern: "場所指示詞", example: "銀行（ぎんこう）はあそこです。", reading: "ぎんこう は あそこ です", translation: "銀行在那裡。" },
      { title: "～があります", meaning: "有……（無生命）", pattern: "場所＋に＋物＋があります", example: "机（つくえ）の上（うえ）に本（ほん）があります。", reading: "つくえ の うえ に ほん が あります", translation: "桌上有一本書。" },
      { title: "～がいます", meaning: "有……（人或動物）", pattern: "場所＋に＋人／動物＋がいます", example: "部屋（へや）に猫（ねこ）がいます。", reading: "へや に ねこ が います", translation: "房間裡有貓。" },
    ],
  },
  {
    words: [
      { japanese: "一つ", reading: "ひとつ", meaning: "一個" },
      { japanese: "二つ", reading: "ふたつ", meaning: "兩個" },
      { japanese: "三つ", reading: "みっつ", meaning: "三個" },
      { japanese: "一人", reading: "ひとり", meaning: "一個人" },
      { japanese: "二人", reading: "ふたり", meaning: "兩個人" },
      { japanese: "一枚", reading: "いちまい", meaning: "一張（扁平物）" },
      { japanese: "一本", reading: "いっぽん", meaning: "一支（細長物）" },
      { japanese: "一台", reading: "いちだい", meaning: "一台（機械、車）" },
      { japanese: "何人", reading: "なんにん", meaning: "幾個人" },
      { japanese: "全部", reading: "ぜんぶ", meaning: "全部" },
    ],
    grammar: [
      { title: "～てください", meaning: "請做……", pattern: "動詞て形＋ください", example: "ここに名前（なまえ）を書（か）いてください。", reading: "ここ に なまえ を かいて ください", translation: "請在這裡寫名字。" },
      { title: "～てもいいです", meaning: "可以做……", pattern: "動詞て形＋もいいです", example: "写真（しゃしん）を撮（と）ってもいいです。", reading: "しゃしん を とっても いい です", translation: "可以拍照。" },
      { title: "～てはいけません", meaning: "不可以做……", pattern: "動詞て形＋はいけません", example: "ここで煙草（たばこ）を吸（す）ってはいけません。", reading: "ここ で たばこ を すって は いけません", translation: "這裡不可以抽菸。" },
    ],
  },
];

