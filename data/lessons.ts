import { n5Vocab, type VocabEntry } from "./vocabulary";

export type Word = {
  japanese: string;
  reading: string;
  meaning: string;
  reference?: { title: string; url: string };
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

const MARUGOTO_REFERENCE = {
  title: "國際交流基金《まるごと》入門 A1 詞彙表",
  url: "https://marugoto.jpf.go.jp/assets/docs/download/starter_a/MarugotoStarterWordbook_EN.pdf",
};

const word = (japanese: string, reading: string, meaning: string): Word => ({
  japanese,
  reading,
  meaning,
  reference: MARUGOTO_REFERENCE,
});

// 人工編排的七天入門教材，並非官方 JLPT 題庫。
// 每題僅有一組讀音與對應詞義；reference 僅標示實際核對過的來源。
// 其餘詞條沿用原編排，不能宣稱全庫已經字典審核。
const baseLessons: Lesson[] = [
  {
    words: [
      { japanese: "日曜日", reading: "にちようび", meaning: "星期日", reference: { title: "國際交流基金《まるごと》入門詞彙表", url: "https://marugoto.jpf.go.jp/assets/docs/download/starter_a/MarugotoStarterWordbook_EN.pdf#page=76" } },
      { japanese: "月", reading: "つき", meaning: "月亮", reference: { title: "Wiktionary 日文詞條", url: "https://en.wiktionary.org/wiki/月#Japanese" } },
      { japanese: "火", reading: "ひ", meaning: "火", reference: { title: "Wiktionary 日文詞條", url: "https://en.wiktionary.org/wiki/火#Japanese" } },
      { japanese: "水", reading: "みず", meaning: "水", reference: { title: "Wiktionary 日文詞條", url: "https://en.wiktionary.org/wiki/水#Japanese" } },
      { japanese: "木", reading: "き", meaning: "樹木", reference: { title: "Wiktionary 日文詞條", url: "https://en.wiktionary.org/wiki/木#Japanese" } },
      { japanese: "お金", reading: "おかね", meaning: "金錢", reference: { title: "國際交流基金《まるごと》入門詞彙表", url: "https://marugoto.jpf.go.jp/assets/docs/download/starter_a/MarugotoStarterWordbook_EN.pdf#page=74" } },
      { japanese: "土", reading: "つち", meaning: "土、土壤", reference: { title: "Wiktionary 日文詞條", url: "https://en.wiktionary.org/wiki/土#Japanese" } },
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
      { japanese: "三時", reading: "さんじ", meaning: "三點鐘", reference: { title: "Wiktionary 日文詞條", url: "https://en.wiktionary.org/wiki/三時#Japanese" } },
      { japanese: "一分", reading: "いっぷん", meaning: "一分鐘", reference: { title: "Wiktionary 日文量詞表", url: "https://en.wiktionary.org/wiki/分#Japanese" } },
      { japanese: "三時半", reading: "さんじはん", meaning: "三點半", reference: { title: "國際交流基金《まるごと》時刻與半點用法", url: "https://marugoto.jpf.go.jp/assets/docs/download/starter_a/MarugotoStarterWordbook_EN.pdf#page=78" } },
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
      { japanese: "良い", reading: "よい", meaning: "好的", reference: { title: "Wiktionary 日文詞條", url: "https://en.wiktionary.org/wiki/良い#Japanese" } },
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

// 第 8～30 課：依國際交流基金《まるごと》Starter A1 的生活主題擴充。
// 所有語音一律朗讀 reading，避免行動裝置自行猜漢字讀音。
const additionalLessons: Lesson[] = [
  {
    words: [
      word("椅子", "いす", "椅子"), word("机", "つくえ", "桌子"), word("鉛筆", "えんぴつ", "鉛筆"), word("ペン", "ぺん", "筆"), word("消しゴム", "けしごむ", "橡皮擦"),
      word("ノート", "のーと", "筆記本"), word("辞書", "じしょ", "字典"), word("携帯電話", "けいたいでんわ", "手機"), word("教科書", "きょうかしょ", "教科書"), word("コンピューター", "こんぴゅーたー", "電腦"),
    ],
    grammar: [
      { title: "これ／それ／あれ", meaning: "這個／那個／更遠的那個", pattern: "指示詞＋です", example: "これは辞書（じしょ）です。", reading: "これ は じしょ です", translation: "這是字典。" },
      { title: "この／その／あの", meaning: "這個／那個／更遠的那個（接名詞）", pattern: "この／その／あの＋名詞", example: "その本（ほん）は私（わたし）のです。", reading: "その ほん は わたし の です", translation: "那本書是我的。" },
      { title: "どれ／どの", meaning: "哪一個／哪個……", pattern: "どれ／どの＋名詞", example: "どのペンですか。", reading: "どの ぺん ですか", translation: "是哪一支筆？" },
    ],
  },
  {
    words: [
      word("父", "ちち", "父親（稱自己的）"), word("母", "はは", "母親（稱自己的）"), word("兄", "あに", "哥哥（稱自己的）"), word("姉", "あね", "姊姊（稱自己的）"), word("弟", "おとうと", "弟弟"),
      word("妹", "いもうと", "妹妹"), word("夫", "おっと", "丈夫（稱自己的）"), word("妻", "つま", "妻子（稱自己的）"), word("両親", "りょうしん", "父母、雙親"), word("家族", "かぞく", "家人、家庭"),
    ],
    grammar: [
      { title: "A と B", meaning: "A 和 B", pattern: "名詞＋と＋名詞", example: "父（ちち）と母（はは）は台湾（たいわん）にいます。", reading: "ちち と はは は たいわん に います", translation: "父親和母親在台灣。" },
      { title: "A や B", meaning: "A、B 等（列舉部分項目）", pattern: "名詞＋や＋名詞", example: "兄（あに）や姉（あね）がいます。", reading: "あに や あね が います", translation: "我有哥哥、姊姊等家人。" },
      { title: "～と一緒に", meaning: "和……一起", pattern: "人＋と一緒に＋動詞", example: "家族（かぞく）と一緒（いっしょ）に住（す）んでいます。", reading: "かぞく と いっしょ に すんで います", translation: "和家人住在一起。" },
    ],
  },
  {
    words: [
      word("ご飯", "ごはん", "飯、餐"), word("パン", "ぱん", "麵包"), word("肉", "にく", "肉"), word("魚", "さかな", "魚"), word("野菜", "やさい", "蔬菜"),
      word("果物", "くだもの", "水果"), word("卵", "たまご", "蛋"), word("牛乳", "ぎゅうにゅう", "牛奶"), word("お茶", "おちゃ", "茶"), word("コーヒー", "こーひー", "咖啡"),
    ],
    grammar: [
      { title: "～が好きです", meaning: "喜歡……", pattern: "名詞＋が好きです", example: "魚（さかな）が好（す）きです。", reading: "さかな が すき です", translation: "我喜歡魚。" },
      { title: "～をください", meaning: "請給我……", pattern: "名詞＋をください", example: "コーヒーを一（ひと）つください。", reading: "こーひー を ひとつ ください", translation: "請給我一杯咖啡。" },
      { title: "～はいくらですか", meaning: "……多少錢？", pattern: "名詞＋はいくらですか", example: "このパンはいくらですか。", reading: "この ぱん は いくら ですか", translation: "這個麵包多少錢？" },
    ],
  },
  {
    words: [
      word("起きる", "おきる", "起床"), word("寝る", "ねる", "睡覺"), word("働く", "はたらく", "工作"), word("勉強する", "べんきょうする", "學習"), word("買う", "かう", "購買"),
      word("会う", "あう", "見面"), word("待つ", "まつ", "等待"), word("使う", "つかう", "使用"), word("作る", "つくる", "製作"), word("休む", "やすむ", "休息、請假"),
    ],
    grammar: [
      { title: "時間＋に", meaning: "在某個時間做……", pattern: "時間＋に＋動詞", example: "七時（しちじ）に起（お）きます。", reading: "しちじ に おきます", translation: "七點起床。" },
      { title: "～から～まで", meaning: "從……到……", pattern: "時間／場所＋から＋時間／場所＋まで", example: "九時（くじ）から五時（ごじ）まで働（はたら）きます。", reading: "くじ から ごじ まで はたらきます", translation: "從九點工作到五點。" },
      { title: "～たり～たりします", meaning: "做……、做……等事情", pattern: "動詞た形＋り＋動詞た形＋りします", example: "休（やす）みの日（ひ）は本（ほん）を読（よ）んだり、映画（えいが）を見（み）たりします。", reading: "やすみ の ひ は ほん を よんだり えいが を みたり します", translation: "休假日會讀書、看電影等等。" },
    ],
  },
  {
    words: [
      word("台所", "だいどころ", "廚房"), word("玄関", "げんかん", "玄關"), word("お風呂", "おふろ", "浴室、泡澡"), word("トイレ", "といれ", "廁所"), word("窓", "まど", "窗戶"),
      word("ドア", "どあ", "門"), word("冷蔵庫", "れいぞうこ", "冰箱"), word("電話", "でんわ", "電話"), word("テレビ", "てれび", "電視"), word("時計", "とけい", "時鐘、手錶"),
    ],
    grammar: [
      { title: "場所に物があります", meaning: "某處有某物", pattern: "場所＋に＋物＋があります", example: "台所（だいどころ）に冷蔵庫（れいぞうこ）があります。", reading: "だいどころ に れいぞうこ が あります", translation: "廚房裡有冰箱。" },
      { title: "物は場所にあります", meaning: "某物在某處", pattern: "物＋は＋場所＋にあります", example: "時計（とけい）は部屋（へや）にあります。", reading: "とけい は へや に あります", translation: "時鐘在房間裡。" },
      { title: "A の位置", meaning: "A 的上、下、旁邊等位置", pattern: "名詞＋の＋位置詞", example: "机（つくえ）の上（うえ）に電話（でんわ）があります。", reading: "つくえ の うえ に でんわ が あります", translation: "桌上有電話。" },
    ],
  },
  {
    words: [
      word("上", "うえ", "上面"), word("下", "した", "下面"), word("前", "まえ", "前面"), word("後ろ", "うしろ", "後面"), word("右", "みぎ", "右邊"),
      word("左", "ひだり", "左邊"), word("中", "なか", "裡面"), word("外", "そと", "外面"), word("隣", "となり", "隔壁、旁邊"), word("近く", "ちかく", "附近"),
    ],
    grammar: [
      { title: "～にあります", meaning: "位於……", pattern: "名詞＋は＋位置＋にあります", example: "銀行（ぎんこう）は駅（えき）の隣（となり）にあります。", reading: "ぎんこう は えき の となり に あります", translation: "銀行在車站旁邊。" },
      { title: "～の右／左", meaning: "……的右邊／左邊", pattern: "名詞＋の＋右／左", example: "トイレは入口（いりぐち）の右（みぎ）です。", reading: "といれ は いりぐち の みぎ です", translation: "廁所在入口右邊。" },
      { title: "～の中／外", meaning: "……的裡面／外面", pattern: "名詞＋の＋中／外", example: "かばんの中（なか）に本（ほん）があります。", reading: "かばん の なか に ほん が あります", translation: "包包裡有書。" },
    ],
  },
  {
    words: [
      word("電車", "でんしゃ", "電車"), word("地下鉄", "ちかてつ", "地下鐵"), word("バス", "ばす", "公車"), word("車", "くるま", "汽車"), word("自転車", "じてんしゃ", "腳踏車"),
      word("飛行機", "ひこうき", "飛機"), word("船", "ふね", "船"), word("歩く", "あるく", "步行"), word("乗る", "のる", "搭乘"), word("降りる", "おりる", "下車"),
    ],
    grammar: [
      { title: "交通工具＋で", meaning: "搭乘……去", pattern: "交通工具＋で＋行きます", example: "電車（でんしゃ）で会社（かいしゃ）へ行（い）きます。", reading: "でんしゃ で かいしゃ へ いきます", translation: "搭電車去公司。" },
      { title: "～に乗ります", meaning: "搭乘……", pattern: "交通工具＋に乗ります", example: "駅（えき）でバスに乗（の）ります。", reading: "えき で ばす に のります", translation: "在車站搭公車。" },
      { title: "～を降ります", meaning: "在……下車", pattern: "交通工具＋を降ります", example: "次（つぎ）の駅（えき）で電車（でんしゃ）を降（お）ります。", reading: "つぎ の えき で でんしゃ を おります", translation: "在下一站下電車。" },
    ],
  },
  {
    words: [
      word("図書館", "としょかん", "圖書館"), word("郵便局", "ゆうびんきょく", "郵局"), word("公園", "こうえん", "公園"), word("空港", "くうこう", "機場"), word("交番", "こうばん", "派出所"),
      word("ホテル", "ほてる", "飯店"), word("レストラン", "れすとらん", "餐廳"), word("喫茶店", "きっさてん", "咖啡店"), word("映画館", "えいがかん", "電影院"), word("スーパー", "すーぱー", "超級市場"),
    ],
    grammar: [
      { title: "場所へ行きます", meaning: "去某個地方", pattern: "場所＋へ／に＋行きます", example: "図書館（としょかん）へ行（い）きます。", reading: "としょかん へ いきます", translation: "去圖書館。" },
      { title: "～ませんか", meaning: "要不要一起……？", pattern: "動詞ません形＋か", example: "一緒（いっしょ）に映画（えいが）を見（み）ませんか。", reading: "いっしょ に えいが を みませんか", translation: "要不要一起看電影？" },
      { title: "～ましょう", meaning: "一起……吧", pattern: "動詞ます形－ます＋ましょう", example: "喫茶店（きっさてん）で休（やす）みましょう。", reading: "きっさてん で やすみましょう", translation: "在咖啡店休息吧。" },
    ],
  },
  {
    words: [
      word("春", "はる", "春天"), word("夏", "なつ", "夏天"), word("秋", "あき", "秋天"), word("冬", "ふゆ", "冬天"), word("天気", "てんき", "天氣"),
      word("晴れ", "はれ", "晴天"), word("雨", "あめ", "雨"), word("雪", "ゆき", "雪"), word("暑い", "あつい", "炎熱的"), word("寒い", "さむい", "寒冷的"),
    ],
    grammar: [
      { title: "～くて", meaning: "い形容詞的連接：又……又……", pattern: "い形容詞－い＋くて", example: "夏（なつ）は暑（あつ）くて、雨（あめ）が多（おお）いです。", reading: "なつ は あつくて あめ が おおい です", translation: "夏天炎熱而且雨很多。" },
      { title: "～から", meaning: "因為……", pattern: "句子＋から", example: "寒（さむ）いですから、窓（まど）を閉（し）めます。", reading: "さむい です から まど を しめます", translation: "因為很冷，所以關窗。" },
      { title: "～でしょう", meaning: "大概會……、應該是……", pattern: "普通形＋でしょう", example: "明日（あした）は雨（あめ）でしょう。", reading: "あした は あめ でしょう", translation: "明天大概會下雨。" },
    ],
  },
  {
    words: [
      word("面白い", "おもしろい", "有趣的"), word("難しい", "むずかしい", "困難的"), word("易しい", "やさしい", "容易的"), word("忙しい", "いそがしい", "忙碌的"), word("楽しい", "たのしい", "快樂、有趣的"),
      word("美味しい", "おいしい", "好吃的"), word("早い", "はやい", "早的"), word("遅い", "おそい", "晚的、慢的"), word("明るい", "あかるい", "明亮的"), word("暗い", "くらい", "昏暗的"),
    ],
    grammar: [
      { title: "い形容詞＋かったです", meaning: "い形容詞的過去肯定", pattern: "い形容詞－い＋かったです", example: "映画（えいが）は面白（おもしろ）かったです。", reading: "えいが は おもしろかった です", translation: "電影很有趣。" },
      { title: "い形容詞＋くなかったです", meaning: "い形容詞的過去否定", pattern: "い形容詞－い＋くなかったです", example: "試験（しけん）は難（むずか）しくなかったです。", reading: "しけん は むずかしくなかった です", translation: "考試不難。" },
      { title: "な形容詞＋でした", meaning: "な形容詞的過去肯定", pattern: "な形容詞＋でした", example: "昨日（きのう）は暇（ひま）でした。", reading: "きのう は ひま でした", translation: "昨天很閒。" },
    ],
  },
  {
    words: [
      word("頭", "あたま", "頭"), word("目", "め", "眼睛"), word("耳", "みみ", "耳朵"), word("口", "くち", "嘴巴"), word("手", "て", "手"),
      word("足", "あし", "腳"), word("体", "からだ", "身體"), word("病気", "びょうき", "生病、疾病"), word("薬", "くすり", "藥"), word("痛い", "いたい", "疼痛的"),
    ],
    grammar: [
      { title: "～が痛いです", meaning: "……很痛", pattern: "身體部位＋が痛いです", example: "頭（あたま）が痛（いた）いです。", reading: "あたま が いたい です", translation: "我頭痛。" },
      { title: "～ないでください", meaning: "請不要……", pattern: "動詞ない形＋でください", example: "無理（むり）をしないでください。", reading: "むり を しないで ください", translation: "請不要勉強自己。" },
      { title: "～ほうがいいです", meaning: "最好……", pattern: "動詞た形＋ほうがいいです", example: "薬（くすり）を飲（の）んだほうがいいです。", reading: "くすり を のんだ ほう が いい です", translation: "最好吃藥。" },
    ],
  },
  {
    words: [
      word("服", "ふく", "衣服"), word("シャツ", "しゃつ", "襯衫"), word("ズボン", "ずぼん", "褲子"), word("靴", "くつ", "鞋子"), word("帽子", "ぼうし", "帽子"),
      word("赤", "あか", "紅色"), word("青", "あお", "藍色"), word("白", "しろ", "白色"), word("黒", "くろ", "黑色"), word("緑", "みどり", "綠色"),
    ],
    grammar: [
      { title: "形容詞＋名詞", meaning: "用形容詞修飾名詞", pattern: "い形容詞＋名詞／な形容詞＋な＋名詞", example: "白（しろ）いシャツを買（か）いました。", reading: "しろい しゃつ を かいました", translation: "買了白色襯衫。" },
      { title: "色＋の＋名詞", meaning: "某種顏色的……", pattern: "色名＋の＋名詞", example: "黒（くろ）の靴（くつ）です。", reading: "くろ の くつ です", translation: "是黑色的鞋子。" },
      { title: "～を着ています", meaning: "正穿著……", pattern: "衣物＋を着ています", example: "青（あお）い服（ふく）を着（き）ています。", reading: "あおい ふく を きて います", translation: "正穿著藍色衣服。" },
    ],
  },
  {
    words: [
      word("値段", "ねだん", "價格"), word("円", "えん", "日圓"), word("買い物", "かいもの", "購物"), word("店員", "てんいん", "店員"), word("お釣り", "おつり", "找零"),
      word("袋", "ふくろ", "袋子"), word("財布", "さいふ", "錢包"), word("百", "ひゃく", "一百"), word("千", "せん", "一千"), word("万", "まん", "一萬"),
    ],
    grammar: [
      { title: "～がほしいです", meaning: "想要……", pattern: "名詞＋がほしいです", example: "新（あたら）しい財布（さいふ）がほしいです。", reading: "あたらしい さいふ が ほしい です", translation: "我想要新錢包。" },
      { title: "～たいです", meaning: "想做……", pattern: "動詞ます形－ます＋たいです", example: "服（ふく）を買（か）いたいです。", reading: "ふく を かいたい です", translation: "我想買衣服。" },
      { title: "～だけ", meaning: "只有……", pattern: "名詞／數量＋だけ", example: "袋（ふくろ）は一（ひと）つだけください。", reading: "ふくろ は ひとつ だけ ください", translation: "袋子只要一個。" },
    ],
  },
  {
    words: [
      word("毎日", "まいにち", "每天"), word("毎週", "まいしゅう", "每週"), word("毎月", "まいつき", "每月"), word("毎年", "まいとし", "每年"), word("午前", "ごぜん", "上午"),
      word("午後", "ごご", "下午"), word("先週", "せんしゅう", "上週"), word("来週", "らいしゅう", "下週"), word("先月", "せんげつ", "上個月"), word("来月", "らいげつ", "下個月"),
    ],
    grammar: [
      { title: "頻率＋動詞", meaning: "表示動作頻率", pattern: "いつも／よく／ときどき＋動詞", example: "毎日（まいにち）よく日本語（にほんご）を聞（き）きます。", reading: "まいにち よく にほんご を ききます", translation: "每天常聽日文。" },
      { title: "～ごろ", meaning: "大約某個時間點", pattern: "時間＋ごろ", example: "毎日（まいにち）十一時（じゅういちじ）ごろ寝（ね）ます。", reading: "まいにち じゅういちじ ごろ ねます", translation: "每天大約十一點睡。" },
      { title: "～くらい", meaning: "大約某個數量或時長", pattern: "數量／時間＋くらい", example: "一時間（いちじかん）くらい勉強（べんきょう）します。", reading: "いちじかん くらい べんきょう します", translation: "大約學習一小時。" },
    ],
  },
  {
    words: [
      word("仕事", "しごと", "工作"), word("会議", "かいぎ", "會議"), word("事務所", "じむしょ", "辦公室"), word("宿題", "しゅくだい", "作業"), word("試験", "しけん", "考試"),
      word("質問", "しつもん", "問題、提問"), word("答え", "こたえ", "答案"), word("練習", "れんしゅう", "練習"), word("休み", "やすみ", "休假、休息"), word("名前", "なまえ", "名字"),
    ],
    grammar: [
      { title: "～ことができます", meaning: "能夠做……", pattern: "動詞辭書形＋ことができます", example: "日本語（にほんご）を話（はな）すことができます。", reading: "にほんご を はなす こと が できます", translation: "會說日文。" },
      { title: "～前に", meaning: "在……之前", pattern: "動詞辭書形／名詞の＋前に", example: "試験（しけん）の前（まえ）に勉強（べんきょう）します。", reading: "しけん の まえ に べんきょう します", translation: "考試前念書。" },
      { title: "～後で", meaning: "在……之後", pattern: "動詞た形／名詞の＋後で", example: "会議（かいぎ）の後（あと）で質問（しつもん）します。", reading: "かいぎ の あと で しつもん します", translation: "會議後提問。" },
    ],
  },
  {
    words: [
      word("音楽", "おんがく", "音樂"), word("映画", "えいが", "電影"), word("写真", "しゃしん", "照片、攝影"), word("旅行", "りょこう", "旅行"), word("料理", "りょうり", "料理"),
      word("歌", "うた", "歌"), word("絵", "え", "圖畫"), word("スポーツ", "すぽーつ", "運動"), word("散歩", "さんぽ", "散步"), word("ゲーム", "げーむ", "遊戲"),
    ],
    grammar: [
      { title: "～のが好きです", meaning: "喜歡做……", pattern: "動詞辭書形＋のが好きです", example: "写真（しゃしん）を撮（と）るのが好（す）きです。", reading: "しゃしん を とる の が すき です", translation: "我喜歡拍照。" },
      { title: "～こと", meaning: "把動作名詞化", pattern: "動詞辭書形＋こと", example: "趣味（しゅみ）は映画（えいが）を見（み）ることです。", reading: "しゅみ は えいが を みる こと です", translation: "興趣是看電影。" },
      { title: "～に行きます", meaning: "去做……", pattern: "動詞ます形－ます＋に行きます", example: "公園（こうえん）へ散歩（さんぽ）しに行（い）きます。", reading: "こうえん へ さんぽ しに いきます", translation: "去公園散步。" },
    ],
  },
  {
    words: [
      word("犬", "いぬ", "狗"), word("猫", "ねこ", "貓"), word("鳥", "とり", "鳥"), word("馬", "うま", "馬"), word("花", "はな", "花"),
      word("空", "そら", "天空"), word("海", "うみ", "海"), word("池", "いけ", "池塘"), word("森", "もり", "森林"), word("島", "しま", "島"),
    ],
    grammar: [
      { title: "～を飼っています", meaning: "養著某種動物", pattern: "動物＋を飼っています", example: "家（いえ）で猫（ねこ）を飼（か）っています。", reading: "いえ で ねこ を かって います", translation: "我在家裡養貓。" },
      { title: "～が大好きです", meaning: "非常喜歡……", pattern: "名詞＋が大好きです", example: "犬（いぬ）が大好（だいす）きです。", reading: "いぬ が だいすき です", translation: "我非常喜歡狗。" },
      { title: "～も～も", meaning: "……和……都……", pattern: "名詞＋も＋名詞＋も", example: "海（うみ）も山（やま）も好（す）きです。", reading: "うみ も やま も すき です", translation: "海和山我都喜歡。" },
    ],
  },
  {
    words: [
      word("開ける", "あける", "打開"), word("閉める", "しめる", "關閉"), word("入る", "はいる", "進入"), word("出る", "でる", "出去、離開"), word("立つ", "たつ", "站立"),
      word("座る", "すわる", "坐下"), word("持つ", "もつ", "拿、持有"), word("置く", "おく", "放置"), word("教える", "おしえる", "教、告訴"), word("習う", "ならう", "學習、跟人學"),
    ],
    grammar: [
      { title: "～て、～", meaning: "依序做兩個動作", pattern: "動詞て形＋、＋動詞", example: "ドアを開（あ）けて、部屋（へや）に入（はい）ります。", reading: "どあ を あけて へや に はいります", translation: "打開門後進房間。" },
      { title: "～ています", meaning: "正在做……或持續的狀態", pattern: "動詞て形＋います", example: "椅子（いす）に座（すわ）っています。", reading: "いす に すわって います", translation: "正坐在椅子上。" },
      { title: "～てから", meaning: "做完……之後再……", pattern: "動詞て形＋から", example: "手（て）を洗（あら）ってから、ご飯（はん）を食（た）べます。", reading: "て を あらって から ごはん を たべます", translation: "洗手後吃飯。" },
    ],
  },
  {
    words: [
      word("電話する", "でんわする", "打電話"), word("送る", "おくる", "寄送、傳送"), word("借りる", "かりる", "借入"), word("貸す", "かす", "借出"), word("呼ぶ", "よぶ", "呼叫"),
      word("答える", "こたえる", "回答"), word("分かる", "わかる", "明白、了解"), word("覚える", "おぼえる", "記住"), word("忘れる", "わすれる", "忘記"), word("見せる", "みせる", "給人看"),
    ],
    grammar: [
      { title: "～てくれます", meaning: "別人為我做……", pattern: "動詞て形＋くれます", example: "先生（せんせい）が日本語（にほんご）を教（おし）えてくれます。", reading: "せんせい が にほんご を おしえて くれます", translation: "老師教我日文。" },
      { title: "～てもいいですか", meaning: "可以做……嗎？", pattern: "動詞て形＋もいいですか", example: "辞書（じしょ）を借（か）りてもいいですか。", reading: "じしょ を かりても いい ですか", translation: "可以借字典嗎？" },
      { title: "～なくてもいいです", meaning: "不做……也可以、不必……", pattern: "動詞ない形－い＋くてもいいです", example: "今日（きょう）は電話（でんわ）しなくてもいいです。", reading: "きょう は でんわ しなくても いい です", translation: "今天不必打電話。" },
    ],
  },
  {
    words: [
      word("一冊", "いっさつ", "一本（書）"), word("二冊", "にさつ", "兩本（書）"), word("一匹", "いっぴき", "一隻（小動物）"), word("二匹", "にひき", "兩隻（小動物）"), word("一杯", "いっぱい", "一杯"),
      word("二杯", "にはい", "兩杯"), word("一回", "いっかい", "一次"), word("二回", "にかい", "兩次"), word("一週間", "いっしゅうかん", "一週"), word("一ヶ月", "いっかげつ", "一個月"),
    ],
    grammar: [
      { title: "數量詞的位置", meaning: "數量詞通常放在動詞前", pattern: "名詞＋を＋數量詞＋動詞", example: "本（ほん）を二冊（にさつ）買（か）いました。", reading: "ほん を にさつ かいました", translation: "買了兩本書。" },
      { title: "～ずつ", meaning: "每……、各……", pattern: "數量＋ずつ", example: "一人（ひとり）一冊（いっさつ）ずつ取（と）ってください。", reading: "ひとり いっさつ ずつ とって ください", translation: "請每人拿一本。" },
      { title: "～に～回", meaning: "每段時間做幾次", pattern: "期間＋に＋次數", example: "一週間（いっしゅうかん）に二回（にかい）運動（うんどう）します。", reading: "いっしゅうかん に にかい うんどう します", translation: "每週運動兩次。" },
    ],
  },
  {
    words: [
      word("何", "なに", "什麼"), word("いつ", "いつ", "何時"), word("どこ", "どこ", "哪裡"), word("どう", "どう", "如何"), word("どうして", "どうして", "為什麼"),
      word("どれ", "どれ", "哪一個"), word("どの", "どの", "哪個……"), word("いくつ", "いくつ", "幾個、幾歲"), word("いくら", "いくら", "多少錢"), word("どんな", "どんな", "什麼樣的"),
    ],
    grammar: [
      { title: "疑問詞＋か", meaning: "某個……、不確定的……", pattern: "疑問詞＋か", example: "何（なに）か食（た）べますか。", reading: "なにか たべますか", translation: "要不要吃點什麼？" },
      { title: "疑問詞＋も＋否定", meaning: "誰都不、哪裡都不、什麼都不", pattern: "疑問詞＋も＋否定形", example: "今日（きょう）はどこにも行（い）きません。", reading: "きょう は どこ にも いきません", translation: "今天哪裡都不去。" },
      { title: "どんな＋名詞", meaning: "什麼樣的……", pattern: "どんな＋名詞＋ですか", example: "どんな音楽（おんがく）が好（す）きですか。", reading: "どんな おんがく が すき ですか", translation: "喜歡什麼樣的音樂？" },
    ],
  },
  {
    words: [
      word("おはよう", "おはよう", "早安"), word("こんにちは", "こんにちは", "你好"), word("こんばんは", "こんばんは", "晚安、晚上好"), word("ありがとう", "ありがとう", "謝謝"), word("すみません", "すみません", "不好意思、對不起"),
      word("お願いします", "おねがいします", "拜託、麻煩你"), word("大丈夫", "だいじょうぶ", "沒問題、不要緊"), word("失礼します", "しつれいします", "失禮了"), word("いただきます", "いただきます", "開動了"), word("ごちそうさま", "ごちそうさま", "謝謝招待"),
    ],
    grammar: [
      { title: "～と言います", meaning: "叫作……、說……", pattern: "內容＋と言います", example: "私（わたし）は王（おう）と言（い）います。", reading: "わたし は おう と いいます", translation: "我姓王。" },
      { title: "～をお願いします", meaning: "麻煩給我……、拜託……", pattern: "名詞＋をお願いします", example: "コーヒーをお願（ねが）いします。", reading: "こーひー を おねがいします", translation: "麻煩給我咖啡。" },
      { title: "～ても大丈夫です", meaning: "做……也沒問題", pattern: "動詞て形＋も大丈夫です", example: "少（すこ）し遅（おく）れても大丈夫（だいじょうぶ）です。", reading: "すこし おくれても だいじょうぶ です", translation: "晚一點也沒關係。" },
    ],
  },
  {
    words: [
      word("予約", "よやく", "預約"), word("約束", "やくそく", "約定"), word("切符", "きっぷ", "票"), word("地図", "ちず", "地圖"), word("荷物", "にもつ", "行李、物品"),
      word("住所", "じゅうしょ", "地址"), word("番号", "ばんごう", "號碼"), word("お土産", "おみやげ", "伴手禮"), word("道", "みち", "道路"), word("信号", "しんごう", "紅綠燈"),
    ],
    grammar: [
      { title: "～つもりです", meaning: "打算……", pattern: "動詞辭書形＋つもりです", example: "来月（らいげつ）日本（にほん）へ行（い）くつもりです。", reading: "らいげつ にほん へ いく つもり です", translation: "打算下個月去日本。" },
      { title: "～予定です", meaning: "預定……", pattern: "動詞辭書形／名詞の＋予定です", example: "明日（あした）ホテルを予約（よやく）する予定（よてい）です。", reading: "あした ほてる を よやく する よてい です", translation: "預定明天訂飯店。" },
      { title: "～なければなりません", meaning: "必須……", pattern: "動詞ない形－い＋ければなりません", example: "切符（きっぷ）を買（か）わなければなりません。", reading: "きっぷ を かわなければ なりません", translation: "必須買票。" },
    ],
  },
];

// 第 31 課起：由 data/vocab/n5.json 的新增單字依主題順序自動分課（每課 10 字，沒有文法）。
// 要增加單字，請改 scripts/vocab 底下的來源檔後執行 npm run vocab:build，不要直接改這裡。
const VOCAB_LESSON_SIZE = 10;
const MIN_LAST_LESSON_SIZE = 5;

const toWord = (entry: VocabEntry): Word => ({
  japanese: entry.word,
  reading: entry.reading,
  meaning: entry.meaning_zh,
  reference: {
    title: "Wiktionary 日文詞條",
    url: `https://en.wiktionary.org/wiki/${encodeURIComponent(entry.word)}#Japanese`,
  },
});

function buildVocabLessons(entries: VocabEntry[]): Lesson[] {
  const words = entries
    .filter((entry) => entry.source === "openjlpt")
    .sort((a, b) => a.order - b.order)
    .map(toWord);
  const lessons: Lesson[] = [];
  for (let start = 0; start < words.length; start += VOCAB_LESSON_SIZE) {
    lessons.push({ words: words.slice(start, start + VOCAB_LESSON_SIZE), grammar: [] });
  }
  // 最後一課太短就併入前一課，避免只剩一兩個單字。
  const last = lessons[lessons.length - 1];
  if (lessons.length > 1 && last.words.length < MIN_LAST_LESSON_SIZE) {
    lessons.pop();
    lessons[lessons.length - 1].words.push(...last.words);
  }
  return lessons;
}

export const handmadeLessonCount = baseLessons.length + additionalLessons.length;

export const n5Lessons: Lesson[] = [...baseLessons, ...additionalLessons, ...buildVocabLessons(n5Vocab)];
