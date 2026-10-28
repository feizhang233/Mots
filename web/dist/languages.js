/* Offline language metadata and illustrative German/Japanese starter banks.
 * The French source remains in data.js. No machine translation is implied.
 * Chinese conversion tables were generated with macOS CoreFoundation / ICU
 * Simplified-Traditional and Traditional-Simplified transforms on 2026-10-22.
 * Exact current source strings preserve contextual distinctions such as 頭髮/發音.
 * Unknown imported text receives longest-phrase + character fallback conversion;
 * this is script conversion, not translation or region-specific rewriting.
 */
(() => {
  'use strict';
  window.MOTS_LANGUAGES = [
    { code: 'fr', label: 'Français', name: '法語', voiceLocale: 'fr-FR' },
    { code: 'de', label: 'Deutsch', name: '德語', voiceLocale: 'de-DE' },
    { code: 'ja', label: '日本語', name: '日語', voiceLocale: 'ja-JP' },
  ];
  window.MOTS_MEANING_LANGUAGES = [
    { code: 'zh-Hant', label: '繁體中文' },
    { code: 'zh-Hans', label: '簡體中文' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ja', label: '日本語' },
  ];
  window.MOTS_JAPANESE_CATEGORIES = [
    {
      "id": "1",
      "name": "日常起居與居家",
      "subcategories": [
        {
          "id": "1.01",
          "name": "全部詞彙"
        }
      ]
    },
    {
      "id": "2",
      "name": "身體健康與醫療",
      "subcategories": [
        {
          "id": "2.01",
          "name": "全部詞彙"
        }
      ]
    },
    {
      "id": "3",
      "name": "交通出行與旅行",
      "subcategories": [
        {
          "id": "3.01",
          "name": "全部詞彙"
        }
      ]
    },
    {
      "id": "4",
      "name": "自然環境與動植物",
      "subcategories": [
        {
          "id": "4.01",
          "name": "全部詞彙"
        }
      ]
    },
    {
      "id": "5",
      "name": "學校學習與研究",
      "subcategories": [
        {
          "id": "5.01",
          "name": "全部詞彙"
        }
      ]
    },
    {
      "id": "6",
      "name": "職場工作與科技",
      "subcategories": [
        {
          "id": "6.01",
          "name": "全部詞彙"
        }
      ]
    },
    {
      "id": "7",
      "name": "金錢金融與購物",
      "subcategories": [
        {
          "id": "7.01",
          "name": "全部詞彙"
        }
      ]
    },
    {
      "id": "8",
      "name": "人際關係與情緒",
      "subcategories": [
        {
          "id": "8.01",
          "name": "全部詞彙"
        }
      ]
    },
    {
      "id": "9",
      "name": "文化休閒與公共生活",
      "subcategories": [
        {
          "id": "9.01",
          "name": "全部詞彙"
        }
      ]
    },
    {
      "id": "10",
      "name": "時間安排與狀態描述",
      "subcategories": [
        {
          "id": "10.01",
          "name": "全部詞彙"
        }
      ]
    }
  ];
  window.MOTS_EXTRA_BANKS = {
    de: [
      {
        id: 'de-1',
        category: '1',
        subcategory: '1.01',
        term: 'der Name',
        meanings: {
          'zh-Hant': '姓名',
          en: 'name',
          fr: 'le nom',
          ja: '名前',
          de: 'der Name',
          'zh-Hans': '姓名',
        },
        example: 'Wie ist dein Name?',
        part: 'Nomen',
      },
      {
        id: 'de-2',
        category: '1',
        subcategory: '1.01',
        term: 'das Alter',
        meanings: {
          'zh-Hant': '年齡',
          en: 'age',
          fr: 'l’âge',
          ja: '年齢',
          de: 'das Alter',
          'zh-Hans': '年龄',
        },
        example: 'Das Alter steht auf dem Formular.',
        part: 'Nomen',
      },
      {
        id: 'de-3',
        category: '1',
        subcategory: '1.01',
        term: 'die Adresse',
        meanings: {
          'zh-Hant': '地址',
          en: 'address',
          fr: 'l’adresse',
          ja: '住所',
          de: 'die Adresse',
          'zh-Hans': '地址',
        },
        example: 'Wie lautet deine Adresse?',
        part: 'Nomen',
      },
      {
        id: 'de-4',
        category: '1',
        subcategory: '1.01',
        term: 'der Beruf',
        meanings: {
          'zh-Hant': '職業',
          en: 'profession; occupation',
          fr: 'le métier',
          ja: '職業',
          de: 'der Beruf',
          'zh-Hans': '职业',
        },
        example: 'Was bist du von Beruf?',
        part: 'Nomen',
      },
      {
        id: 'de-5',
        category: '2',
        subcategory: '2.01',
        term: 'das Haus',
        meanings: {
          'zh-Hant': '房子',
          en: 'house',
          fr: 'la maison',
          ja: '家',
          de: 'das Haus',
          'zh-Hans': '房子',
        },
        example: 'Das Haus hat einen kleinen Garten.',
        part: 'Nomen',
      },
      {
        id: 'de-6',
        category: '2',
        subcategory: '2.01',
        term: 'die Wohnung',
        meanings: {
          'zh-Hant': '公寓；住宅',
          en: 'apartment; flat',
          fr: 'l’appartement',
          ja: 'アパート',
          de: 'die Wohnung',
          'zh-Hans': '公寓；住宅',
        },
        example: 'Unsere Wohnung ist hell und ruhig.',
        part: 'Nomen',
      },
      {
        id: 'de-7',
        category: '2',
        subcategory: '2.01',
        term: 'das Zimmer',
        meanings: {
          'zh-Hant': '房間',
          en: 'room',
          fr: 'la chambre',
          ja: '部屋',
          de: 'das Zimmer',
          'zh-Hans': '房间',
        },
        example: 'Mein Zimmer ist im ersten Stock.',
        part: 'Nomen',
      },
      {
        id: 'de-8',
        category: '2',
        subcategory: '2.01',
        term: 'die Küche',
        meanings: {
          'zh-Hant': '廚房',
          en: 'kitchen',
          fr: 'la cuisine',
          ja: '台所',
          de: 'die Küche',
          'zh-Hans': '厨房',
        },
        example: 'Wir essen zusammen in der Küche.',
        part: 'Nomen',
      },
      {
        id: 'de-9',
        category: '5',
        subcategory: '5.01',
        term: 'das Brot',
        meanings: {
          'zh-Hant': '麵包',
          en: 'bread',
          fr: 'le pain',
          ja: 'パン',
          de: 'das Brot',
          'zh-Hans': '面包',
        },
        example: 'Ich kaufe jeden Morgen frisches Brot.',
        part: 'Nomen',
      },
      {
        id: 'de-10',
        category: '5',
        subcategory: '5.01',
        term: 'das Wasser',
        meanings: {
          'zh-Hant': '水',
          en: 'water',
          fr: 'l’eau',
          ja: '水',
          de: 'das Wasser',
          'zh-Hans': '水',
        },
        example: 'Ich trinke ein Glas Wasser.',
        part: 'Nomen',
      },
      {
        id: 'de-11',
        category: '5',
        subcategory: '5.01',
        term: 'der Apfel',
        meanings: {
          'zh-Hant': '蘋果',
          en: 'apple',
          fr: 'la pomme',
          ja: 'りんご',
          de: 'der Apfel',
          'zh-Hans': '苹果',
        },
        example: 'Der Apfel ist süß und saftig.',
        part: 'Nomen',
      },
      {
        id: 'de-12',
        category: '5',
        subcategory: '5.01',
        term: 'der Reis',
        meanings: {
          'zh-Hant': '稻米；米飯',
          en: 'rice',
          fr: 'le riz',
          ja: '米；ご飯',
          de: 'der Reis',
          'zh-Hans': '稻米；米饭',
        },
        example: 'Heute gibt es Reis mit Gemüse.',
        part: 'Nomen',
      },
    ],
    ja: [
      {
        "id": "ja-vocab-0d85970cc339",
        "category": "2",
        "subcategory": "2.01",
        "term": "診察する（しんさつする）",
        "headword": "診察する",
        "reading": "しんさつする",
        "meanings": {
          "zh-Hant": "診察、檢查病情"
        },
        "example": "医師が患者を診察している間、家族は外で待っていた。",
        "examples": [
          {
            "text": "医師が患者を診察している間、家族は外で待っていた。",
            "translations": {
              "zh-Hant": "醫生為病人診察時，家屬在外面等候。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-8606e39efe76",
        "category": "2",
        "subcategory": "2.01",
        "term": "外科（げか）",
        "headword": "外科",
        "reading": "げか",
        "meanings": {
          "zh-Hant": "外科"
        },
        "example": "腕の傷を診てもらうため、外科を受診した。",
        "examples": [
          {
            "text": "腕の傷を診てもらうため、外科を受診した。",
            "translations": {
              "zh-Hant": "為了檢查手臂的傷口，我去看了外科。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9b16ab058e39",
        "category": "1",
        "subcategory": "1.01",
        "term": "這う（はう）",
        "headword": "這う",
        "reading": "はう",
        "meanings": {
          "zh-Hant": "爬、爬行"
        },
        "example": "赤ちゃんが床を這って、おもちゃに近づいた。",
        "examples": [
          {
            "text": "赤ちゃんが床を這って、おもちゃに近づいた。",
            "translations": {
              "zh-Hant": "嬰兒在地板上爬著靠近玩具。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-1c4901718b99",
        "category": "1",
        "subcategory": "1.01",
        "term": "しゃがむ（しゃがむ）",
        "headword": "しゃがむ",
        "reading": "しゃがむ",
        "meanings": {
          "zh-Hant": "蹲下"
        },
        "example": "道端の小さな花を見ようと、しゃがんだ。",
        "examples": [
          {
            "text": "道端の小さな花を見ようと、しゃがんだ。",
            "translations": {
              "zh-Hant": "我為了看路邊的小花而蹲下。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9513c1603c4a",
        "category": "1",
        "subcategory": "1.01",
        "term": "腰掛ける（こしかける）",
        "headword": "腰掛ける",
        "reading": "こしかける",
        "meanings": {
          "zh-Hant": "坐下"
        },
        "example": "祖父は公園のベンチに腰掛けて休んでいた。",
        "examples": [
          {
            "text": "祖父は公園のベンチに腰掛けて休んでいた。",
            "translations": {
              "zh-Hant": "祖父坐在公園的長椅上休息。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5a3e4b9f0a85",
        "category": "2",
        "subcategory": "2.01",
        "term": "欠伸（あくび）",
        "headword": "欠伸",
        "reading": "あくび",
        "meanings": {
          "zh-Hant": "哈欠"
        },
        "example": "昨夜あまり眠れず、授業中に何度も欠伸が出た。",
        "examples": [
          {
            "text": "昨夜あまり眠れず、授業中に何度も欠伸が出た。",
            "translations": {
              "zh-Hant": "昨晚沒睡好，上課時一直打哈欠。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-50c96f0b1feb",
        "category": "1",
        "subcategory": "1.01",
        "term": "徹夜する（てつやする）",
        "headword": "徹夜する",
        "reading": "てつやする",
        "meanings": {
          "zh-Hant": "熬夜、通宵"
        },
        "example": "友達と話し込んで、つい徹夜してしまった。",
        "examples": [
          {
            "text": "友達と話し込んで、つい徹夜してしまった。",
            "translations": {
              "zh-Hant": "我和朋友聊得太投入，不知不覺就熬了一整夜。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-6e45b019d97b",
        "category": "1",
        "subcategory": "1.01",
        "term": "剃刀（かみそり）",
        "headword": "剃刀",
        "reading": "かみそり",
        "meanings": {
          "zh-Hant": "剃刀、刮鬍刀"
        },
        "example": "旅行用のかばんに、新しい剃刀を入れた。",
        "examples": [
          {
            "text": "旅行用のかばんに、新しい剃刀を入れた。",
            "translations": {
              "zh-Hant": "我在旅行袋裡放了一把新的刮鬍刀。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-69879921b328",
        "category": "2",
        "subcategory": "2.01",
        "term": "髭（ひげ）",
        "headword": "髭",
        "reading": "ひげ",
        "meanings": {
          "zh-Hant": "鬍鬚"
        },
        "example": "父は休暇中、髭を伸ばしていた。",
        "examples": [
          {
            "text": "父は休暇中、髭を伸ばしていた。",
            "translations": {
              "zh-Hant": "父親休假期間留起了鬍鬚。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-d0a2483af7c6",
        "category": "1",
        "subcategory": "1.01",
        "term": "剃る（そる）",
        "headword": "剃る",
        "reading": "そる",
        "meanings": {
          "zh-Hant": "剃、刮"
        },
        "example": "出勤する前に、鏡を見ながら髭を剃った。",
        "examples": [
          {
            "text": "出勤する前に、鏡を見ながら髭を剃った。",
            "translations": {
              "zh-Hant": "上班前，我照著鏡子刮了鬍子。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c0dbe1fafaf3",
        "category": "1",
        "subcategory": "1.01",
        "term": "櫛（くし）",
        "headword": "櫛",
        "reading": "くし",
        "meanings": {
          "zh-Hant": "梳子"
        },
        "example": "母からもらった木の櫛を今も使っている。",
        "examples": [
          {
            "text": "母からもらった木の櫛を今も使っている。",
            "translations": {
              "zh-Hant": "我現在仍使用母親送給我的木梳。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-54608128789b",
        "category": "1",
        "subcategory": "1.01",
        "term": "ブラシ（ぶらし）",
        "headword": "ブラシ",
        "reading": "ぶらし",
        "meanings": {
          "zh-Hant": "刷子、髮刷"
        },
        "example": "このブラシは柔らかくて、髪をとかしやすい。",
        "examples": [
          {
            "text": "このブラシは柔らかくて、髪をとかしやすい。",
            "translations": {
              "zh-Hant": "這把髮刷很柔軟，很好梳頭髮。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e6fc348a848e",
        "category": "2",
        "subcategory": "2.01",
        "term": "しゃっくり（しゃっくり）",
        "headword": "しゃっくり",
        "reading": "しゃっくり",
        "meanings": {
          "zh-Hant": "打嗝、呃逆"
        },
        "example": "食事の途中でしゃっくりが出て、話せなくなった。",
        "examples": [
          {
            "text": "食事の途中でしゃっくりが出て、話せなくなった。",
            "translations": {
              "zh-Hant": "吃飯時突然打嗝，讓我說不出話來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c420a68b68f8",
        "category": "2",
        "subcategory": "2.01",
        "term": "咳（せき）",
        "headword": "咳",
        "reading": "せき",
        "meanings": {
          "zh-Hant": "咳嗽"
        },
        "example": "昨夜は咳がひどくて、何度も目が覚めた。",
        "examples": [
          {
            "text": "昨夜は咳がひどくて、何度も目が覚めた。",
            "translations": {
              "zh-Hant": "昨晚咳得很厲害，好幾次都醒了過來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-336c03e25e7b",
        "category": "2",
        "subcategory": "2.01",
        "term": "くしゃみ（くしゃみ）",
        "headword": "くしゃみ",
        "reading": "くしゃみ",
        "meanings": {
          "zh-Hant": "噴嚏"
        },
        "example": "ほこりを吸い込んで、大きなくしゃみをした。",
        "examples": [
          {
            "text": "ほこりを吸い込んで、大きなくしゃみをした。",
            "translations": {
              "zh-Hant": "我吸入灰塵，打了一個大噴嚏。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-cb01948a6c26",
        "category": "10",
        "subcategory": "10.01",
        "term": "当分（とうぶん）",
        "headword": "当分",
        "reading": "とうぶん",
        "meanings": {
          "zh-Hant": "暫時、一段時間內"
        },
        "example": "引っ越したばかりなので、当分は家具を買わずに暮らす。",
        "examples": [
          {
            "text": "引っ越したばかりなので、当分は家具を買わずに暮らす。",
            "translations": {
              "zh-Hant": "才剛搬家，這段時間我打算先不買家具過日子。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-31885b000827",
        "category": "10",
        "subcategory": "10.01",
        "term": "たちまち（たちまち）",
        "headword": "たちまち",
        "reading": "たちまち",
        "meanings": {
          "zh-Hant": "立刻、轉眼間"
        },
        "example": "焼きたてのパンは、店に並ぶとたちまち売り切れた。",
        "examples": [
          {
            "text": "焼きたてのパンは、店に並ぶとたちまち売り切れた。",
            "translations": {
              "zh-Hant": "剛出爐的麵包一上架，轉眼間就賣光了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c211fbfc4873",
        "category": "2",
        "subcategory": "2.01",
        "term": "看病する（かんびょうする）",
        "headword": "看病する",
        "reading": "かんびょうする",
        "meanings": {
          "zh-Hant": "照顧病人、看護"
        },
        "example": "熱を出した弟を、母が一晩中看病していた。",
        "examples": [
          {
            "text": "熱を出した弟を、母が一晩中看病していた。",
            "translations": {
              "zh-Hant": "弟弟發燒了，母親照顧了他一整夜。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-442de16ffdf3",
        "category": "2",
        "subcategory": "2.01",
        "term": "予防する（よぼうする）",
        "headword": "予防する",
        "reading": "よぼうする",
        "meanings": {
          "zh-Hant": "預防"
        },
        "example": "病気を予防するために、生活習慣を見直した。",
        "examples": [
          {
            "text": "病気を予防するために、生活習慣を見直した。",
            "translations": {
              "zh-Hant": "為了預防疾病，我重新檢視了自己的生活習慣。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-72a8a97b349f",
        "category": "2",
        "subcategory": "2.01",
        "term": "休養（きゅうよう）",
        "headword": "休養",
        "reading": "きゅうよう",
        "meanings": {
          "zh-Hant": "休養、調養"
        },
        "example": "仕事を数日休んで、家で十分な休養を取った。",
        "examples": [
          {
            "text": "仕事を数日休んで、家で十分な休養を取った。",
            "translations": {
              "zh-Hant": "我請了幾天假，在家充分休養。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-87d4f0e108ee",
        "category": "2",
        "subcategory": "2.01",
        "term": "消毒（しょうどく）",
        "headword": "消毒",
        "reading": "しょうどく",
        "meanings": {
          "zh-Hant": "消毒"
        },
        "example": "看護師は注射をする前に、腕を消毒した。",
        "examples": [
          {
            "text": "看護師は注射をする前に、腕を消毒した。",
            "translations": {
              "zh-Hant": "護理師在打針前先替手臂消毒。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-1a9fd2a1d11f",
        "category": "10",
        "subcategory": "10.01",
        "term": "不規則（ふきそく）",
        "headword": "不規則",
        "reading": "ふきそく",
        "meanings": {
          "zh-Hant": "不規則、沒有規律"
        },
        "example": "夜勤が続いて、食事の時間が不規則になった。",
        "examples": [
          {
            "text": "夜勤が続いて、食事の時間が不規則になった。",
            "translations": {
              "zh-Hant": "連續上夜班，讓我的用餐時間變得不規律。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-84dce2d5a725",
        "category": "2",
        "subcategory": "2.01",
        "term": "美容（びよう）",
        "headword": "美容",
        "reading": "びよう",
        "meanings": {
          "zh-Hant": "美容"
        },
        "example": "姉は美容の仕事に興味があり、専門学校で学んでいる。",
        "examples": [
          {
            "text": "姉は美容の仕事に興味があり、専門学校で学んでいる。",
            "translations": {
              "zh-Hant": "姊姊對美容工作感興趣，正在專門學校學習。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-d8b166defcd4",
        "category": "2",
        "subcategory": "2.01",
        "term": "荒れる（あれる）",
        "headword": "荒れる",
        "reading": "あれる",
        "meanings": {
          "zh-Hant": "粗糙、荒蕪；天氣惡劣"
        },
        "example": "強い風で海が荒れ、船は港を出られなかった。",
        "examples": [
          {
            "text": "強い風で海が荒れ、船は港を出られなかった。",
            "translations": {
              "zh-Hant": "強風吹得海面波濤洶湧，船無法出港。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-cda46207a737",
        "category": "2",
        "subcategory": "2.01",
        "term": "ひねる（ひねる）",
        "headword": "ひねる",
        "reading": "ひねる",
        "meanings": {
          "zh-Hant": "扭、擰；扭傷"
        },
        "example": "階段を下りるときに足首をひねってしまった。",
        "examples": [
          {
            "text": "階段を下りるときに足首をひねってしまった。",
            "translations": {
              "zh-Hant": "下樓梯時，我不小心扭傷了腳踝。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5583cc1e42ca",
        "category": "1",
        "subcategory": "1.01",
        "term": "床（ゆか）",
        "headword": "床",
        "reading": "ゆか",
        "meanings": {
          "zh-Hant": "地板"
        },
        "example": "コップを倒して、床に水をこぼしてしまった。",
        "examples": [
          {
            "text": "コップを倒して、床に水をこぼしてしまった。",
            "translations": {
              "zh-Hant": "我打翻杯子，把水灑在了地板上。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7894d0aad731",
        "category": "2",
        "subcategory": "2.01",
        "term": "肌（はだ）",
        "headword": "肌",
        "reading": "はだ",
        "meanings": {
          "zh-Hant": "皮膚、肌膚"
        },
        "example": "冬になると、肌が乾燥しやすくなる。",
        "examples": [
          {
            "text": "冬になると、肌が乾燥しやすくなる。",
            "translations": {
              "zh-Hant": "一到冬天，皮膚就容易乾燥。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-3085f770767c",
        "category": "5",
        "subcategory": "5.01",
        "term": "上達（じょうたつ）",
        "headword": "上達",
        "reading": "じょうたつ",
        "meanings": {
          "zh-Hant": "進步、技藝提高"
        },
        "example": "毎日練習しているので、妹はピアノの上達が早い。",
        "examples": [
          {
            "text": "毎日練習しているので、妹はピアノの上達が早い。",
            "translations": {
              "zh-Hant": "妹妹每天練習，因此鋼琴進步得很快。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e171c227640e",
        "category": "9",
        "subcategory": "9.01",
        "term": "見事（みごと）",
        "headword": "見事",
        "reading": "みごと",
        "meanings": {
          "zh-Hant": "精彩、出色"
        },
        "example": "彼女は難しい曲を見事に弾き終えた。",
        "examples": [
          {
            "text": "彼女は難しい曲を見事に弾き終えた。",
            "translations": {
              "zh-Hant": "她出色地演奏完了一首高難度的曲子。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-91f240a8a0d3",
        "category": "9",
        "subcategory": "9.01",
        "term": "活躍（かつやく）",
        "headword": "活躍",
        "reading": "かつやく",
        "meanings": {
          "zh-Hant": "活躍、發揮本領"
        },
        "example": "地元の選手が世界の大会で活躍している。",
        "examples": [
          {
            "text": "地元の選手が世界の大会で活躍している。",
            "translations": {
              "zh-Hant": "本地選手正在世界大賽中大展身手。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c4d54a6dc7c2",
        "category": "6",
        "subcategory": "6.01",
        "term": "従う（したがう）",
        "headword": "従う",
        "reading": "したがう",
        "meanings": {
          "zh-Hant": "遵從、服從；跟隨"
        },
        "example": "係員の指示に従って、順番に会場を出た。",
        "examples": [
          {
            "text": "係員の指示に従って、順番に会場を出た。",
            "translations": {
              "zh-Hant": "我們遵照工作人員的指示，依序離開會場。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-48bc955c9526",
        "category": "9",
        "subcategory": "9.01",
        "term": "応援（おうえん）",
        "headword": "応援",
        "reading": "おうえん",
        "meanings": {
          "zh-Hant": "支援、加油"
        },
        "example": "試合当日は、家族みんなで弟を応援しに行く。",
        "examples": [
          {
            "text": "試合当日は、家族みんなで弟を応援しに行く。",
            "translations": {
              "zh-Hant": "比賽當天，全家人都要去替弟弟加油。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-0aecab7e98ea",
        "category": "6",
        "subcategory": "6.01",
        "term": "ベテラン（べてらん）",
        "headword": "ベテラン",
        "reading": "べてらん",
        "meanings": {
          "zh-Hant": "老手、經驗豐富的人"
        },
        "example": "困ったときは、ベテランの先輩に相談している。",
        "examples": [
          {
            "text": "困ったときは、ベテランの先輩に相談している。",
            "translations": {
              "zh-Hant": "遇到困難時，我都會找經驗豐富的前輩商量。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-0c510f1b3759",
        "category": "9",
        "subcategory": "9.01",
        "term": "攻める（せめる）",
        "headword": "攻める",
        "reading": "せめる",
        "meanings": {
          "zh-Hant": "進攻、攻擊"
        },
        "example": "後半に入ると、相手チームは右側から攻めてきた。",
        "examples": [
          {
            "text": "後半に入ると、相手チームは右側から攻めてきた。",
            "translations": {
              "zh-Hant": "進入下半場後，對方球隊從右側發動了進攻。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-75309a4d22c4",
        "category": "9",
        "subcategory": "9.01",
        "term": "破る（やぶる）",
        "headword": "破る",
        "reading": "やぶる",
        "meanings": {
          "zh-Hant": "撕破；打破、擊敗"
        },
        "example": "弟が百メートル走で学校の記録を破った。",
        "examples": [
          {
            "text": "弟が百メートル走で学校の記録を破った。",
            "translations": {
              "zh-Hant": "弟弟在一百公尺賽跑中打破了學校紀錄。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b95c1ce128f7",
        "category": "9",
        "subcategory": "9.01",
        "term": "敗れる（やぶれる）",
        "headword": "敗れる",
        "reading": "やぶれる",
        "meanings": {
          "zh-Hant": "敗北、輸"
        },
        "example": "私たちのチームは決勝戦で強豪に敗れた。",
        "examples": [
          {
            "text": "私たちのチームは決勝戦で強豪に敗れた。",
            "translations": {
              "zh-Hant": "我們的球隊在決賽中敗給了強隊。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-97c035bb9f8b",
        "category": "9",
        "subcategory": "9.01",
        "term": "引き分け（ひきわけ）",
        "headword": "引き分け",
        "reading": "ひきわけ",
        "meanings": {
          "zh-Hant": "平手、平局"
        },
        "example": "両チームとも点が取れず、試合は引き分けに終わった。",
        "examples": [
          {
            "text": "両チームとも点が取れず、試合は引き分けに終わった。",
            "translations": {
              "zh-Hant": "兩隊都沒有得分，比賽以平手結束。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c2f6dfb42b45",
        "category": "9",
        "subcategory": "9.01",
        "term": "著者（ちょしゃ）",
        "headword": "著者",
        "reading": "ちょしゃ",
        "meanings": {
          "zh-Hant": "作者、著者"
        },
        "example": "この小説の著者は、長い間外国で暮らしていた。",
        "examples": [
          {
            "text": "この小説の著者は、長い間外国で暮らしていた。",
            "translations": {
              "zh-Hant": "這本小說的作者曾在國外生活很長一段時間。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f532c7bde6a6",
        "category": "9",
        "subcategory": "9.01",
        "term": "文芸（ぶんげい）",
        "headword": "文芸",
        "reading": "ぶんげい",
        "meanings": {
          "zh-Hant": "文學、文藝"
        },
        "example": "高校では文芸部に入り、短い物語を書いていた。",
        "examples": [
          {
            "text": "高校では文芸部に入り、短い物語を書いていた。",
            "translations": {
              "zh-Hant": "高中時，我加入文藝社，寫過一些短篇故事。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-711502244919",
        "category": "9",
        "subcategory": "9.01",
        "term": "筆者（ひっしゃ）",
        "headword": "筆者",
        "reading": "ひっしゃ",
        "meanings": {
          "zh-Hant": "撰文者、文章作者"
        },
        "example": "この文章の筆者は、自然を守る大切さを訴えている。",
        "examples": [
          {
            "text": "この文章の筆者は、自然を守る大切さを訴えている。",
            "translations": {
              "zh-Hant": "這篇文章的作者呼籲大家重視保護自然的重要性。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7168ea7b6ca9",
        "category": "5",
        "subcategory": "5.01",
        "term": "目次（もくじ）",
        "headword": "目次",
        "reading": "もくじ",
        "meanings": {
          "zh-Hant": "目錄"
        },
        "example": "必要な章を探すために、まず目次を開いた。",
        "examples": [
          {
            "text": "必要な章を探すために、まず目次を開いた。",
            "translations": {
              "zh-Hant": "為了找到需要的章節，我先翻開了目錄。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7580bb4ea696",
        "category": "5",
        "subcategory": "5.01",
        "term": "索引（さくいん）",
        "headword": "索引",
        "reading": "さくいん",
        "meanings": {
          "zh-Hant": "索引"
        },
        "example": "本の索引で、調べたい言葉のページを探した。",
        "examples": [
          {
            "text": "本の索引で、調べたい言葉のページを探した。",
            "translations": {
              "zh-Hant": "我利用書後的索引，尋找想查的詞所在的頁數。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-cfb2cd46a19d",
        "category": "9",
        "subcategory": "9.01",
        "term": "執筆（しっぴつ）",
        "headword": "執筆",
        "reading": "しっぴつ",
        "meanings": {
          "zh-Hant": "執筆、寫作"
        },
        "example": "祖母は退職後、故郷の歴史について執筆している。",
        "examples": [
          {
            "text": "祖母は退職後、故郷の歴史について執筆している。",
            "translations": {
              "zh-Hant": "祖母退休後，一直在撰寫關於故鄉歷史的文章。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-43aa1bc70d7e",
        "category": "9",
        "subcategory": "9.01",
        "term": "芝居（しばい）",
        "headword": "芝居",
        "reading": "しばい",
        "meanings": {
          "zh-Hant": "戲劇、演戲"
        },
        "example": "舞台の役者たちの芝居に、すっかり引き込まれた。",
        "examples": [
          {
            "text": "舞台の役者たちの芝居に、すっかり引き込まれた。",
            "translations": {
              "zh-Hant": "我完全被舞台上演員們的演技吸引住了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-be57f340403c",
        "category": "9",
        "subcategory": "9.01",
        "term": "劇場（げきじょう）",
        "headword": "劇場",
        "reading": "げきじょう",
        "meanings": {
          "zh-Hant": "劇場"
        },
        "example": "開演の三十分前に劇場に着いた。",
        "examples": [
          {
            "text": "開演の三十分前に劇場に着いた。",
            "translations": {
              "zh-Hant": "我在開演前三十分鐘抵達了劇場。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-0eb5ac522d81",
        "category": "9",
        "subcategory": "9.01",
        "term": "幕（まく）",
        "headword": "幕",
        "reading": "まく",
        "meanings": {
          "zh-Hant": "幕布；戲劇的一幕"
        },
        "example": "幕が上がると、舞台には大きな船が現れた。",
        "examples": [
          {
            "text": "幕が上がると、舞台には大きな船が現れた。",
            "translations": {
              "zh-Hant": "幕布一拉開，舞台上出現了一艘大船。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-a0a186eba1d6",
        "category": "9",
        "subcategory": "9.01",
        "term": "粗筋（あらすじ）",
        "headword": "粗筋",
        "reading": "あらすじ",
        "meanings": {
          "zh-Hant": "梗概、故事大綱"
        },
        "example": "映画を見る前に、友達から話の粗筋を聞いた。",
        "examples": [
          {
            "text": "映画を見る前に、友達から話の粗筋を聞いた。",
            "translations": {
              "zh-Hant": "看電影前，我先聽朋友介紹了故事大綱。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7ee9bd267c4e",
        "category": "9",
        "subcategory": "9.01",
        "term": "編み物（あみもの）",
        "headword": "編み物",
        "reading": "あみもの",
        "meanings": {
          "zh-Hant": "編織；編織品"
        },
        "example": "祖母は編み物が得意で、毎年マフラーを作ってくれる。",
        "examples": [
          {
            "text": "祖母は編み物が得意で、毎年マフラーを作ってくれる。",
            "translations": {
              "zh-Hant": "祖母很擅長編織，每年都會替我織圍巾。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-1cfa6500ca67",
        "category": "9",
        "subcategory": "9.01",
        "term": "工芸（こうげい）",
        "headword": "工芸",
        "reading": "こうげい",
        "meanings": {
          "zh-Hant": "工藝"
        },
        "example": "この町では、竹を使った工芸が盛んだ。",
        "examples": [
          {
            "text": "この町では、竹を使った工芸が盛んだ。",
            "translations": {
              "zh-Hant": "這座城鎮的竹工藝很興盛。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ad415cdf106d",
        "category": "9",
        "subcategory": "9.01",
        "term": "綿（わた）",
        "headword": "綿",
        "reading": "わた",
        "meanings": {
          "zh-Hant": "棉花、棉絮"
        },
        "example": "この枕には、柔らかい綿がたくさん詰まっている。",
        "examples": [
          {
            "text": "この枕には、柔らかい綿がたくさん詰まっている。",
            "translations": {
              "zh-Hant": "這個枕頭裡塞滿了柔軟的棉花。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e12c879d1758",
        "category": "9",
        "subcategory": "9.01",
        "term": "削る（けずる）",
        "headword": "削る",
        "reading": "けずる",
        "meanings": {
          "zh-Hant": "削、刨；削減"
        },
        "example": "旅行に行くために、毎月の外食費を削った。",
        "examples": [
          {
            "text": "旅行に行くために、毎月の外食費を削った。",
            "translations": {
              "zh-Hant": "為了去旅行，我削減了每個月的外食費用。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-868563c321b9",
        "category": "9",
        "subcategory": "9.01",
        "term": "彫る（ほる）",
        "headword": "彫る",
        "reading": "ほる",
        "meanings": {
          "zh-Hant": "雕刻"
        },
        "example": "父は木の板に、家族の名前を彫った。",
        "examples": [
          {
            "text": "父は木の板に、家族の名前を彫った。",
            "translations": {
              "zh-Hant": "父親在木板上刻下了家人的名字。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-6b9b8178e90d",
        "category": "3",
        "subcategory": "3.01",
        "term": "詰めて（つめて）",
        "headword": "詰めて",
        "reading": "つめて",
        "meanings": {
          "zh-Hant": "靠攏一些、挪緊一些"
        },
        "example": "もう一人座れるように、少し詰めてください。",
        "examples": [
          {
            "text": "もう一人座れるように、少し詰めてください。",
            "translations": {
              "zh-Hant": "請稍微坐靠近一點，讓另一個人也能坐下。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-791e78206de4",
        "category": "3",
        "subcategory": "3.01",
        "term": "日程（にってい）",
        "headword": "日程",
        "reading": "にってい",
        "meanings": {
          "zh-Hant": "日程、行程安排"
        },
        "example": "雨の予報が出たので、旅行の日程を変更した。",
        "examples": [
          {
            "text": "雨の予報が出たので、旅行の日程を変更した。",
            "translations": {
              "zh-Hant": "因為天氣預報說會下雨，我更改了旅行行程。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7448fee3521e",
        "category": "3",
        "subcategory": "3.01",
        "term": "座席（ざせき）",
        "headword": "座席",
        "reading": "ざせき",
        "meanings": {
          "zh-Hant": "座位"
        },
        "example": "窓側の座席から、遠くの山がよく見えた。",
        "examples": [
          {
            "text": "窓側の座席から、遠くの山がよく見えた。",
            "translations": {
              "zh-Hant": "從靠窗的座位，可以清楚看見遠方的山。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-59a79bf69801",
        "category": "3",
        "subcategory": "3.01",
        "term": "往復（おうふく）",
        "headword": "往復",
        "reading": "おうふく",
        "meanings": {
          "zh-Hant": "往返、來回"
        },
        "example": "空港まで電車で往復すると、二時間ほどかかる。",
        "examples": [
          {
            "text": "空港まで電車で往復すると、二時間ほどかかる。",
            "translations": {
              "zh-Hant": "搭電車往返機場，大約需要兩個小時。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c08c2c531167",
        "category": "3",
        "subcategory": "3.01",
        "term": "片道（かたみち）",
        "headword": "片道",
        "reading": "かたみち",
        "meanings": {
          "zh-Hant": "單程"
        },
        "example": "駅から大学までは、歩いて片道二十分だ。",
        "examples": [
          {
            "text": "駅から大学までは、歩いて片道二十分だ。",
            "translations": {
              "zh-Hant": "從車站走到大學，單程需要二十分鐘。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-a2a62f372cd3",
        "category": "3",
        "subcategory": "3.01",
        "term": "日帰り（ひがえり）",
        "headword": "日帰り",
        "reading": "ひがえり",
        "meanings": {
          "zh-Hant": "當天往返"
        },
        "example": "週末に、友達と日帰りで温泉へ行った。",
        "examples": [
          {
            "text": "週末に、友達と日帰りで温泉へ行った。",
            "translations": {
              "zh-Hant": "週末我和朋友去泡溫泉，當天就回來了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b90917bc5d0f",
        "category": "3",
        "subcategory": "3.01",
        "term": "跡（あと）",
        "headword": "跡",
        "reading": "あと",
        "meanings": {
          "zh-Hant": "痕跡；遺址"
        },
        "example": "雪の上に、猫の足の跡が残っていた。",
        "examples": [
          {
            "text": "雪の上に、猫の足の跡が残っていた。",
            "translations": {
              "zh-Hant": "雪地上留著貓的腳印。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c8b677fe5235",
        "category": "3",
        "subcategory": "3.01",
        "term": "巡る（めぐる）",
        "headword": "巡る",
        "reading": "めぐる",
        "meanings": {
          "zh-Hant": "巡遊、走訪；圍繞"
        },
        "example": "夏休みに、自転車で湖の周りの町を巡った。",
        "examples": [
          {
            "text": "夏休みに、自転車で湖の周りの町を巡った。",
            "translations": {
              "zh-Hant": "暑假時，我騎腳踏車走訪了湖邊的幾座城鎮。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ba0a503d70e9",
        "category": "3",
        "subcategory": "3.01",
        "term": "混雑（こんざつ）",
        "headword": "混雑",
        "reading": "こんざつ",
        "meanings": {
          "zh-Hant": "擁擠、混雜"
        },
        "example": "休日の混雑を避けて、平日に美術館へ行った。",
        "examples": [
          {
            "text": "休日の混雑を避けて、平日に美術館へ行った。",
            "translations": {
              "zh-Hant": "為了避開假日的人潮，我選在平日去美術館。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-de7e48166730",
        "category": "3",
        "subcategory": "3.01",
        "term": "大通り（おおどおり）",
        "headword": "大通り",
        "reading": "おおどおり",
        "meanings": {
          "zh-Hant": "大街、主要道路"
        },
        "example": "この路地を抜けると、にぎやかな大通りに出る。",
        "examples": [
          {
            "text": "この路地を抜けると、にぎやかな大通りに出る。",
            "translations": {
              "zh-Hant": "穿過這條巷子，就會走到熱鬧的大街。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-4890b407b19e",
        "category": "3",
        "subcategory": "3.01",
        "term": "踏切（ふみきり）",
        "headword": "踏切",
        "reading": "ふみきり",
        "meanings": {
          "zh-Hant": "鐵路平交道"
        },
        "example": "踏切の前で、電車が通り過ぎるのを待った。",
        "examples": [
          {
            "text": "踏切の前で、電車が通り過ぎるのを待った。",
            "translations": {
              "zh-Hant": "我在平交道前等電車通過。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-47792baa0c01",
        "category": "3",
        "subcategory": "3.01",
        "term": "経由（けいゆ）",
        "headword": "経由",
        "reading": "けいゆ",
        "meanings": {
          "zh-Hant": "經由、途經"
        },
        "example": "大阪を経由して、京都へ向かった。",
        "examples": [
          {
            "text": "大阪を経由して、京都へ向かった。",
            "translations": {
              "zh-Hant": "我經由大阪前往京都。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-11ca6cc2b745",
        "category": "5",
        "subcategory": "5.01",
        "term": "通学（つうがく）",
        "headword": "通学",
        "reading": "つうがく",
        "meanings": {
          "zh-Hant": "上學、往返學校"
        },
        "example": "弟は毎朝、自転車で高校に通学している。",
        "examples": [
          {
            "text": "弟は毎朝、自転車で高校に通学している。",
            "translations": {
              "zh-Hant": "弟弟每天早上騎腳踏車去高中上學。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f7129d1ccf82",
        "category": "3",
        "subcategory": "3.01",
        "term": "ラッシュアワー（らっしゅあわー）",
        "headword": "ラッシュアワー",
        "reading": "らっしゅあわー",
        "meanings": {
          "zh-Hant": "交通尖峰時段"
        },
        "example": "ラッシュアワーを避けるため、いつもより早く家を出た。",
        "examples": [
          {
            "text": "ラッシュアワーを避けるため、いつもより早く家を出た。",
            "translations": {
              "zh-Hant": "為了避開交通尖峰時段，我比平常更早出門。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9eeb47c92694",
        "category": "9",
        "subcategory": "9.01",
        "term": "競技（きょうぎ）",
        "headword": "競技",
        "reading": "きょうぎ",
        "meanings": {
          "zh-Hant": "競技、體育比賽"
        },
        "example": "妹は陸上競技の大会で二位になった。",
        "examples": [
          {
            "text": "妹は陸上競技の大会で二位になった。",
            "translations": {
              "zh-Hant": "妹妹在田徑比賽中獲得了第二名。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5791af70d388",
        "category": "3",
        "subcategory": "3.01",
        "term": "発つ（たつ）",
        "headword": "発つ",
        "reading": "たつ",
        "meanings": {
          "zh-Hant": "出發、啟程"
        },
        "example": "兄は明日の朝、留学先の国へ発つ。",
        "examples": [
          {
            "text": "兄は明日の朝、留学先の国へ発つ。",
            "translations": {
              "zh-Hant": "哥哥明天早上將啟程前往留學的國家。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e34cf8241396",
        "category": "10",
        "subcategory": "10.01",
        "term": "既に（すでに）",
        "headword": "既に",
        "reading": "すでに",
        "meanings": {
          "zh-Hant": "已經"
        },
        "example": "会場に着いたときには、式は既に始まっていた。",
        "examples": [
          {
            "text": "会場に着いたときには、式は既に始まっていた。",
            "translations": {
              "zh-Hant": "我抵達會場時，典禮已經開始了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-a5d2e814b770",
        "category": "3",
        "subcategory": "3.01",
        "term": "見送る（みおくる）",
        "headword": "見送る",
        "reading": "みおくる",
        "meanings": {
          "zh-Hant": "送行；暫緩、放棄"
        },
        "example": "駅のホームで、遠くへ引っ越す友人を見送った。",
        "examples": [
          {
            "text": "駅のホームで、遠くへ引っ越す友人を見送った。",
            "translations": {
              "zh-Hant": "我在車站月台為即將搬到遠方的朋友送行。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-23d5b5303731",
        "category": "4",
        "subcategory": "4.01",
        "term": "南北（なんぼく）",
        "headword": "南北",
        "reading": "なんぼく",
        "meanings": {
          "zh-Hant": "南北"
        },
        "example": "この道路は、町の南北を結んでいる。",
        "examples": [
          {
            "text": "この道路は、町の南北を結んでいる。",
            "translations": {
              "zh-Hant": "這條道路連接著城鎮的南北兩端。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-844e919ace9c",
        "category": "4",
        "subcategory": "4.01",
        "term": "岬（みさき）",
        "headword": "岬",
        "reading": "みさき",
        "meanings": {
          "zh-Hant": "海岬、海角"
        },
        "example": "岬の先に立つ白い灯台が、海からも見える。",
        "examples": [
          {
            "text": "岬の先に立つ白い灯台が、海からも見える。",
            "translations": {
              "zh-Hant": "矗立在海岬盡頭的白色燈塔，從海上也看得見。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-60f17d2ad71e",
        "category": "4",
        "subcategory": "4.01",
        "term": "丘（おか）",
        "headword": "丘",
        "reading": "おか",
        "meanings": {
          "zh-Hant": "丘陵、小山"
        },
        "example": "丘の上から、町全体を見渡せた。",
        "examples": [
          {
            "text": "丘の上から、町全体を見渡せた。",
            "translations": {
              "zh-Hant": "從小山丘上，可以眺望整座城鎮。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-fd6ee3c9c9d8",
        "category": "4",
        "subcategory": "4.01",
        "term": "険しい（けわしい）",
        "headword": "険しい",
        "reading": "けわしい",
        "meanings": {
          "zh-Hant": "險峻；嚴峻"
        },
        "example": "山頂までは、険しい山道を登らなければならない。",
        "examples": [
          {
            "text": "山頂までは、険しい山道を登らなければならない。",
            "translations": {
              "zh-Hant": "要到山頂，必須攀登陡峭的山路。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9cf0517e493b",
        "category": "4",
        "subcategory": "4.01",
        "term": "ふもと（ふもと）",
        "headword": "ふもと",
        "reading": "ふもと",
        "meanings": {
          "zh-Hant": "山腳"
        },
        "example": "山のふもとの小さな村で、一晩泊まった。",
        "examples": [
          {
            "text": "山のふもとの小さな村で、一晩泊まった。",
            "translations": {
              "zh-Hant": "我在山腳下的小村莊住了一晚。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ceb7b2a20cbd",
        "category": "4",
        "subcategory": "4.01",
        "term": "谷（たに）",
        "headword": "谷",
        "reading": "たに",
        "meanings": {
          "zh-Hant": "山谷"
        },
        "example": "深い谷の底を、細い川が流れている。",
        "examples": [
          {
            "text": "深い谷の底を、細い川が流れている。",
            "translations": {
              "zh-Hant": "深谷底部流著一條細細的河川。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ed5ffbbcb3f3",
        "category": "4",
        "subcategory": "4.01",
        "term": "滝（たき）",
        "headword": "滝",
        "reading": "たき",
        "meanings": {
          "zh-Hant": "瀑布"
        },
        "example": "森の奥を歩くと、大きな滝の音が聞こえてきた。",
        "examples": [
          {
            "text": "森の奥を歩くと、大きな滝の音が聞こえてきた。",
            "translations": {
              "zh-Hant": "往森林深處走去，就聽見了大瀑布的水聲。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-59368a07ddf7",
        "category": "4",
        "subcategory": "4.01",
        "term": "砂（すな）",
        "headword": "砂",
        "reading": "すな",
        "meanings": {
          "zh-Hant": "沙、沙子"
        },
        "example": "子供たちは海辺の砂で大きな城を作った。",
        "examples": [
          {
            "text": "子供たちは海辺の砂で大きな城を作った。",
            "translations": {
              "zh-Hant": "孩子們用海邊的沙子堆了一座大城堡。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-56f085adea3f",
        "category": "4",
        "subcategory": "4.01",
        "term": "泥（どろ）",
        "headword": "泥",
        "reading": "どろ",
        "meanings": {
          "zh-Hant": "泥、泥土"
        },
        "example": "雨上がりの畑を歩いて、靴が泥だらけになった。",
        "examples": [
          {
            "text": "雨上がりの畑を歩いて、靴が泥だらけになった。",
            "translations": {
              "zh-Hant": "我走過雨後的田地，鞋子沾滿了泥巴。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-2ec3aadeb1c7",
        "category": "4",
        "subcategory": "4.01",
        "term": "砂漠（さばく）",
        "headword": "砂漠",
        "reading": "さばく",
        "meanings": {
          "zh-Hant": "沙漠"
        },
        "example": "砂漠を旅する人たちは、十分な水を用意した。",
        "examples": [
          {
            "text": "砂漠を旅する人たちは、十分な水を用意した。",
            "translations": {
              "zh-Hant": "穿越沙漠的旅人們準備了充足的水。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b9255c9a6ee5",
        "category": "4",
        "subcategory": "4.01",
        "term": "沖（おき）",
        "headword": "沖",
        "reading": "おき",
        "meanings": {
          "zh-Hant": "離岸較遠的海面、外海"
        },
        "example": "釣り船が港を離れ、沖へ向かっていった。",
        "examples": [
          {
            "text": "釣り船が港を離れ、沖へ向かっていった。",
            "translations": {
              "zh-Hant": "釣魚船離開港口，駛向外海。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-91ea8e24efa5",
        "category": "4",
        "subcategory": "4.01",
        "term": "快晴（かいせい）",
        "headword": "快晴",
        "reading": "かいせい",
        "meanings": {
          "zh-Hant": "晴朗無雲"
        },
        "example": "旅行の最終日は快晴で、山の景色を楽しめた。",
        "examples": [
          {
            "text": "旅行の最終日は快晴で、山の景色を楽しめた。",
            "translations": {
              "zh-Hant": "旅行的最後一天晴空萬里，我得以欣賞山景。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5b977c44201a",
        "category": "4",
        "subcategory": "4.01",
        "term": "夕立（ゆうだち）",
        "headword": "夕立",
        "reading": "ゆうだち",
        "meanings": {
          "zh-Hant": "夏季傍晚的驟雨"
        },
        "example": "突然の夕立で、洗濯物がすっかりぬれてしまった。",
        "examples": [
          {
            "text": "突然の夕立で、洗濯物がすっかりぬれてしまった。",
            "translations": {
              "zh-Hant": "突如其來的傍晚驟雨，把晾著的衣服全淋濕了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-fd900b7ae294",
        "category": "4",
        "subcategory": "4.01",
        "term": "沈む（しずむ）",
        "headword": "沈む",
        "reading": "しずむ",
        "meanings": {
          "zh-Hant": "下沉；日落；消沉"
        },
        "example": "夕日が海に沈むまで、砂浜に座っていた。",
        "examples": [
          {
            "text": "夕日が海に沈むまで、砂浜に座っていた。",
            "translations": {
              "zh-Hant": "我坐在沙灘上，直到夕陽沉入海中。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e8277081f7ad",
        "category": "4",
        "subcategory": "4.01",
        "term": "日差し（ひざし）",
        "headword": "日差し",
        "reading": "ひざし",
        "meanings": {
          "zh-Hant": "陽光、日照"
        },
        "example": "午後は日差しが強くなるので、木陰で休もう。",
        "examples": [
          {
            "text": "午後は日差しが強くなるので、木陰で休もう。",
            "translations": {
              "zh-Hant": "下午陽光會變強，我們到樹蔭下休息吧。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b8034369b8c2",
        "category": "4",
        "subcategory": "4.01",
        "term": "実り（みのり）",
        "headword": "実り",
        "reading": "みのり",
        "meanings": {
          "zh-Hant": "結實、收成；成果"
        },
        "example": "農家の人たちは、秋の実りを喜んでいた。",
        "examples": [
          {
            "text": "農家の人たちは、秋の実りを喜んでいた。",
            "translations": {
              "zh-Hant": "農家們為秋天的收成感到喜悅。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5604b56da552",
        "category": "4",
        "subcategory": "4.01",
        "term": "稲（いね）",
        "headword": "稲",
        "reading": "いね",
        "meanings": {
          "zh-Hant": "水稻、稻子"
        },
        "example": "田んぼの稲が育ち、穂が少しずつ重くなってきた。",
        "examples": [
          {
            "text": "田んぼの稲が育ち、穂が少しずつ重くなってきた。",
            "translations": {
              "zh-Hant": "田裡的水稻長大了，稻穗也漸漸變重。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-dd92cb0746f1",
        "category": "4",
        "subcategory": "4.01",
        "term": "刈る（かる）",
        "headword": "刈る",
        "reading": "かる",
        "meanings": {
          "zh-Hant": "割、收割"
        },
        "example": "父は週末に、庭の伸びすぎた草を刈った。",
        "examples": [
          {
            "text": "父は週末に、庭の伸びすぎた草を刈った。",
            "translations": {
              "zh-Hant": "父親在週末割除了庭院裡長得太高的草。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-dd58e0c1d837",
        "category": "4",
        "subcategory": "4.01",
        "term": "初霜（はつしも）",
        "headword": "初霜",
        "reading": "はつしも",
        "meanings": {
          "zh-Hant": "入秋後的第一次霜"
        },
        "example": "今朝は初霜が降り、畑がうっすら白くなった。",
        "examples": [
          {
            "text": "今朝は初霜が降り、畑がうっすら白くなった。",
            "translations": {
              "zh-Hant": "今天早上下了入秋後的第一場霜，田地泛著一層淡白色。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-094ae0c81f9e",
        "category": "2",
        "subcategory": "2.01",
        "term": "凍える（こごえる）",
        "headword": "凍える",
        "reading": "こごえる",
        "meanings": {
          "zh-Hant": "凍僵"
        },
        "example": "雪の中でバスを待ち、手が凍えるほど冷たくなった。",
        "examples": [
          {
            "text": "雪の中でバスを待ち、手が凍えるほど冷たくなった。",
            "translations": {
              "zh-Hant": "我在雪中等公車，雙手冷得幾乎凍僵。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-4d9e4f1330f6",
        "category": "10",
        "subcategory": "10.01",
        "term": "遥かに（はるかに）",
        "headword": "遥かに",
        "reading": "はるかに",
        "meanings": {
          "zh-Hant": "遠遠地；大大地"
        },
        "example": "新しい道を使うと、以前より遥かに早く着く。",
        "examples": [
          {
            "text": "新しい道を使うと、以前より遥かに早く着く。",
            "translations": {
              "zh-Hant": "走新開的道路，會比以前快得多。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5dc34e331acb",
        "category": "4",
        "subcategory": "4.01",
        "term": "眩しい（まぶしい）",
        "headword": "眩しい",
        "reading": "まぶしい",
        "meanings": {
          "zh-Hant": "耀眼、刺眼"
        },
        "example": "カーテンを開けると、朝日が眩しくて目を細めた。",
        "examples": [
          {
            "text": "カーテンを開けると、朝日が眩しくて目を細めた。",
            "translations": {
              "zh-Hant": "一拉開窗簾，朝陽刺得我瞇起了眼睛。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9ceecb4ca62f",
        "category": "4",
        "subcategory": "4.01",
        "term": "なだらかな（なだらかな）",
        "headword": "なだらかな",
        "reading": "なだらかな",
        "meanings": {
          "zh-Hant": "平緩的、坡度和緩的"
        },
        "example": "なだらかな坂道を、ゆっくり自転車で登った。",
        "examples": [
          {
            "text": "なだらかな坂道を、ゆっくり自転車で登った。",
            "translations": {
              "zh-Hant": "我騎著腳踏車，慢慢爬上平緩的坡道。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5f2567109f06",
        "category": "10",
        "subcategory": "10.01",
        "term": "一段と（いちだんと）",
        "headword": "一段と",
        "reading": "いちだんと",
        "meanings": {
          "zh-Hant": "更加、越發"
        },
        "example": "雨が上がると、山の緑が一段と鮮やかに見えた。",
        "examples": [
          {
            "text": "雨が上がると、山の緑が一段と鮮やかに見えた。",
            "translations": {
              "zh-Hant": "雨停之後，山林的綠色看起來更加鮮明了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-660edcbf4a44",
        "category": "10",
        "subcategory": "10.01",
        "term": "遥か（はるか）",
        "headword": "遥か",
        "reading": "はるか",
        "meanings": {
          "zh-Hant": "遙遠、久遠"
        },
        "example": "遥か遠くに、雪をかぶった山が見えた。",
        "examples": [
          {
            "text": "遥か遠くに、雪をかぶった山が見えた。",
            "translations": {
              "zh-Hant": "在遙遠的地方，可以看見覆著白雪的山。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-55a2b740b60d",
        "category": "4",
        "subcategory": "4.01",
        "term": "湧く（わく）",
        "headword": "湧く",
        "reading": "わく",
        "meanings": {
          "zh-Hant": "湧出；產生、湧現"
        },
        "example": "岩の間から、冷たい水が湧いている。",
        "examples": [
          {
            "text": "岩の間から、冷たい水が湧いている。",
            "translations": {
              "zh-Hant": "冰涼的水從岩石縫隙間湧出。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9b514f4c8003",
        "category": "3",
        "subcategory": "3.01",
        "term": "眺める（ながめる）",
        "headword": "眺める",
        "reading": "ながめる",
        "meanings": {
          "zh-Hant": "眺望、欣賞"
        },
        "example": "窓辺に座り、庭に咲く花を眺めていた。",
        "examples": [
          {
            "text": "窓辺に座り、庭に咲く花を眺めていた。",
            "translations": {
              "zh-Hant": "我坐在窗邊，欣賞庭院裡盛開的花。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-fa3c082d3cc6",
        "category": "5",
        "subcategory": "5.01",
        "term": "単位（たんい）",
        "headword": "単位",
        "reading": "たんい",
        "meanings": {
          "zh-Hant": "單位；學分"
        },
        "example": "卒業に必要な単位を、すべて取り終えた。",
        "examples": [
          {
            "text": "卒業に必要な単位を、すべて取り終えた。",
            "translations": {
              "zh-Hant": "我已修完畢業所需的所有學分。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-491683081aa5",
        "category": "5",
        "subcategory": "5.01",
        "term": "休講（きゅうこう）",
        "headword": "休講",
        "reading": "きゅうこう",
        "meanings": {
          "zh-Hant": "停課"
        },
        "example": "先生が出張中のため、今日の授業は休講になった。",
        "examples": [
          {
            "text": "先生が出張中のため、今日の授業は休講になった。",
            "translations": {
              "zh-Hant": "因為老師出差，今天的課停課了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9d9f6e81c24b",
        "category": "5",
        "subcategory": "5.01",
        "term": "科目（かもく）",
        "headword": "科目",
        "reading": "かもく",
        "meanings": {
          "zh-Hant": "科目"
        },
        "example": "今学期は、興味のある科目を三つ選んだ。",
        "examples": [
          {
            "text": "今学期は、興味のある科目を三つ選んだ。",
            "translations": {
              "zh-Hant": "這學期，我選了三門自己感興趣的科目。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-4a616be3a2c5",
        "category": "5",
        "subcategory": "5.01",
        "term": "児童（じどう）",
        "headword": "児童",
        "reading": "じどう",
        "meanings": {
          "zh-Hant": "兒童、小學生"
        },
        "example": "児童たちは、先生と一緒に野菜を育てている。",
        "examples": [
          {
            "text": "児童たちは、先生と一緒に野菜を育てている。",
            "translations": {
              "zh-Hant": "小學生們和老師一起種植蔬菜。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ab39b81e985f",
        "category": "5",
        "subcategory": "5.01",
        "term": "実習（じっしゅう）",
        "headword": "実習",
        "reading": "じっしゅう",
        "meanings": {
          "zh-Hant": "實習、實作練習"
        },
        "example": "調理の実習で、野菜の切り方を習った。",
        "examples": [
          {
            "text": "調理の実習で、野菜の切り方を習った。",
            "translations": {
              "zh-Hant": "在烹飪實作課上，我學了蔬菜的切法。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-6fe255e728ba",
        "category": "5",
        "subcategory": "5.01",
        "term": "期末（きまつ）",
        "headword": "期末",
        "reading": "きまつ",
        "meanings": {
          "zh-Hant": "期末"
        },
        "example": "期末のレポートを書くため、図書館で資料を集めた。",
        "examples": [
          {
            "text": "期末のレポートを書くため、図書館で資料を集めた。",
            "translations": {
              "zh-Hant": "為了寫期末報告，我到圖書館蒐集資料。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-73f344b1ced1",
        "category": "5",
        "subcategory": "5.01",
        "term": "筆記（ひっき）",
        "headword": "筆記",
        "reading": "ひっき",
        "meanings": {
          "zh-Hant": "筆記、書寫記錄"
        },
        "example": "試験は、筆記と面接の二つに分かれている。",
        "examples": [
          {
            "text": "試験は、筆記と面接の二つに分かれている。",
            "translations": {
              "zh-Hant": "考試分為筆試和面試兩個部分。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-86d43f67635a",
        "category": "5",
        "subcategory": "5.01",
        "term": "暗記（あんき）",
        "headword": "暗記",
        "reading": "あんき",
        "meanings": {
          "zh-Hant": "背誦、熟記"
        },
        "example": "年号の暗記だけでなく、出来事の背景も学びたい。",
        "examples": [
          {
            "text": "年号の暗記だけでなく、出来事の背景も学びたい。",
            "translations": {
              "zh-Hant": "除了熟記年代，我也想了解事件的背景。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-db4959778e7e",
        "category": "5",
        "subcategory": "5.01",
        "term": "優れる（すぐれる）",
        "headword": "優れる",
        "reading": "すぐれる",
        "meanings": {
          "zh-Hant": "優秀、出色"
        },
        "example": "このかばんは軽く、耐久性にも優れている。",
        "examples": [
          {
            "text": "このかばんは軽く、耐久性にも優れている。",
            "translations": {
              "zh-Hant": "這個包包很輕，耐用性也很出色。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-d359598226ee",
        "category": "10",
        "subcategory": "10.01",
        "term": "妥当（だとう）",
        "headword": "妥当",
        "reading": "だとう",
        "meanings": {
          "zh-Hant": "妥當、適當、合理"
        },
        "example": "作業にかかる時間を考えると、この料金は妥当だ。",
        "examples": [
          {
            "text": "作業にかかる時間を考えると、この料金は妥当だ。",
            "translations": {
              "zh-Hant": "考慮到工作所需的時間，這個收費是合理的。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c98ab5697ac9",
        "category": "5",
        "subcategory": "5.01",
        "term": "学会（がっかい）",
        "headword": "学会",
        "reading": "がっかい",
        "meanings": {
          "zh-Hant": "學會；學術會議"
        },
        "example": "来月の学会で、研究の成果を発表する予定だ。",
        "examples": [
          {
            "text": "来月の学会で、研究の成果を発表する予定だ。",
            "translations": {
              "zh-Hant": "我預計在下個月的學術會議上發表研究成果。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-80db605c7b72",
        "category": "5",
        "subcategory": "5.01",
        "term": "哲学（てつがく）",
        "headword": "哲学",
        "reading": "てつがく",
        "meanings": {
          "zh-Hant": "哲學"
        },
        "example": "大学で哲学を学び、人の生き方について考えるようになった。",
        "examples": [
          {
            "text": "大学で哲学を学び、人の生き方について考えるようになった。",
            "translations": {
              "zh-Hant": "在大學學習哲學後，我開始思考人的生活方式。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ff08785605a2",
        "category": "5",
        "subcategory": "5.01",
        "term": "自習（じしゅう）",
        "headword": "自習",
        "reading": "じしゅう",
        "meanings": {
          "zh-Hant": "自習"
        },
        "example": "先生が来るまで、教室で静かに自習していた。",
        "examples": [
          {
            "text": "先生が来るまで、教室で静かに自習していた。",
            "translations": {
              "zh-Hant": "老師來之前，我一直在教室裡安靜自習。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f7e479b892bf",
        "category": "5",
        "subcategory": "5.01",
        "term": "採点する（さいてんする）",
        "headword": "採点する",
        "reading": "さいてんする",
        "meanings": {
          "zh-Hant": "評分、批改"
        },
        "example": "先生は週末に、学生の答案を採点した。",
        "examples": [
          {
            "text": "先生は週末に、学生の答案を採点した。",
            "translations": {
              "zh-Hant": "老師在週末批改了學生的考卷。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-4f7230d23ede",
        "category": "5",
        "subcategory": "5.01",
        "term": "怠ける（なまける）",
        "headword": "怠ける",
        "reading": "なまける",
        "meanings": {
          "zh-Hant": "偷懶、懈怠"
        },
        "example": "休みの日も怠けずに、日本語の勉強を続けている。",
        "examples": [
          {
            "text": "休みの日も怠けずに、日本語の勉強を続けている。",
            "translations": {
              "zh-Hant": "即使放假，我也不偷懶，持續學習日語。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-171249948271",
        "category": "5",
        "subcategory": "5.01",
        "term": "思いつく（おもいつく）",
        "headword": "思いつく",
        "reading": "おもいつく",
        "meanings": {
          "zh-Hant": "想到、想出"
        },
        "example": "散歩をしているときに、いい考えを思いついた。",
        "examples": [
          {
            "text": "散歩をしているときに、いい考えを思いついた。",
            "translations": {
              "zh-Hant": "散步的時候，我想到了一個好主意。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-2ec848c178ed",
        "category": "6",
        "subcategory": "6.01",
        "term": "慌ただしい（あわただしい）",
        "headword": "慌ただしい",
        "reading": "あわただしい",
        "meanings": {
          "zh-Hant": "忙亂、匆忙"
        },
        "example": "引っ越しの準備で、慌ただしい一週間を過ごした。",
        "examples": [
          {
            "text": "引っ越しの準備で、慌ただしい一週間を過ごした。",
            "translations": {
              "zh-Hant": "為了準備搬家，我度過了忙亂的一週。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-cb8c98168bd4",
        "category": "6",
        "subcategory": "6.01",
        "term": "能率（のうりつ）",
        "headword": "能率",
        "reading": "のうりつ",
        "meanings": {
          "zh-Hant": "效率、工作效率"
        },
        "example": "道具の置き場所を変えたら、仕事の能率が上がった。",
        "examples": [
          {
            "text": "道具の置き場所を変えたら、仕事の能率が上がった。",
            "translations": {
              "zh-Hant": "改變工具的擺放位置後，工作效率提高了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b4c3a6bcdbe8",
        "category": "6",
        "subcategory": "6.01",
        "term": "引き受ける（ひきうける）",
        "headword": "引き受ける",
        "reading": "ひきうける",
        "meanings": {
          "zh-Hant": "承擔、接受委託"
        },
        "example": "忙しい同僚に代わって、会議の準備を引き受けた。",
        "examples": [
          {
            "text": "忙しい同僚に代わって、会議の準備を引き受けた。",
            "translations": {
              "zh-Hant": "我代替忙碌的同事，接下了準備會議的工作。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-29f0c8eca618",
        "category": "6",
        "subcategory": "6.01",
        "term": "失業（しつぎょう）",
        "headword": "失業",
        "reading": "しつぎょう",
        "meanings": {
          "zh-Hant": "失業"
        },
        "example": "父は失業した後、新しい仕事を探し始めた。",
        "examples": [
          {
            "text": "父は失業した後、新しい仕事を探し始めた。",
            "translations": {
              "zh-Hant": "父親失業後，開始尋找新工作。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-a249b746a7bd",
        "category": "6",
        "subcategory": "6.01",
        "term": "稼ぐ（かせぐ）",
        "headword": "稼ぐ",
        "reading": "かせぐ",
        "meanings": {
          "zh-Hant": "賺錢、謀生"
        },
        "example": "学生のころは、店で働いて生活費を稼いでいた。",
        "examples": [
          {
            "text": "学生のころは、店で働いて生活費を稼いでいた。",
            "translations": {
              "zh-Hant": "學生時期，我在店裡打工賺生活費。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-cf4d6cb15471",
        "category": "7",
        "subcategory": "7.01",
        "term": "破産（はさん）",
        "headword": "破産",
        "reading": "はさん",
        "meanings": {
          "zh-Hant": "破產"
        },
        "example": "借金が増え続け、その会社はついに破産した。",
        "examples": [
          {
            "text": "借金が増え続け、その会社はついに破産した。",
            "translations": {
              "zh-Hant": "那家公司的債務不斷增加，最後終於破產了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-590cd32346f0",
        "category": "6",
        "subcategory": "6.01",
        "term": "月給（げっきゅう）",
        "headword": "月給",
        "reading": "げっきゅう",
        "meanings": {
          "zh-Hant": "月薪"
        },
        "example": "初めての月給で、両親に食事をごちそうした。",
        "examples": [
          {
            "text": "初めての月給で、両親に食事をごちそうした。",
            "translations": {
              "zh-Hant": "我領到第一份月薪後，請父母吃了一頓飯。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-eeef35e74dc6",
        "category": "6",
        "subcategory": "6.01",
        "term": "張り切る（はりきる）",
        "headword": "張り切る",
        "reading": "はりきる",
        "meanings": {
          "zh-Hant": "幹勁十足、精神抖擻"
        },
        "example": "初めて店を手伝うことになり、弟は朝から張り切っている。",
        "examples": [
          {
            "text": "初めて店を手伝うことになり、弟は朝から張り切っている。",
            "translations": {
              "zh-Hant": "第一次要幫店裡的忙，弟弟從早上起就幹勁十足。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-4e519d496fb4",
        "category": "7",
        "subcategory": "7.01",
        "term": "資本（しほん）",
        "headword": "資本",
        "reading": "しほん",
        "meanings": {
          "zh-Hant": "資本、資金"
        },
        "example": "二人は少ない資本で、小さな店を始めた。",
        "examples": [
          {
            "text": "二人は少ない資本で、小さな店を始めた。",
            "translations": {
              "zh-Hant": "兩人用不多的資金，開了一家小店。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-0a9ee0e6af2f",
        "category": "6",
        "subcategory": "6.01",
        "term": "雇う（やとう）",
        "headword": "雇う",
        "reading": "やとう",
        "meanings": {
          "zh-Hant": "僱用"
        },
        "example": "店が忙しくなったので、新しい店員を二人雇った。",
        "examples": [
          {
            "text": "店が忙しくなったので、新しい店員を二人雇った。",
            "translations": {
              "zh-Hant": "店裡變忙了，因此新僱用了兩名店員。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e9054af8a1ea",
        "category": "6",
        "subcategory": "6.01",
        "term": "募集（ぼしゅう）",
        "headword": "募集",
        "reading": "ぼしゅう",
        "meanings": {
          "zh-Hant": "招募、徵集"
        },
        "example": "図書館では、本の整理を手伝う人を募集している。",
        "examples": [
          {
            "text": "図書館では、本の整理を手伝う人を募集している。",
            "translations": {
              "zh-Hant": "圖書館正在招募幫忙整理書籍的人。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-66ec1ff92fe1",
        "category": "6",
        "subcategory": "6.01",
        "term": "重役（じゅうやく）",
        "headword": "重役",
        "reading": "じゅうやく",
        "meanings": {
          "zh-Hant": "公司董事、高級主管"
        },
        "example": "来週の会議には、会社の重役も出席する。",
        "examples": [
          {
            "text": "来週の会議には、会社の重役も出席する。",
            "translations": {
              "zh-Hant": "下週的會議，公司高階主管也會出席。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-6b39fef52ea6",
        "category": "6",
        "subcategory": "6.01",
        "term": "組合（くみあい）",
        "headword": "組合",
        "reading": "くみあい",
        "meanings": {
          "zh-Hant": "工會、合作社等組織"
        },
        "example": "労働組合が、働く時間について会社と話し合った。",
        "examples": [
          {
            "text": "労働組合が、働く時間について会社と話し合った。",
            "translations": {
              "zh-Hant": "工會和公司討論了工時問題。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7d4b3e381d4c",
        "category": "7",
        "subcategory": "7.01",
        "term": "金融（きんゆう）",
        "headword": "金融",
        "reading": "きんゆう",
        "meanings": {
          "zh-Hant": "金融"
        },
        "example": "兄は大学で経済を学び、今は金融の仕事をしている。",
        "examples": [
          {
            "text": "兄は大学で経済を学び、今は金融の仕事をしている。",
            "translations": {
              "zh-Hant": "哥哥在大學學習經濟，現在從事金融工作。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-59631e105136",
        "category": "7",
        "subcategory": "7.01",
        "term": "引き出す（ひきだす）",
        "headword": "引き出す",
        "reading": "ひきだす",
        "meanings": {
          "zh-Hant": "拉出；提款；引出"
        },
        "example": "旅行の前に、銀行で現金を引き出した。",
        "examples": [
          {
            "text": "旅行の前に、銀行で現金を引き出した。",
            "translations": {
              "zh-Hant": "旅行前，我到銀行提領了現金。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-d10c42c9b9ed",
        "category": "5",
        "subcategory": "5.01",
        "term": "当てはまる（あてはまる）",
        "headword": "当てはまる",
        "reading": "あてはまる",
        "meanings": {
          "zh-Hant": "適用、符合"
        },
        "example": "この説明は、すべての場合に当てはまるわけではない。",
        "examples": [
          {
            "text": "この説明は、すべての場合に当てはまるわけではない。",
            "translations": {
              "zh-Hant": "這個說明並不適用於所有情況。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-d8bb45ec238f",
        "category": "4",
        "subcategory": "4.01",
        "term": "追いかける（おいかける）",
        "headword": "追いかける",
        "reading": "おいかける",
        "meanings": {
          "zh-Hant": "追趕、追逐"
        },
        "example": "犬が転がるボールを追いかけて、庭を走り回った。",
        "examples": [
          {
            "text": "犬が転がるボールを追いかけて、庭を走り回った。",
            "translations": {
              "zh-Hant": "狗追著滾動的球，在庭院裡跑來跑去。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-fee823c5642b",
        "category": "9",
        "subcategory": "9.01",
        "term": "マスコミ（ますこみ）",
        "headword": "マスコミ",
        "reading": "ますこみ",
        "meanings": {
          "zh-Hant": "大眾傳媒、媒體"
        },
        "example": "事件の現場には、マスコミの記者が大勢集まった。",
        "examples": [
          {
            "text": "事件の現場には、マスコミの記者が大勢集まった。",
            "translations": {
              "zh-Hant": "事件現場聚集了許多媒體記者。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-a7e766a34c0c",
        "category": "9",
        "subcategory": "9.01",
        "term": "見出し（みだし）",
        "headword": "見出し",
        "reading": "みだし",
        "meanings": {
          "zh-Hant": "標題、小標題"
        },
        "example": "新聞の大きな見出しを見て、足を止めた。",
        "examples": [
          {
            "text": "新聞の大きな見出しを見て、足を止めた。",
            "translations": {
              "zh-Hant": "我看到報紙的大標題，不禁停下了腳步。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-51e4c5683e8c",
        "category": "10",
        "subcategory": "10.01",
        "term": "近々（ちかぢか）",
        "headword": "近々",
        "reading": "ちかぢか",
        "meanings": {
          "zh-Hant": "不久、近日內"
        },
        "example": "近々、駅の近くに新しい本屋ができるそうだ。",
        "examples": [
          {
            "text": "近々、駅の近くに新しい本屋ができるそうだ。",
            "translations": {
              "zh-Hant": "聽說車站附近不久後就會開一家新書店。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-6c753c6017fe",
        "category": "6",
        "subcategory": "6.01",
        "term": "自ら（みずから）",
        "headword": "自ら",
        "reading": "みずから",
        "meanings": {
          "zh-Hant": "親自；自己、主動地"
        },
        "example": "店長自ら客の前に出て、事情を説明した。",
        "examples": [
          {
            "text": "店長自ら客の前に出て、事情を説明した。",
            "translations": {
              "zh-Hant": "店長親自出面，向顧客說明情況。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-2ca0c3566834",
        "category": "7",
        "subcategory": "7.01",
        "term": "じっくり（じっくり）",
        "headword": "じっくり",
        "reading": "じっくり",
        "meanings": {
          "zh-Hant": "仔細地、耐心地"
        },
        "example": "大きな買い物なので、家族とじっくり相談したい。",
        "examples": [
          {
            "text": "大きな買い物なので、家族とじっくり相談したい。",
            "translations": {
              "zh-Hant": "因為是大筆消費，我想和家人仔細商量。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c8f01d9528f8",
        "category": "9",
        "subcategory": "9.01",
        "term": "流れる（ながれる）",
        "headword": "流れる",
        "reading": "ながれる",
        "meanings": {
          "zh-Hant": "流動；播放；流逝"
        },
        "example": "店の中には、静かな音楽が流れていた。",
        "examples": [
          {
            "text": "店の中には、静かな音楽が流れていた。",
            "translations": {
              "zh-Hant": "店裡播放著輕柔的音樂。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-8b99ec5c3b33",
        "category": "10",
        "subcategory": "10.01",
        "term": "掛かる（かかる）",
        "headword": "掛かる",
        "reading": "かかる",
        "meanings": {
          "zh-Hant": "花費時間或金錢；掛著；電話打來"
        },
        "example": "この修理には、一週間ほど掛かると言われた。",
        "examples": [
          {
            "text": "この修理には、一週間ほど掛かると言われた。",
            "translations": {
              "zh-Hant": "對方告訴我，這項修理大約需要一週。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-981b91b281ca",
        "category": "1",
        "subcategory": "1.01",
        "term": "浴びる（あびる）",
        "headword": "浴びる",
        "reading": "あびる",
        "meanings": {
          "zh-Hant": "淋、沐浴；受到、遭受"
        },
        "example": "毎朝シャワーを浴びてから、朝ご飯を食べる。",
        "examples": [
          {
            "text": "毎朝シャワーを浴びてから、朝ご飯を食べる。",
            "translations": {
              "zh-Hant": "我每天早上先淋浴，再吃早餐。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-a34d05d4c3d7",
        "category": "6",
        "subcategory": "6.01",
        "term": "消去（しょうきょ）",
        "headword": "消去",
        "reading": "しょうきょ",
        "meanings": {
          "zh-Hant": "消除、清除"
        },
        "example": "古い携帯電話を売る前に、保存したデータをすべて消去した。",
        "examples": [
          {
            "text": "古い携帯電話を売る前に、保存したデータをすべて消去した。",
            "translations": {
              "zh-Hant": "賣掉舊手機前，我清除了所有儲存的資料。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-132c92296835",
        "category": "6",
        "subcategory": "6.01",
        "term": "削除（さくじょ）",
        "headword": "削除",
        "reading": "さくじょ",
        "meanings": {
          "zh-Hant": "刪除"
        },
        "example": "間違えて同じ写真を二枚保存したので、一枚を削除した。",
        "examples": [
          {
            "text": "間違えて同じ写真を二枚保存したので、一枚を削除した。",
            "translations": {
              "zh-Hant": "我不小心把同一張照片存了兩次，所以刪掉了其中一張。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-347c9d2a0188",
        "category": "6",
        "subcategory": "6.01",
        "term": "添付する（てんぷする）",
        "headword": "添付する",
        "reading": "てんぷする",
        "meanings": {
          "zh-Hant": "附上、添加附件"
        },
        "example": "申込書をメールに添付して、担当者に送った。",
        "examples": [
          {
            "text": "申込書をメールに添付して、担当者に送った。",
            "translations": {
              "zh-Hant": "我把申請表附在電子郵件中，寄給了負責人。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9b7ee1c03afd",
        "category": "6",
        "subcategory": "6.01",
        "term": "拡大（かくだい）",
        "headword": "拡大",
        "reading": "かくだい",
        "meanings": {
          "zh-Hant": "擴大、放大"
        },
        "example": "地図を拡大すると、小さな道の名前まで読めた。",
        "examples": [
          {
            "text": "地図を拡大すると、小さな道の名前まで読めた。",
            "translations": {
              "zh-Hant": "把地圖放大後，連小路的名稱都看得清楚了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b93cfc8549ea",
        "category": "6",
        "subcategory": "6.01",
        "term": "縮小（しゅくしょう）",
        "headword": "縮小",
        "reading": "しゅくしょう",
        "meanings": {
          "zh-Hant": "縮小"
        },
        "example": "写真を縮小して、履歴書の右上に貼った。",
        "examples": [
          {
            "text": "写真を縮小して、履歴書の右上に貼った。",
            "translations": {
              "zh-Hant": "我把照片縮小，貼在履歷表的右上角。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-0f27af0aa853",
        "category": "6",
        "subcategory": "6.01",
        "term": "接続する（せつぞくする）",
        "headword": "接続する",
        "reading": "せつぞくする",
        "meanings": {
          "zh-Hant": "連接、接通"
        },
        "example": "パソコンをテレビに接続して、家族で旅行の写真を見た。",
        "examples": [
          {
            "text": "パソコンをテレビに接続して、家族で旅行の写真を見た。",
            "translations": {
              "zh-Hant": "我把電腦連接到電視，和家人一起看旅行的照片。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-15c02c079cc9",
        "category": "6",
        "subcategory": "6.01",
        "term": "モニター（もにたー）",
        "headword": "モニター",
        "reading": "もにたー",
        "meanings": {
          "zh-Hant": "顯示器；監測；試用評價者"
        },
        "example": "モニターの位置を少し上げると、画面が見やすくなった。",
        "examples": [
          {
            "text": "モニターの位置を少し上げると、画面が見やすくなった。",
            "translations": {
              "zh-Hant": "把顯示器的位置稍微調高後，畫面就更容易看清楚了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c9fc5d2357fc",
        "category": "10",
        "subcategory": "10.01",
        "term": "若干（じゃっかん）",
        "headword": "若干",
        "reading": "じゃっかん",
        "meanings": {
          "zh-Hant": "少許、若干"
        },
        "example": "この二つの商品は、色に若干の違いがある。",
        "examples": [
          {
            "text": "この二つの商品は、色に若干の違いがある。",
            "translations": {
              "zh-Hant": "這兩件商品的顏色略有差異。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-3cccab07e675",
        "category": "6",
        "subcategory": "6.01",
        "term": "変換（へんかん）",
        "headword": "変換",
        "reading": "へんかん",
        "meanings": {
          "zh-Hant": "轉換"
        },
        "example": "名前を入力したら、別の漢字に変換されてしまった。",
        "examples": [
          {
            "text": "名前を入力したら、別の漢字に変換されてしまった。",
            "translations": {
              "zh-Hant": "輸入姓名後，文字卻被轉換成了別的漢字。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-64dfd361e4bd",
        "category": "10",
        "subcategory": "10.01",
        "term": "大まか（おおまか）",
        "headword": "大まか",
        "reading": "おおまか",
        "meanings": {
          "zh-Hant": "粗略、大致"
        },
        "example": "出張の日程は、大まかに決めてから細かく調整しよう。",
        "examples": [
          {
            "text": "出張の日程は、大まかに決めてから細かく調整しよう。",
            "translations": {
              "zh-Hant": "出差行程先大致定下來，再調整細節吧。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-a8d44d0b5ac6",
        "category": "8",
        "subcategory": "8.01",
        "term": "でたらめ（でたらめ）",
        "headword": "でたらめ",
        "reading": "でたらめ",
        "meanings": {
          "zh-Hant": "胡說、胡亂；毫無根據"
        },
        "example": "彼の話はでたらめで、実際にはそんな店は存在しなかった。",
        "examples": [
          {
            "text": "彼の話はでたらめで、実際にはそんな店は存在しなかった。",
            "translations": {
              "zh-Hant": "他說的話全是胡扯，實際上根本沒有那家店。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-56eef131feef",
        "category": "10",
        "subcategory": "10.01",
        "term": "うっかり（うっかり）",
        "headword": "うっかり",
        "reading": "うっかり",
        "meanings": {
          "zh-Hant": "不留神、疏忽地"
        },
        "example": "急いでいたので、うっかり傘を電車に忘れてしまった。",
        "examples": [
          {
            "text": "急いでいたので、うっかり傘を電車に忘れてしまった。",
            "translations": {
              "zh-Hant": "因為趕時間，我不留神把傘忘在電車上了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5cbd0ef84f5c",
        "category": "6",
        "subcategory": "6.01",
        "term": "音声（おんせい）",
        "headword": "音声",
        "reading": "おんせい",
        "meanings": {
          "zh-Hant": "語音、聲音"
        },
        "example": "この動画は音声が小さくて、何を言っているのか聞き取れない。",
        "examples": [
          {
            "text": "この動画は音声が小さくて、何を言っているのか聞き取れない。",
            "translations": {
              "zh-Hant": "這段影片的聲音太小，聽不清楚在說什麼。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-79d23cf5964e",
        "category": "6",
        "subcategory": "6.01",
        "term": "立ち上げる（たちあげる）",
        "headword": "立ち上げる",
        "reading": "たちあげる",
        "meanings": {
          "zh-Hant": "啟動；創辦、成立"
        },
        "example": "大学時代の友人と、小さな会社を立ち上げた。",
        "examples": [
          {
            "text": "大学時代の友人と、小さな会社を立ち上げた。",
            "translations": {
              "zh-Hant": "我和大學時代的朋友一起創辦了一家小公司。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f0f420f9ae7d",
        "category": "9",
        "subcategory": "9.01",
        "term": "盛り上げる（もりあげる）",
        "headword": "盛り上げる",
        "reading": "もりあげる",
        "meanings": {
          "zh-Hant": "堆高；使氣氛熱烈"
        },
        "example": "司会者の明るい話し方が、会場の雰囲気を盛り上げた。",
        "examples": [
          {
            "text": "司会者の明るい話し方が、会場の雰囲気を盛り上げた。",
            "translations": {
              "zh-Hant": "主持人開朗的說話方式讓會場的氣氛熱絡了起來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5c627509af2f",
        "category": "9",
        "subcategory": "9.01",
        "term": "仏（ほとけ）",
        "headword": "仏",
        "reading": "ほとけ",
        "meanings": {
          "zh-Hant": "佛；逝者"
        },
        "example": "寺の本堂に入り、仏の前で静かに手を合わせた。",
        "examples": [
          {
            "text": "寺の本堂に入り、仏の前で静かに手を合わせた。",
            "translations": {
              "zh-Hant": "走進寺院正殿後，我在佛像前靜靜地合掌。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-517a29772196",
        "category": "8",
        "subcategory": "8.01",
        "term": "願う（ねがう）",
        "headword": "願う",
        "reading": "ねがう",
        "meanings": {
          "zh-Hant": "希望、祈願；請求"
        },
        "example": "離れて暮らす両親の健康を、いつも願っている。",
        "examples": [
          {
            "text": "離れて暮らす両親の健康を、いつも願っている。",
            "translations": {
              "zh-Hant": "我一直祈願住在遠方的父母身體健康。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-d47715c4a81e",
        "category": "9",
        "subcategory": "9.01",
        "term": "ふさわしい（ふさわしい）",
        "headword": "ふさわしい",
        "reading": "ふさわしい",
        "meanings": {
          "zh-Hant": "合適、相稱"
        },
        "example": "式典には、その場にふさわしい服装で出席してください。",
        "examples": [
          {
            "text": "式典には、その場にふさわしい服装で出席してください。",
            "translations": {
              "zh-Hant": "出席典禮時，請穿著適合該場合的服裝。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-fa8108591f86",
        "category": "8",
        "subcategory": "8.01",
        "term": "承諾（しょうだく）",
        "headword": "承諾",
        "reading": "しょうだく",
        "meanings": {
          "zh-Hant": "同意、答應"
        },
        "example": "店長の承諾を得てから、店内の写真を撮った。",
        "examples": [
          {
            "text": "店長の承諾を得てから、店内の写真を撮った。",
            "translations": {
              "zh-Hant": "取得店長的同意後，我才拍攝店內的照片。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-fa49e5e95c28",
        "category": "8",
        "subcategory": "8.01",
        "term": "築く（きずく）",
        "headword": "築く",
        "reading": "きずく",
        "meanings": {
          "zh-Hant": "建造；建立、奠定"
        },
        "example": "何度も話し合うことで、少しずつ信頼関係を築いてきた。",
        "examples": [
          {
            "text": "何度も話し合うことで、少しずつ信頼関係を築いてきた。",
            "translations": {
              "zh-Hant": "透過一次次的溝通，我們逐漸建立了信任關係。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5b71f796f11e",
        "category": "7",
        "subcategory": "7.01",
        "term": "資金（しきん）",
        "headword": "資金",
        "reading": "しきん",
        "meanings": {
          "zh-Hant": "資金"
        },
        "example": "店を開くための資金を、三年間かけて用意した。",
        "examples": [
          {
            "text": "店を開くための資金を、三年間かけて用意した。",
            "translations": {
              "zh-Hant": "我花了三年時間，籌備開店所需的資金。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b8e42de9b489",
        "category": "8",
        "subcategory": "8.01",
        "term": "花嫁（はなよめ）",
        "headword": "花嫁",
        "reading": "はなよめ",
        "meanings": {
          "zh-Hant": "新娘"
        },
        "example": "花嫁は父親と腕を組んで、ゆっくり歩いてきた。",
        "examples": [
          {
            "text": "花嫁は父親と腕を組んで、ゆっくり歩いてきた。",
            "translations": {
              "zh-Hant": "新娘挽著父親的手臂，緩緩地走了過來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7554311e6296",
        "category": "8",
        "subcategory": "8.01",
        "term": "盛大（せいだい）",
        "headword": "盛大",
        "reading": "せいだい",
        "meanings": {
          "zh-Hant": "盛大、隆重"
        },
        "example": "祖父の九十歳の誕生日を、親戚一同で盛大に祝った。",
        "examples": [
          {
            "text": "祖父の九十歳の誕生日を、親戚一同で盛大に祝った。",
            "translations": {
              "zh-Hant": "親戚們齊聚一堂，隆重地慶祝祖父的九十大壽。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-61f5062c5fca",
        "category": "8",
        "subcategory": "8.01",
        "term": "豪華（ごうか）",
        "headword": "豪華",
        "reading": "ごうか",
        "meanings": {
          "zh-Hant": "豪華、奢華"
        },
        "example": "こんなに豪華なホテルに泊まるのは、初めてだ。",
        "examples": [
          {
            "text": "こんなに豪華なホテルに泊まるのは、初めてだ。",
            "translations": {
              "zh-Hant": "這是我第一次入住這麼豪華的飯店。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-93b59c20f95e",
        "category": "8",
        "subcategory": "8.01",
        "term": "華やかな（はなやかな）",
        "headword": "華やかな",
        "reading": "はなやかな",
        "meanings": {
          "zh-Hant": "華麗的、光彩奪目的"
        },
        "example": "華やかな衣装を着た踊り手たちが、舞台に並んだ。",
        "examples": [
          {
            "text": "華やかな衣装を着た踊り手たちが、舞台に並んだ。",
            "translations": {
              "zh-Hant": "穿著華麗服裝的舞者們在舞臺上排成一列。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-fbfdc775541a",
        "category": "8",
        "subcategory": "8.01",
        "term": "育つ（そだつ）",
        "headword": "育つ",
        "reading": "そだつ",
        "meanings": {
          "zh-Hant": "成長、長大"
        },
        "example": "この野菜は、日当たりのよい場所でよく育つ。",
        "examples": [
          {
            "text": "この野菜は、日当たりのよい場所でよく育つ。",
            "translations": {
              "zh-Hant": "這種蔬菜在日照充足的地方長得很好。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c36ddb19611f",
        "category": "6",
        "subcategory": "6.01",
        "term": "果たす（はたす）",
        "headword": "果たす",
        "reading": "はたす",
        "meanings": {
          "zh-Hant": "完成、履行；實現"
        },
        "example": "最後まで責任を果たした彼に、みんなが感謝した。",
        "examples": [
          {
            "text": "最後まで責任を果たした彼に、みんなが感謝した。",
            "translations": {
              "zh-Hant": "大家都很感謝他負責到底，履行了自己的職責。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-36c6ea231e20",
        "category": "6",
        "subcategory": "6.01",
        "term": "奮闘（ふんとう）",
        "headword": "奮闘",
        "reading": "ふんとう",
        "meanings": {
          "zh-Hant": "奮鬥、奮力拼搏"
        },
        "example": "慣れない仕事に奮闘する弟を、家族みんなで応援している。",
        "examples": [
          {
            "text": "慣れない仕事に奮闘する弟を、家族みんなで応援している。",
            "translations": {
              "zh-Hant": "弟弟正努力適應不熟悉的工作，全家人都在為他加油。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-3f97ae492d3e",
        "category": "8",
        "subcategory": "8.01",
        "term": "墓（はか）",
        "headword": "墓",
        "reading": "はか",
        "meanings": {
          "zh-Hant": "墳墓"
        },
        "example": "お盆には家族で祖母の墓を訪れ、花を供える。",
        "examples": [
          {
            "text": "お盆には家族で祖母の墓を訪れ、花を供える。",
            "translations": {
              "zh-Hant": "盂蘭盆節時，我們全家會到祖母的墓前獻花。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-d5189b4ed971",
        "category": "8",
        "subcategory": "8.01",
        "term": "墓地（ぼち）",
        "headword": "墓地",
        "reading": "ぼち",
        "meanings": {
          "zh-Hant": "墓地、公墓"
        },
        "example": "丘の上の墓地からは、遠くの海が見える。",
        "examples": [
          {
            "text": "丘の上の墓地からは、遠くの海が見える。",
            "translations": {
              "zh-Hant": "從山丘上的墓地可以看見遠處的大海。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9d3ad54d8ecc",
        "category": "8",
        "subcategory": "8.01",
        "term": "葬儀（そうぎ）",
        "headword": "葬儀",
        "reading": "そうぎ",
        "meanings": {
          "zh-Hant": "葬禮"
        },
        "example": "葬儀には、故人と親しかった友人たちが集まった。",
        "examples": [
          {
            "text": "葬儀には、故人と親しかった友人たちが集まった。",
            "translations": {
              "zh-Hant": "與逝者交好的朋友們都來參加了葬禮。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5c99740caf0f",
        "category": "8",
        "subcategory": "8.01",
        "term": "故人（こじん）",
        "headword": "故人",
        "reading": "こじん",
        "meanings": {
          "zh-Hant": "已故的人、逝者"
        },
        "example": "遺族の希望で、会場には故人の好きだった音楽が流れた。",
        "examples": [
          {
            "text": "遺族の希望で、会場には故人の好きだった音楽が流れた。",
            "translations": {
              "zh-Hant": "依照家屬的意願，會場播放了逝者生前喜愛的音樂。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f0e13850478a",
        "category": "8",
        "subcategory": "8.01",
        "term": "惜しむ（おしむ）",
        "headword": "惜しむ",
        "reading": "おしむ",
        "meanings": {
          "zh-Hant": "惋惜、不捨；吝惜"
        },
        "example": "留学生たちは、別れを惜しんで何度も手を振った。",
        "examples": [
          {
            "text": "留学生たちは、別れを惜しんで何度も手を振った。",
            "translations": {
              "zh-Hant": "留學生們依依不捨，不斷揮手道別。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-a4aab44a3e36",
        "category": "8",
        "subcategory": "8.01",
        "term": "嘆く（なげく）",
        "headword": "嘆く",
        "reading": "なげく",
        "meanings": {
          "zh-Hant": "嘆息、悲嘆"
        },
        "example": "失敗を嘆くばかりではなく、次に何ができるか考えよう。",
        "examples": [
          {
            "text": "失敗を嘆くばかりではなく、次に何ができるか考えよう。",
            "translations": {
              "zh-Hant": "別只顧著為失敗嘆息，想想接下來能做些什麼吧。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-66e041a143ae",
        "category": "8",
        "subcategory": "8.01",
        "term": "すくすく（すくすく）",
        "headword": "すくすく",
        "reading": "すくすく",
        "meanings": {
          "zh-Hant": "茁壯成長的樣子"
        },
        "example": "庭に植えた木は、すくすくと育っている。",
        "examples": [
          {
            "text": "庭に植えた木は、すくすくと育っている。",
            "translations": {
              "zh-Hant": "種在庭院裡的樹正茁壯成長。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-792699b256cd",
        "category": "8",
        "subcategory": "8.01",
        "term": "のびのび（のびのび）",
        "headword": "のびのび",
        "reading": "のびのび",
        "meanings": {
          "zh-Hant": "自由自在、無拘無束"
        },
        "example": "子どもたちは広い芝生の上で、のびのびと遊んでいた。",
        "examples": [
          {
            "text": "子どもたちは広い芝生の上で、のびのびと遊んでいた。",
            "translations": {
              "zh-Hant": "孩子們在寬闊的草地上無拘無束地玩耍。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-52ee65a6539b",
        "category": "9",
        "subcategory": "9.01",
        "term": "遭う（あう）",
        "headword": "遭う",
        "reading": "あう",
        "meanings": {
          "zh-Hant": "遭遇、碰上不幸的事"
        },
        "example": "旅行中に盗難に遭い、財布をなくしてしまった。",
        "examples": [
          {
            "text": "旅行中に盗難に遭い、財布をなくしてしまった。",
            "translations": {
              "zh-Hant": "我在旅行途中遭竊，錢包被偷走了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-4625696f2712",
        "category": "9",
        "subcategory": "9.01",
        "term": "取り締まる（とりしまる）",
        "headword": "取り締まる",
        "reading": "とりしまる",
        "meanings": {
          "zh-Hant": "取締、查禁；監督管理"
        },
        "example": "警察は、駅前の違法駐車を厳しく取り締まっている。",
        "examples": [
          {
            "text": "警察は、駅前の違法駐車を厳しく取り締まっている。",
            "translations": {
              "zh-Hant": "警方正在嚴格取締車站前的違規停車。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-844a4ef06f61",
        "category": "9",
        "subcategory": "9.01",
        "term": "備える（そなえる）",
        "headword": "備える",
        "reading": "そなえる",
        "meanings": {
          "zh-Hant": "準備、防備；配備"
        },
        "example": "停電に備えて、懐中電灯を取り出しやすい場所に置いた。",
        "examples": [
          {
            "text": "停電に備えて、懐中電灯を取り出しやすい場所に置いた。",
            "translations": {
              "zh-Hant": "為了因應停電，我把手電筒放在容易拿取的地方。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f12b034e1987",
        "category": "4",
        "subcategory": "4.01",
        "term": "土砂（どしゃ）",
        "headword": "土砂",
        "reading": "どしゃ",
        "meanings": {
          "zh-Hant": "泥沙、土石"
        },
        "example": "大雨で流れ込んだ土砂が、道路をふさいでいた。",
        "examples": [
          {
            "text": "大雨で流れ込んだ土砂が、道路をふさいでいた。",
            "translations": {
              "zh-Hant": "大雨沖來的泥沙堵住了道路。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-392bea7ab8a7",
        "category": "4",
        "subcategory": "4.01",
        "term": "崩れ（くずれ）",
        "headword": "崩れ",
        "reading": "くずれ",
        "meanings": {
          "zh-Hant": "崩塌、倒塌；潰散"
        },
        "example": "土砂崩れで、山へ続く道路が通れなくなった。",
        "examples": [
          {
            "text": "土砂崩れで、山へ続く道路が通れなくなった。",
            "translations": {
              "zh-Hant": "通往山裡的道路因土石崩塌而無法通行了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-07096ea69a5a",
        "category": "4",
        "subcategory": "4.01",
        "term": "河川（かせん）",
        "headword": "河川",
        "reading": "かせん",
        "meanings": {
          "zh-Hant": "河川、河流"
        },
        "example": "この町では、河川の水質を毎月調べている。",
        "examples": [
          {
            "text": "この町では、河川の水質を毎月調べている。",
            "translations": {
              "zh-Hant": "這個城鎮每個月都會檢測河川的水質。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-51ccfe139379",
        "category": "4",
        "subcategory": "4.01",
        "term": "氾濫（はんらん）",
        "headword": "氾濫",
        "reading": "はんらん",
        "meanings": {
          "zh-Hant": "氾濫、洪水泛濫"
        },
        "example": "川の氾濫を恐れて、住民たちは高台へ避難した。",
        "examples": [
          {
            "text": "川の氾濫を恐れて、住民たちは高台へ避難した。",
            "translations": {
              "zh-Hant": "居民們擔心河水氾濫，紛紛撤離到高地。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5207d0973aa5",
        "category": "4",
        "subcategory": "4.01",
        "term": "噴火（ふんか）",
        "headword": "噴火",
        "reading": "ふんか",
        "meanings": {
          "zh-Hant": "火山噴發"
        },
        "example": "火山の噴火で、近くの空港は一時閉鎖された。",
        "examples": [
          {
            "text": "火山の噴火で、近くの空港は一時閉鎖された。",
            "translations": {
              "zh-Hant": "附近的機場因火山噴發而暫時關閉了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-350bbaf297db",
        "category": "9",
        "subcategory": "9.01",
        "term": "救済する（きゅうさいする）",
        "headword": "救済する",
        "reading": "きゅうさいする",
        "meanings": {
          "zh-Hant": "救濟、救助"
        },
        "example": "市は、災害で家を失った人々を救済する制度を設けた。",
        "examples": [
          {
            "text": "市は、災害で家を失った人々を救済する制度を設けた。",
            "translations": {
              "zh-Hant": "市政府設立了救助在災害中失去家園者的制度。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-eb57604bfc49",
        "category": "9",
        "subcategory": "9.01",
        "term": "復旧する（ふっきゅうする）",
        "headword": "復旧する",
        "reading": "ふっきゅうする",
        "meanings": {
          "zh-Hant": "修復、恢復原狀"
        },
        "example": "修理が終わり、止まっていた水道がようやく復旧した。",
        "examples": [
          {
            "text": "修理が終わり、止まっていた水道がようやく復旧した。",
            "translations": {
              "zh-Hant": "維修結束後，中斷的供水終於恢復了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-dea14f941c88",
        "category": "10",
        "subcategory": "10.01",
        "term": "依然（いぜん）",
        "headword": "依然",
        "reading": "いぜん",
        "meanings": {
          "zh-Hant": "依然、仍然"
        },
        "example": "薬を飲んでも、熱は依然として下がらなかった。",
        "examples": [
          {
            "text": "薬を飲んでも、熱は依然として下がらなかった。",
            "translations": {
              "zh-Hant": "即使吃了藥，體溫仍然沒有降下來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-fcd14c0e7079",
        "category": "10",
        "subcategory": "10.01",
        "term": "直ちに（ただちに）",
        "headword": "直ちに",
        "reading": "ただちに",
        "meanings": {
          "zh-Hant": "立即、馬上"
        },
        "example": "異常に気づいた作業員は、直ちに機械を止めた。",
        "examples": [
          {
            "text": "異常に気づいた作業員は、直ちに機械を止めた。",
            "translations": {
              "zh-Hant": "察覺異常的作業員立即停止了機器。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-38170bc8f9fa",
        "category": "8",
        "subcategory": "8.01",
        "term": "浮気（うわき）",
        "headword": "浮気",
        "reading": "うわき",
        "meanings": {
          "zh-Hant": "外遇；見異思遷"
        },
        "example": "夫の浮気を知ってから、二人の関係は悪くなった。",
        "examples": [
          {
            "text": "夫の浮気を知ってから、二人の関係は悪くなった。",
            "translations": {
              "zh-Hant": "得知丈夫外遇後，兩人的關係變差了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-447a2d835b7e",
        "category": "7",
        "subcategory": "7.01",
        "term": "貯める（ためる）",
        "headword": "貯める",
        "reading": "ためる",
        "meanings": {
          "zh-Hant": "儲存、積攢"
        },
        "example": "新しい自転車を買うために、お小遣いを少しずつ貯めている。",
        "examples": [
          {
            "text": "新しい自転車を買うために、お小遣いを少しずつ貯めている。",
            "translations": {
              "zh-Hant": "為了買一輛新腳踏車，我正一點一滴地存零用錢。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-6303196fe310",
        "category": "6",
        "subcategory": "6.01",
        "term": "打ち合わせ（うちあわせ）",
        "headword": "打ち合わせ",
        "reading": "うちあわせ",
        "meanings": {
          "zh-Hant": "事先商量、工作磋商"
        },
        "example": "明日の会議の前に、担当者同士で打ち合わせをした。",
        "examples": [
          {
            "text": "明日の会議の前に、担当者同士で打ち合わせをした。",
            "translations": {
              "zh-Hant": "明天開會之前，負責人之間先做了事前討論。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-429faaa8b90b",
        "category": "10",
        "subcategory": "10.01",
        "term": "細やか（ささやか）",
        "headword": "細やか",
        "reading": "ささやか",
        "meanings": {
          "zh-Hant": "微薄、簡單、小小的"
        },
        "example": "細やかな贈り物ですが、どうぞお受け取りください。",
        "examples": [
          {
            "text": "細やかな贈り物ですが、どうぞお受け取りください。",
            "translations": {
              "zh-Hant": "這只是一份小小的禮物，請您收下。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f8bc3b96de75",
        "category": "6",
        "subcategory": "6.01",
        "term": "努める（つとめる）",
        "headword": "努める",
        "reading": "つとめる",
        "meanings": {
          "zh-Hant": "努力、盡力"
        },
        "example": "誤解を招かないように、分かりやすい説明に努めた。",
        "examples": [
          {
            "text": "誤解を招かないように、分かりやすい説明に努めた。",
            "translations": {
              "zh-Hant": "為了避免引起誤會，我盡力把事情解釋清楚。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ca26aa1fb3d2",
        "category": "3",
        "subcategory": "3.01",
        "term": "行方（ゆくえ）",
        "headword": "行方",
        "reading": "ゆくえ",
        "meanings": {
          "zh-Hant": "去向、下落"
        },
        "example": "駅でいなくなった犬の行方を、家族で捜している。",
        "examples": [
          {
            "text": "駅でいなくなった犬の行方を、家族で捜している。",
            "translations": {
              "zh-Hant": "全家人正在尋找那隻在車站走失的狗。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-44e1eb4ec752",
        "category": "3",
        "subcategory": "3.01",
        "term": "差し掛かる（さしかかる）",
        "headword": "差し掛かる",
        "reading": "さしかかる",
        "meanings": {
          "zh-Hant": "來到、行至；臨近"
        },
        "example": "橋に差し掛かったところで、急に雨が降り出した。",
        "examples": [
          {
            "text": "橋に差し掛かったところで、急に雨が降り出した。",
            "translations": {
              "zh-Hant": "剛走到橋邊，天就突然下起雨來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-151fbc2fa542",
        "category": "6",
        "subcategory": "6.01",
        "term": "役割（やくわり）",
        "headword": "役割",
        "reading": "やくわり",
        "meanings": {
          "zh-Hant": "角色、職責"
        },
        "example": "文化祭では、私は会場を案内する役割を任された。",
        "examples": [
          {
            "text": "文化祭では、私は会場を案内する役割を任された。",
            "translations": {
              "zh-Hant": "在文化祭上，我被指派負責引導來賓。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-66874224e11d",
        "category": "3",
        "subcategory": "3.01",
        "term": "預ける（あずける）",
        "headword": "預ける",
        "reading": "あずける",
        "meanings": {
          "zh-Hant": "寄存、託付"
        },
        "example": "大きな荷物をホテルに預けてから、町を歩いた。",
        "examples": [
          {
            "text": "大きな荷物をホテルに預けてから、町を歩いた。",
            "translations": {
              "zh-Hant": "把大型行李寄放在飯店後，我才去逛街。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-3b510423ae33",
        "category": "9",
        "subcategory": "9.01",
        "term": "取り押さえる（とりおさえる）",
        "headword": "取り押さえる",
        "reading": "とりおさえる",
        "meanings": {
          "zh-Hant": "抓住、制伏、逮住"
        },
        "example": "逃げようとした男を、二人の警備員が取り押さえた。",
        "examples": [
          {
            "text": "逃げようとした男を、二人の警備員が取り押さえた。",
            "translations": {
              "zh-Hant": "兩名警衛制伏了試圖逃跑的男子。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-df217f5af861",
        "category": "7",
        "subcategory": "7.01",
        "term": "貯金する（ちょきんする）",
        "headword": "貯金する",
        "reading": "ちょきんする",
        "meanings": {
          "zh-Hant": "存錢、儲蓄"
        },
        "example": "給料が入るたびに、決まった額を貯金している。",
        "examples": [
          {
            "text": "給料が入るたびに、決まった額を貯金している。",
            "translations": {
              "zh-Hant": "每次領到薪水，我都會把固定金額存起來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-8eb3be71614b",
        "category": "7",
        "subcategory": "7.01",
        "term": "貯蓄する（ちょちくする）",
        "headword": "貯蓄する",
        "reading": "ちょちくする",
        "meanings": {
          "zh-Hant": "儲蓄、積蓄財物"
        },
        "example": "将来の学費に備えて、夫婦で毎月貯蓄している。",
        "examples": [
          {
            "text": "将来の学費に備えて、夫婦で毎月貯蓄している。",
            "translations": {
              "zh-Hant": "為了準備將來的學費，我們夫妻每個月都會儲蓄。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-4e805d8f7d5e",
        "category": "7",
        "subcategory": "7.01",
        "term": "借金（しゃっきん）",
        "headword": "借金",
        "reading": "しゃっきん",
        "meanings": {
          "zh-Hant": "借款、債務"
        },
        "example": "借金を返すために、しばらく支出を減らすことにした。",
        "examples": [
          {
            "text": "借金を返すために、しばらく支出を減らすことにした。",
            "translations": {
              "zh-Hant": "為了償還債務，我決定暫時減少開銷。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-dc8ecdc92f3a",
        "category": "7",
        "subcategory": "7.01",
        "term": "利子（りし）",
        "headword": "利子",
        "reading": "りし",
        "meanings": {
          "zh-Hant": "利息"
        },
        "example": "借りたお金には利子がつくので、返す総額を確認した。",
        "examples": [
          {
            "text": "借りたお金には利子がつくので、返す総額を確認した。",
            "translations": {
              "zh-Hant": "借款會產生利息，所以我確認了應償還的總金額。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-00c749ea416f",
        "category": "7",
        "subcategory": "7.01",
        "term": "利息（りそく）",
        "headword": "利息",
        "reading": "りそく",
        "meanings": {
          "zh-Hant": "利息"
        },
        "example": "通帳を見たら、預金に少し利息がついていた。",
        "examples": [
          {
            "text": "通帳を見たら、預金に少し利息がついていた。",
            "translations": {
              "zh-Hant": "查看存摺時，我發現存款多了一點利息。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-84da74d6df57",
        "category": "7",
        "subcategory": "7.01",
        "term": "納税（のうぜい）",
        "headword": "納税",
        "reading": "のうぜい",
        "meanings": {
          "zh-Hant": "納稅"
        },
        "example": "納税の期限が近づいているので、必要な書類をそろえた。",
        "examples": [
          {
            "text": "納税の期限が近づいているので、必要な書類をそろえた。",
            "translations": {
              "zh-Hant": "納稅期限快到了，所以我備齊了所需文件。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7035723c5a79",
        "category": "7",
        "subcategory": "7.01",
        "term": "納める（おさめる）",
        "headword": "納める",
        "reading": "おさめる",
        "meanings": {
          "zh-Hant": "繳納；交付"
        },
        "example": "今年の税金は、期限までにすべて納めた。",
        "examples": [
          {
            "text": "今年の税金は、期限までにすべて納めた。",
            "translations": {
              "zh-Hant": "今年的稅款，我已在期限內全部繳清了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-904b423883d3",
        "category": "4",
        "subcategory": "4.01",
        "term": "耕す（たがやす）",
        "headword": "耕す",
        "reading": "たがやす",
        "meanings": {
          "zh-Hant": "耕地、翻耕"
        },
        "example": "春になると、祖父は畑を耕して野菜を植える準備をする。",
        "examples": [
          {
            "text": "春になると、祖父は畑を耕して野菜を植える準備をする。",
            "translations": {
              "zh-Hant": "春天一到，祖父就翻耕田地，準備種菜。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-aadcb6094a21",
        "category": "4",
        "subcategory": "4.01",
        "term": "畑（はたけ）",
        "headword": "畑",
        "reading": "はたけ",
        "meanings": {
          "zh-Hant": "旱田、田地"
        },
        "example": "家の裏の畑で、トマトときゅうりを育てている。",
        "examples": [
          {
            "text": "家の裏の畑で、トマトときゅうりを育てている。",
            "translations": {
              "zh-Hant": "我在屋後的田地裡種番茄和小黃瓜。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5dc09d821116",
        "category": "6",
        "subcategory": "6.01",
        "term": "出荷（しゅっか）",
        "headword": "出荷",
        "reading": "しゅっか",
        "meanings": {
          "zh-Hant": "出貨、發貨"
        },
        "example": "出荷する前に、箱の数と商品の状態を確認した。",
        "examples": [
          {
            "text": "出荷する前に、箱の数と商品の状態を確認した。",
            "translations": {
              "zh-Hant": "出貨前，我確認了箱數和商品的狀態。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-49949f404917",
        "category": "6",
        "subcategory": "6.01",
        "term": "供給（きょうきゅう）",
        "headword": "供給",
        "reading": "きょうきゅう",
        "meanings": {
          "zh-Hant": "供給、供應"
        },
        "example": "水道管の工事で、この地域への水の供給が止まった。",
        "examples": [
          {
            "text": "水道管の工事で、この地域への水の供給が止まった。",
            "translations": {
              "zh-Hant": "由於水管施工，這個地區暫停供水。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c8ef6dfc0c49",
        "category": "4",
        "subcategory": "4.01",
        "term": "天然（てんねん）",
        "headword": "天然",
        "reading": "てんねん",
        "meanings": {
          "zh-Hant": "天然、自然形成"
        },
        "example": "この石けんは、天然の植物油から作られている。",
        "examples": [
          {
            "text": "この石けんは、天然の植物油から作られている。",
            "translations": {
              "zh-Hant": "這款肥皂是用天然植物油製成的。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-3bd2b3ea92c7",
        "category": "10",
        "subcategory": "10.01",
        "term": "決して（けっして）",
        "headword": "決して",
        "reading": "けっして",
        "meanings": {
          "zh-Hant": "絕不、決不（後接否定）"
        },
        "example": "どんなに急いでいても、決して信号を無視してはいけない。",
        "examples": [
          {
            "text": "どんなに急いでいても、決して信号を無視してはいけない。",
            "translations": {
              "zh-Hant": "無論多麼趕時間，都絕對不能闖紅燈。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e09d9f52a8eb",
        "category": "5",
        "subcategory": "5.01",
        "term": "向上する（こうじょうする）",
        "headword": "向上する",
        "reading": "こうじょうする",
        "meanings": {
          "zh-Hant": "提高、進步"
        },
        "example": "毎日練習を続けた結果、会話の力が向上した。",
        "examples": [
          {
            "text": "毎日練習を続けた結果、会話の力が向上した。",
            "translations": {
              "zh-Hant": "每天持續練習後，我的會話能力進步了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-995d34d9efb6",
        "category": "10",
        "subcategory": "10.01",
        "term": "一旦（いったん）",
        "headword": "一旦",
        "reading": "いったん",
        "meanings": {
          "zh-Hant": "一旦；暫且"
        },
        "example": "作業を一旦止めて、全員で手順を確認した。",
        "examples": [
          {
            "text": "作業を一旦止めて、全員で手順を確認した。",
            "translations": {
              "zh-Hant": "我們先暫停作業，由所有人一起確認操作步驟。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-6602293de7ae",
        "category": "6",
        "subcategory": "6.01",
        "term": "取引先（とりひきさき）",
        "headword": "取引先",
        "reading": "とりひきさき",
        "meanings": {
          "zh-Hant": "業務往來對象、客戶"
        },
        "example": "午後は取引先を訪ねて、新しい商品を紹介する予定だ。",
        "examples": [
          {
            "text": "午後は取引先を訪ねて、新しい商品を紹介する予定だ。",
            "translations": {
              "zh-Hant": "下午預計拜訪客戶，向對方介紹新商品。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-1c82f160f6e8",
        "category": "7",
        "subcategory": "7.01",
        "term": "下ろす（おろす）",
        "headword": "下ろす",
        "reading": "おろす",
        "meanings": {
          "zh-Hant": "放下、卸下；提款"
        },
        "example": "重いリュックを下ろして、ベンチで少し休んだ。",
        "examples": [
          {
            "text": "重いリュックを下ろして、ベンチで少し休んだ。",
            "translations": {
              "zh-Hant": "我放下沉重的背包，坐在長椅上休息了一會兒。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-64eca7beef5d",
        "category": "6",
        "subcategory": "6.01",
        "term": "勤める（つとめる）",
        "headword": "勤める",
        "reading": "つとめる",
        "meanings": {
          "zh-Hant": "任職、在某處工作"
        },
        "example": "姉は大学を卒業してから、地元の銀行に勤めている。",
        "examples": [
          {
            "text": "姉は大学を卒業してから、地元の銀行に勤めている。",
            "translations": {
              "zh-Hant": "姊姊大學畢業後，一直在家鄉的銀行任職。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5e9b6ab04fab",
        "category": "9",
        "subcategory": "9.01",
        "term": "財務相（ざいむしょう）",
        "headword": "財務相",
        "reading": "ざいむしょう",
        "meanings": {
          "zh-Hant": "財政部長、財務大臣"
        },
        "example": "財務相は、来年度の予算案について説明した。",
        "examples": [
          {
            "text": "財務相は、来年度の予算案について説明した。",
            "translations": {
              "zh-Hant": "財政部長說明了下一年度的預算案。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-64c1d7ad8430",
        "category": "9",
        "subcategory": "9.01",
        "term": "合意する（ごういする）",
        "headword": "合意する",
        "reading": "ごういする",
        "meanings": {
          "zh-Hant": "達成共識、取得一致意見"
        },
        "example": "長い話し合いの末、両社は契約の条件に合意した。",
        "examples": [
          {
            "text": "長い話し合いの末、両社は契約の条件に合意した。",
            "translations": {
              "zh-Hant": "經過長時間討論，兩家公司終於就合約條件達成共識。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-62b20649bafc",
        "category": "7",
        "subcategory": "7.01",
        "term": "財政的（ざいせいてき）",
        "headword": "財政的",
        "reading": "ざいせいてき",
        "meanings": {
          "zh-Hant": "財政上的、財政方面的"
        },
        "example": "町の財政的な負担を減らすため、計画を見直した。",
        "examples": [
          {
            "text": "町の財政的な負担を減らすため、計画を見直した。",
            "translations": {
              "zh-Hant": "為了減輕鎮上的財政負擔，我們重新檢視了計畫。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ad909f09a289",
        "category": "9",
        "subcategory": "9.01",
        "term": "取り組み（とりくみ）",
        "headword": "取り組み",
        "reading": "とりくみ",
        "meanings": {
          "zh-Hant": "努力、措施；致力處理某事"
        },
        "example": "ごみを減らす取り組みが、地域全体に広がっている。",
        "examples": [
          {
            "text": "ごみを減らす取り組みが、地域全体に広がっている。",
            "translations": {
              "zh-Hant": "減少垃圾的行動正擴展到整個地區。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c3575fb9d3c8",
        "category": "9",
        "subcategory": "9.01",
        "term": "条約（じょうやく）",
        "headword": "条約",
        "reading": "じょうやく",
        "meanings": {
          "zh-Hant": "條約"
        },
        "example": "両国は、平和条約を結ぶことで合意した。",
        "examples": [
          {
            "text": "両国は、平和条約を結ぶことで合意した。",
            "translations": {
              "zh-Hant": "兩國同意締結和平條約。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-676d35169881",
        "category": "9",
        "subcategory": "9.01",
        "term": "見直す（みなおす）",
        "headword": "見直す",
        "reading": "みなおす",
        "meanings": {
          "zh-Hant": "重新檢視、修訂；重新評價"
        },
        "example": "無駄な出費がないか、家計を見直してみた。",
        "examples": [
          {
            "text": "無駄な出費がないか、家計を見直してみた。",
            "translations": {
              "zh-Hant": "我重新檢視了家中收支，看看是否有不必要的開銷。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-40420869b9af",
        "category": "9",
        "subcategory": "9.01",
        "term": "政策（せいさく）",
        "headword": "政策",
        "reading": "せいさく",
        "meanings": {
          "zh-Hant": "政策"
        },
        "example": "市の新しい交通政策について、住民向けの説明会が開かれた。",
        "examples": [
          {
            "text": "市の新しい交通政策について、住民向けの説明会が開かれた。",
            "translations": {
              "zh-Hant": "市政府針對新的交通政策，舉辦了面向居民的說明會。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-8713e798796d",
        "category": "9",
        "subcategory": "9.01",
        "term": "公共（こうきょう）",
        "headword": "公共",
        "reading": "こうきょう",
        "meanings": {
          "zh-Hant": "公共、公眾共有"
        },
        "example": "駅や図書館などの公共の場所では、周りの人に配慮しよう。",
        "examples": [
          {
            "text": "駅や図書館などの公共の場所では、周りの人に配慮しよう。",
            "translations": {
              "zh-Hant": "在車站、圖書館等公共場所，要多替周圍的人著想。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-4d0a24fe5248",
        "category": "9",
        "subcategory": "9.01",
        "term": "投票（とうひょう）",
        "headword": "投票",
        "reading": "とうひょう",
        "meanings": {
          "zh-Hant": "投票"
        },
        "example": "選挙の日、仕事に行く前に投票を済ませた。",
        "examples": [
          {
            "text": "選挙の日、仕事に行く前に投票を済ませた。",
            "translations": {
              "zh-Hant": "選舉當天，我在上班前先去投了票。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e2be8db39740",
        "category": "9",
        "subcategory": "9.01",
        "term": "定める（さだめる）",
        "headword": "定める",
        "reading": "さだめる",
        "meanings": {
          "zh-Hant": "決定、規定、制定"
        },
        "example": "新しい規則では、図書館の閉館時刻を午後八時と定めた。",
        "examples": [
          {
            "text": "新しい規則では、図書館の閉館時刻を午後八時と定めた。",
            "translations": {
              "zh-Hant": "新規定將圖書館的閉館時間訂為晚上八點。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ef0773440fcd",
        "category": "9",
        "subcategory": "9.01",
        "term": "改正する（かいせいする）",
        "headword": "改正する",
        "reading": "かいせいする",
        "meanings": {
          "zh-Hant": "修訂、修改法規等"
        },
        "example": "利用者の声を受けて、施設の利用規則を改正した。",
        "examples": [
          {
            "text": "利用者の声を受けて、施設の利用規則を改正した。",
            "translations": {
              "zh-Hant": "收到使用者的意見後，管理方修訂了設施使用規則。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-97187facef9c",
        "category": "9",
        "subcategory": "9.01",
        "term": "訴える（うったえる）",
        "headword": "訴える",
        "reading": "うったえる",
        "meanings": {
          "zh-Hant": "控訴；申訴、呼籲"
        },
        "example": "住民たちは、市に道路の危険性を訴えた。",
        "examples": [
          {
            "text": "住民たちは、市に道路の危険性を訴えた。",
            "translations": {
              "zh-Hant": "居民們向市政府反映了道路的危險性。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c20d84fcb521",
        "category": "9",
        "subcategory": "9.01",
        "term": "統一（とういつ）",
        "headword": "統一",
        "reading": "とういつ",
        "meanings": {
          "zh-Hant": "統一"
        },
        "example": "資料が読みやすくなるように、文字の大きさを統一した。",
        "examples": [
          {
            "text": "資料が読みやすくなるように、文字の大きさを統一した。",
            "translations": {
              "zh-Hant": "為了讓資料更容易閱讀，我統一了字體大小。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-34db3f566c25",
        "category": "9",
        "subcategory": "9.01",
        "term": "栄える（さかえる）",
        "headword": "栄える",
        "reading": "さかえる",
        "meanings": {
          "zh-Hant": "繁榮、興盛"
        },
        "example": "この町は港を中心に栄え、多くの商人が集まった。",
        "examples": [
          {
            "text": "この町は港を中心に栄え、多くの商人が集まった。",
            "translations": {
              "zh-Hant": "這座城鎮以港口為中心繁榮起來，吸引了許多商人。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-a9eafff236dd",
        "category": "9",
        "subcategory": "9.01",
        "term": "滅びる（ほろびる）",
        "headword": "滅びる",
        "reading": "ほろびる",
        "meanings": {
          "zh-Hant": "滅亡、衰亡"
        },
        "example": "戦争が続き、かつて栄えた王国は滅びてしまった。",
        "examples": [
          {
            "text": "戦争が続き、かつて栄えた王国は滅びてしまった。",
            "translations": {
              "zh-Hant": "戰爭連年不斷，曾經繁榮的王國終於滅亡了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-cd848ab2db82",
        "category": "9",
        "subcategory": "9.01",
        "term": "植民地（しょくみんち）",
        "headword": "植民地",
        "reading": "しょくみんち",
        "meanings": {
          "zh-Hant": "殖民地"
        },
        "example": "その小説は、かつて植民地だった島を舞台にしている。",
        "examples": [
          {
            "text": "その小説は、かつて植民地だった島を舞台にしている。",
            "translations": {
              "zh-Hant": "那部小說以一座曾經是殖民地的島嶼為背景。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-a93d3fb12942",
        "category": "9",
        "subcategory": "9.01",
        "term": "権力（けんりょく）",
        "headword": "権力",
        "reading": "けんりょく",
        "meanings": {
          "zh-Hant": "權力"
        },
        "example": "権力を持つ人ほど、自分の行動に責任を持つべきだ。",
        "examples": [
          {
            "text": "権力を持つ人ほど、自分の行動に責任を持つべきだ。",
            "translations": {
              "zh-Hant": "越是掌握權力的人，越應該對自己的行為負責。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-aa377d82b238",
        "category": "9",
        "subcategory": "9.01",
        "term": "握る（にぎる）",
        "headword": "握る",
        "reading": "にぎる",
        "meanings": {
          "zh-Hant": "握住；掌握"
        },
        "example": "迷子にならないように、娘の手をしっかり握った。",
        "examples": [
          {
            "text": "迷子にならないように、娘の手をしっかり握った。",
            "translations": {
              "zh-Hant": "為了避免女兒走失，我緊緊握住了她的手。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-bb2369cc699c",
        "category": "9",
        "subcategory": "9.01",
        "term": "庶民（しょみん）",
        "headword": "庶民",
        "reading": "しょみん",
        "meanings": {
          "zh-Hant": "平民、一般民眾"
        },
        "example": "この食堂は、安くておいしい庶民の味で知られている。",
        "examples": [
          {
            "text": "この食堂は、安くておいしい庶民の味で知られている。",
            "translations": {
              "zh-Hant": "這間餐館以平價又美味的平民料理聞名。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-2a29f58fd081",
        "category": "8",
        "subcategory": "8.01",
        "term": "言い合い（いいあい）",
        "headword": "言い合い",
        "reading": "いいあい",
        "meanings": {
          "zh-Hant": "爭吵、口角"
        },
        "example": "小さな誤解から、友人と言い合いになってしまった。",
        "examples": [
          {
            "text": "小さな誤解から、友人と言い合いになってしまった。",
            "translations": {
              "zh-Hant": "一個小小的誤會，竟讓我和朋友吵了起來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-647c1be153f5",
        "category": "8",
        "subcategory": "8.01",
        "term": "話し合い（はなしあい）",
        "headword": "話し合い",
        "reading": "はなしあい",
        "meanings": {
          "zh-Hant": "商量、協商、討論"
        },
        "example": "話し合いを重ねるうちに、お互いの考えが分かってきた。",
        "examples": [
          {
            "text": "話し合いを重ねるうちに、お互いの考えが分かってきた。",
            "translations": {
              "zh-Hant": "經過多次討論，我們逐漸了解了彼此的想法。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-15aa066fe89b",
        "category": "8",
        "subcategory": "8.01",
        "term": "問い合わせる（といあわせる）",
        "headword": "問い合わせる",
        "reading": "といあわせる",
        "meanings": {
          "zh-Hant": "詢問、查詢"
        },
        "example": "荷物が届かないので、配送会社に問い合わせた。",
        "examples": [
          {
            "text": "荷物が届かないので、配送会社に問い合わせた。",
            "translations": {
              "zh-Hant": "因為包裹遲遲沒送到，我向配送公司詢問了情況。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-6ebb244781a5",
        "category": "10",
        "subcategory": "10.01",
        "term": "場合（ばあい）",
        "headword": "場合",
        "reading": "ばあい",
        "meanings": {
          "zh-Hant": "情況、場合"
        },
        "example": "雨が降った場合は、試合を来週に延期する。",
        "examples": [
          {
            "text": "雨が降った場合は、試合を来週に延期する。",
            "translations": {
              "zh-Hant": "如果下雨，比賽就延到下週。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-94e6c976fd86",
        "category": "1",
        "subcategory": "1.01",
        "term": "瓶（びん）",
        "headword": "瓶",
        "reading": "びん",
        "meanings": {
          "zh-Hant": "瓶子"
        },
        "example": "空になった瓶を洗って、花を一輪挿した。",
        "examples": [
          {
            "text": "空になった瓶を洗って、花を一輪挿した。",
            "translations": {
              "zh-Hant": "我把空瓶子洗乾淨，插上了一朵花。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-3214e9685aba",
        "category": "1",
        "subcategory": "1.01",
        "term": "缶（かん）",
        "headword": "缶",
        "reading": "かん",
        "meanings": {
          "zh-Hant": "罐子、金屬罐"
        },
        "example": "飲み終わった缶は、専用の箱に入れてください。",
        "examples": [
          {
            "text": "飲み終わった缶は、専用の箱に入れてください。",
            "translations": {
              "zh-Hant": "喝完的空罐請放進專用的箱子裡。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-eb0dc1e3f8db",
        "category": "4",
        "subcategory": "4.01",
        "term": "汚染（おせん）",
        "headword": "汚染",
        "reading": "おせん",
        "meanings": {
          "zh-Hant": "污染"
        },
        "example": "工場から流れ出た油が、川の汚染の原因になった。",
        "examples": [
          {
            "text": "工場から流れ出た油が、川の汚染の原因になった。",
            "translations": {
              "zh-Hant": "工廠流出的油成了河川污染的原因。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f9207c751bb2",
        "category": "10",
        "subcategory": "10.01",
        "term": "深刻（しんこく）",
        "headword": "深刻",
        "reading": "しんこく",
        "meanings": {
          "zh-Hant": "嚴重、深刻"
        },
        "example": "若い人が減り、この村では人手不足が深刻になっている。",
        "examples": [
          {
            "text": "若い人が減り、この村では人手不足が深刻になっている。",
            "translations": {
              "zh-Hant": "年輕人口減少，使這座村莊的人力不足問題日益嚴重。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-793eced10961",
        "category": "4",
        "subcategory": "4.01",
        "term": "騒音（そうおん）",
        "headword": "騒音",
        "reading": "そうおん",
        "meanings": {
          "zh-Hant": "噪音"
        },
        "example": "隣の工事現場の騒音で、電話の声が聞こえなかった。",
        "examples": [
          {
            "text": "隣の工事現場の騒音で、電話の声が聞こえなかった。",
            "translations": {
              "zh-Hant": "隔壁工地的噪音太大，我聽不見電話另一頭的聲音。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-4426fd3ff0b4",
        "category": "4",
        "subcategory": "4.01",
        "term": "繁殖（はんしょく）",
        "headword": "繁殖",
        "reading": "はんしょく",
        "meanings": {
          "zh-Hant": "繁殖"
        },
        "example": "雨の後、水たまりで蚊が繁殖していた。",
        "examples": [
          {
            "text": "雨の後、水たまりで蚊が繁殖していた。",
            "translations": {
              "zh-Hant": "下雨後，蚊子在積水處繁殖。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-bfabc0643f16",
        "category": "4",
        "subcategory": "4.01",
        "term": "獲物（えもの）",
        "headword": "獲物",
        "reading": "えもの",
        "meanings": {
          "zh-Hant": "獵物、捕獲物"
        },
        "example": "猫は草むらに隠れて、獲物が近づくのを待っていた。",
        "examples": [
          {
            "text": "猫は草むらに隠れて、獲物が近づくのを待っていた。",
            "translations": {
              "zh-Hant": "貓躲在草叢裡，等待獵物靠近。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e60a67240492",
        "category": "4",
        "subcategory": "4.01",
        "term": "群がる（むらがる）",
        "headword": "群がる",
        "reading": "むらがる",
        "meanings": {
          "zh-Hant": "聚集、成群聚攏"
        },
        "example": "甘い香りに誘われて、花に虫が群がっていた。",
        "examples": [
          {
            "text": "甘い香りに誘われて、花に虫が群がっていた。",
            "translations": {
              "zh-Hant": "昆蟲受到甜美香氣的吸引，成群聚集在花上。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-a2a152d0df16",
        "category": "4",
        "subcategory": "4.01",
        "term": "鶏（にわとり）",
        "headword": "鶏",
        "reading": "にわとり",
        "meanings": {
          "zh-Hant": "雞"
        },
        "example": "祖母は毎朝、庭で飼っている鶏に餌をやる。",
        "examples": [
          {
            "text": "祖母は毎朝、庭で飼っている鶏に餌をやる。",
            "translations": {
              "zh-Hant": "祖母每天早上都會餵養在庭院裡的雞。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-70bee1832f1a",
        "category": "4",
        "subcategory": "4.01",
        "term": "飼育（しいく）",
        "headword": "飼育",
        "reading": "しいく",
        "meanings": {
          "zh-Hant": "飼養、養育動物"
        },
        "example": "弟は学校で飼育しているうさぎの世話を担当している。",
        "examples": [
          {
            "text": "弟は学校で飼育しているうさぎの世話を担当している。",
            "translations": {
              "zh-Hant": "弟弟負責照顧學校飼養的兔子。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7501778ba9cf",
        "category": "4",
        "subcategory": "4.01",
        "term": "くわえる（くわえる）",
        "headword": "くわえる",
        "reading": "くわえる",
        "meanings": {
          "zh-Hant": "用嘴叼住、銜住"
        },
        "example": "犬が新聞をくわえて、玄関まで運んできた。",
        "examples": [
          {
            "text": "犬が新聞をくわえて、玄関まで運んできた。",
            "translations": {
              "zh-Hant": "狗叼著報紙，把它送到了玄關。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9169e9fee9b1",
        "category": "4",
        "subcategory": "4.01",
        "term": "雌（めす）",
        "headword": "雌",
        "reading": "めす",
        "meanings": {
          "zh-Hant": "雌性、母的"
        },
        "example": "この猫は雌で、去年三匹の子猫を産んだ。",
        "examples": [
          {
            "text": "この猫は雌で、去年三匹の子猫を産んだ。",
            "translations": {
              "zh-Hant": "這隻貓是母貓，去年生了三隻小貓。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-803d32bb14cd",
        "category": "4",
        "subcategory": "4.01",
        "term": "見分ける（みわける）",
        "headword": "見分ける",
        "reading": "みわける",
        "meanings": {
          "zh-Hant": "辨別、分辨"
        },
        "example": "よく似た二種類の鳥を、羽の色で見分ける。",
        "examples": [
          {
            "text": "よく似た二種類の鳥を、羽の色で見分ける。",
            "translations": {
              "zh-Hant": "這兩種鳥長得很像，可以根據羽毛顏色來辨別。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-754e1f2ea742",
        "category": "4",
        "subcategory": "4.01",
        "term": "子牛（こうし）",
        "headword": "子牛",
        "reading": "こうし",
        "meanings": {
          "zh-Hant": "小牛、牛犢"
        },
        "example": "子牛が母牛のそばで、よろよろと立ち上がった。",
        "examples": [
          {
            "text": "子牛が母牛のそばで、よろよろと立ち上がった。",
            "translations": {
              "zh-Hant": "小牛在母牛身旁搖搖晃晃地站了起來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-719571a1ced8",
        "category": "4",
        "subcategory": "4.01",
        "term": "一頭生まれる（いっとううまれる）",
        "headword": "一頭生まれる",
        "reading": "いっとううまれる",
        "meanings": {
          "zh-Hant": "出生一頭大型動物"
        },
        "example": "今朝、牧場で子牛が一頭生まれた。",
        "examples": [
          {
            "text": "今朝、牧場で子牛が一頭生まれた。",
            "translations": {
              "zh-Hant": "今天早上，牧場裡出生了一頭小牛。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e50904f7bd01",
        "category": "4",
        "subcategory": "4.01",
        "term": "植える（うえる）",
        "headword": "植える",
        "reading": "うえる",
        "meanings": {
          "zh-Hant": "種植、栽種"
        },
        "example": "窓の外から見える場所に、桜の木を植えた。",
        "examples": [
          {
            "text": "窓の外から見える場所に、桜の木を植えた。",
            "translations": {
              "zh-Hant": "我在從窗戶看得到的地方，種了一棵櫻花樹。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e7c013c594f7",
        "category": "4",
        "subcategory": "4.01",
        "term": "茎（くき）",
        "headword": "茎",
        "reading": "くき",
        "meanings": {
          "zh-Hant": "莖"
        },
        "example": "この花は茎が細いので、強い風で折れやすい。",
        "examples": [
          {
            "text": "この花は茎が細いので、強い風で折れやすい。",
            "translations": {
              "zh-Hant": "這種花的莖很細，遇到強風容易折斷。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-07f301ffe197",
        "category": "4",
        "subcategory": "4.01",
        "term": "つぼみ（つぼみ）",
        "headword": "つぼみ",
        "reading": "つぼみ",
        "meanings": {
          "zh-Hant": "花苞、蓓蕾"
        },
        "example": "桜のつぼみが少しずつ開き始めた。",
        "examples": [
          {
            "text": "桜のつぼみが少しずつ開き始めた。",
            "translations": {
              "zh-Hant": "櫻花的花苞開始一點一點地綻放了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f05c4354b68d",
        "category": "4",
        "subcategory": "4.01",
        "term": "膨らむ（ふくらむ）",
        "headword": "膨らむ",
        "reading": "ふくらむ",
        "meanings": {
          "zh-Hant": "膨脹、鼓起；擴大"
        },
        "example": "パンの生地を暖かい場所に置き、膨らむのを待った。",
        "examples": [
          {
            "text": "パンの生地を暖かい場所に置き、膨らむのを待った。",
            "translations": {
              "zh-Hant": "我把麵包麵團放在溫暖的地方，等待它膨脹。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-43a7312a6442",
        "category": "4",
        "subcategory": "4.01",
        "term": "花粉（かふん）",
        "headword": "花粉",
        "reading": "かふん",
        "meanings": {
          "zh-Hant": "花粉"
        },
        "example": "春になると、花粉で目がかゆくなる。",
        "examples": [
          {
            "text": "春になると、花粉で目がかゆくなる。",
            "translations": {
              "zh-Hant": "一到春天，我的眼睛就會因為花粉而發癢。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-1d5710ae0087",
        "category": "5",
        "subcategory": "5.01",
        "term": "見誤る（みあやまる）",
        "headword": "見誤る",
        "reading": "みあやまる",
        "meanings": {
          "zh-Hant": "看錯、判斷錯誤"
        },
        "example": "駅までの距離を見誤って、電車に乗り遅れた。",
        "examples": [
          {
            "text": "駅までの距離を見誤って、電車に乗り遅れた。",
            "translations": {
              "zh-Hant": "我誤判了到車站的距離，結果沒趕上電車。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-32bcfe41c356",
        "category": "5",
        "subcategory": "5.01",
        "term": "取り組む（とりくむ）",
        "headword": "取り組む",
        "reading": "とりくむ",
        "meanings": {
          "zh-Hant": "致力於、認真處理"
        },
        "example": "苦手な問題にも、あきらめずに取り組んでいる。",
        "examples": [
          {
            "text": "苦手な問題にも、あきらめずに取り組んでいる。",
            "translations": {
              "zh-Hant": "即使是不擅長的題目，我也不放棄，持續認真解答。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-4ee8a9248e82",
        "category": "5",
        "subcategory": "5.01",
        "term": "取り入れる（とりいれる）",
        "headword": "取り入れる",
        "reading": "とりいれる",
        "meanings": {
          "zh-Hant": "採納、引進；收割"
        },
        "example": "生徒の意見を取り入れて、授業の進め方を変えた。",
        "examples": [
          {
            "text": "生徒の意見を取り入れて、授業の進め方を変えた。",
            "translations": {
              "zh-Hant": "老師採納了學生的意見，改變了授課方式。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9d9319c452c3",
        "category": "10",
        "subcategory": "10.01",
        "term": "徐々に（じょじょに）",
        "headword": "徐々に",
        "reading": "じょじょに",
        "meanings": {
          "zh-Hant": "漸漸地、逐步地"
        },
        "example": "雨がやみ、空が徐々に明るくなってきた。",
        "examples": [
          {
            "text": "雨がやみ、空が徐々に明るくなってきた。",
            "translations": {
              "zh-Hant": "雨停了，天空也漸漸明亮起來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-2c1e9cf660d0",
        "category": "5",
        "subcategory": "5.01",
        "term": "区別する（くべつする）",
        "headword": "区別する",
        "reading": "くべつする",
        "meanings": {
          "zh-Hant": "區別、分辨"
        },
        "example": "この二つの言葉は、意味を区別して使う必要がある。",
        "examples": [
          {
            "text": "この二つの言葉は、意味を区別して使う必要がある。",
            "translations": {
              "zh-Hant": "這兩個詞必須區分意思後再使用。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-641fb1bb9032",
        "category": "7",
        "subcategory": "7.01",
        "term": "返品する（へんぴんする）",
        "headword": "返品する",
        "reading": "へんぴんする",
        "meanings": {
          "zh-Hant": "退貨"
        },
        "example": "買ったシャツに穴が開いていたので、店に返品した。",
        "examples": [
          {
            "text": "買ったシャツに穴が開いていたので、店に返品した。",
            "translations": {
              "zh-Hant": "買來的襯衫上有個破洞，所以我拿到店裡退貨了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-aa08b3341d43",
        "category": "6",
        "subcategory": "6.01",
        "term": "普及する（ふきゅうする）",
        "headword": "普及する",
        "reading": "ふきゅうする",
        "meanings": {
          "zh-Hant": "普及、推廣"
        },
        "example": "スマートフォンが普及して、外出先でも地図を見られるようになった。",
        "examples": [
          {
            "text": "スマートフォンが普及して、外出先でも地図を見られるようになった。",
            "translations": {
              "zh-Hant": "智慧型手機普及後，出門在外也能查看地圖了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7bd10029adde",
        "category": "5",
        "subcategory": "5.01",
        "term": "発達する（はったつする）",
        "headword": "発達する",
        "reading": "はったつする",
        "meanings": {
          "zh-Hant": "發展、發達"
        },
        "example": "子どもの言葉は、周囲の人との会話を通して発達する。",
        "examples": [
          {
            "text": "子どもの言葉は、周囲の人との会話を通して発達する。",
            "translations": {
              "zh-Hant": "兒童的語言能力會透過與周圍人的交談而發展。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-737c1be4ab4b",
        "category": "6",
        "subcategory": "6.01",
        "term": "通信網（つうしんもう）",
        "headword": "通信網",
        "reading": "つうしんもう",
        "meanings": {
          "zh-Hant": "通訊網路"
        },
        "example": "災害で通信網が使えなくなり、家族と連絡が取れなかった。",
        "examples": [
          {
            "text": "災害で通信網が使えなくなり、家族と連絡が取れなかった。",
            "translations": {
              "zh-Hant": "通訊網路因災害而中斷，我無法和家人取得聯繫。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-dbd39d7b9471",
        "category": "4",
        "subcategory": "4.01",
        "term": "退化する（たいかする）",
        "headword": "退化する",
        "reading": "たいかする",
        "meanings": {
          "zh-Hant": "退化"
        },
        "example": "この生物は暗い場所で暮らしてきたため、目が退化している。",
        "examples": [
          {
            "text": "この生物は暗い場所で暮らしてきたため、目が退化している。",
            "translations": {
              "zh-Hant": "這種生物長期生活在黑暗環境中，因此眼睛已經退化。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-193f0d55151f",
        "category": "9",
        "subcategory": "9.01",
        "term": "収集する（しゅうしゅうする）",
        "headword": "収集する",
        "reading": "しゅうしゅうする",
        "meanings": {
          "zh-Hant": "收集"
        },
        "example": "祖父は、旅先で見つけた古い切手を収集している。",
        "examples": [
          {
            "text": "祖父は、旅先で見つけた古い切手を収集している。",
            "translations": {
              "zh-Hant": "祖父會收集旅行途中發現的老郵票。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-72a9c415ca6e",
        "category": "2",
        "subcategory": "2.01",
        "term": "感染する（かんせんする）",
        "headword": "感染する",
        "reading": "かんせんする",
        "meanings": {
          "zh-Hant": "感染"
        },
        "example": "インフルエンザに感染して、一週間学校を休んだ。",
        "examples": [
          {
            "text": "インフルエンザに感染して、一週間学校を休んだ。",
            "translations": {
              "zh-Hant": "我感染了流感，請了一週的病假沒去上學。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-2ceeeff35236",
        "category": "5",
        "subcategory": "5.01",
        "term": "菌（きん）",
        "headword": "菌",
        "reading": "きん",
        "meanings": {
          "zh-Hant": "菌、微生物"
        },
        "example": "ヨーグルトに含まれる菌の働きを調べた。",
        "examples": [
          {
            "text": "ヨーグルトに含まれる菌の働きを調べた。",
            "translations": {
              "zh-Hant": "我研究了優格中所含菌種的作用。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-29de63f51dd5",
        "category": "5",
        "subcategory": "5.01",
        "term": "細菌（さいきん）",
        "headword": "細菌",
        "reading": "さいきん",
        "meanings": {
          "zh-Hant": "細菌"
        },
        "example": "研究室で、顕微鏡を使って細菌を観察した。",
        "examples": [
          {
            "text": "研究室で、顕微鏡を使って細菌を観察した。",
            "translations": {
              "zh-Hant": "我在研究室裡用顯微鏡觀察細菌。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-47fc991be1b6",
        "category": "6",
        "subcategory": "6.01",
        "term": "改良する（かいりょうする）",
        "headword": "改良する",
        "reading": "かいりょうする",
        "meanings": {
          "zh-Hant": "改良"
        },
        "example": "使いやすくなるように、道具の形を少し改良した。",
        "examples": [
          {
            "text": "使いやすくなるように、道具の形を少し改良した。",
            "translations": {
              "zh-Hant": "為了讓工具更好用，我稍微改良了它的形狀。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e93e7d01f22f",
        "category": "5",
        "subcategory": "5.01",
        "term": "組み換え（くみかえ）",
        "headword": "組み換え",
        "reading": "くみかえ",
        "meanings": {
          "zh-Hant": "重新組合、重組"
        },
        "example": "遺伝子の組み換えについて、授業で学んだ。",
        "examples": [
          {
            "text": "遺伝子の組み換えについて、授業で学んだ。",
            "translations": {
              "zh-Hant": "我在課堂上學習了基因重組的相關知識。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-2eea27fdcfe6",
        "category": "8",
        "subcategory": "8.01",
        "term": "受け継ぐ（うけつぐ）",
        "headword": "受け継ぐ",
        "reading": "うけつぐ",
        "meanings": {
          "zh-Hant": "繼承、承襲"
        },
        "example": "母が大切にしていた着物を、娘の私が受け継いだ。",
        "examples": [
          {
            "text": "母が大切にしていた着物を、娘の私が受け継いだ。",
            "translations": {
              "zh-Hant": "身為女兒的我，繼承了母親珍藏的和服。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b36f6ab0ddb2",
        "category": "6",
        "subcategory": "6.01",
        "term": "技術的（ぎじゅつてき）",
        "headword": "技術的",
        "reading": "ぎじゅつてき",
        "meanings": {
          "zh-Hant": "技術上的"
        },
        "example": "この計画には、まだ技術的な課題が残っている。",
        "examples": [
          {
            "text": "この計画には、まだ技術的な課題が残っている。",
            "translations": {
              "zh-Hant": "這項計畫仍有技術上的課題尚待解決。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5a44d19119fc",
        "category": "5",
        "subcategory": "5.01",
        "term": "微量（びりょう）",
        "headword": "微量",
        "reading": "びりょう",
        "meanings": {
          "zh-Hant": "微量"
        },
        "example": "この水には、微量の塩分が含まれている。",
        "examples": [
          {
            "text": "この水には、微量の塩分が含まれている。",
            "translations": {
              "zh-Hant": "這水裡含有微量的鹽分。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-8bc9a52fb0ee",
        "category": "1",
        "subcategory": "1.01",
        "term": "炊く（たく）",
        "headword": "炊く",
        "reading": "たく",
        "meanings": {
          "zh-Hant": "煮飯、炊煮"
        },
        "example": "毎朝、家族の分のご飯を炊きます。",
        "examples": [
          {
            "text": "毎朝、家族の分のご飯を炊きます。",
            "translations": {
              "zh-Hant": "每天早上，我都會煮全家人的飯。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-6e001bdf1efd",
        "category": "3",
        "subcategory": "3.01",
        "term": "役立つ（やくだつ）",
        "headword": "役立つ",
        "reading": "やくだつ",
        "meanings": {
          "zh-Hant": "有用、派上用場"
        },
        "example": "この地図は街を歩くときに役立ちます。",
        "examples": [
          {
            "text": "この地図は街を歩くときに役立ちます。",
            "translations": {
              "zh-Hant": "這張地圖在市區步行時很有幫助。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-876ffa73896f",
        "category": "5",
        "subcategory": "5.01",
        "term": "足し算（たしざん）",
        "headword": "足し算",
        "reading": "たしざん",
        "meanings": {
          "zh-Hant": "加法"
        },
        "example": "弟は指を使って足し算をしています。",
        "examples": [
          {
            "text": "弟は指を使って足し算をしています。",
            "translations": {
              "zh-Hant": "弟弟正在用手指做加法。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e58c77e27d4e",
        "category": "5",
        "subcategory": "5.01",
        "term": "引き算（ひきざん）",
        "headword": "引き算",
        "reading": "ひきざん",
        "meanings": {
          "zh-Hant": "減法"
        },
        "example": "この引き算の答えは七です。",
        "examples": [
          {
            "text": "この引き算の答えは七です。",
            "translations": {
              "zh-Hant": "這道減法題的答案是七。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-abfc4fddd9b4",
        "category": "5",
        "subcategory": "5.01",
        "term": "掛け算（かけざん）",
        "headword": "掛け算",
        "reading": "かけざん",
        "meanings": {
          "zh-Hant": "乘法"
        },
        "example": "掛け算を覚えると、計算が速くなります。",
        "examples": [
          {
            "text": "掛け算を覚えると、計算が速くなります。",
            "translations": {
              "zh-Hant": "學會乘法後，計算就會變快。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-6e898a392e69",
        "category": "5",
        "subcategory": "5.01",
        "term": "割り算（わりざん）",
        "headword": "割り算",
        "reading": "わりざん",
        "meanings": {
          "zh-Hant": "除法"
        },
        "example": "割り算で余りが出たので、もう一度確かめました。",
        "examples": [
          {
            "text": "割り算で余りが出たので、もう一度確かめました。",
            "translations": {
              "zh-Hant": "除法算出了餘數，所以我又檢查了一遍。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-af165e007ef4",
        "category": "7",
        "subcategory": "7.01",
        "term": "勘定（かんじょう）",
        "headword": "勘定",
        "reading": "かんじょう",
        "meanings": {
          "zh-Hant": "計算；帳款、結帳"
        },
        "example": "お勘定は別々でお願いします。",
        "examples": [
          {
            "text": "お勘定は別々でお願いします。",
            "translations": {
              "zh-Hant": "麻煩幫我們分開結帳。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-dd83ade376f5",
        "category": "10",
        "subcategory": "10.01",
        "term": "増大（ぞうだい）",
        "headword": "増大",
        "reading": "ぞうだい",
        "meanings": {
          "zh-Hant": "增大、增加"
        },
        "example": "人口の増加に伴って、水の需要が増大しています。",
        "examples": [
          {
            "text": "人口の増加に伴って、水の需要が増大しています。",
            "translations": {
              "zh-Hant": "隨著人口增加，用水需求也正在增大。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7c370a1446af",
        "category": "7",
        "subcategory": "7.01",
        "term": "補う（おぎなう）",
        "headword": "補う",
        "reading": "おぎなう",
        "meanings": {
          "zh-Hant": "補充、彌補"
        },
        "example": "足りない生活費を補うために、週末も働いています。",
        "examples": [
          {
            "text": "足りない生活費を補うために、週末も働いています。",
            "translations": {
              "zh-Hant": "為了補足生活費，我連週末也在工作。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b1ccc665edf2",
        "category": "4",
        "subcategory": "4.01",
        "term": "不足（ふそく）",
        "headword": "不足",
        "reading": "ふそく",
        "meanings": {
          "zh-Hant": "不足、缺乏"
        },
        "example": "雨が降らず、畑の水が不足しています。",
        "examples": [
          {
            "text": "雨が降らず、畑の水が不足しています。",
            "translations": {
              "zh-Hant": "一直沒有下雨，田裡的水不夠了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5b43b5bfe718",
        "category": "2",
        "subcategory": "2.01",
        "term": "軽減（けいげん）",
        "headword": "軽減",
        "reading": "けいげん",
        "meanings": {
          "zh-Hant": "減輕"
        },
        "example": "荷物を減らせば、肩の負担を軽減できます。",
        "examples": [
          {
            "text": "荷物を減らせば、肩の負担を軽減できます。",
            "translations": {
              "zh-Hant": "減少行李，就能減輕肩膀的負擔。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b6a980c002dd",
        "category": "4",
        "subcategory": "4.01",
        "term": "殺生（せっしょう）",
        "headword": "殺生",
        "reading": "せっしょう",
        "meanings": {
          "zh-Hant": "殺生、殺害生物"
        },
        "example": "祖母は殺生を嫌い、家に入った虫も外へ逃がします。",
        "examples": [
          {
            "text": "祖母は殺生を嫌い、家に入った虫も外へ逃がします。",
            "translations": {
              "zh-Hant": "祖母不喜歡殺生，就連跑進家裡的蟲也會放到外面。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-309f94637d15",
        "category": "4",
        "subcategory": "4.01",
        "term": "達する（たっする）",
        "headword": "達する",
        "reading": "たっする",
        "meanings": {
          "zh-Hant": "達到、到達"
        },
        "example": "今日の最高気温は三十五度に達しました。",
        "examples": [
          {
            "text": "今日の最高気温は三十五度に達しました。",
            "translations": {
              "zh-Hant": "今天的最高氣溫達到了三十五度。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-2a910fb598af",
        "category": "4",
        "subcategory": "4.01",
        "term": "広がる（ひろがる）",
        "headword": "広がる",
        "reading": "ひろがる",
        "meanings": {
          "zh-Hant": "擴展、蔓延"
        },
        "example": "丘の上からは、青い海が広がっているのが見えます。",
        "examples": [
          {
            "text": "丘の上からは、青い海が広がっているのが見えます。",
            "translations": {
              "zh-Hant": "從山丘上可以看見一望無際的藍色大海。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-53e3381ca854",
        "category": "3",
        "subcategory": "3.01",
        "term": "通り（とおり）",
        "headword": "通り",
        "reading": "とおり",
        "meanings": {
          "zh-Hant": "大街；通行；方式"
        },
        "example": "この通りには古い本屋が何軒もあります。",
        "examples": [
          {
            "text": "この通りには古い本屋が何軒もあります。",
            "translations": {
              "zh-Hant": "這條街上有好幾家老書店。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9377e653ebd5",
        "category": "10",
        "subcategory": "10.01",
        "term": "経過する（けいかする）",
        "headword": "経過する",
        "reading": "けいかする",
        "meanings": {
          "zh-Hant": "經過、時間流逝"
        },
        "example": "手術から一週間が経過しました。",
        "examples": [
          {
            "text": "手術から一週間が経過しました。",
            "translations": {
              "zh-Hant": "距離手術已經過了一個星期。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-481a2db0e860",
        "category": "10",
        "subcategory": "10.01",
        "term": "周期（しゅうき）",
        "headword": "周期",
        "reading": "しゅうき",
        "meanings": {
          "zh-Hant": "週期"
        },
        "example": "この機械は十秒の周期で音を出します。",
        "examples": [
          {
            "text": "この機械は十秒の周期で音を出します。",
            "translations": {
              "zh-Hant": "這台機器每隔十秒就會發出聲音。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-175dac23e7cd",
        "category": "10",
        "subcategory": "10.01",
        "term": "早朝（そうちょう）",
        "headword": "早朝",
        "reading": "そうちょう",
        "meanings": {
          "zh-Hant": "清晨"
        },
        "example": "早朝の公園は静かで、空気も澄んでいます。",
        "examples": [
          {
            "text": "早朝の公園は静かで、空気も澄んでいます。",
            "translations": {
              "zh-Hant": "清晨的公園很安靜，空氣也很清新。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9193eec7b511",
        "category": "10",
        "subcategory": "10.01",
        "term": "夕暮れ時（ゆうぐれどき）",
        "headword": "夕暮れ時",
        "reading": "ゆうぐれどき",
        "meanings": {
          "zh-Hant": "黃昏時分"
        },
        "example": "夕暮れ時に、犬を連れて海辺を散歩しました。",
        "examples": [
          {
            "text": "夕暮れ時に、犬を連れて海辺を散歩しました。",
            "translations": {
              "zh-Hant": "黃昏時，我帶著狗在海邊散步。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ec3e7d3d85eb",
        "category": "10",
        "subcategory": "10.01",
        "term": "下旬（げじゅん）",
        "headword": "下旬",
        "reading": "げじゅん",
        "meanings": {
          "zh-Hant": "下旬"
        },
        "example": "来月の下旬に新しい店が開きます。",
        "examples": [
          {
            "text": "来月の下旬に新しい店が開きます。",
            "translations": {
              "zh-Hant": "下個月下旬會有一家新店開幕。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-382cdcd3c02c",
        "category": "3",
        "subcategory": "3.01",
        "term": "向かう（むかう）",
        "headword": "向かう",
        "reading": "むかう",
        "meanings": {
          "zh-Hant": "朝向、前往；面對"
        },
        "example": "駅へ向かう途中で、友人に会いました。",
        "examples": [
          {
            "text": "駅へ向かう途中で、友人に会いました。",
            "translations": {
              "zh-Hant": "前往車站的途中，我遇見了朋友。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-bb4af23327a3",
        "category": "1",
        "subcategory": "1.01",
        "term": "枠（わく）",
        "headword": "枠",
        "reading": "わく",
        "meanings": {
          "zh-Hant": "框架；範圍、名額"
        },
        "example": "この写真には木の枠がよく合います。",
        "examples": [
          {
            "text": "この写真には木の枠がよく合います。",
            "translations": {
              "zh-Hant": "這張照片很適合搭配木製相框。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-410a652a25e9",
        "category": "1",
        "subcategory": "1.01",
        "term": "敷く（しく）",
        "headword": "敷く",
        "reading": "しく",
        "meanings": {
          "zh-Hant": "鋪設、鋪開"
        },
        "example": "冷たい床に毛布を敷いて座りました。",
        "examples": [
          {
            "text": "冷たい床に毛布を敷いて座りました。",
            "translations": {
              "zh-Hant": "我在冰冷的地板上鋪了毛毯再坐下。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-661d483a5f02",
        "category": "1",
        "subcategory": "1.01",
        "term": "配置（はいち）",
        "headword": "配置",
        "reading": "はいち",
        "meanings": {
          "zh-Hant": "配置、安排"
        },
        "example": "部屋を広く使えるように、机の配置を変えました。",
        "examples": [
          {
            "text": "部屋を広く使えるように、机の配置を変えました。",
            "translations": {
              "zh-Hant": "為了讓房間的空間更好利用，我改變了桌子的配置。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-cedd17c1b33f",
        "category": "3",
        "subcategory": "3.01",
        "term": "位置（いち）",
        "headword": "位置",
        "reading": "いち",
        "meanings": {
          "zh-Hant": "位置"
        },
        "example": "地図でホテルの位置を確かめました。",
        "examples": [
          {
            "text": "地図でホテルの位置を確かめました。",
            "translations": {
              "zh-Hant": "我在地圖上確認了飯店的位置。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7ab764734e86",
        "category": "10",
        "subcategory": "10.01",
        "term": "常に（つねに）",
        "headword": "常に",
        "reading": "つねに",
        "meanings": {
          "zh-Hant": "經常、始終"
        },
        "example": "医師は常に患者の話をよく聞いていました。",
        "examples": [
          {
            "text": "医師は常に患者の話をよく聞いていました。",
            "translations": {
              "zh-Hant": "那位醫師始終很仔細地聆聽病人說話。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-549b0cd2e1a9",
        "category": "10",
        "subcategory": "10.01",
        "term": "逃す（のがす）",
        "headword": "逃す",
        "reading": "のがす",
        "meanings": {
          "zh-Hant": "放跑；錯失"
        },
        "example": "迷っている間に、申し込む機会を逃しました。",
        "examples": [
          {
            "text": "迷っている間に、申し込む機会を逃しました。",
            "translations": {
              "zh-Hant": "猶豫不決的時候，我錯過了報名的機會。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9493412fc88d",
        "category": "1",
        "subcategory": "1.01",
        "term": "留守（るす）",
        "headword": "留守",
        "reading": "るす",
        "meanings": {
          "zh-Hant": "不在家、外出"
        },
        "example": "昼間は留守なので、荷物は夕方に届けてください。",
        "examples": [
          {
            "text": "昼間は留守なので、荷物は夕方に届けてください。",
            "translations": {
              "zh-Hant": "白天我不在家，請在傍晚送來包裹。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-fec8f055dbca",
        "category": "1",
        "subcategory": "1.01",
        "term": "押さえる（おさえる）",
        "headword": "押さえる",
        "reading": "おさえる",
        "meanings": {
          "zh-Hant": "按住、壓住；掌握重點"
        },
        "example": "風で飛ばないように、紙を手で押さえてください。",
        "examples": [
          {
            "text": "風で飛ばないように、紙を手で押さえてください。",
            "translations": {
              "zh-Hant": "請用手按住紙張，以免被風吹走。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5d49b83693be",
        "category": "8",
        "subcategory": "8.01",
        "term": "抑える（おさえる）",
        "headword": "抑える",
        "reading": "おさえる",
        "meanings": {
          "zh-Hant": "抑制、控制"
        },
        "example": "深呼吸をして、怒りを抑えました。",
        "examples": [
          {
            "text": "深呼吸をして、怒りを抑えました。",
            "translations": {
              "zh-Hant": "我做了深呼吸，壓住了怒氣。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ce9c75afc24f",
        "category": "1",
        "subcategory": "1.01",
        "term": "傾く（かたむく）",
        "headword": "傾く",
        "reading": "かたむく",
        "meanings": {
          "zh-Hant": "傾斜；傾向、衰落"
        },
        "example": "古い塀が道路の方へ傾いています。",
        "examples": [
          {
            "text": "古い塀が道路の方へ傾いています。",
            "translations": {
              "zh-Hant": "老舊的圍牆正朝道路的方向傾斜。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-76ad637f6b8d",
        "category": "1",
        "subcategory": "1.01",
        "term": "刻む（きざむ）",
        "headword": "刻む",
        "reading": "きざむ",
        "meanings": {
          "zh-Hant": "切碎；刻、銘記"
        },
        "example": "玉ねぎを細かく刻んで、鍋に入れます。",
        "examples": [
          {
            "text": "玉ねぎを細かく刻んで、鍋に入れます。",
            "translations": {
              "zh-Hant": "把洋蔥切碎，再放進鍋裡。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-15f040c1d797",
        "category": "1",
        "subcategory": "1.01",
        "term": "崩す（くずす）",
        "headword": "崩す",
        "reading": "くずす",
        "meanings": {
          "zh-Hant": "弄垮、打散；打亂"
        },
        "example": "弟が積み木の城を崩してしまいました。",
        "examples": [
          {
            "text": "弟が積み木の城を崩してしまいました。",
            "translations": {
              "zh-Hant": "弟弟把積木城堡弄倒了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7b26cc1116a9",
        "category": "10",
        "subcategory": "10.01",
        "term": "狂う（くるう）",
        "headword": "狂う",
        "reading": "くるう",
        "meanings": {
          "zh-Hant": "失常、發狂；出錯"
        },
        "example": "電車が遅れて、一日の予定が狂ってしまいました。",
        "examples": [
          {
            "text": "電車が遅れて、一日の予定が狂ってしまいました。",
            "translations": {
              "zh-Hant": "電車誤點，打亂了我一整天的行程。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-75cf1cc6d187",
        "category": "9",
        "subcategory": "9.01",
        "term": "染める（そめる）",
        "headword": "染める",
        "reading": "そめる",
        "meanings": {
          "zh-Hant": "染色、染上"
        },
        "example": "白い布を青く染めて、袋を作りました。",
        "examples": [
          {
            "text": "白い布を青く染めて、袋を作りました。",
            "translations": {
              "zh-Hant": "我把白布染成藍色，做成了袋子。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-2c330ed56939",
        "category": "6",
        "subcategory": "6.01",
        "term": "迫る（せまる）",
        "headword": "迫る",
        "reading": "せまる",
        "meanings": {
          "zh-Hant": "逼近、迫近；逼迫"
        },
        "example": "締め切りが迫っているので、今日は残業します。",
        "examples": [
          {
            "text": "締め切りが迫っているので、今日は残業します。",
            "translations": {
              "zh-Hant": "截止日期快到了，所以今天要加班。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-6ae964d7a35d",
        "category": "1",
        "subcategory": "1.01",
        "term": "注ぐ（そそぐ）",
        "headword": "注ぐ",
        "reading": "そそぐ",
        "meanings": {
          "zh-Hant": "注入、倒入；傾注"
        },
        "example": "カップに熱いお茶を注ぎました。",
        "examples": [
          {
            "text": "カップに熱いお茶を注ぎました。",
            "translations": {
              "zh-Hant": "我把熱茶倒進杯子裡。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-47ab4be4abf4",
        "category": "4",
        "subcategory": "4.01",
        "term": "搾る（しぼる）",
        "headword": "搾る",
        "reading": "しぼる",
        "meanings": {
          "zh-Hant": "榨取、擠出"
        },
        "example": "牧場で、牛の乳を搾る体験をしました。",
        "examples": [
          {
            "text": "牧場で、牛の乳を搾る体験をしました。",
            "translations": {
              "zh-Hant": "我在牧場體驗了擠牛奶。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-506595847cbe",
        "category": "1",
        "subcategory": "1.01",
        "term": "絞る（しぼる）",
        "headword": "絞る",
        "reading": "しぼる",
        "meanings": {
          "zh-Hant": "擰乾；縮小範圍"
        },
        "example": "洗ったタオルをよく絞ってから、干してください。",
        "examples": [
          {
            "text": "洗ったタオルをよく絞ってから、干してください。",
            "translations": {
              "zh-Hant": "請把洗好的毛巾擰乾後再晾起來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-031e6f986162",
        "category": "1",
        "subcategory": "1.01",
        "term": "縛る（しばる）",
        "headword": "縛る",
        "reading": "しばる",
        "meanings": {
          "zh-Hant": "捆綁；束縛"
        },
        "example": "古い新聞をひもで縛って、玄関に置きました。",
        "examples": [
          {
            "text": "古い新聞をひもで縛って、玄関に置きました。",
            "translations": {
              "zh-Hant": "我用繩子把舊報紙綁好，放在玄關。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-bffbd3ab8b63",
        "category": "3",
        "subcategory": "3.01",
        "term": "上り（のぼり）",
        "headword": "上り",
        "reading": "のぼり",
        "meanings": {
          "zh-Hant": "上行、上坡"
        },
        "example": "東京方面へ行く上りの電車に乗りました。",
        "examples": [
          {
            "text": "東京方面へ行く上りの電車に乗りました。",
            "translations": {
              "zh-Hant": "我搭上了開往東京方向的上行列車。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7205e6beb5c5",
        "category": "1",
        "subcategory": "1.01",
        "term": "沈み（しずみ）",
        "headword": "沈み",
        "reading": "しずみ",
        "meanings": {
          "zh-Hant": "下沉、低落"
        },
        "example": "このソファは座ったときの沈みが大きいです。",
        "examples": [
          {
            "text": "このソファは座ったときの沈みが大きいです。",
            "translations": {
              "zh-Hant": "這張沙發坐下時會陷得很深。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-3f435939c207",
        "category": "8",
        "subcategory": "8.01",
        "term": "見栄（みえ）",
        "headword": "見栄",
        "reading": "みえ",
        "meanings": {
          "zh-Hant": "外表、虛榮"
        },
        "example": "見栄を張って、高い時計を買ってしまいました。",
        "examples": [
          {
            "text": "見栄を張って、高い時計を買ってしまいました。",
            "translations": {
              "zh-Hant": "我為了愛面子，買下了昂貴的手錶。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-18450753a9bf",
        "category": "1",
        "subcategory": "1.01",
        "term": "積む（つむ）",
        "headword": "積む",
        "reading": "つむ",
        "meanings": {
          "zh-Hant": "堆積、裝載；累積"
        },
        "example": "引っ越しの箱をトラックに積みました。",
        "examples": [
          {
            "text": "引っ越しの箱をトラックに積みました。",
            "translations": {
              "zh-Hant": "我把搬家用的箱子裝上了卡車。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-dc75044f840e",
        "category": "5",
        "subcategory": "5.01",
        "term": "解く（とく）",
        "headword": "解く",
        "reading": "とく",
        "meanings": {
          "zh-Hant": "解開；解答"
        },
        "example": "先生にヒントをもらって、難しい問題を解きました。",
        "examples": [
          {
            "text": "先生にヒントをもらって、難しい問題を解きました。",
            "translations": {
              "zh-Hant": "得到老師的提示後，我解開了那道難題。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5234cb2c6197",
        "category": "1",
        "subcategory": "1.01",
        "term": "溶く〔待確認〕（とく）",
        "headword": "溶く〔待確認〕",
        "reading": "とく",
        "meanings": {
          "zh-Hant": "溶解、調開"
        },
        "example": "小麦粉を水で溶いて、衣を作ります。",
        "examples": [
          {
            "text": "小麦粉を水で溶いて、衣を作ります。",
            "translations": {
              "zh-Hant": "把麵粉用水調開，做成裹炸物的麵糊。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e4e517ba348c",
        "category": "4",
        "subcategory": "4.01",
        "term": "捕らえる（とらえる）",
        "headword": "捕らえる",
        "reading": "とらえる",
        "meanings": {
          "zh-Hant": "捕捉、抓住"
        },
        "example": "猫が庭で小さなねずみを捕らえました。",
        "examples": [
          {
            "text": "猫が庭で小さなねずみを捕らえました。",
            "translations": {
              "zh-Hant": "貓在庭院裡捉到了一隻小老鼠。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-022c8c9897f0",
        "category": "8",
        "subcategory": "8.01",
        "term": "睨む（にらむ）",
        "headword": "睨む",
        "reading": "にらむ",
        "meanings": {
          "zh-Hant": "瞪視；盯住、估計"
        },
        "example": "大声で話していたら、隣の客に睨まれました。",
        "examples": [
          {
            "text": "大声で話していたら、隣の客に睨まれました。",
            "translations": {
              "zh-Hant": "我大聲說話時，被鄰座的客人瞪了一眼。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-25697c2f5d08",
        "category": "1",
        "subcategory": "1.01",
        "term": "跳ねる（はねる）",
        "headword": "跳ねる",
        "reading": "はねる",
        "meanings": {
          "zh-Hant": "跳躍；濺起"
        },
        "example": "水たまりを踏んで、泥がズボンに跳ねました。",
        "examples": [
          {
            "text": "水たまりを踏んで、泥がズボンに跳ねました。",
            "translations": {
              "zh-Hant": "我踩進水窪，泥水濺到了褲子上。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-22fd071c7b4f",
        "category": "9",
        "subcategory": "9.01",
        "term": "はまる（はまる）",
        "headword": "はまる",
        "reading": "はまる",
        "meanings": {
          "zh-Hant": "嵌入；陷入、著迷"
        },
        "example": "最近、古い映画を見ることにはまっています。",
        "examples": [
          {
            "text": "最近、古い映画を見ることにはまっています。",
            "translations": {
              "zh-Hant": "最近我迷上了看老電影。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-2de92ace261f",
        "category": "3",
        "subcategory": "3.01",
        "term": "塞がる（ふさがる）",
        "headword": "塞がる",
        "reading": "ふさがる",
        "meanings": {
          "zh-Hant": "堵住；被佔用"
        },
        "example": "倒れた木で道が塞がり、先へ進めませんでした。",
        "examples": [
          {
            "text": "倒れた木で道が塞がり、先へ進めませんでした。",
            "translations": {
              "zh-Hant": "倒下的樹堵住了道路，讓我們無法繼續前進。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-65cc3c9450b2",
        "category": "3",
        "subcategory": "3.01",
        "term": "ぶつかる（ぶつかる）",
        "headword": "ぶつかる",
        "reading": "ぶつかる",
        "meanings": {
          "zh-Hant": "碰撞；遇到、衝突"
        },
        "example": "急いで角を曲がったら、人にぶつかりそうになりました。",
        "examples": [
          {
            "text": "急いで角を曲がったら、人にぶつかりそうになりました。",
            "translations": {
              "zh-Hant": "我匆忙轉過街角，差點撞到人。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-642ae2a15b2d",
        "category": "8",
        "subcategory": "8.01",
        "term": "振る（ふる）",
        "headword": "振る",
        "reading": "ふる",
        "meanings": {
          "zh-Hant": "揮動、搖動；甩開"
        },
        "example": "母は窓から手を振って、見送ってくれました。",
        "examples": [
          {
            "text": "母は窓から手を振って、見送ってくれました。",
            "translations": {
              "zh-Hant": "母親從窗邊揮手，目送我離開。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-796ed39f09db",
        "category": "9",
        "subcategory": "9.01",
        "term": "触れる（ふれる）",
        "headword": "触れる",
        "reading": "ふれる",
        "meanings": {
          "zh-Hant": "觸碰；提及、接觸"
        },
        "example": "展示品には手で触れないでください。",
        "examples": [
          {
            "text": "展示品には手で触れないでください。",
            "translations": {
              "zh-Hant": "請不要用手觸摸展示品。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-0bff49d6cf81",
        "category": "8",
        "subcategory": "8.01",
        "term": "招く（まねく）",
        "headword": "招く",
        "reading": "まねく",
        "meanings": {
          "zh-Hant": "招待、邀請；招致"
        },
        "example": "週末は友人を家に招いて、一緒に料理をします。",
        "examples": [
          {
            "text": "週末は友人を家に招いて、一緒に料理をします。",
            "translations": {
              "zh-Hant": "週末我要邀請朋友來家裡，一起做飯。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-63d9c38cad3d",
        "category": "1",
        "subcategory": "1.01",
        "term": "寄せる（よせる）",
        "headword": "寄せる",
        "reading": "よせる",
        "meanings": {
          "zh-Hant": "使靠近、聚攏；寄送"
        },
        "example": "寒いので、椅子をストーブの近くに寄せました。",
        "examples": [
          {
            "text": "寒いので、椅子をストーブの近くに寄せました。",
            "translations": {
              "zh-Hant": "因為很冷，我把椅子挪到了暖爐旁。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e2674f984d5e",
        "category": "8",
        "subcategory": "8.01",
        "term": "文句（もんく）",
        "headword": "文句",
        "reading": "もんく",
        "meanings": {
          "zh-Hant": "抱怨；語句"
        },
        "example": "文句を言う前に、まず自分で試してみてください。",
        "examples": [
          {
            "text": "文句を言う前に、まず自分で試してみてください。",
            "translations": {
              "zh-Hant": "抱怨之前，請先自己試試看。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-8438803585eb",
        "category": "4",
        "subcategory": "4.01",
        "term": "波（なみ）",
        "headword": "波",
        "reading": "なみ",
        "meanings": {
          "zh-Hant": "波浪；波動"
        },
        "example": "今日は波が高いので、海には入りません。",
        "examples": [
          {
            "text": "今日は波が高いので、海には入りません。",
            "translations": {
              "zh-Hant": "今天海浪很大，所以我不下海。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b704a8db3083",
        "category": "4",
        "subcategory": "4.01",
        "term": "陰（かげ）",
        "headword": "陰",
        "reading": "かげ",
        "meanings": {
          "zh-Hant": "陰處；背後"
        },
        "example": "日差しが強かったので、木の陰で休みました。",
        "examples": [
          {
            "text": "日差しが強かったので、木の陰で休みました。",
            "translations": {
              "zh-Hant": "陽光太強，所以我在樹蔭下休息。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f774681ffe03",
        "category": "1",
        "subcategory": "1.01",
        "term": "鋭い（するどい）",
        "headword": "鋭い",
        "reading": "するどい",
        "meanings": {
          "zh-Hant": "尖銳、鋒利；敏銳"
        },
        "example": "この包丁は刃が鋭いので、扱いに気をつけてください。",
        "examples": [
          {
            "text": "この包丁は刃が鋭いので、扱いに気をつけてください。",
            "translations": {
              "zh-Hant": "這把菜刀的刀刃很鋒利，使用時請小心。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-94cb2fd32fd5",
        "category": "4",
        "subcategory": "4.01",
        "term": "やかましい（やかましい）",
        "headword": "やかましい",
        "reading": "やかましい",
        "meanings": {
          "zh-Hant": "吵鬧；挑剔、嚴格"
        },
        "example": "外の工事の音がやかましくて、仕事に集中できません。",
        "examples": [
          {
            "text": "外の工事の音がやかましくて、仕事に集中できません。",
            "translations": {
              "zh-Hant": "外面的施工聲太吵，讓我無法專心工作。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ce70464fdc48",
        "category": "10",
        "subcategory": "10.01",
        "term": "しょっちゅう（しょっちゅう）",
        "headword": "しょっちゅう",
        "reading": "しょっちゅう",
        "meanings": {
          "zh-Hant": "經常、老是"
        },
        "example": "兄はしょっちゅう鍵をなくして、家族に探してもらっています。",
        "examples": [
          {
            "text": "兄はしょっちゅう鍵をなくして、家族に探してもらっています。",
            "translations": {
              "zh-Hant": "哥哥老是弄丟鑰匙，請家人幫忙找。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-91a7273e7f76",
        "category": "10",
        "subcategory": "10.01",
        "term": "頻繁に（ひんぱんに）",
        "headword": "頻繁に",
        "reading": "ひんぱんに",
        "meanings": {
          "zh-Hant": "頻繁地"
        },
        "example": "最近、仕事で大阪を頻繁に訪れています。",
        "examples": [
          {
            "text": "最近、仕事で大阪を頻繁に訪れています。",
            "translations": {
              "zh-Hant": "最近我因為工作而頻繁前往大阪。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-d65080a0aaae",
        "category": "3",
        "subcategory": "3.01",
        "term": "尋ねる（たずねる）",
        "headword": "尋ねる",
        "reading": "たずねる",
        "meanings": {
          "zh-Hant": "詢問、打聽"
        },
        "example": "道が分からなかったので、近くの店で駅への行き方を尋ねました。",
        "examples": [
          {
            "text": "道が分からなかったので、近くの店で駅への行き方を尋ねました。",
            "translations": {
              "zh-Hant": "因為不認識路，我到附近的店裡詢問了去車站的走法。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c6e064911613",
        "category": "8",
        "subcategory": "8.01",
        "term": "大げさに（おおげさに）",
        "headword": "大げさに",
        "reading": "おおげさに",
        "meanings": {
          "zh-Hant": "誇張地、小題大作地"
        },
        "example": "兄は小さなけがなのに、大げさに痛がっています。",
        "examples": [
          {
            "text": "兄は小さなけがなのに、大げさに痛がっています。",
            "translations": {
              "zh-Hant": "哥哥明明只是受了小傷，卻誇張地喊痛。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-3cb8d1773a70",
        "category": "8",
        "subcategory": "8.01",
        "term": "オーバーに（おーばーに）",
        "headword": "オーバーに",
        "reading": "おーばーに",
        "meanings": {
          "zh-Hant": "誇張地、過度地"
        },
        "example": "彼はわざとオーバーに驚いて、子供たちを笑わせました。",
        "examples": [
          {
            "text": "彼はわざとオーバーに驚いて、子供たちを笑わせました。",
            "translations": {
              "zh-Hant": "他故意誇張地表現出驚訝，逗得孩子們大笑。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-6d2ca6ba8dfc",
        "category": "10",
        "subcategory": "10.01",
        "term": "にわかに（にわかに）",
        "headword": "にわかに",
        "reading": "にわかに",
        "meanings": {
          "zh-Hant": "突然、驟然"
        },
        "example": "晴れていた空が、にわかに暗くなりました。",
        "examples": [
          {
            "text": "晴れていた空が、にわかに暗くなりました。",
            "translations": {
              "zh-Hant": "原本晴朗的天空突然暗了下來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9575fb5d6539",
        "category": "10",
        "subcategory": "10.01",
        "term": "あらゆる（あらゆる）",
        "headword": "あらゆる",
        "reading": "あらゆる",
        "meanings": {
          "zh-Hant": "所有、一切"
        },
        "example": "あらゆる方法を試しましたが、鍵は見つかりませんでした。",
        "examples": [
          {
            "text": "あらゆる方法を試しましたが、鍵は見つかりませんでした。",
            "translations": {
              "zh-Hant": "我試過了所有方法，卻還是找不到鑰匙。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-4ba0c0de2f28",
        "category": "6",
        "subcategory": "6.01",
        "term": "安易に（あんいに）",
        "headword": "安易に",
        "reading": "あんいに",
        "meanings": {
          "zh-Hant": "輕易地、草率地"
        },
        "example": "契約の内容を読まずに、安易に署名してはいけません。",
        "examples": [
          {
            "text": "契約の内容を読まずに、安易に署名してはいけません。",
            "translations": {
              "zh-Hant": "不可以沒看合約內容就草率簽名。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-da4a2da91644",
        "category": "6",
        "subcategory": "6.01",
        "term": "相互に（そうごに）",
        "headword": "相互に",
        "reading": "そうごに",
        "meanings": {
          "zh-Hant": "互相、彼此"
        },
        "example": "仕事を進めるには、相互に情報を伝える必要があります。",
        "examples": [
          {
            "text": "仕事を進めるには、相互に情報を伝える必要があります。",
            "translations": {
              "zh-Hant": "要推進工作，就必須互相傳遞資訊。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-180273bd0e2c",
        "category": "6",
        "subcategory": "6.01",
        "term": "スムーズに（すむーずに）",
        "headword": "スムーズに",
        "reading": "すむーずに",
        "meanings": {
          "zh-Hant": "順暢地、順利地"
        },
        "example": "事前に準備したので、受付はスムーズに進みました。",
        "examples": [
          {
            "text": "事前に準備したので、受付はスムーズに進みました。",
            "translations": {
              "zh-Hant": "由於事先做好準備，報到作業進行得很順利。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-3b65da86f1a6",
        "category": "8",
        "subcategory": "8.01",
        "term": "強引に（ごういんに）",
        "headword": "強引に",
        "reading": "ごういんに",
        "meanings": {
          "zh-Hant": "強行地、硬來地"
        },
        "example": "相手の話を聞かずに、強引に自分の案を通しました。",
        "examples": [
          {
            "text": "相手の話を聞かずに、強引に自分の案を通しました。",
            "translations": {
              "zh-Hant": "他不聽對方的意見，強行通過了自己的方案。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-d6f4fbd160da",
        "category": "10",
        "subcategory": "10.01",
        "term": "案の定（あんのじょう）",
        "headword": "案の定",
        "reading": "あんのじょう",
        "meanings": {
          "zh-Hant": "果然、不出所料"
        },
        "example": "傘を持たずに出たら、案の定、帰りに雨に降られました。",
        "examples": [
          {
            "text": "傘を持たずに出たら、案の定、帰りに雨に降られました。",
            "translations": {
              "zh-Hant": "出門沒帶傘，果然回家時就遇上了下雨。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c03e06621cf5",
        "category": "8",
        "subcategory": "8.01",
        "term": "厚かましい（あつかましい）",
        "headword": "厚かましい",
        "reading": "あつかましい",
        "meanings": {
          "zh-Hant": "厚臉皮、不知羞恥"
        },
        "example": "初対面の人にお金を借りるなんて、厚かましいと思います。",
        "examples": [
          {
            "text": "初対面の人にお金を借りるなんて、厚かましいと思います。",
            "translations": {
              "zh-Hant": "向第一次見面的人借錢，我覺得太厚臉皮了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-8d37e03190e8",
        "category": "8",
        "subcategory": "8.01",
        "term": "図々しい（ずうずうしい）",
        "headword": "図々しい",
        "reading": "ずうずうしい",
        "meanings": {
          "zh-Hant": "厚臉皮、恬不知恥"
        },
        "example": "人の席に勝手に座るなんて、図々しい人ですね。",
        "examples": [
          {
            "text": "人の席に勝手に座るなんて、図々しい人ですね。",
            "translations": {
              "zh-Hant": "竟然擅自坐別人的位子，真是個厚臉皮的人。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7087ca85d361",
        "category": "8",
        "subcategory": "8.01",
        "term": "内気（うちき）",
        "headword": "内気",
        "reading": "うちき",
        "meanings": {
          "zh-Hant": "內向、靦腆"
        },
        "example": "内気な弟は、新しいクラスで周りの人にまだ話しかけられません。",
        "examples": [
          {
            "text": "内気な弟は、新しいクラスで周りの人にまだ話しかけられません。",
            "translations": {
              "zh-Hant": "內向的弟弟到了新班級，還不敢主動和周圍的人說話。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-8cad8bb6a535",
        "category": "8",
        "subcategory": "8.01",
        "term": "シャイ（しゃい）",
        "headword": "シャイ",
        "reading": "しゃい",
        "meanings": {
          "zh-Hant": "害羞、靦腆"
        },
        "example": "彼はシャイなので、褒めるとすぐ顔が赤くなります。",
        "examples": [
          {
            "text": "彼はシャイなので、褒めるとすぐ顔が赤くなります。",
            "translations": {
              "zh-Hant": "他很害羞，一受到稱讚就馬上臉紅。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-2235be6e4b36",
        "category": "8",
        "subcategory": "8.01",
        "term": "曖昧（あいまい）",
        "headword": "曖昧",
        "reading": "あいまい",
        "meanings": {
          "zh-Hant": "含糊、模稜兩可"
        },
        "example": "曖昧な返事だけでは、参加するのかどうか分かりません。",
        "examples": [
          {
            "text": "曖昧な返事だけでは、参加するのかどうか分かりません。",
            "translations": {
              "zh-Hant": "只給含糊的答覆，讓人無法知道到底會不會參加。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-24def3f41fe2",
        "category": "10",
        "subcategory": "10.01",
        "term": "厄介な（やっかいな）",
        "headword": "厄介な",
        "reading": "やっかいな",
        "meanings": {
          "zh-Hant": "麻煩的、棘手的"
        },
        "example": "厄介な問題ですが、一つずつ解決していきましょう。",
        "examples": [
          {
            "text": "厄介な問題ですが、一つずつ解決していきましょう。",
            "translations": {
              "zh-Hant": "雖然都是棘手的問題，我們還是一個個解決吧。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-a2f618c398eb",
        "category": "8",
        "subcategory": "8.01",
        "term": "差し支えない（さしつかえない）",
        "headword": "差し支えない",
        "reading": "さしつかえない",
        "meanings": {
          "zh-Hant": "沒有妨礙、沒有關係"
        },
        "example": "差し支えない範囲で、お仕事について教えてください。",
        "examples": [
          {
            "text": "差し支えない範囲で、お仕事について教えてください。",
            "translations": {
              "zh-Hant": "請在方便透露的範圍內，介紹一下您的工作。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-2bee37a36090",
        "category": "10",
        "subcategory": "10.01",
        "term": "やむを得ない（やむをえない）",
        "headword": "やむを得ない",
        "reading": "やむをえない",
        "meanings": {
          "zh-Hant": "不得已、無可奈何"
        },
        "example": "大雪で電車が止まったのなら、遅刻もやむを得ないでしょう。",
        "examples": [
          {
            "text": "大雪で電車が止まったのなら、遅刻もやむを得ないでしょう。",
            "translations": {
              "zh-Hant": "如果是因為大雪導致電車停駛，那麼遲到也是無可奈何的吧。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-80695f798f03",
        "category": "8",
        "subcategory": "8.01",
        "term": "みっともない（みっともない）",
        "headword": "みっともない",
        "reading": "みっともない",
        "meanings": {
          "zh-Hant": "難看、不體面"
        },
        "example": "人前で大声で言い争うのは、みっともないですよ。",
        "examples": [
          {
            "text": "人前で大声で言い争うのは、みっともないですよ。",
            "translations": {
              "zh-Hant": "在眾人面前大聲爭吵，很不體面喔。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-524d7675d04d",
        "category": "6",
        "subcategory": "6.01",
        "term": "順調に（じゅんちょうに）",
        "headword": "順調に",
        "reading": "じゅんちょうに",
        "meanings": {
          "zh-Hant": "順利地"
        },
        "example": "工事は予定どおり順調に進んでいます。",
        "examples": [
          {
            "text": "工事は予定どおり順調に進んでいます。",
            "translations": {
              "zh-Hant": "工程正按照預定計畫順利進行。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e0abc938bb2f",
        "category": "5",
        "subcategory": "5.01",
        "term": "アイデア（あいであ）",
        "headword": "アイデア",
        "reading": "あいであ",
        "meanings": {
          "zh-Hant": "主意、構想"
        },
        "example": "散歩をしていると、いいアイデアが浮かびました。",
        "examples": [
          {
            "text": "散歩をしていると、いいアイデアが浮かびました。",
            "translations": {
              "zh-Hant": "散步的時候，我想到了一個好主意。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7ffb2710ddbe",
        "category": "8",
        "subcategory": "8.01",
        "term": "伝言（でんごん）",
        "headword": "伝言",
        "reading": "でんごん",
        "meanings": {
          "zh-Hant": "傳話、留言"
        },
        "example": "留守番電話に伝言を残しました。",
        "examples": [
          {
            "text": "留守番電話に伝言を残しました。",
            "translations": {
              "zh-Hant": "我在電話答錄機裡留了言。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-d024185eb6b7",
        "category": "10",
        "subcategory": "10.01",
        "term": "各々（おのおの）",
        "headword": "各々",
        "reading": "おのおの",
        "meanings": {
          "zh-Hant": "各自、各個"
        },
        "example": "参加者は各々、自分の飲み物を持ってきてください。",
        "examples": [
          {
            "text": "参加者は各々、自分の飲み物を持ってきてください。",
            "translations": {
              "zh-Hant": "請參加者各自攜帶自己的飲料。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b6c5e5aa4df4",
        "category": "8",
        "subcategory": "8.01",
        "term": "苦情（くじょう）",
        "headword": "苦情",
        "reading": "くじょう",
        "meanings": {
          "zh-Hant": "抱怨、投訴"
        },
        "example": "夜中の騒音について、住民から苦情が出ています。",
        "examples": [
          {
            "text": "夜中の騒音について、住民から苦情が出ています。",
            "translations": {
              "zh-Hant": "居民對半夜的噪音提出了投訴。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-4f13613fd7fd",
        "category": "8",
        "subcategory": "8.01",
        "term": "マナー（まなー）",
        "headword": "マナー",
        "reading": "まなー",
        "meanings": {
          "zh-Hant": "禮儀、規矩"
        },
        "example": "店員に乱暴な言い方をするのは、マナーに反します。",
        "examples": [
          {
            "text": "店員に乱暴な言い方をするのは、マナーに反します。",
            "translations": {
              "zh-Hant": "用粗魯的語氣對店員說話，是不合禮儀的行為。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-8c3298178f6c",
        "category": "10",
        "subcategory": "10.01",
        "term": "契機（けいき）",
        "headword": "契機",
        "reading": "けいき",
        "meanings": {
          "zh-Hant": "契機、轉機"
        },
        "example": "留学を契機に、料理を自分で作るようになりました。",
        "examples": [
          {
            "text": "留学を契機に、料理を自分で作るようになりました。",
            "translations": {
              "zh-Hant": "以留學為契機，我開始自己做飯。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e48696d2702e",
        "category": "6",
        "subcategory": "6.01",
        "term": "試作品（しさくひん）",
        "headword": "試作品",
        "reading": "しさくひん",
        "meanings": {
          "zh-Hant": "試製品、樣品"
        },
        "example": "試作品を使ってもらい、お客さんの意見を集めました。",
        "examples": [
          {
            "text": "試作品を使ってもらい、お客さんの意見を集めました。",
            "translations": {
              "zh-Hant": "我們請顧客試用樣品，蒐集了他們的意見。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-deb3b54d2fd7",
        "category": "9",
        "subcategory": "9.01",
        "term": "援助（えんじょ）",
        "headword": "援助",
        "reading": "えんじょ",
        "meanings": {
          "zh-Hant": "援助、幫助"
        },
        "example": "被災した村に、食料や水の援助が届きました。",
        "examples": [
          {
            "text": "被災した村に、食料や水の援助が届きました。",
            "translations": {
              "zh-Hant": "受災的村莊收到了糧食和飲用水等援助。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-86592fe77e48",
        "category": "8",
        "subcategory": "8.01",
        "term": "上がる（あがる）",
        "headword": "上がる",
        "reading": "あがる",
        "meanings": {
          "zh-Hant": "上升；怯場、緊張"
        },
        "example": "初めての発表で上がってしまい、名前も言えませんでした。",
        "examples": [
          {
            "text": "初めての発表で上がってしまい、名前も言えませんでした。",
            "translations": {
              "zh-Hant": "第一次上台發表時，我緊張得連名字都說不出來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b3d749bfcd44",
        "category": "8",
        "subcategory": "8.01",
        "term": "頭に来る（あたまにくる）",
        "headword": "頭に来る",
        "reading": "あたまにくる",
        "meanings": {
          "zh-Hant": "生氣、惱火"
        },
        "example": "約束を何度も破られて、さすがに頭に来ました。",
        "examples": [
          {
            "text": "約束を何度も破られて、さすがに頭に来ました。",
            "translations": {
              "zh-Hant": "對方一再違反約定，這次我實在火大了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-051139cb9ff8",
        "category": "8",
        "subcategory": "8.01",
        "term": "腹が立つ（はらがたつ）",
        "headword": "腹が立つ",
        "reading": "はらがたつ",
        "meanings": {
          "zh-Hant": "生氣、憤怒"
        },
        "example": "私の話を最後まで聞かないので、腹が立ちました。",
        "examples": [
          {
            "text": "私の話を最後まで聞かないので、腹が立ちました。",
            "translations": {
              "zh-Hant": "對方不肯把我的話聽完，讓我很生氣。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-996e96ed2aa8",
        "category": "8",
        "subcategory": "8.01",
        "term": "へこむ（へこむ）",
        "headword": "へこむ",
        "reading": "へこむ",
        "meanings": {
          "zh-Hant": "凹陷；沮喪"
        },
        "example": "失敗してへこんでいたら、友人が励ましてくれました。",
        "examples": [
          {
            "text": "失敗してへこんでいたら、友人が励ましてくれました。",
            "translations": {
              "zh-Hant": "我因為失敗而沮喪時，朋友給了我鼓勵。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-8ed6aee1bf93",
        "category": "8",
        "subcategory": "8.01",
        "term": "がっかりする（がっかりする）",
        "headword": "がっかりする",
        "reading": "がっかりする",
        "meanings": {
          "zh-Hant": "失望、灰心"
        },
        "example": "楽しみにしていた店が休みで、がっかりしました。",
        "examples": [
          {
            "text": "楽しみにしていた店が休みで、がっかりしました。",
            "translations": {
              "zh-Hant": "期待已久的店竟然沒營業，讓我很失望。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-516b6f37234f",
        "category": "8",
        "subcategory": "8.01",
        "term": "お詫びする（おわびする）",
        "headword": "お詫びする",
        "reading": "おわびする",
        "meanings": {
          "zh-Hant": "道歉、致歉"
        },
        "example": "商品の発送が遅れたことを、お客様にお詫びしました。",
        "examples": [
          {
            "text": "商品の発送が遅れたことを、お客様にお詫びしました。",
            "translations": {
              "zh-Hant": "我為商品延遲出貨一事向顧客致歉。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-0309f961a45e",
        "category": "8",
        "subcategory": "8.01",
        "term": "言い張る（いいはる）",
        "headword": "言い張る",
        "reading": "いいはる",
        "meanings": {
          "zh-Hant": "堅稱、堅持己見"
        },
        "example": "彼は証拠を見せられても、知らないと言い張りました。",
        "examples": [
          {
            "text": "彼は証拠を見せられても、知らないと言い張りました。",
            "translations": {
              "zh-Hant": "即使證據擺在眼前，他仍堅稱自己不知情。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-a13144bd2c66",
        "category": "8",
        "subcategory": "8.01",
        "term": "打ち消す（うちけす）",
        "headword": "打ち消す",
        "reading": "うちけす",
        "meanings": {
          "zh-Hant": "否定、消除"
        },
        "example": "会社は店を閉めるといううわさを打ち消しました。",
        "examples": [
          {
            "text": "会社は店を閉めるといううわさを打ち消しました。",
            "translations": {
              "zh-Hant": "公司否認了將要關店的傳聞。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-44c82f35a6ed",
        "category": "1",
        "subcategory": "1.01",
        "term": "くるむ（くるむ）",
        "headword": "くるむ",
        "reading": "くるむ",
        "meanings": {
          "zh-Hant": "包裹、包住"
        },
        "example": "赤ちゃんを柔らかい毛布でくるみました。",
        "examples": [
          {
            "text": "赤ちゃんを柔らかい毛布でくるみました。",
            "translations": {
              "zh-Hant": "我用柔軟的毛毯把嬰兒包起來。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-62e4516102db",
        "category": "3",
        "subcategory": "3.01",
        "term": "背負う（せおう）",
        "headword": "背負う",
        "reading": "せおう",
        "meanings": {
          "zh-Hant": "背負；承擔"
        },
        "example": "父は重いリュックを背負って、山道を歩きました。",
        "examples": [
          {
            "text": "父は重いリュックを背負って、山道を歩きました。",
            "translations": {
              "zh-Hant": "父親背著沉重的背包，走在山路上。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-fc9328c64c64",
        "category": "6",
        "subcategory": "6.01",
        "term": "担ぐ（かつぐ）",
        "headword": "担ぐ",
        "reading": "かつぐ",
        "meanings": {
          "zh-Hant": "扛、抬；擁戴"
        },
        "example": "二人で木材を肩に担いで、倉庫まで運びました。",
        "examples": [
          {
            "text": "二人で木材を肩に担いで、倉庫まで運びました。",
            "translations": {
              "zh-Hant": "兩個人一起把木材扛在肩上，搬到了倉庫。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-077f35d8b992",
        "category": "3",
        "subcategory": "3.01",
        "term": "引き返す（ひきかえす）",
        "headword": "引き返す",
        "reading": "ひきかえす",
        "meanings": {
          "zh-Hant": "返回、折返"
        },
        "example": "財布を忘れたことに気づいて、家へ引き返しました。",
        "examples": [
          {
            "text": "財布を忘れたことに気づいて、家へ引き返しました。",
            "translations": {
              "zh-Hant": "發現忘了帶錢包後，我便折返回家。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5a91b2e107f8",
        "category": "2",
        "subcategory": "2.01",
        "term": "くたびれる（くたびれる）",
        "headword": "くたびれる",
        "reading": "くたびれる",
        "meanings": {
          "zh-Hant": "疲倦；磨損、陳舊"
        },
        "example": "一日中歩いて、すっかりくたびれました。",
        "examples": [
          {
            "text": "一日中歩いて、すっかりくたびれました。",
            "translations": {
              "zh-Hant": "走了一整天，我已經累壞了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-dd6777d9e799",
        "category": "8",
        "subcategory": "8.01",
        "term": "悩む（なやむ）",
        "headword": "悩む",
        "reading": "なやむ",
        "meanings": {
          "zh-Hant": "煩惱、苦惱"
        },
        "example": "進学するか就職するか、ずっと悩んでいます。",
        "examples": [
          {
            "text": "進学するか就職するか、ずっと悩んでいます。",
            "translations": {
              "zh-Hant": "我一直在煩惱該繼續升學還是就業。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-8c52920802b4",
        "category": "9",
        "subcategory": "9.01",
        "term": "負ける（まける）",
        "headword": "負ける",
        "reading": "まける",
        "meanings": {
          "zh-Hant": "輸、敗北；讓價"
        },
        "example": "昨日の試合では一点差で負けました。",
        "examples": [
          {
            "text": "昨日の試合では一点差で負けました。",
            "translations": {
              "zh-Hant": "昨天的比賽，我們以一分之差輸了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-d5af6ae7d19c",
        "category": "5",
        "subcategory": "5.01",
        "term": "サボる（さぼる）",
        "headword": "サボる",
        "reading": "さぼる",
        "meanings": {
          "zh-Hant": "偷懶、翹課、曠工"
        },
        "example": "授業をサボって映画を見に行き、先生に叱られました。",
        "examples": [
          {
            "text": "授業をサボって映画を見に行き、先生に叱られました。",
            "translations": {
              "zh-Hant": "我翹課去看電影，被老師罵了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-d07149209712",
        "category": "1",
        "subcategory": "1.01",
        "term": "転居する（てんきょする）",
        "headword": "転居する",
        "reading": "てんきょする",
        "meanings": {
          "zh-Hant": "搬家、遷居"
        },
        "example": "来月、会社の近くの町へ転居します。",
        "examples": [
          {
            "text": "来月、会社の近くの町へ転居します。",
            "translations": {
              "zh-Hant": "下個月我要搬到公司附近的城鎮。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-801eb3b242c5",
        "category": "1",
        "subcategory": "1.01",
        "term": "寛ぐ（くつろぐ）",
        "headword": "寛ぐ",
        "reading": "くつろぐ",
        "meanings": {
          "zh-Hant": "放鬆、舒適地休息"
        },
        "example": "休みの日は、家で音楽を聴きながら寛いでいます。",
        "examples": [
          {
            "text": "休みの日は、家で音楽を聴きながら寛いでいます。",
            "translations": {
              "zh-Hant": "休假的日子，我會在家一邊聽音樂一邊放鬆。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-70c037170594",
        "category": "8",
        "subcategory": "8.01",
        "term": "気まぐれ（きまぐれ）",
        "headword": "気まぐれ",
        "reading": "きまぐれ",
        "meanings": {
          "zh-Hant": "心血來潮、反覆無常"
        },
        "example": "彼の気まぐれで、旅行の行き先が何度も変わりました。",
        "examples": [
          {
            "text": "彼の気まぐれで、旅行の行き先が何度も変わりました。",
            "translations": {
              "zh-Hant": "因為他反覆無常，旅行目的地改了好幾次。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ff060accf1e8",
        "category": "10",
        "subcategory": "10.01",
        "term": "未だに（いまだに）",
        "headword": "未だに",
        "reading": "いまだに",
        "meanings": {
          "zh-Hant": "至今仍然"
        },
        "example": "十年前にもらった手紙を、未だに大切にしています。",
        "examples": [
          {
            "text": "十年前にもらった手紙を、未だに大切にしています。",
            "translations": {
              "zh-Hant": "十年前收到的信，我至今仍十分珍惜。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-e5e32a395573",
        "category": "4",
        "subcategory": "4.01",
        "term": "たくましい（たくましい）",
        "headword": "たくましい",
        "reading": "たくましい",
        "meanings": {
          "zh-Hant": "健壯；堅強、有韌性"
        },
        "example": "庭の木は強い風にも負けず、たくましく育っています。",
        "examples": [
          {
            "text": "庭の木は強い風にも負けず、たくましく育っています。",
            "translations": {
              "zh-Hant": "庭院裡的樹木不畏強風，正茁壯地成長。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-65720d6b86b1",
        "category": "9",
        "subcategory": "9.01",
        "term": "批評（ひひょう）",
        "headword": "批評",
        "reading": "ひひょう",
        "meanings": {
          "zh-Hant": "評論、批評"
        },
        "example": "新聞に、この映画を厳しく批評する記事が載っていました。",
        "examples": [
          {
            "text": "新聞に、この映画を厳しく批評する記事が載っていました。",
            "translations": {
              "zh-Hant": "報紙上刊登了一篇嚴厲批評這部電影的文章。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-7b29435a200a",
        "category": "6",
        "subcategory": "6.01",
        "term": "適応（てきおう）",
        "headword": "適応",
        "reading": "てきおう",
        "meanings": {
          "zh-Hant": "適應"
        },
        "example": "新しい職場の環境に適応するまで、少し時間がかかりました。",
        "examples": [
          {
            "text": "新しい職場の環境に適応するまで、少し時間がかかりました。",
            "translations": {
              "zh-Hant": "我花了一點時間才適應新職場的環境。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-eae514537f92",
        "category": "1",
        "subcategory": "1.01",
        "term": "改築（かいちく）",
        "headword": "改築",
        "reading": "かいちく",
        "meanings": {
          "zh-Hant": "改建建築物"
        },
        "example": "古い家を改築して、小さな図書館にしました。",
        "examples": [
          {
            "text": "古い家を改築して、小さな図書館にしました。",
            "translations": {
              "zh-Hant": "我們把老房子改建成了一間小圖書館。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-5db1adb8961e",
        "category": "1",
        "subcategory": "1.01",
        "term": "改装（かいそう）",
        "headword": "改装",
        "reading": "かいそう",
        "meanings": {
          "zh-Hant": "重新裝修、改裝"
        },
        "example": "店内を明るく改装してから、お客さんが増えました。",
        "examples": [
          {
            "text": "店内を明るく改装してから、お客さんが増えました。",
            "translations": {
              "zh-Hant": "把店內重新裝修得明亮之後，顧客增加了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-3443010e202c",
        "category": "10",
        "subcategory": "10.01",
        "term": "よほど・よっぽど（よほど・よっぽど）",
        "headword": "よほど・よっぽど",
        "reading": "よほど・よっぽど",
        "meanings": {
          "zh-Hant": "相當、很；多麼"
        },
        "example": "昼食を食べる時間もなかったなんて、よほど忙しかったんですね。",
        "examples": [
          {
            "text": "昼食を食べる時間もなかったなんて、よほど忙しかったんですね。",
            "translations": {
              "zh-Hant": "竟然連吃午餐的時間都沒有，想必相當忙吧。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c286c86c20ec",
        "category": "10",
        "subcategory": "10.01",
        "term": "大いに（おおいに）",
        "headword": "大いに",
        "reading": "おおいに",
        "meanings": {
          "zh-Hant": "大大地、盡情地"
        },
        "example": "新しい仕事には不安もありますが、大いに期待しています。",
        "examples": [
          {
            "text": "新しい仕事には不安もありますが、大いに期待しています。",
            "translations": {
              "zh-Hant": "對新工作雖然有些不安，但我也抱著很大的期待。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b9cf498e8ee0",
        "category": "10",
        "subcategory": "10.01",
        "term": "なおさら（なおさら）",
        "headword": "なおさら",
        "reading": "なおさら",
        "meanings": {
          "zh-Hant": "更加、越發"
        },
        "example": "一人でも大変なのに、子供を連れていればなおさらです。",
        "examples": [
          {
            "text": "一人でも大変なのに、子供を連れていればなおさらです。",
            "translations": {
              "zh-Hant": "光是一個人就已經很辛苦了，帶著孩子就更不用說了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-0674f1f2a6d3",
        "category": "10",
        "subcategory": "10.01",
        "term": "ぐっと（ぐっと）",
        "headword": "ぐっと",
        "reading": "ぐっと",
        "meanings": {
          "zh-Hant": "猛然；大幅度地"
        },
        "example": "秋になって、朝の気温がぐっと下がりました。",
        "examples": [
          {
            "text": "秋になって、朝の気温がぐっと下がりました。",
            "translations": {
              "zh-Hant": "入秋後，早晨的氣溫大幅下降了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-d0e037670079",
        "category": "10",
        "subcategory": "10.01",
        "term": "めっきり（めっきり）",
        "headword": "めっきり",
        "reading": "めっきり",
        "meanings": {
          "zh-Hant": "明顯地、顯著地"
        },
        "example": "引っ越してから、彼に会う機会がめっきり減りました。",
        "examples": [
          {
            "text": "引っ越してから、彼に会う機会がめっきり減りました。",
            "translations": {
              "zh-Hant": "搬家後，見到他的機會明顯減少了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f61c8dbcebee",
        "category": "5",
        "subcategory": "5.01",
        "term": "割合（わりあい）",
        "headword": "割合",
        "reading": "わりあい",
        "meanings": {
          "zh-Hant": "比例；比較、相當"
        },
        "example": "この学校は、電車で通う生徒の割合が高いです。",
        "examples": [
          {
            "text": "この学校は、電車で通う生徒の割合が高いです。",
            "translations": {
              "zh-Hant": "這所學校搭電車通學的學生比例很高。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9de0dddf70ab",
        "category": "10",
        "subcategory": "10.01",
        "term": "あらかじめ（あらかじめ）",
        "headword": "あらかじめ",
        "reading": "あらかじめ",
        "meanings": {
          "zh-Hant": "預先、事先"
        },
        "example": "会議の資料は、あらかじめメールで送っておきます。",
        "examples": [
          {
            "text": "会議の資料は、あらかじめメールで送っておきます。",
            "translations": {
              "zh-Hant": "我會事先透過電子郵件寄出會議資料。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-6d6f19212be7",
        "category": "10",
        "subcategory": "10.01",
        "term": "絶えず（たえず）",
        "headword": "絶えず",
        "reading": "たえず",
        "meanings": {
          "zh-Hant": "不斷地、始終"
        },
        "example": "窓の外から、絶えず車の音が聞こえてきます。",
        "examples": [
          {
            "text": "窓の外から、絶えず車の音が聞こえてきます。",
            "translations": {
              "zh-Hant": "窗外不斷傳來車輛的聲音。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-9ebb3678a436",
        "category": "10",
        "subcategory": "10.01",
        "term": "終始（しゅうし）",
        "headword": "終始",
        "reading": "しゅうし",
        "meanings": {
          "zh-Hant": "始終、從頭到尾"
        },
        "example": "彼女は終始笑顔で、私たちの質問に答えてくれました。",
        "examples": [
          {
            "text": "彼女は終始笑顔で、私たちの質問に答えてくれました。",
            "translations": {
              "zh-Hant": "她從頭到尾都帶著笑容回答我們的問題。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-c1bb6c5062de",
        "category": "10",
        "subcategory": "10.01",
        "term": "時折（ときおり）",
        "headword": "時折",
        "reading": "ときおり",
        "meanings": {
          "zh-Hant": "偶爾、時而"
        },
        "example": "祖父は時折、子供の頃の話をしてくれます。",
        "examples": [
          {
            "text": "祖父は時折、子供の頃の話をしてくれます。",
            "translations": {
              "zh-Hant": "祖父偶爾會跟我們說他小時候的故事。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-10554f0a252e",
        "category": "10",
        "subcategory": "10.01",
        "term": "度々（たびたび）",
        "headword": "度々",
        "reading": "たびたび",
        "meanings": {
          "zh-Hant": "屢次、多次"
        },
        "example": "彼には度々助けてもらったので、今度は私が力になりたいです。",
        "examples": [
          {
            "text": "彼には度々助けてもらったので、今度は私が力になりたいです。",
            "translations": {
              "zh-Hant": "他曾多次幫助我，這次我也想助他一臂之力。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-28f0c76c5bd7",
        "category": "10",
        "subcategory": "10.01",
        "term": "しきりに（しきりに）",
        "headword": "しきりに",
        "reading": "しきりに",
        "meanings": {
          "zh-Hant": "頻頻地、不停地"
        },
        "example": "猫がしきりに窓の外を見ているので、何かいるのかもしれません。",
        "examples": [
          {
            "text": "猫がしきりに窓の外を見ているので、何かいるのかもしれません。",
            "translations": {
              "zh-Hant": "貓不停地往窗外看，外面可能有什麼東西。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ba00d2753220",
        "category": "10",
        "subcategory": "10.01",
        "term": "大して（たいして）",
        "headword": "大して",
        "reading": "たいして",
        "meanings": {
          "zh-Hant": "並不怎麼（後接否定）"
        },
        "example": "この問題は大して難しくないので、一人でも解けます。",
        "examples": [
          {
            "text": "この問題は大して難しくないので、一人でも解けます。",
            "translations": {
              "zh-Hant": "這道題並不怎麼難，一個人也能解開。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-964fecdfb0d2",
        "category": "10",
        "subcategory": "10.01",
        "term": "めったに（めったに）",
        "headword": "めったに",
        "reading": "めったに",
        "meanings": {
          "zh-Hant": "很少、難得（後接否定）"
        },
        "example": "仕事が忙しくて、平日はめったに自炊しません。",
        "examples": [
          {
            "text": "仕事が忙しくて、平日はめったに自炊しません。",
            "translations": {
              "zh-Hant": "工作很忙，我平日很少自己做飯。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-0bcb681ce00b",
        "category": "10",
        "subcategory": "10.01",
        "term": "果たして（はたして）",
        "headword": "果たして",
        "reading": "はたして",
        "meanings": {
          "zh-Hant": "究竟、到底；果然"
        },
        "example": "この小さな船で、果たして海を渡れるだろうか。",
        "examples": [
          {
            "text": "この小さな船で、果たして海を渡れるだろうか。",
            "translations": {
              "zh-Hant": "靠這艘小船，究竟能不能渡過大海呢？"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f4bfa6786a6c",
        "category": "10",
        "subcategory": "10.01",
        "term": "だろうか（だろうか）",
        "headword": "だろうか",
        "reading": "だろうか",
        "meanings": {
          "zh-Hant": "會是……嗎、是否……呢"
        },
        "example": "あの店は、日曜日も開いているのだろうか。",
        "examples": [
          {
            "text": "あの店は、日曜日も開いているのだろうか。",
            "translations": {
              "zh-Hant": "那家店星期天也有營業嗎？"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f59a795eef0b",
        "category": "10",
        "subcategory": "10.01",
        "term": "あたかも（あたかも）",
        "headword": "あたかも",
        "reading": "あたかも",
        "meanings": {
          "zh-Hant": "宛如、彷彿"
        },
        "example": "彼はあたかも何も知らないかのように振る舞いました。",
        "examples": [
          {
            "text": "彼はあたかも何も知らないかのように振る舞いました。",
            "translations": {
              "zh-Hant": "他的表現宛如什麼都不知道似的。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-b93e4fed073c",
        "category": "10",
        "subcategory": "10.01",
        "term": "ふと（ふと）",
        "headword": "ふと",
        "reading": "ふと",
        "meanings": {
          "zh-Hant": "忽然、偶然"
        },
        "example": "電車に乗っているとき、ふと昔の友人を思い出しました。",
        "examples": [
          {
            "text": "電車に乗っているとき、ふと昔の友人を思い出しました。",
            "translations": {
              "zh-Hant": "搭電車時，我忽然想起了一位老朋友。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-ac3ac08dd2a8",
        "category": "10",
        "subcategory": "10.01",
        "term": "やむを得ず（やむをえず）",
        "headword": "やむを得ず",
        "reading": "やむをえず",
        "meanings": {
          "zh-Hant": "不得已地"
        },
        "example": "子供が熱を出したので、やむを得ず出張を取りやめました。",
        "examples": [
          {
            "text": "子供が熱を出したので、やむを得ず出張を取りやめました。",
            "translations": {
              "zh-Hant": "因為孩子發燒了，我不得已取消了出差。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-1199182a46d4",
        "category": "10",
        "subcategory": "10.01",
        "term": "まして（まして）",
        "headword": "まして",
        "reading": "まして",
        "meanings": {
          "zh-Hant": "何況、更不用說"
        },
        "example": "私には三キロも走れないのだから、まして十キロは無理です。",
        "examples": [
          {
            "text": "私には三キロも走れないのだから、まして十キロは無理です。",
            "translations": {
              "zh-Hant": "我連三公里都跑不了，更不用說十公里了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-05c73da918e5",
        "category": "10",
        "subcategory": "10.01",
        "term": "かえって（かえって）",
        "headword": "かえって",
        "reading": "かえって",
        "meanings": {
          "zh-Hant": "反而"
        },
        "example": "急いで説明したら、かえって相手を混乱させてしまいました。",
        "examples": [
          {
            "text": "急いで説明したら、かえって相手を混乱させてしまいました。",
            "translations": {
              "zh-Hant": "我匆忙解釋，反而讓對方更混亂了。"
            }
          }
        ]
      },
      {
        "id": "ja-vocab-f30637799e39",
        "category": "10",
        "subcategory": "10.01",
        "term": "あいにく（あいにく）",
        "headword": "あいにく",
        "reading": "あいにく",
        "meanings": {
          "zh-Hant": "不巧、偏偏"
        },
        "example": "あいにく今日は店長が休みなので、明日お電話いただけますか。",
        "examples": [
          {
            "text": "あいにく今日は店長が休みなので、明日お電話いただけますか。",
            "translations": {
              "zh-Hant": "不巧店長今天休假，可以請您明天再來電嗎？"
            }
          }
        ]
      }
    ],
  };
  const conversion = {
    traditionalExact: {
      '《圣经》中的“约”': '《聖經》中的“約”',
      '一点一滴，积累语感': '一點一滴，積累語感',
      '一餐；饭': '一餐；飯',
      上一个: '上一個',
      上一页: '上一頁',
      下一个: '下一個',
      下一页: '下一頁',
      下载的进度备份: '下載的進度備份',
      下载进度备份: '下載進度備份',
      '与 diocèse（主教教区）区分。': '與 diocèse（主教教區）區分。',
      '丑的，难看的': '醜的，難看的',
      '业余活动、兴趣和爱好': '業餘活動、興趣和愛好',
      东方的: '東方的',
      '严厉的，严格的': '嚴厲的，嚴格的',
      严格: '嚴格',
      严格的: '嚴格的',
      个主题: '個主題',
      个人数据: '個人數據',
      个人的: '個人的',
      个性: '個性',
      个词: '個詞',
      个词已经看完了: '個詞已經看完了',
      '个词条。第一单元“履历、个人信息”已按《法语基础词汇分类学习手册》书页 1–15 整理为 321 个词条，保留基础／进阶分组与法语例句。其余主题仍为 148 个原创示例词条':
        '個詞條。第一單元“履歷、個人信息”已按《法語基礎詞彙分類學習手冊》書頁 1–15 整理為 321 個詞條，保留基礎／進階分組與法語例句。其餘主題仍為 148 個原創示例詞條',
      个词汇: '個詞彙',
      '个词汇已掌握，继续积累吧': '個詞彙已掌握，繼續積累吧',
      '个词的进度；同词采用备份中的标记': '個詞的進度；同詞採用備份中的標記',
      '个，共': '個，共',
      中国人: '中國人',
      中文释义: '中文釋義',
      主教会议: '主教會議',
      '主教管区，教区': '主教管區，教區',
      主题导航: '主題導航',
      '举止，管教': '舉止，管教',
      '举止，行为，外表': '舉止，行為，外表',
      乌冬面: '烏冬面',
      '乖的，听话的': '乖的，聽話的',
      '乡村；农村': '鄉村；農村',
      书页: '書頁',
      乱序: '亂序',
      '交通；车流': '交通；車流',
      '亲切的，客气的': '親切的，客氣的',
      人类: '人類',
      '人，个体': '人，個體',
      '令人赞赏的，令人钦佩的': '令人贊賞的，令人欽佩的',
      '以使用词汇筛选、卡片和进度记录': '以使用詞彙篩選、卡片和進度記錄',
      以内: '以內',
      价格: '價格',
      价格和货币往来: '價格和貨幣往來',
      '优美，优雅，魅力': '優美，優雅，魅力',
      '优雅的，漂亮的': '優雅的，漂亮的',
      会议: '會議',
      '使……感兴趣': '使……感興趣',
      '使散步，带……散步': '使散步，帶……散步',
      使睡觉: '使睡覺',
      '侧脸，形象，气质': '側臉，形象，氣質',
      俄国的: '俄國的',
      '保留原书例句中的群体概括，仅作语言材料。': '保留原書例句中的群體概括，僅作語言材料。',
      '保留原书例句；其中对人群的概括属于原书表述。':
        '保留原書例句；其中對人群的概括屬於原書表述。',
      '信徒，门徒': '信徒，門徒',
      儿子: '兒子',
      '先回想，再看释义': '先回想，再看釋義',
      '先想一想，这个词是什么意思': '先想一想，這個詞是什麼意思',
      全部子类: '全部子類',
      全部词汇: '全部詞彙',
      公共和社会服务: '公共和社會服務',
      公共和私人服务业: '公共和私人服務業',
      公共服务: '公共服務',
      公共汽车: '公共汽車',
      关于学习进度: '關於學習進度',
      关于熟悉程度: '關於熟悉程度',
      关于词库与读音: '關於詞庫與讀音',
      关于读音: '關於讀音',
      关闭分类目录: '關閉分類目錄',
      关闭说明: '關閉說明',
      兴趣: '興趣',
      '其他标签页的进度无法读取，请重新打开页面': '其他標籤頁的進度無法讀取，請重新打開頁面',
      再学一遍: '再學一遍',
      再点一次取消标记: '再點一次取消標記',
      凶恶的: '凶惡的',
      '出售；卖': '出售；賣',
      '出生于，源于': '出生於，源於',
      '出身，来源': '出身，來源',
      '分数；成绩': '分數；成績',
      分钟: '分鐘',
      切换到乱序学习: '切換到亂序學習',
      切换到正序学习: '切換到正序學習',
      切换词汇: '切換詞彙',
      '列表中的绿点表示已掌握，橙点表示有印象，红点表示不熟悉。点击圆点即可标记，再次点击已选圆点可恢复为未学习':
        '列表中的綠點表示已掌握，橙點表示有印象，紅點表示不熟悉。點擊圓點即可標記，再次點擊已選圓點可恢復為未學習',
      '创造力，想象力': '創造力，想象力',
      '办公室；书桌': '辦公室；書桌',
      勇气: '勇氣',
      医学和医学护理: '醫學和醫學護理',
      医生: '醫生',
      单词: '單詞',
      '单词和例句均内置法语音频，点击扬声器可直接播放，再次点击可停止。音频由法语':
        '單詞和例句均內置法語音頻，點擊揚聲器可直接播放，再次點擊可停止。音頻由法語',
      卢森堡: '盧森堡',
      '卢森堡的；卢森堡人': '盧森堡的；盧森堡人',
      '卧室；房间': '臥室；房間',
      '原书中文误作“美国人”，已改为“英格兰人”。': '原書中文誤作“美國人”，已改為“英格蘭人”。',
      '原书例句照录，是简化表述，基督教也包括东正教等传统。':
        '原書例句照錄，是簡化表述，基督教也包括東正教等傳統。',
      '原书合译“上帝”；普通名词 dieu / déesse 为神 / 女神，专名 Dieu 为上帝。':
        '原書合譯“上帝”；普通名詞 dieu / déesse 為神 / 女神，專名 Dieu 為上帝。',
      '原书第 1–15 页': '原書第 1–15 頁',
      '原书译“《旧约全书》”；Ancien Testament 为旧约，Nouveau Testament 为新约。':
        '原書譯“《舊約全書》”；Ancien Testament 為舊約，Nouveau Testament 為新約。',
      '原书译“年长的”；此处带冠词，按名词处理。': '原書譯“年長的”；此處帶冠詞，按名詞處理。',
      '原书译“忏悔的”，与此例句不符，已改为“宗教的，教派的”。':
        '原書譯“懺悔的”，與此例句不符，已改為“宗教的，教派的”。',
      '原书译“水族馆”，例句对应“水族箱”，已补充。': '原書譯“水族館”，例句對應“水族箱”，已補充。',
      '原书译“牧师”，按天主教语境改为“神父，司铎”。':
        '原書譯“牧師”，按天主教語境改為“神父，司鐸”。',
      '原书译“神甫，主教”，已按新教语境改为“牧师”。':
        '原書譯“神甫，主教”，已按新教語境改為“牧師”。',
      '原书释义与例句照录；indigène 指原住民时可能带殖民时代色彩。':
        '原書釋義與例句照錄；indigène 指原住民時可能帶殖民時代色彩。',
      原创示例词库: '原創示例詞庫',
      反复: '反復',
      '反抗，反对；作出反应': '反抗，反對；作出反應',
      发丝: '發絲',
      发型: '髮型',
      发根: '發根',
      '发烧；发热': '發燒；發熱',
      发辫: '發辮',
      叙利亚的: '敘利亞的',
      '可怕的，非常难看的': '可怕的，非常難看的',
      台湾: '台灣',
      台灯: '台燈',
      台风: '颱風',
      后台: '後台',
      听见: '聽見',
      '吵闹的；嘈杂的': '吵鬧的；嘈雜的',
      吸尘器: '吸塵器',
      '和蔼的，热情的': '和藹的，熱情的',
      '喜悦；快乐': '喜悅；快樂',
      回复: '回復',
      '固定的，不可改变的': '固定的，不可改變的',
      '国家的，民族的': '國家的，民族的',
      国籍和民族: '國籍和民族',
      图书馆: '圖書館',
      圣经: '聖經',
      圣经的: '聖經的',
      地狱: '地獄',
      '坦白的，诚实的': '坦白的，誠實的',
      城市和乡村: '城市和鄉村',
      基础: '基礎',
      堂区: '堂區',
      '堵车；交通拥堵': '堵車；交通擁堵',
      '声线合成；单文件版已包含所有音频，可离线播放。设备语音与':
        '聲線合成；單文件版已包含所有音頻，可離線播放。設備語音與',
      处方: '處方',
      复习: '復習',
      '复习；修订': '復習；修訂',
      复印: '復印',
      复原: '復原',
      复杂: '複雜',
      复活: '復活',
      '外国的，陌生的': '外國的，陌生的',
      '外形，轮廓': '外形，輪廓',
      '外观，样子；方面': '外觀，樣子；方面',
      大学: '大學',
      大学学习: '大學學習',
      '大的，宽的': '大的，寬的',
      '大胆的，勇敢的': '大膽的，勇敢的',
      '大胆，勇气': '大膽，勇氣',
      '太阳；阳光': '太陽；陽光',
      头: '頭',
      头发: '頭髮',
      奇迹: '奇跡',
      奥地利: '奧地利',
      奥地利的: '奧地利的',
      女儿: '女兒',
      '奶奶，外婆（儿语）': '奶奶，外婆（兒語）',
      '妈妈（儿语）': '媽媽（兒語）',
      '姨妈，姑姑，婶婶等': '姨媽，姑姑，嬸嬸等',
      '娱乐，闲暇活动': '娛樂，閒暇活動',
      婴儿: '嬰兒',
      '孙女，外孙女': '孫女，外孫女',
      '孙子，外孙子': '孫子，外孫子',
      '孙辈，外孙辈': '孫輩，外孫輩',
      学习培训: '學習培訓',
      学习空间: '學習空間',
      学习进度: '學習進度',
      学校: '學校',
      '学生；中小学生': '學生；中小學生',
      '孩子（俗语）': '孩子（俗語）',
      安静的: '安靜的',
      完成这组: '完成這組',
      宗教仪式: '宗教儀式',
      '审慎，谨慎；智慧': '審慎，謹慎；智慧',
      客厅: '客廳',
      客观的: '客觀的',
      '害怕；恐惧': '害怕；恐懼',
      家庭作业: '家庭作業',
      '对……感兴趣': '對……感興趣',
      导入进度备份: '導入進度備份',
      '小伙子，男人（俗语）': '小伙子，男人（俗語）',
      '小偷；盗贼': '小偷；盜賊',
      '小心的，谨慎的': '小心的，謹慎的',
      '小心，谨慎': '小心，謹慎',
      居留许可: '居留許可',
      '履历、个人信息': '履歷、個人信息',
      '山；山区': '山；山區',
      '崇拜，礼拜，祭祀': '崇拜，禮拜，祭祀',
      工作内容和活动: '工作內容和活動',
      工作场所和工作条件: '工作場所和工作條件',
      '工作时间；时间表': '工作時間；時間表',
      工作领域: '工作領域',
      '工作，职业': '工作，職業',
      '工地；施工现场': '工地；施工現場',
      工程师: '工程師',
      '已婚的，结婚的': '已婚的，結婚的',
      已导入: '已導入',
      已打乱词汇顺序: '已打亂詞彙順序',
      已按目录顺序排列: '已按目錄順序排列',
      已更新其他标签页的学习进度: '已更新其他標籤頁的學習進度',
      已标记为: '已標記為',
      已重新打乱顺序: '已重新打亂順序',
      '市政府；市政厅': '市政府；市政廳',
      希腊的: '希臘的',
      干净: '乾淨',
      干扰: '干擾',
      干杯: '乾杯',
      干果: '乾果',
      干洗: '乾洗',
      干燥: '乾燥',
      干粮: '乾糧',
      干线: '幹線',
      干货: '乾貨',
      干部: '幹部',
      干酪: '乾酪',
      '干零活，零星修补': '乾零活，零星修補',
      干预: '干預',
      年轻人: '年輕人',
      年轻的: '年輕的',
      '年长者，长子，长女': '年長者，長子，長女',
      年龄: '年齡',
      '年龄为……的': '年齡為……的',
      庄重的: '莊重的',
      '庙宇，教堂': '廟宇，教堂',
      '开学；返校': '開學；返校',
      弥撒: '彌撒',
      '强壮的，力气大的': '強壯的，力氣大的',
      当前浏览位置: '當前瀏覽位置',
      '当前读音无法播放，请使用': '當前讀音無法播放，請使用',
      德国: '德國',
      德国的: '德國的',
      德语: '德語',
      心理感觉: '心理感覺',
      '心脏；心': '心臟；心',
      '快乐的，愉快的': '快樂的，愉快的',
      忽视: '忽視',
      怀疑: '懷疑',
      态度: '態度',
      性格和脾气: '性格和脾氣',
      '性，性别': '性，性別',
      '悲伤；难过': '悲傷；難過',
      感官感觉和感知表述: '感官感覺和感知表述',
      感觉: '感覺',
      感觉和运动: '感覺和運動',
      感觉特征: '感覺特徵',
      '感觉，同情心，敏感性': '感覺，同情心，敏感性',
      '愤怒；生气': '憤怒；生氣',
      懒的: '懶的',
      我的法语词库: '我的法語詞庫',
      我的词库: '我的詞庫',
      房间和布置陈设: '房間和佈置陳設',
      手机词汇分类: '手機詞彙分類',
      打印机: '打印機',
      打开分类目录: '打開分類目錄',
      打扫卫生: '打掃衛生',
      打猎: '打獵',
      '把例句读出声，让词汇留在语境里': '把例句讀出聲，讓詞彙留在語境里',
      '把法语，变成日常': '把法語，變成日常',
      护发: '護髮',
      护照: '護照',
      '报案；提出控告': '報案；提出控告',
      拉面: '拉麵',
      '拾，捡': '拾，撿',
      挂面: '掛面',
      '按主题学习法语词汇。卡片与列表、例句、读音，让每一个词慢慢熟悉':
        '按主題學習法語詞彙。卡片與列表、例句、讀音，讓每一個詞慢慢熟悉',
      '按你提供的目录，整理了 11 个主题、44 个子类。当前共':
        '按你提供的目錄，整理了 11 個主題、44 個子類。當前共',
      按熟悉程度筛选: '按熟悉程度篩選',
      提问: '提問',
      '搜索法语、中文或例句': '搜索法語、中文或例句',
      搜索法语或中文: '搜索法語或中文',
      摄像头: '攝像頭',
      '播放例句；再次点击停止': '播放例句；再次點擊停止',
      播放未获允许: '播放未獲允許',
      '播放法语读音；再次点击停止': '播放法語讀音；再次點擊停止',
      收养: '收養',
      收据: '收據',
      '收集，搜集': '收集，蒐集',
      政府机关和管理: '政府機關和管理',
      '教士，神职人员': '教士，神職人員',
      教师: '教師',
      '教师；教授': '教師；教授',
      '教理讲授，教理课程': '教理講授，教理課程',
      数据库: '數據庫',
      '文凭；毕业证书': '文憑；畢業證書',
      '新教的，耶稣教的': '新教的，耶穌教的',
      旅游业: '旅遊業',
      旅游和交通: '旅遊和交通',
      '旅馆；酒店': '旅館；酒店',
      '无法导入。请选择': '無法導入。請選擇',
      '无耐心的，性急的；迫不及待的': '無耐心的，性急的；迫不及待的',
      日语: '日語',
      时钟: '時鐘',
      '明显的，显眼的': '明顯的，顯眼的',
      显示: '顯示',
      '显示 / 隐藏释义': '顯示 / 隱藏釋義',
      显示方式: '顯示方式',
      显示释义与例句: '顯示釋義與例句',
      '有天分的，有天赋的': '有天分的，有天賦的',
      服装和饰品: '服裝和飾品',
      朗读: '朗讀',
      朗读例句: '朗讀例句',
      '朗读未能开始，请使用': '朗讀未能開始，請使用',
      '期限；时限': '期限；時限',
      '木材；木头': '木材；木頭',
      未学习: '未學習',
      '本地人，当地人': '本地人，當地人',
      '机灵的，聪明的，狡猾的': '機靈的，聰明的，狡猾的',
      村庄: '村莊',
      '枪，步枪': '槍，步槍',
      染发: '染髮',
      '柔软的；柔和的': '柔軟的；柔和的',
      柜台: '櫃台',
      查看词库说明: '查看詞庫說明',
      标记熟悉程度: '標記熟悉程度',
      树: '樹',
      树干: '樹幹',
      '棕色的，棕发的': '棕色的，棕發的',
      植物和动物: '植物和動物',
      欧洲: '歐洲',
      欧洲的: '歐洲的',
      正在朗读: '正在朗讀',
      '正直的，善良的，诚实的': '正直的，善良的，誠實的',
      '步态，步伐': '步態，步伐',
      母亲: '母親',
      '母亲的，母性的': '母親的，母性的',
      '每次一个词，每天进一步': '每次一個詞，每天進一步',
      比利时: '比利時',
      比利时的: '比利時的',
      气候和天气: '氣候和天氣',
      '水族箱；水族馆': '水族箱；水族館',
      汉字: '漢字',
      没有可用的法语语音: '沒有可用的法語語音',
      没有找到匹配的词汇: '沒有找到匹配的詞彙',
      法国: '法國',
      法国的: '法國的',
      法语: '法語',
      '法语 / 读音': '法語 / 讀音',
      法语例句: '法語例句',
      法语基础词汇分类学习手册: '法語基礎詞彙分類學習手冊',
      法语词汇: '法語詞彙',
      法语词汇列表: '法語詞彙列表',
      法语词汇首页: '法語詞彙首頁',
      波兰的: '波蘭的',
      洗发: '洗發',
      活动: '活動',
      '浏览器无法保存进度，请在词库说明中下载备份': '瀏覽器無法保存進度，請在詞庫說明中下載備份',
      '海滩；沙滩': '海灘；沙灘',
      '消遣，娱乐': '消遣，娛樂',
      清除筛选: '清除篩選',
      '温度；气温': '溫度；氣溫',
      游戏: '遊戲',
      '激情，爱好': '激情，愛好',
      火车: '火車',
      点选圆点标记: '點選圓點標記',
      '点餐；订购': '點餐；訂購',
      '热情的，讨人喜欢的': '熱情的，討人喜歡的',
      '照看，照顾': '照看，照顧',
      熟悉程度图例: '熟悉程度圖例',
      '熟悉程度自动保存在当前浏览器，不会跨设备同步。清除浏览器数据会清除进度。可下载备份，在其他设备导入':
        '熟悉程度自動保存在當前瀏覽器，不會跨設備同步。清除瀏覽器數據會清除進度。可下載備份，在其他設備導入',
      爱好者: '愛好者',
      父亲: '父親',
      '爷爷，外公（儿语）': '爺爺，外公（兒語）',
      '爸爸（儿语）': '爸爸（兒語）',
      '牧师（新教）': '牧師（新教）',
      犹太人: '猶太人',
      猎人: '獵人',
      环境: '環境',
      理发: '理髮',
      '生日，周年纪念日': '生日，週年紀念日',
      '用于，奉献于': '用於，奉獻於',
      男护士: '男護士',
      画画: '畫畫',
      '痊愈；治愈': '痊癒；治癒',
      '瘦长的，苗条的': '瘦長的，苗條的',
      白发: '白髮',
      的子类: '的子類',
      '的熟悉程度，当前': '的熟悉程度，當前',
      的读音: '的讀音',
      盗窃: '盜竊',
      看见: '看見',
      '真诚的，诚恳的': '真誠的，誠懇的',
      '石头；石材': '石頭；石材',
      '研究；寻找': '研究；尋找',
      社会救助: '社會救助',
      祈祷: '祈禱',
      '祈祷，祷告': '祈禱，禱告',
      神圣的: '神聖的',
      '神学，宗教学': '神學，宗教學',
      '神父，司铎': '神父，司鐸',
      '神甫，堂区神父': '神甫，堂區神父',
      '神话，传奇': '神話，傳奇',
      '票；车票': '票；車票',
      福音书: '福音書',
      离婚: '離婚',
      秒钟: '秒鐘',
      '积极的，活跃的': '積極的，活躍的',
      移出当前筛选: '移出當前篩選',
      '穿过；横穿': '穿過；橫穿',
      '笔记本；练习本': '筆記本；練習本',
      '第一单元 · 原书词库': '第一單元 · 原書詞庫',
      第一单元原书词汇: '第一單元原書詞彙',
      筛选词库: '篩選詞庫',
      签名: '簽名',
      简体: '簡體',
      '粗暴的，粗鲁的；突然的': '粗暴的，粗魯的；突然的',
      紧张的: '緊張的',
      繁体: '繁體',
      '红棕色的，红发的': '紅棕色的，紅髮的',
      红灯: '紅燈',
      红衣主教: '紅衣主教',
      '组织；安排': '組織；安排',
      给记忆一点时间: '給記憶一點時間',
      网络: '網絡',
      罗马教皇: '羅馬教皇',
      美国的: '美國的',
      '美貌，美丽': '美貌，美麗',
      '翻译 · 备用': '翻譯 · 備用',
      翻译中查看: '翻譯中查看',
      翻译作为备用入口: '翻譯作為備用入口',
      翻译备用入口: '翻譯備用入口',
      '老的，上年纪的': '老的，上年紀的',
      考试: '考試',
      职业名称: '職業名稱',
      聪明的: '聰明的',
      背词区域: '背詞區域',
      '能干的，精明的': '能幹的，精明的',
      '自发的，自愿的': '自發的，自願的',
      自行车: '自行車',
      苍白的: '蒼白的',
      英国的: '英國的',
      英格兰人: '英格蘭人',
      英语: '英語',
      苹果: '蘋果',
      '药店；药房': '藥店；藥房',
      '药；药品': '藥；藥品',
      荷兰的: '荷蘭的',
      '薪水；工资': '薪水；工資',
      行为: '行為',
      '街区；城区': '街區；城區',
      '衣柜；柜子': '衣櫃；櫃子',
      '补充与例句对应的“外观，样子”义。': '補充與例句對應的“外觀，樣子”義。',
      '表格；申请表': '表格；申請表',
      衬衫: '襯衫',
      '触摸；碰': '觸摸；碰',
      计算机: '計算機',
      '认真的，严肃的': '認真的，嚴肅的',
      '让每一个陌生的词，慢慢变得熟悉': '讓每一個陌生的詞，慢慢變得熟悉',
      '记得；想起': '記得；想起',
      讲台: '講台',
      '设备朗读不可用，请使用': '設備朗讀不可用，請使用',
      '设备没有可用法语语音，请使用': '設備沒有可用法語語音，請使用',
      设置: '設置',
      设计语言: '設計語言',
      词: '詞',
      词库未能加载: '詞庫未能加載',
      词库说明: '詞庫說明',
      词汇: '詞彙',
      词汇分类: '詞彙分類',
      词汇卡片: '詞彙卡片',
      词汇大类: '詞彙大類',
      '试试其他关键词，或清除搜索和熟悉程度筛选': '試試其他關鍵詞，或清除搜索和熟悉程度篩選',
      '诚实的，正直的': '誠實的，正直的',
      语言: '語言',
      请再点一次扬声器播放读音: '請再點一次揚聲器播放讀音',
      请刷新页面后重试: '請刷新頁面後重試',
      请启用: '請啓用',
      诸圣瞻礼节: '諸聖瞻禮節',
      读音不可用: '讀音不可用',
      读音未能开始: '讀音未能開始',
      课堂: '課堂',
      '课程；课': '課程；課',
      调查: '調查',
      账单: '賬單',
      '购买；买': '購買；買',
      购物: '購物',
      '赋予，授予': '賦予，授予',
      路线描述: '路線描述',
      跳到词汇学习: '跳到詞彙學習',
      身份检查: '身份檢查',
      身体: '身體',
      身体健康和卫生: '身體健康和衛生',
      身体健康和需求: '身體健康和需求',
      身体活动: '身體活動',
      躯干: '軀乾',
      '转弯；转动': '轉彎；轉動',
      '运动员，玩家': '運動員，玩家',
      运输工具: '運輸工具',
      '这个词，你有多熟悉': '這個詞，你有多熟悉',
      这组: '這組',
      这组的学习进度: '這組的學習進度',
      进度保存在本机: '進度保存在本機',
      进度备份已准备下载: '進度備份已準備下載',
      '进度暂存，建议下载备份': '進度暫存，建議下載備份',
      进阶: '進階',
      选择分类: '選擇分類',
      '逗乐，使高兴': '逗樂，使高興',
      '通过；成功': '通過；成功',
      邪恶: '邪惡',
      '邮局；邮政': '郵局；郵政',
      采用: '採用',
      释义: '釋義',
      重复: '重復',
      重新加载: '重新加載',
      重新打乱: '重新打亂',
      重新打乱顺序: '重新打亂順序',
      金属: '金屬',
      '金色的，金发的': '金色的，金髮的',
      钓鱼: '釣魚',
      钟: '鐘',
      钟声: '鐘聲',
      钟楼: '鐘樓',
      钟点: '鐘點',
      钟表: '鐘錶',
      长裤: '長褲',
      闹钟: '鬧鐘',
      '闻；感到': '聞；感到',
      阴性的: '陰性的',
      隐藏: '隱藏',
      隐藏释义: '隱藏釋義',
      '零钱；货币': '零錢；貨幣',
      '青年时代，青春': '青年時代，青春',
      面包: '麵包',
      面包师: '麵包師',
      面团: '面團',
      面条: '麵條',
      面粉: '麵粉',
      '项目；计划': '項目；計劃',
      项链: '項鍊',
      '顾客；客户': '顧客；客戶',
      预订: '預訂',
      风: '風',
      风景: '風景',
      '风景；景色': '風景；景色',
      飞机: '飛機',
      餐饮: '餐飲',
      '饿；感到饥饿': '餓；感到飢餓',
      马戏团: '馬戲團',
      '骄傲的，自豪的': '驕傲的，自豪的',
      '鳏夫，寡妇': '鰥夫，寡婦',
      鸟: '鳥',
      鼠标: '鼠標',
      '包括，由……组成': '包括，由……組成',
      '关，关闭': '關，關閉',
      '实用的，功能的': '實用的，功能的',
      湿的: '濕的',
      '装饰，装修': '裝飾，裝修',
      '根据例句补充“已开业的”。': '根據例句補充“已開業的”。',
      '杂乱，无序': '雜亂，無序',
      阳台: '陽台',
      '原书释义“塑料”；词条无冠词，例句中用作形容词。':
        '原書釋義“塑料”；詞條無冠詞，例句中用作形容詞。',
      铁: '鐵',
      打开: '打開',
      '供……居住，容纳': '供……居住，容納',
      '原书译“一楼”；法语指与地面齐平的一层，其上一层才是 premier étage。':
        '原書譯“一樓”；法語指與地面齊平的一層，其上一層才是 premier étage。',
      别墅: '別墅',
      '煮沸，烧开': '煮沸，燒開',
      烟: '煙',
      '舒服，舒适': '舒服，舒適',
      '木材，木头': '木材，木頭',
      '法语楼层编号从地面层之上的 premier étage 起算。':
        '法語樓層編號從地面層之上的 premier étage 起算。',
      设备: '設備',
      干净的: '乾淨的',
      楼梯: '樓梯',
      '原书例句误写“est en sculptée en grès”，已删除多余的第一个 en；原书“粗陶土”义整理为“炻器（粗陶）”。':
        '原書例句誤寫“est en sculptée en grès”，已刪除多餘的第一個 en；原書“粗陶土”義整理為“炻器（粗陶）”。',
      '原书中文误作“启开”，此处应为“堵住、塞住”。': '原書中文誤作“啓開”，此處應為“堵住、塞住”。',
      脏的: '髒的',
      '建筑物的正面，立面': '建築物的正面，立面',
      宫殿: '宮殿',
      蜡烛: '蠟燭',
      床单: '床單',
      '材料，建筑材料': '材料，建築材料',
      '铺开，摊开，晾晒': '鋪開，攤開，晾曬',
      '装备，配备': '裝備，配備',
      '污点，污渍': '污點，污漬',
      '架子，书架的隔板': '架子，書架的隔板',
      '原书另列于相邻行的 appartement 例句已归入本词条。':
        '原書另列於相鄰行的 appartement 例句已歸入本詞條。',
      '家庭的，家务的': '家庭的，家務的',
      弄脏: '弄髒',
      '根据 verres en cristal 补充“水晶玻璃”。': '根據 verres en cristal 補充“水晶玻璃”。',
      '重新覆盖，覆盖': '重新覆蓋，覆蓋',
      '固定，固定装置': '固定，固定裝置',
      长凳: '長凳',
      使砰然作响: '使砰然作響',
      '烛芯，灯芯': '燭芯，燈芯',
      '浴室，洗澡间': '浴室，洗澡間',
      '灰尘，尘土': '灰塵，塵土',
      树脂: '樹脂',
      '使隔热，隔离': '使隔熱，隔離',
      物质: '物質',
      '打扫，清洁': '打掃，清潔',
      '摆放，整理': '擺放，整理',
      '亭舍，亭子': '亭捨，亭子',
      '厅，室': '廳，室',
      '衣柜，壁橱': '衣櫃，壁櫥',
      用家具布置: '用傢具佈置',
      '没用的，无用的': '沒用的，無用的',
      '建造，盖': '建造，蓋',
      水龙头: '水龍頭',
      '例句数字保留原书表述，未更新为现时统计。': '例句數字保留原書表述，未更新為現時統計。',
      '加热，给……供暖': '加熱，給……供暖',
      台阶: '台階',
      '隔墙，隔板': '隔牆，隔板',
      '方便的，实用的': '方便的，實用的',
      纸板: '紙板',
      绳子: '繩子',
      '顺序，秩序，整齐': '順序，秩序，整齊',
      灯: '燈',
      '东西，物品': '東西，物品',
      '磁化；磁化强度': '磁化；磁化強度',
      '饰面，砌面，覆盖层': '飾面，砌面，覆蓋層',
      '壁纸，墙布': '壁紙，牆布',
      家具: '傢具',
      '点燃，点着，打开（灯）': '點燃，點著，打開（燈）',
      家务: '家務',
      '酸（化学）': '酸（化學）',
      布置: '佈置',
      网: '網',
      '底层，地面层': '底層，地面層',
      门槛: '門檻',
      '钻，打孔': '鑽，打孔',
      '层，楼层': '層，樓層',
      车库: '車庫',
      '房间，卧室': '房間，臥室',
      '建筑，建造': '建築，建造',
      '板，片，盘': '板，片，盤',
      '安装，装配': '安裝，裝配',
      火灾: '火災',
      '小棍，小棒，梯级横档': '小棍，小棒，梯級橫檔',
      砖: '磚',
      '壁炉，烟囱': '壁爐，煙囪',
      窗帘: '窗簾',
      门: '門',
      '缝，缝纫': '縫，縫紉',
      银: '銀',
      线: '線',
      '滚筒，滚柱，擀面杖': '滾筒，滾柱，擀麵杖',
      钢: '鋼',
      细绳: '細繩',
      蜡: '蠟',
      楼梯平台: '樓梯平台',
      '百叶窗，窗板': '百葉窗，窗板',
      '原书译“方砖”；此词也可指窗玻璃，例句未限定具体所指。':
        '原書譯“方磚”；此詞也可指窗玻璃，例句未限定具體所指。',
      '大门，正门': '大門，正門',
      '地下室，地下层': '地下室，地下層',
      墙: '牆',
      '家庭，住户': '家庭，住戶',
      屋顶: '屋頂',
      冒烟: '冒煙',
      花园: '花園',
      '已建立的，已开业的': '已建立的，已開業的',
      '涂漆，涂抹': '塗漆，塗抹',
      '方砖；窗玻璃': '方磚；窗玻璃',
      '按例句“单位体积的磁矩”补充“磁化强度”义。': '按例句“單位體積的磁矩”補充“磁化強度”義。',
      装饰: '裝飾',
      钥匙: '鑰匙',
      '此处为“台阶”义；第一单元同形词为“走路、行程”义。':
        '此處為“台階”義；第一單元同形詞為“走路、行程”義。',
      纸: '紙',
      门铃: '門鈴',
      金属的: '金屬的',
      '参观，看房': '參觀，看房',
      '气，气体': '氣，氣體',
      '楼，楼房': '樓，樓房',
      被覆盖的: '被覆蓋的',
      '垃圾，废物': '垃圾，廢物',
      镜子: '鏡子',
      '根据例句补充“擀面杖”。': '根據例句補充“擀麵杖”。',
      '熄灭，关掉': '熄滅，關掉',
      房间: '房間',
      铜: '銅',
      '楼，建筑物': '樓，建築物',
      纤维: '纖維',
      '洒，使溅出，散布': '灑，使濺出，散布',
      电梯: '電梯',
      '使干，干燥': '使乾，乾燥',
      厨房: '廚房',
      邻居: '鄰居',
      '外地的，外省的；土里土气的（贬义）': '外地的，外省的；土裡土氣的（貶義）',
    },
    simplifiedExact: {
      '《聖經》中的“約”': '《圣经》中的“约”',
      '一點一滴，積累語感': '一点一滴，积累语感',
      '一餐；飯': '一餐；饭',
      上一個: '上一个',
      上一頁: '上一页',
      下一個: '下一个',
      下一頁: '下一页',
      下載的進度備份: '下载的进度备份',
      下載進度備份: '下载进度备份',
      '與 diocèse（主教教區）區分。': '与 diocèse（主教教区）区分。',
      '醜的，難看的': '丑的，难看的',
      '業餘活動、興趣和愛好': '业余活动、兴趣和爱好',
      東方的: '东方的',
      '嚴厲的，嚴格的': '严厉的，严格的',
      嚴格: '严格',
      嚴格的: '严格的',
      個主題: '个主题',
      個人數據: '个人数据',
      個人的: '个人的',
      個性: '个性',
      個詞: '个词',
      個詞已經看完了: '个词已经看完了',
      '個詞條。第一單元“履歷、個人信息”已按《法語基礎詞彙分類學習手冊》書頁 1–15 整理為 321 個詞條，保留基礎／進階分組與法語例句。其餘主題仍為 148 個原創示例詞條':
        '个词条。第一单元“履历、个人信息”已按《法语基础词汇分类学习手册》书页 1–15 整理为 321 个词条，保留基础／进阶分组与法语例句。其余主题仍为 148 个原创示例词条',
      個詞彙: '个词汇',
      '個詞彙已掌握，繼續積累吧': '个词汇已掌握，继续积累吧',
      '個詞的進度；同詞採用備份中的標記': '个词的进度；同词采用备份中的标记',
      '個，共': '个，共',
      中國人: '中国人',
      中文釋義: '中文释义',
      主教會議: '主教会议',
      '主教管區，教區': '主教管区，教区',
      主題導航: '主题导航',
      '舉止，管教': '举止，管教',
      '舉止，行為，外表': '举止，行为，外表',
      烏冬面: '乌冬面',
      '乖的，聽話的': '乖的，听话的',
      '鄉村；農村': '乡村；农村',
      書頁: '书页',
      亂序: '乱序',
      '交通；車流': '交通；车流',
      '親切的，客氣的': '亲切的，客气的',
      人類: '人类',
      '人，個體': '人，个体',
      '令人贊賞的，令人欽佩的': '令人赞赏的，令人钦佩的',
      '以使用詞彙篩選、卡片和進度記錄': '以使用词汇筛选、卡片和进度记录',
      以內: '以内',
      價格: '价格',
      價格和貨幣往來: '价格和货币往来',
      '優美，優雅，魅力': '优美，优雅，魅力',
      '優雅的，漂亮的': '优雅的，漂亮的',
      會議: '会议',
      '使……感興趣': '使……感兴趣',
      '使散步，帶……散步': '使散步，带……散步',
      使睡覺: '使睡觉',
      '側臉，形象，氣質': '侧脸，形象，气质',
      俄國的: '俄国的',
      '保留原書例句中的群體概括，僅作語言材料。': '保留原书例句中的群体概括，仅作语言材料。',
      '保留原書例句；其中對人群的概括屬於原書表述。':
        '保留原书例句；其中对人群的概括属于原书表述。',
      '信徒，門徒': '信徒，门徒',
      兒子: '儿子',
      '先回想，再看釋義': '先回想，再看释义',
      '先想一想，這個詞是什麼意思': '先想一想，这个词是什么意思',
      全部子類: '全部子类',
      全部詞彙: '全部词汇',
      公共和社會服務: '公共和社会服务',
      公共和私人服務業: '公共和私人服务业',
      公共服務: '公共服务',
      公共汽車: '公共汽车',
      關於學習進度: '关于学习进度',
      關於熟悉程度: '关于熟悉程度',
      關於詞庫與讀音: '关于词库与读音',
      關於讀音: '关于读音',
      關閉分類目錄: '关闭分类目录',
      關閉說明: '关闭说明',
      興趣: '兴趣',
      '其他標籤頁的進度無法讀取，請重新打開頁面': '其他标签页的进度无法读取，请重新打开页面',
      再學一遍: '再学一遍',
      再點一次取消標記: '再点一次取消标记',
      凶惡的: '凶恶的',
      '出售；賣': '出售；卖',
      '出生於，源於': '出生于，源于',
      '出身，來源': '出身，来源',
      '分數；成績': '分数；成绩',
      分鐘: '分钟',
      切換到亂序學習: '切换到乱序学习',
      切換到正序學習: '切换到正序学习',
      切換詞彙: '切换词汇',
      '列表中的綠點表示已掌握，橙點表示有印象，紅點表示不熟悉。點擊圓點即可標記，再次點擊已選圓點可恢復為未學習':
        '列表中的绿点表示已掌握，橙点表示有印象，红点表示不熟悉。点击圆点即可标记，再次点击已选圆点可恢复为未学习',
      '創造力，想象力': '创造力，想象力',
      '辦公室；書桌': '办公室；书桌',
      勇氣: '勇气',
      醫學和醫學護理: '医学和医学护理',
      醫生: '医生',
      單詞: '单词',
      '單詞和例句均內置法語音頻，點擊揚聲器可直接播放，再次點擊可停止。音頻由法語':
        '单词和例句均内置法语音频，点击扬声器可直接播放，再次点击可停止。音频由法语',
      盧森堡: '卢森堡',
      '盧森堡的；盧森堡人': '卢森堡的；卢森堡人',
      '臥室；房間': '卧室；房间',
      '原書中文誤作“美國人”，已改為“英格蘭人”。': '原书中文误作“美国人”，已改为“英格兰人”。',
      '原書例句照錄，是簡化表述，基督教也包括東正教等傳統。':
        '原书例句照录，是简化表述，基督教也包括东正教等传统。',
      '原書合譯“上帝”；普通名詞 dieu / déesse 為神 / 女神，專名 Dieu 為上帝。':
        '原书合译“上帝”；普通名词 dieu / déesse 为神 / 女神，专名 Dieu 为上帝。',
      '原書第 1–15 頁': '原书第 1–15 页',
      '原書譯“《舊約全書》”；Ancien Testament 為舊約，Nouveau Testament 為新約。':
        '原书译“《旧约全书》”；Ancien Testament 为旧约，Nouveau Testament 为新约。',
      '原書譯“年長的”；此處帶冠詞，按名詞處理。': '原书译“年长的”；此处带冠词，按名词处理。',
      '原書譯“懺悔的”，與此例句不符，已改為“宗教的，教派的”。':
        '原书译“忏悔的”，与此例句不符，已改为“宗教的，教派的”。',
      '原書譯“水族館”，例句對應“水族箱”，已補充。': '原书译“水族馆”，例句对应“水族箱”，已补充。',
      '原書譯“牧師”，按天主教語境改為“神父，司鐸”。':
        '原书译“牧师”，按天主教语境改为“神父，司铎”。',
      '原書譯“神甫，主教”，已按新教語境改為“牧師”。':
        '原书译“神甫，主教”，已按新教语境改为“牧师”。',
      '原書釋義與例句照錄；indigène 指原住民時可能帶殖民時代色彩。':
        '原书释义与例句照录；indigène 指原住民时可能带殖民时代色彩。',
      原創示例詞庫: '原创示例词库',
      反復: '反复',
      '反抗，反對；作出反應': '反抗，反对；作出反应',
      發絲: '发丝',
      髮型: '发型',
      發根: '发根',
      '發燒；發熱': '发烧；发热',
      發辮: '发辫',
      敘利亞的: '叙利亚的',
      '可怕的，非常難看的': '可怕的，非常难看的',
      台灣: '台湾',
      台燈: '台灯',
      颱風: '台风',
      後台: '后台',
      聽見: '听见',
      '吵鬧的；嘈雜的': '吵闹的；嘈杂的',
      吸塵器: '吸尘器',
      '和藹的，熱情的': '和蔼的，热情的',
      '喜悅；快樂': '喜悦；快乐',
      回復: '回复',
      '固定的，不可改變的': '固定的，不可改变的',
      '國家的，民族的': '国家的，民族的',
      國籍和民族: '国籍和民族',
      圖書館: '图书馆',
      聖經: '圣经',
      聖經的: '圣经的',
      地獄: '地狱',
      '坦白的，誠實的': '坦白的，诚实的',
      城市和鄉村: '城市和乡村',
      基礎: '基础',
      堂區: '堂区',
      '堵車；交通擁堵': '堵车；交通拥堵',
      '聲線合成；單文件版已包含所有音頻，可離線播放。設備語音與':
        '声线合成；单文件版已包含所有音频，可离线播放。设备语音与',
      處方: '处方',
      復習: '复习',
      '復習；修訂': '复习；修订',
      復印: '复印',
      復原: '复原',
      複雜: '复杂',
      復活: '复活',
      '外國的，陌生的': '外国的，陌生的',
      '外形，輪廓': '外形，轮廓',
      '外觀，樣子；方面': '外观，样子；方面',
      大學: '大学',
      大學學習: '大学学习',
      '大的，寬的': '大的，宽的',
      '大膽的，勇敢的': '大胆的，勇敢的',
      '大膽，勇氣': '大胆，勇气',
      '太陽；陽光': '太阳；阳光',
      頭: '头',
      頭髮: '头发',
      奇跡: '奇迹',
      奧地利: '奥地利',
      奧地利的: '奥地利的',
      女兒: '女儿',
      '奶奶，外婆（兒語）': '奶奶，外婆（儿语）',
      '媽媽（兒語）': '妈妈（儿语）',
      '姨媽，姑姑，嬸嬸等': '姨妈，姑姑，婶婶等',
      '娛樂，閒暇活動': '娱乐，闲暇活动',
      嬰兒: '婴儿',
      '孫女，外孫女': '孙女，外孙女',
      '孫子，外孫子': '孙子，外孙子',
      '孫輩，外孫輩': '孙辈，外孙辈',
      學習培訓: '学习培训',
      學習空間: '学习空间',
      學習進度: '学习进度',
      學校: '学校',
      '學生；中小學生': '学生；中小学生',
      '孩子（俗語）': '孩子（俗语）',
      安靜的: '安静的',
      完成這組: '完成这组',
      宗教儀式: '宗教仪式',
      '審慎，謹慎；智慧': '审慎，谨慎；智慧',
      客廳: '客厅',
      客觀的: '客观的',
      '害怕；恐懼': '害怕；恐惧',
      家庭作業: '家庭作业',
      '對……感興趣': '对……感兴趣',
      導入進度備份: '导入进度备份',
      '小伙子，男人（俗語）': '小伙子，男人（俗语）',
      '小偷；盜賊': '小偷；盗贼',
      '小心的，謹慎的': '小心的，谨慎的',
      '小心，謹慎': '小心，谨慎',
      居留許可: '居留许可',
      '履歷、個人信息': '履历、个人信息',
      '山；山區': '山；山区',
      '崇拜，禮拜，祭祀': '崇拜，礼拜，祭祀',
      工作內容和活動: '工作内容和活动',
      工作場所和工作條件: '工作场所和工作条件',
      '工作時間；時間表': '工作时间；时间表',
      工作領域: '工作领域',
      '工作，職業': '工作，职业',
      '工地；施工現場': '工地；施工现场',
      工程師: '工程师',
      '已婚的，結婚的': '已婚的，结婚的',
      已導入: '已导入',
      已打亂詞彙順序: '已打乱词汇顺序',
      已按目錄順序排列: '已按目录顺序排列',
      已更新其他標籤頁的學習進度: '已更新其他标签页的学习进度',
      已標記為: '已标记为',
      已重新打亂順序: '已重新打乱顺序',
      '市政府；市政廳': '市政府；市政厅',
      希臘的: '希腊的',
      乾淨: '干净',
      干擾: '干扰',
      乾杯: '干杯',
      乾果: '干果',
      乾洗: '干洗',
      乾燥: '干燥',
      乾糧: '干粮',
      幹線: '干线',
      乾貨: '干货',
      幹部: '干部',
      乾酪: '干酪',
      '乾零活，零星修補': '干零活，零星修补',
      干預: '干预',
      年輕人: '年轻人',
      年輕的: '年轻的',
      '年長者，長子，長女': '年长者，长子，长女',
      年齡: '年龄',
      '年齡為……的': '年龄为……的',
      莊重的: '庄重的',
      '廟宇，教堂': '庙宇，教堂',
      '開學；返校': '开学；返校',
      彌撒: '弥撒',
      '強壯的，力氣大的': '强壮的，力气大的',
      當前瀏覽位置: '当前浏览位置',
      '當前讀音無法播放，請使用': '当前读音无法播放，请使用',
      德國: '德国',
      德國的: '德国的',
      德語: '德语',
      心理感覺: '心理感觉',
      '心臟；心': '心脏；心',
      '快樂的，愉快的': '快乐的，愉快的',
      忽視: '忽视',
      懷疑: '怀疑',
      態度: '态度',
      性格和脾氣: '性格和脾气',
      '性，性別': '性，性别',
      '悲傷；難過': '悲伤；难过',
      感官感覺和感知表述: '感官感觉和感知表述',
      感覺: '感觉',
      感覺和運動: '感觉和运动',
      感覺特徵: '感觉特征',
      '感覺，同情心，敏感性': '感觉，同情心，敏感性',
      '憤怒；生氣': '愤怒；生气',
      懶的: '懒的',
      我的法語詞庫: '我的法语词库',
      我的詞庫: '我的词库',
      房間和佈置陳設: '房间和布置陈设',
      手機詞彙分類: '手机词汇分类',
      打印機: '打印机',
      打開分類目錄: '打开分类目录',
      打掃衛生: '打扫卫生',
      打獵: '打猎',
      '把例句讀出聲，讓詞彙留在語境里': '把例句读出声，让词汇留在语境里',
      '把法語，變成日常': '把法语，变成日常',
      護髮: '护发',
      護照: '护照',
      '報案；提出控告': '报案；提出控告',
      拉麵: '拉面',
      '拾，撿': '拾，捡',
      掛面: '挂面',
      '按主題學習法語詞彙。卡片與列表、例句、讀音，讓每一個詞慢慢熟悉':
        '按主题学习法语词汇。卡片与列表、例句、读音，让每一个词慢慢熟悉',
      '按你提供的目錄，整理了 11 個主題、44 個子類。當前共':
        '按你提供的目录，整理了 11 个主题、44 个子类。当前共',
      按熟悉程度篩選: '按熟悉程度筛选',
      提問: '提问',
      '搜索法語、中文或例句': '搜索法语、中文或例句',
      搜索法語或中文: '搜索法语或中文',
      攝像頭: '摄像头',
      '播放例句；再次點擊停止': '播放例句；再次点击停止',
      播放未獲允許: '播放未获允许',
      '播放法語讀音；再次點擊停止': '播放法语读音；再次点击停止',
      收養: '收养',
      收據: '收据',
      '收集，蒐集': '收集，搜集',
      政府機關和管理: '政府机关和管理',
      '教士，神職人員': '教士，神职人员',
      教師: '教师',
      '教師；教授': '教师；教授',
      '教理講授，教理課程': '教理讲授，教理课程',
      數據庫: '数据库',
      '文憑；畢業證書': '文凭；毕业证书',
      '新教的，耶穌教的': '新教的，耶稣教的',
      旅遊業: '旅游业',
      旅遊和交通: '旅游和交通',
      '旅館；酒店': '旅馆；酒店',
      '無法導入。請選擇': '无法导入。请选择',
      '無耐心的，性急的；迫不及待的': '无耐心的，性急的；迫不及待的',
      日語: '日语',
      時鐘: '时钟',
      '明顯的，顯眼的': '明显的，显眼的',
      顯示: '显示',
      '顯示 / 隱藏釋義': '显示 / 隐藏释义',
      顯示方式: '显示方式',
      顯示釋義與例句: '显示释义与例句',
      '有天分的，有天賦的': '有天分的，有天赋的',
      服裝和飾品: '服装和饰品',
      朗讀: '朗读',
      朗讀例句: '朗读例句',
      '朗讀未能開始，請使用': '朗读未能开始，请使用',
      '期限；時限': '期限；时限',
      '木材；木頭': '木材；木头',
      未學習: '未学习',
      '本地人，當地人': '本地人，当地人',
      '機靈的，聰明的，狡猾的': '机灵的，聪明的，狡猾的',
      村莊: '村庄',
      '槍，步槍': '枪，步枪',
      染髮: '染发',
      '柔軟的；柔和的': '柔软的；柔和的',
      櫃台: '柜台',
      查看詞庫說明: '查看词库说明',
      標記熟悉程度: '标记熟悉程度',
      樹: '树',
      樹幹: '树干',
      '棕色的，棕發的': '棕色的，棕发的',
      植物和動物: '植物和动物',
      歐洲: '欧洲',
      歐洲的: '欧洲的',
      正在朗讀: '正在朗读',
      '正直的，善良的，誠實的': '正直的，善良的，诚实的',
      '步態，步伐': '步态，步伐',
      母親: '母亲',
      '母親的，母性的': '母亲的，母性的',
      '每次一個詞，每天進一步': '每次一个词，每天进一步',
      比利時: '比利时',
      比利時的: '比利时的',
      氣候和天氣: '气候和天气',
      '水族箱；水族館': '水族箱；水族馆',
      漢字: '汉字',
      沒有可用的法語語音: '没有可用的法语语音',
      沒有找到匹配的詞彙: '没有找到匹配的词汇',
      法國: '法国',
      法國的: '法国的',
      法語: '法语',
      '法語 / 讀音': '法语 / 读音',
      法語例句: '法语例句',
      法語基礎詞彙分類學習手冊: '法语基础词汇分类学习手册',
      法語詞彙: '法语词汇',
      法語詞彙列表: '法语词汇列表',
      法語詞彙首頁: '法语词汇首页',
      波蘭的: '波兰的',
      洗發: '洗发',
      活動: '活动',
      '瀏覽器無法保存進度，請在詞庫說明中下載備份': '浏览器无法保存进度，请在词库说明中下载备份',
      '海灘；沙灘': '海滩；沙滩',
      '消遣，娛樂': '消遣，娱乐',
      清除篩選: '清除筛选',
      '溫度；氣溫': '温度；气温',
      遊戲: '游戏',
      '激情，愛好': '激情，爱好',
      火車: '火车',
      點選圓點標記: '点选圆点标记',
      '點餐；訂購': '点餐；订购',
      '熱情的，討人喜歡的': '热情的，讨人喜欢的',
      '照看，照顧': '照看，照顾',
      熟悉程度圖例: '熟悉程度图例',
      '熟悉程度自動保存在當前瀏覽器，不會跨設備同步。清除瀏覽器數據會清除進度。可下載備份，在其他設備導入':
        '熟悉程度自动保存在当前浏览器，不会跨设备同步。清除浏览器数据会清除进度。可下载备份，在其他设备导入',
      愛好者: '爱好者',
      父親: '父亲',
      '爺爺，外公（兒語）': '爷爷，外公（儿语）',
      '爸爸（兒語）': '爸爸（儿语）',
      '牧師（新教）': '牧师（新教）',
      猶太人: '犹太人',
      獵人: '猎人',
      環境: '环境',
      理髮: '理发',
      '生日，週年紀念日': '生日，周年纪念日',
      '用於，奉獻於': '用于，奉献于',
      男護士: '男护士',
      畫畫: '画画',
      '痊癒；治癒': '痊愈；治愈',
      '瘦長的，苗條的': '瘦长的，苗条的',
      白髮: '白发',
      的子類: '的子类',
      '的熟悉程度，當前': '的熟悉程度，当前',
      的讀音: '的读音',
      盜竊: '盗窃',
      看見: '看见',
      '真誠的，誠懇的': '真诚的，诚恳的',
      '石頭；石材': '石头；石材',
      '研究；尋找': '研究；寻找',
      社會救助: '社会救助',
      祈禱: '祈祷',
      '祈禱，禱告': '祈祷，祷告',
      神聖的: '神圣的',
      '神學，宗教學': '神学，宗教学',
      '神父，司鐸': '神父，司铎',
      '神甫，堂區神父': '神甫，堂区神父',
      '神話，傳奇': '神话，传奇',
      '票；車票': '票；车票',
      福音書: '福音书',
      離婚: '离婚',
      秒鐘: '秒钟',
      '積極的，活躍的': '积极的，活跃的',
      移出當前篩選: '移出当前筛选',
      '穿過；橫穿': '穿过；横穿',
      '筆記本；練習本': '笔记本；练习本',
      '第一單元 · 原書詞庫': '第一单元 · 原书词库',
      第一單元原書詞彙: '第一单元原书词汇',
      篩選詞庫: '筛选词库',
      簽名: '签名',
      簡體: '简体',
      '粗暴的，粗魯的；突然的': '粗暴的，粗鲁的；突然的',
      緊張的: '紧张的',
      繁體: '繁体',
      '紅棕色的，紅髮的': '红棕色的，红发的',
      紅燈: '红灯',
      紅衣主教: '红衣主教',
      '組織；安排': '组织；安排',
      給記憶一點時間: '给记忆一点时间',
      網絡: '网络',
      羅馬教皇: '罗马教皇',
      美國的: '美国的',
      '美貌，美麗': '美貌，美丽',
      '翻譯 · 備用': '翻译 · 备用',
      翻譯中查看: '翻译中查看',
      翻譯作為備用入口: '翻译作为备用入口',
      翻譯備用入口: '翻译备用入口',
      '老的，上年紀的': '老的，上年纪的',
      考試: '考试',
      職業名稱: '职业名称',
      聰明的: '聪明的',
      背詞區域: '背词区域',
      '能幹的，精明的': '能干的，精明的',
      '自發的，自願的': '自发的，自愿的',
      自行車: '自行车',
      蒼白的: '苍白的',
      英國的: '英国的',
      英格蘭人: '英格兰人',
      英語: '英语',
      蘋果: '苹果',
      '藥店；藥房': '药店；药房',
      '藥；藥品': '药；药品',
      荷蘭的: '荷兰的',
      '薪水；工資': '薪水；工资',
      行為: '行为',
      '街區；城區': '街区；城区',
      '衣櫃；櫃子': '衣柜；柜子',
      '補充與例句對應的“外觀，樣子”義。': '补充与例句对应的“外观，样子”义。',
      '表格；申請表': '表格；申请表',
      襯衫: '衬衫',
      '觸摸；碰': '触摸；碰',
      計算機: '计算机',
      '認真的，嚴肅的': '认真的，严肃的',
      '讓每一個陌生的詞，慢慢變得熟悉': '让每一个陌生的词，慢慢变得熟悉',
      '記得；想起': '记得；想起',
      講台: '讲台',
      '設備朗讀不可用，請使用': '设备朗读不可用，请使用',
      '設備沒有可用法語語音，請使用': '设备没有可用法语语音，请使用',
      設置: '设置',
      設計語言: '设计语言',
      詞: '词',
      詞庫未能加載: '词库未能加载',
      詞庫說明: '词库说明',
      詞彙: '词汇',
      詞彙分類: '词汇分类',
      詞彙卡片: '词汇卡片',
      詞彙大類: '词汇大类',
      '試試其他關鍵詞，或清除搜索和熟悉程度篩選': '试试其他关键词，或清除搜索和熟悉程度筛选',
      '誠實的，正直的': '诚实的，正直的',
      語言: '语言',
      請再點一次揚聲器播放讀音: '请再点一次扬声器播放读音',
      請刷新頁面後重試: '请刷新页面后重试',
      請啓用: '请启用',
      諸聖瞻禮節: '诸圣瞻礼节',
      讀音不可用: '读音不可用',
      讀音未能開始: '读音未能开始',
      課堂: '课堂',
      '課程；課': '课程；课',
      調查: '调查',
      賬單: '账单',
      '購買；買': '购买；买',
      購物: '购物',
      '賦予，授予': '赋予，授予',
      路線描述: '路线描述',
      跳到詞彙學習: '跳到词汇学习',
      身份檢查: '身份检查',
      身體: '身体',
      身體健康和衛生: '身体健康和卫生',
      身體健康和需求: '身体健康和需求',
      身體活動: '身体活动',
      軀乾: '躯干',
      '轉彎；轉動': '转弯；转动',
      '運動員，玩家': '运动员，玩家',
      運輸工具: '运输工具',
      '這個詞，你有多熟悉': '这个词，你有多熟悉',
      這組: '这组',
      這組的學習進度: '这组的学习进度',
      進度保存在本機: '进度保存在本机',
      進度備份已準備下載: '进度备份已准备下载',
      '進度暫存，建議下載備份': '进度暂存，建议下载备份',
      進階: '进阶',
      選擇分類: '选择分类',
      '逗樂，使高興': '逗乐，使高兴',
      '通過；成功': '通过；成功',
      邪惡: '邪恶',
      '郵局；郵政': '邮局；邮政',
      採用: '采用',
      釋義: '释义',
      重復: '重复',
      重新加載: '重新加载',
      重新打亂: '重新打乱',
      重新打亂順序: '重新打乱顺序',
      金屬: '金属',
      '金色的，金髮的': '金色的，金发的',
      釣魚: '钓鱼',
      鐘: '钟',
      鐘聲: '钟声',
      鐘樓: '钟楼',
      鐘點: '钟点',
      鐘錶: '钟表',
      長褲: '长裤',
      鬧鐘: '闹钟',
      '聞；感到': '闻；感到',
      陰性的: '阴性的',
      隱藏: '隐藏',
      隱藏釋義: '隐藏释义',
      '零錢；貨幣': '零钱；货币',
      '青年時代，青春': '青年时代，青春',
      麵包: '面包',
      麵包師: '面包师',
      面團: '面团',
      麵條: '面条',
      麵粉: '面粉',
      '項目；計劃': '项目；计划',
      項鍊: '项链',
      '顧客；客戶': '顾客；客户',
      預訂: '预订',
      風: '风',
      風景: '风景',
      '風景；景色': '风景；景色',
      飛機: '飞机',
      餐飲: '餐饮',
      '餓；感到飢餓': '饿；感到饥饿',
      馬戲團: '马戏团',
      '驕傲的，自豪的': '骄傲的，自豪的',
      '鰥夫，寡婦': '鳏夫，寡妇',
      鳥: '鸟',
      鼠標: '鼠标',
      '包括，由……組成': '包括，由……组成',
      '關，關閉': '关，关闭',
      '實用的，功能的': '实用的，功能的',
      濕的: '湿的',
      '裝飾，裝修': '装饰，装修',
      '根據例句補充“已開業的”。': '根据例句补充“已开业的”。',
      '雜亂，無序': '杂乱，无序',
      陽台: '阳台',
      '原書釋義“塑料”；詞條無冠詞，例句中用作形容詞。':
        '原书释义“塑料”；词条无冠词，例句中用作形容词。',
      鐵: '铁',
      打開: '打开',
      '供……居住，容納': '供……居住，容纳',
      '原書譯“一樓”；法語指與地面齊平的一層，其上一層才是 premier étage。':
        '原书译“一楼”；法语指与地面齐平的一层，其上一层才是 premier étage。',
      別墅: '别墅',
      '煮沸，燒開': '煮沸，烧开',
      煙: '烟',
      '舒服，舒適': '舒服，舒适',
      '木材，木頭': '木材，木头',
      '法語樓層編號從地面層之上的 premier étage 起算。':
        '法语楼层编号从地面层之上的 premier étage 起算。',
      設備: '设备',
      乾淨的: '干净的',
      樓梯: '楼梯',
      '原書例句誤寫“est en sculptée en grès”，已刪除多餘的第一個 en；原書“粗陶土”義整理為“炻器（粗陶）”。':
        '原书例句误写“est en sculptée en grès”，已删除多余的第一个 en；原书“粗陶土”义整理为“炻器（粗陶）”。',
      '原書中文誤作“啓開”，此處應為“堵住、塞住”。': '原书中文误作“启开”，此处应为“堵住、塞住”。',
      髒的: '脏的',
      '建築物的正面，立面': '建筑物的正面，立面',
      宮殿: '宫殿',
      蠟燭: '蜡烛',
      床單: '床单',
      '材料，建築材料': '材料，建筑材料',
      '鋪開，攤開，晾曬': '铺开，摊开，晾晒',
      '裝備，配備': '装备，配备',
      '污點，污漬': '污点，污渍',
      '架子，書架的隔板': '架子，书架的隔板',
      '原書另列於相鄰行的 appartement 例句已歸入本詞條。':
        '原书另列于相邻行的 appartement 例句已归入本词条。',
      '家庭的，家務的': '家庭的，家务的',
      弄髒: '弄脏',
      '根據 verres en cristal 補充“水晶玻璃”。': '根据 verres en cristal 补充“水晶玻璃”。',
      '重新覆蓋，覆蓋': '重新覆盖，覆盖',
      '固定，固定裝置': '固定，固定装置',
      長凳: '长凳',
      使砰然作響: '使砰然作响',
      '燭芯，燈芯': '烛芯，灯芯',
      '浴室，洗澡間': '浴室，洗澡间',
      '灰塵，塵土': '灰尘，尘土',
      樹脂: '树脂',
      '使隔熱，隔離': '使隔热，隔离',
      物質: '物质',
      '打掃，清潔': '打扫，清洁',
      '擺放，整理': '摆放，整理',
      '亭捨，亭子': '亭舍，亭子',
      '廳，室': '厅，室',
      '衣櫃，壁櫥': '衣柜，壁橱',
      用傢具佈置: '用家具布置',
      '沒用的，無用的': '没用的，无用的',
      '建造，蓋': '建造，盖',
      水龍頭: '水龙头',
      '例句數字保留原書表述，未更新為現時統計。': '例句数字保留原书表述，未更新为现时统计。',
      '加熱，給……供暖': '加热，给……供暖',
      台階: '台阶',
      '隔牆，隔板': '隔墙，隔板',
      '方便的，實用的': '方便的，实用的',
      紙板: '纸板',
      繩子: '绳子',
      '順序，秩序，整齊': '顺序，秩序，整齐',
      燈: '灯',
      '東西，物品': '东西，物品',
      '磁化；磁化強度': '磁化；磁化强度',
      '飾面，砌面，覆蓋層': '饰面，砌面，覆盖层',
      '壁紙，牆布': '壁纸，墙布',
      傢具: '家具',
      '點燃，點著，打開（燈）': '点燃，点着，打开（灯）',
      家務: '家务',
      '酸（化學）': '酸（化学）',
      佈置: '布置',
      網: '网',
      '底層，地面層': '底层，地面层',
      門檻: '门槛',
      '鑽，打孔': '钻，打孔',
      '層，樓層': '层，楼层',
      車庫: '车库',
      '房間，臥室': '房间，卧室',
      '建築，建造': '建筑，建造',
      '板，片，盤': '板，片，盘',
      '安裝，裝配': '安装，装配',
      火災: '火灾',
      '小棍，小棒，梯級橫檔': '小棍，小棒，梯级横档',
      磚: '砖',
      '壁爐，煙囪': '壁炉，烟囱',
      窗簾: '窗帘',
      門: '门',
      '縫，縫紉': '缝，缝纫',
      銀: '银',
      線: '线',
      '滾筒，滾柱，擀麵杖': '滚筒，滚柱，擀面杖',
      鋼: '钢',
      細繩: '细绳',
      蠟: '蜡',
      樓梯平台: '楼梯平台',
      '百葉窗，窗板': '百叶窗，窗板',
      '原書譯“方磚”；此詞也可指窗玻璃，例句未限定具體所指。':
        '原书译“方砖”；此词也可指窗玻璃，例句未限定具体所指。',
      '大門，正門': '大门，正门',
      '地下室，地下層': '地下室，地下层',
      牆: '墙',
      '家庭，住戶': '家庭，住户',
      屋頂: '屋顶',
      冒煙: '冒烟',
      花園: '花园',
      '已建立的，已開業的': '已建立的，已开业的',
      '塗漆，塗抹': '涂漆，涂抹',
      '方磚；窗玻璃': '方砖；窗玻璃',
      '按例句“單位體積的磁矩”補充“磁化強度”義。': '按例句“单位体积的磁矩”补充“磁化强度”义。',
      裝飾: '装饰',
      鑰匙: '钥匙',
      '此處為“台階”義；第一單元同形詞為“走路、行程”義。':
        '此处为“台阶”义；第一单元同形词为“走路、行程”义。',
      紙: '纸',
      門鈴: '门铃',
      金屬的: '金属的',
      '參觀，看房': '参观，看房',
      '氣，氣體': '气，气体',
      '樓，樓房': '楼，楼房',
      被覆蓋的: '被覆盖的',
      '垃圾，廢物': '垃圾，废物',
      鏡子: '镜子',
      '根據例句補充“擀麵杖”。': '根据例句补充“擀面杖”。',
      '熄滅，關掉': '熄灭，关掉',
      房間: '房间',
      銅: '铜',
      '樓，建築物': '楼，建筑物',
      纖維: '纤维',
      '灑，使濺出，散布': '洒，使溅出，散布',
      電梯: '电梯',
      '使乾，乾燥': '使干，干燥',
      廚房: '厨房',
      鄰居: '邻居',
    },
    traditionalPhrases: {
      头发: '頭髮',
      发型: '髮型',
      理发: '理髮',
      发丝: '發絲',
      发辫: '發辮',
      发根: '發根',
      白发: '白髮',
      染发: '染髮',
      护发: '護髮',
      洗发: '洗發',
      干净: '乾淨',
      干燥: '乾燥',
      干杯: '乾杯',
      干果: '乾果',
      干货: '乾貨',
      干洗: '乾洗',
      干酪: '乾酪',
      干粮: '乾糧',
      干预: '干預',
      干扰: '干擾',
      干线: '幹線',
      干部: '幹部',
      树干: '樹幹',
      躯干: '軀乾',
      面条: '麵條',
      面粉: '麵粉',
      乌冬面: '烏冬面',
      拉面: '拉麵',
      面包: '麵包',
      面团: '面團',
      挂面: '掛面',
      钟表: '鐘錶',
      时钟: '時鐘',
      钟点: '鐘點',
      闹钟: '鬧鐘',
      分钟: '分鐘',
      秒钟: '秒鐘',
      钟声: '鐘聲',
      钟楼: '鐘樓',
      感觉: '感覺',
      复习: '復習',
      重复: '重復',
      回复: '回復',
      反复: '反復',
      复原: '復原',
      复印: '復印',
      复杂: '複雜',
      复活: '復活',
      台湾: '台灣',
      台风: '颱風',
      台灯: '台燈',
      柜台: '櫃台',
      讲台: '講台',
      后台: '後台',
      计算机: '計算機',
      鼠标: '鼠標',
      数据库: '數據庫',
      打印机: '打印機',
      网络: '網絡',
      摄像头: '攝像頭',
      设置: '設置',
      语言: '語言',
      释义: '釋義',
      简体: '簡體',
      繁体: '繁體',
      单词: '單詞',
      词汇: '詞彙',
      隐藏: '隱藏',
      显示: '顯示',
      汉字: '漢字',
      日语: '日語',
      德语: '德語',
      法语: '法語',
      英语: '英語',
      土里土氣: '土裡土氣',
      土里土气: '土裡土氣',
    },
    simplifiedPhrases: {
      頭髮: '头发',
      髮型: '发型',
      理髮: '理发',
      發絲: '发丝',
      發辮: '发辫',
      發根: '发根',
      白髮: '白发',
      染髮: '染发',
      護髮: '护发',
      洗發: '洗发',
      乾淨: '干净',
      乾燥: '干燥',
      乾杯: '干杯',
      乾果: '干果',
      乾貨: '干货',
      乾洗: '干洗',
      乾酪: '干酪',
      乾糧: '干粮',
      干預: '干预',
      干擾: '干扰',
      幹線: '干线',
      幹部: '干部',
      樹幹: '树干',
      軀乾: '躯干',
      麵條: '面条',
      麵粉: '面粉',
      烏冬面: '乌冬面',
      拉麵: '拉面',
      麵包: '面包',
      面團: '面团',
      掛面: '挂面',
      鐘錶: '钟表',
      時鐘: '时钟',
      鐘點: '钟点',
      鬧鐘: '闹钟',
      分鐘: '分钟',
      秒鐘: '秒钟',
      鐘聲: '钟声',
      鐘樓: '钟楼',
      感覺: '感觉',
      復習: '复习',
      重復: '重复',
      回復: '回复',
      反復: '反复',
      復原: '复原',
      復印: '复印',
      複雜: '复杂',
      復活: '复活',
      台灣: '台湾',
      颱風: '台风',
      台燈: '台灯',
      櫃台: '柜台',
      講台: '讲台',
      後台: '后台',
      計算機: '计算机',
      鼠標: '鼠标',
      數據庫: '数据库',
      打印機: '打印机',
      網絡: '网络',
      攝像頭: '摄像头',
      設置: '设置',
      語言: '语言',
      釋義: '释义',
      簡體: '简体',
      繁體: '繁体',
      單詞: '单词',
      詞彙: '词汇',
      隱藏: '隐藏',
      顯示: '显示',
      漢字: '汉字',
      日語: '日语',
      德語: '德语',
      法語: '法语',
      英語: '英语',
    },
    traditionalCharacters: {
      㑇: '㑳',
      㑩: '儸',
      㓥: '劏',
      㔉: '劚',
      㖊: '噚',
      㖞: '喎',
      㘎: '㘚',
      㟆: '㠏',
      㤘: '㥮',
      㧐: '㩳',
      㧑: '撝',
      㧟: '擓',
      㨫: '㩜',
      㭎: '棡',
      㱩: '殰',
      㱮: '殨',
      㲿: '瀇',
      㶉: '鸂',
      㶶: '燶',
      㶽: '煱',
      㺍: '獱',
      䁖: '瞜',
      䃅: '磾',
      䅉: '稏',
      䅟: '穇',
      䇲: '筴',
      䌶: '䊷',
      䌷: '紬',
      䌸: '縳',
      䌹: '絅',
      䌺: '䋙',
      䌼: '綐',
      䌽: '綵',
      䌾: '䋻',
      䍀: '繿',
      䍁: '繸',
      䏝: '膞',
      䓕: '薳',
      䓖: '藭',
      䓨: '罃',
      䗖: '螮',
      䙓: '襬',
      䜣: '訢',
      䜧: '譅',
      䜩: '讌',
      䝙: '貙',
      䞍: '䝼',
      䞐: '賰',
      䥽: '鏺',
      䦃: '鐯',
      䩄: '靦',
      䯄: '騧',
      䯅: '䯀',
      䲝: '䱽',
      䲟: '鮣',
      䲠: '鰆',
      䲢: '鰧',
      䴓: '鳾',
      䴔: '鵁',
      䴕: '鴷',
      䴖: '鶄',
      䴗: '鶪',
      䴘: '鷈',
      䴙: '鷿',
      䶮: '龑',
      万: '萬',
      与: '與',
      丑: '醜',
      专: '專',
      业: '業',
      丛: '叢',
      东: '東',
      丝: '絲',
      丢: '丟',
      两: '兩',
      严: '嚴',
      丧: '喪',
      个: '個',
      丰: '豐',
      临: '臨',
      为: '為',
      丽: '麗',
      举: '舉',
      么: '麼',
      义: '義',
      乌: '烏',
      乐: '樂',
      乔: '喬',
      习: '習',
      乡: '鄉',
      书: '書',
      买: '買',
      乱: '亂',
      争: '爭',
      于: '於',
      亏: '虧',
      云: '雲',
      亘: '亙',
      亚: '亞',
      产: '產',
      亩: '畝',
      亲: '親',
      亵: '褻',
      亸: '嚲',
      亿: '億',
      仅: '僅',
      仆: '僕',
      从: '從',
      仑: '侖',
      仓: '倉',
      仪: '儀',
      们: '們',
      价: '價',
      众: '眾',
      优: '優',
      会: '會',
      伛: '傴',
      伞: '傘',
      伟: '偉',
      传: '傳',
      伣: '俔',
      伤: '傷',
      伥: '倀',
      伦: '倫',
      伧: '傖',
      伪: '偽',
      伫: '佇',
      体: '體',
      佣: '傭',
      佥: '僉',
      侠: '俠',
      侣: '侶',
      侥: '僥',
      侦: '偵',
      侧: '側',
      侨: '僑',
      侩: '儈',
      侪: '儕',
      侬: '儂',
      俣: '俁',
      俦: '儔',
      俨: '儼',
      俩: '倆',
      俪: '儷',
      俫: '倈',
      俭: '儉',
      债: '債',
      倾: '傾',
      偬: '傯',
      偻: '僂',
      偾: '僨',
      偿: '償',
      傥: '儻',
      傧: '儐',
      储: '儲',
      傩: '儺',
      儿: '兒',
      兑: '兌',
      兖: '兗',
      党: '黨',
      兰: '蘭',
      关: '關',
      兴: '興',
      兹: '茲',
      养: '養',
      兽: '獸',
      冁: '囅',
      内: '內',
      冈: '岡',
      册: '冊',
      写: '寫',
      军: '軍',
      农: '農',
      冯: '馮',
      冲: '衝',
      决: '決',
      况: '況',
      冻: '凍',
      净: '淨',
      凄: '淒',
      凉: '涼',
      减: '減',
      凑: '湊',
      凛: '凜',
      几: '幾',
      凤: '鳳',
      凫: '鳧',
      凭: '憑',
      凯: '凱',
      击: '擊',
      凿: '鑿',
      刍: '芻',
      刘: '劉',
      则: '則',
      刚: '剛',
      创: '創',
      删: '刪',
      别: '別',
      刬: '剗',
      刭: '剄',
      刹: '剎',
      刽: '劊',
      刿: '劌',
      剀: '剴',
      剂: '劑',
      剐: '剮',
      剑: '劍',
      剥: '剝',
      剧: '劇',
      劝: '勸',
      办: '辦',
      务: '務',
      劢: '勱',
      动: '動',
      励: '勵',
      劲: '勁',
      劳: '勞',
      势: '勢',
      勋: '勳',
      勚: '勩',
      匀: '勻',
      匦: '匭',
      匮: '匱',
      区: '區',
      医: '醫',
      华: '華',
      协: '協',
      单: '單',
      卖: '賣',
      占: '佔',
      卢: '盧',
      卤: '鹵',
      卧: '臥',
      卫: '衛',
      却: '卻',
      厂: '廠',
      厅: '廳',
      历: '歷',
      厉: '厲',
      压: '壓',
      厌: '厭',
      厍: '厙',
      厐: '龎',
      厕: '廁',
      厘: '釐',
      厢: '廂',
      厣: '厴',
      厦: '廈',
      厨: '廚',
      厩: '廄',
      厮: '廝',
      县: '縣',
      叁: '叄',
      参: '參',
      叆: '靉',
      叇: '靆',
      双: '雙',
      发: '發',
      变: '變',
      叙: '敘',
      叠: '疊',
      叶: '葉',
      号: '號',
      叹: '嘆',
      叽: '嘰',
      后: '後',
      吓: '嚇',
      吕: '呂',
      吗: '嗎',
      吣: '唚',
      吨: '噸',
      听: '聽',
      启: '啓',
      吴: '吳',
      呐: '吶',
      呒: '嘸',
      呓: '囈',
      呕: '嘔',
      呖: '嚦',
      呗: '唄',
      员: '員',
      呙: '咼',
      呛: '嗆',
      呜: '嗚',
      咏: '詠',
      咙: '嚨',
      咛: '嚀',
      咝: '噝',
      咤: '吒',
      响: '響',
      哑: '啞',
      哒: '噠',
      哓: '嘵',
      哔: '嗶',
      哕: '噦',
      哗: '嘩',
      哙: '噲',
      哜: '嚌',
      哝: '噥',
      哟: '喲',
      唛: '嘜',
      唝: '嗊',
      唠: '嘮',
      唡: '啢',
      唢: '嗩',
      唤: '喚',
      啧: '嘖',
      啬: '嗇',
      啭: '囀',
      啮: '嚙',
      啰: '囉',
      啴: '嘽',
      啸: '嘯',
      喂: '餵',
      喷: '噴',
      喽: '嘍',
      喾: '嚳',
      嗫: '囁',
      嗳: '噯',
      嘘: '噓',
      嘤: '嚶',
      嘱: '囑',
      噜: '嚕',
      嚣: '囂',
      团: '團',
      园: '園',
      囱: '囪',
      围: '圍',
      囵: '圇',
      国: '國',
      图: '圖',
      圆: '圓',
      圣: '聖',
      圹: '壙',
      场: '場',
      坂: '阪',
      坏: '壞',
      块: '塊',
      坚: '堅',
      坛: '壇',
      坜: '壢',
      坝: '壩',
      坞: '塢',
      坟: '墳',
      坠: '墜',
      垄: '壟',
      垅: '壠',
      垆: '壚',
      垒: '壘',
      垦: '墾',
      垩: '堊',
      垫: '墊',
      垭: '埡',
      垯: '墶',
      垱: '壋',
      垲: '塏',
      垴: '堖',
      埘: '塒',
      埙: '塤',
      埚: '堝',
      埯: '垵',
      堑: '塹',
      堕: '墮',
      塆: '壪',
      墙: '牆',
      壮: '壯',
      声: '聲',
      壳: '殼',
      壶: '壺',
      壸: '壼',
      处: '處',
      备: '備',
      复: '復',
      够: '夠',
      头: '頭',
      夸: '誇',
      夹: '夾',
      夺: '奪',
      奁: '奩',
      奂: '奐',
      奋: '奮',
      奖: '獎',
      奥: '奧',
      妆: '妝',
      妇: '婦',
      妈: '媽',
      妩: '嫵',
      妪: '嫗',
      妫: '媯',
      姗: '姍',
      姹: '奼',
      娄: '婁',
      娅: '婭',
      娆: '嬈',
      娇: '嬌',
      娈: '孌',
      娱: '娛',
      娲: '媧',
      娴: '嫻',
      婳: '嫿',
      婴: '嬰',
      婵: '嬋',
      婶: '嬸',
      媪: '媼',
      媭: '嬃',
      嫒: '嬡',
      嫔: '嬪',
      嫱: '嬙',
      嬷: '嬤',
      孙: '孫',
      学: '學',
      孪: '孿',
      宁: '寧',
      宝: '寶',
      实: '實',
      宠: '寵',
      审: '審',
      宪: '憲',
      宫: '宮',
      宽: '寬',
      宾: '賓',
      寝: '寢',
      对: '對',
      寻: '尋',
      导: '導',
      寿: '壽',
      将: '將',
      尔: '爾',
      尘: '塵',
      尝: '嘗',
      尧: '堯',
      尴: '尷',
      尸: '屍',
      尽: '盡',
      层: '層',
      屃: '屓',
      屉: '屜',
      届: '屆',
      属: '屬',
      屡: '屢',
      屦: '屨',
      屿: '嶼',
      岁: '歲',
      岂: '豈',
      岖: '嶇',
      岗: '崗',
      岘: '峴',
      岙: '嶴',
      岚: '嵐',
      岛: '島',
      岭: '嶺',
      岽: '崬',
      岿: '巋',
      峃: '嶨',
      峄: '嶧',
      峡: '峽',
      峣: '嶢',
      峤: '嶠',
      峥: '崢',
      峦: '巒',
      崂: '嶗',
      崃: '崍',
      崄: '嶮',
      崭: '嶄',
      嵘: '嶸',
      嵚: '嶔',
      嵝: '嶁',
      巅: '巔',
      巩: '鞏',
      巯: '巰',
      币: '幣',
      帅: '帥',
      师: '師',
      帏: '幃',
      帐: '帳',
      帘: '簾',
      帜: '幟',
      带: '帶',
      帧: '幀',
      帮: '幫',
      帱: '幬',
      帻: '幘',
      帼: '幗',
      幂: '冪',
      干: '乾',
      并: '並',
      广: '廣',
      庄: '莊',
      庆: '慶',
      庐: '廬',
      庑: '廡',
      库: '庫',
      应: '應',
      庙: '廟',
      庞: '龐',
      废: '廢',
      庼: '廎',
      廪: '廩',
      开: '開',
      异: '異',
      弃: '棄',
      弑: '弒',
      张: '張',
      弥: '彌',
      弪: '弳',
      弯: '彎',
      弹: '彈',
      强: '強',
      归: '歸',
      当: '當',
      录: '錄',
      彟: '彠',
      彦: '彥',
      彷: '徬',
      彻: '徹',
      征: '徵',
      径: '徑',
      徕: '徠',
      忆: '憶',
      忏: '懺',
      忧: '憂',
      忾: '愾',
      怀: '懷',
      态: '態',
      怂: '慫',
      怃: '憮',
      怄: '慪',
      怅: '悵',
      怆: '愴',
      怜: '憐',
      总: '總',
      怼: '懟',
      怿: '懌',
      恋: '戀',
      恒: '恆',
      恳: '懇',
      恶: '惡',
      恸: '慟',
      恹: '懨',
      恺: '愷',
      恻: '惻',
      恼: '惱',
      恽: '惲',
      悦: '悅',
      悫: '愨',
      悬: '懸',
      悭: '慳',
      悮: '悞',
      悯: '憫',
      惊: '驚',
      惧: '懼',
      惨: '慘',
      惩: '懲',
      惫: '憊',
      惬: '愜',
      惭: '慚',
      惮: '憚',
      惯: '慣',
      愠: '慍',
      愤: '憤',
      愦: '憒',
      愿: '願',
      慑: '懾',
      慭: '憖',
      懑: '懣',
      懒: '懶',
      懔: '懍',
      戆: '戇',
      戋: '戔',
      戏: '戲',
      戗: '戧',
      战: '戰',
      戬: '戩',
      戯: '戱',
      户: '戶',
      扑: '撲',
      执: '執',
      扩: '擴',
      扪: '捫',
      扫: '掃',
      扬: '揚',
      扰: '擾',
      抚: '撫',
      抛: '拋',
      抟: '摶',
      抠: '摳',
      抡: '掄',
      抢: '搶',
      护: '護',
      报: '報',
      担: '擔',
      拟: '擬',
      拢: '攏',
      拣: '揀',
      拥: '擁',
      拦: '攔',
      拧: '擰',
      拨: '撥',
      择: '擇',
      挂: '掛',
      挚: '摯',
      挛: '攣',
      挜: '掗',
      挝: '撾',
      挞: '撻',
      挟: '挾',
      挠: '撓',
      挡: '擋',
      挢: '撟',
      挣: '掙',
      挤: '擠',
      挥: '揮',
      挦: '撏',
      挽: '輓',
      捝: '挩',
      捞: '撈',
      损: '損',
      捡: '撿',
      换: '換',
      捣: '搗',
      据: '據',
      掳: '擄',
      掴: '摑',
      掷: '擲',
      掸: '撣',
      掺: '摻',
      掼: '摜',
      揽: '攬',
      揾: '搵',
      揿: '撳',
      搀: '攙',
      搁: '擱',
      搂: '摟',
      搅: '攪',
      携: '攜',
      摄: '攝',
      摅: '攄',
      摆: '擺',
      摇: '搖',
      摈: '擯',
      摊: '攤',
      撄: '攖',
      撑: '撐',
      撵: '攆',
      撷: '擷',
      撸: '擼',
      撺: '攛',
      擞: '擻',
      攒: '攢',
      敌: '敵',
      敛: '斂',
      敩: '斆',
      数: '數',
      斋: '齋',
      斓: '斕',
      斗: '鬥',
      斩: '斬',
      断: '斷',
      无: '無',
      旧: '舊',
      时: '時',
      旷: '曠',
      旸: '暘',
      昙: '曇',
      昵: '暱',
      昼: '晝',
      昽: '曨',
      显: '顯',
      晋: '晉',
      晒: '曬',
      晓: '曉',
      晔: '曄',
      晕: '暈',
      晖: '暉',
      暂: '暫',
      暧: '曖',
      术: '術',
      朴: '樸',
      机: '機',
      杀: '殺',
      杂: '雜',
      权: '權',
      杆: '桿',
      杠: '槓',
      条: '條',
      来: '來',
      杨: '楊',
      杩: '榪',
      杰: '傑',
      极: '極',
      构: '構',
      枞: '樅',
      枢: '樞',
      枣: '棗',
      枥: '櫪',
      枧: '梘',
      枨: '棖',
      枪: '槍',
      枫: '楓',
      枭: '梟',
      柜: '櫃',
      柠: '檸',
      柽: '檉',
      栀: '梔',
      栅: '柵',
      标: '標',
      栈: '棧',
      栉: '櫛',
      栊: '櫳',
      栋: '棟',
      栌: '櫨',
      栎: '櫟',
      栏: '欄',
      树: '樹',
      栖: '棲',
      样: '樣',
      栾: '欒',
      桠: '椏',
      桡: '橈',
      桢: '楨',
      档: '檔',
      桤: '榿',
      桥: '橋',
      桦: '樺',
      桧: '檜',
      桨: '槳',
      桩: '樁',
      梦: '夢',
      梼: '檮',
      梾: '棶',
      梿: '槤',
      检: '檢',
      棁: '梲',
      棂: '櫺',
      棱: '稜',
      椁: '槨',
      椟: '櫝',
      椠: '槧',
      椤: '欏',
      椭: '橢',
      楼: '樓',
      榄: '欖',
      榅: '榲',
      榇: '櫬',
      榈: '櫚',
      榉: '櫸',
      槚: '檟',
      槛: '檻',
      槟: '檳',
      槠: '櫧',
      横: '橫',
      樯: '檣',
      樱: '櫻',
      橥: '櫫',
      橱: '櫥',
      橹: '櫓',
      橼: '櫞',
      檩: '檁',
      欢: '歡',
      欤: '歟',
      欧: '歐',
      歼: '殲',
      殁: '歿',
      殇: '殤',
      残: '殘',
      殒: '殞',
      殓: '殮',
      殚: '殫',
      殡: '殯',
      殴: '毆',
      毁: '毀',
      毂: '轂',
      毕: '畢',
      毙: '斃',
      毡: '氈',
      毵: '毿',
      氇: '氌',
      气: '氣',
      氢: '氫',
      氩: '氬',
      氲: '氳',
      汇: '匯',
      汉: '漢',
      汤: '湯',
      汹: '洶',
      沉: '沈',
      沟: '溝',
      没: '沒',
      沣: '灃',
      沤: '漚',
      沥: '瀝',
      沦: '淪',
      沧: '滄',
      沨: '渢',
      沩: '溈',
      沪: '滬',
      泄: '洩',
      泞: '濘',
      泪: '淚',
      泶: '澩',
      泷: '瀧',
      泸: '瀘',
      泺: '濼',
      泻: '瀉',
      泼: '潑',
      泽: '澤',
      泾: '涇',
      洁: '潔',
      洒: '灑',
      洼: '窪',
      浃: '浹',
      浅: '淺',
      浆: '漿',
      浇: '澆',
      浈: '湞',
      浉: '溮',
      浊: '濁',
      测: '測',
      浍: '澮',
      济: '濟',
      浏: '瀏',
      浐: '滻',
      浑: '渾',
      浒: '滸',
      浓: '濃',
      浔: '潯',
      浕: '濜',
      涂: '塗',
      涌: '湧',
      涛: '濤',
      涝: '澇',
      涞: '淶',
      涟: '漣',
      涠: '潿',
      涡: '渦',
      涢: '溳',
      涣: '渙',
      涤: '滌',
      润: '潤',
      涧: '澗',
      涨: '漲',
      涩: '澀',
      淀: '澱',
      渊: '淵',
      渌: '淥',
      渍: '漬',
      渎: '瀆',
      渐: '漸',
      渑: '澠',
      渔: '漁',
      渖: '瀋',
      渗: '滲',
      温: '溫',
      湾: '灣',
      湿: '濕',
      溁: '濚',
      溃: '潰',
      溅: '濺',
      溆: '漵',
      溇: '漊',
      滗: '潷',
      滚: '滾',
      滞: '滯',
      滟: '灧',
      滠: '灄',
      满: '滿',
      滢: '瀅',
      滤: '濾',
      滥: '濫',
      滦: '灤',
      滨: '濱',
      滩: '灘',
      滪: '澦',
      漓: '灕',
      漤: '灠',
      潆: '瀠',
      潇: '瀟',
      潋: '瀲',
      潍: '濰',
      潜: '潛',
      潴: '瀦',
      澛: '瀂',
      澜: '瀾',
      濑: '瀨',
      濒: '瀕',
      灏: '灝',
      灭: '滅',
      灯: '燈',
      灵: '靈',
      灾: '災',
      灿: '燦',
      炀: '煬',
      炉: '爐',
      炖: '燉',
      炜: '煒',
      炝: '熗',
      点: '點',
      炼: '煉',
      炽: '熾',
      烁: '爍',
      烂: '爛',
      烃: '烴',
      烛: '燭',
      烟: '煙',
      烦: '煩',
      烧: '燒',
      烨: '燁',
      烩: '燴',
      烫: '燙',
      烬: '燼',
      热: '熱',
      焕: '煥',
      焖: '燜',
      焘: '燾',
      煴: '熅',
      爱: '愛',
      爷: '爺',
      牍: '牘',
      牦: '氂',
      牵: '牽',
      牺: '犧',
      犊: '犢',
      状: '狀',
      犷: '獷',
      犸: '獁',
      犹: '猶',
      狈: '狽',
      狝: '獮',
      狞: '獰',
      独: '獨',
      狭: '狹',
      狮: '獅',
      狯: '獪',
      狰: '猙',
      狱: '獄',
      狲: '猻',
      猃: '獫',
      猎: '獵',
      猕: '獼',
      猡: '玀',
      猪: '豬',
      猫: '貓',
      猬: '蝟',
      献: '獻',
      獭: '獺',
      玑: '璣',
      玙: '璵',
      玚: '瑒',
      玛: '瑪',
      玮: '瑋',
      环: '環',
      现: '現',
      玱: '瑲',
      玺: '璽',
      珐: '琺',
      珑: '瓏',
      珰: '璫',
      珲: '琿',
      琎: '璡',
      琏: '璉',
      琐: '瑣',
      琼: '瓊',
      瑶: '瑤',
      瑷: '璦',
      璎: '瓔',
      瓒: '瓚',
      瓮: '甕',
      瓯: '甌',
      电: '電',
      画: '畫',
      畅: '暢',
      畴: '疇',
      疖: '癤',
      疗: '療',
      疟: '瘧',
      疠: '癘',
      疡: '瘍',
      疬: '癧',
      疭: '瘲',
      疮: '瘡',
      疯: '瘋',
      疱: '皰',
      疴: '痾',
      痈: '癰',
      痉: '痙',
      痒: '癢',
      痖: '瘂',
      痨: '癆',
      痪: '瘓',
      痫: '癇',
      瘅: '癉',
      瘆: '瘮',
      瘗: '瘞',
      瘘: '瘻',
      瘪: '癟',
      瘫: '癱',
      瘾: '癮',
      瘿: '癭',
      癞: '癩',
      癣: '癬',
      癫: '癲',
      皑: '皚',
      皱: '皺',
      皲: '皸',
      盏: '盞',
      盐: '鹽',
      监: '監',
      盖: '蓋',
      盗: '盜',
      盘: '盤',
      眍: '瞘',
      眦: '眥',
      眬: '矓',
      着: '著',
      睁: '睜',
      睐: '睞',
      睑: '瞼',
      睾: '睪',
      瞆: '瞶',
      瞒: '瞞',
      瞩: '矚',
      矫: '矯',
      矶: '磯',
      矾: '礬',
      矿: '礦',
      砀: '碭',
      码: '碼',
      砖: '磚',
      砗: '硨',
      砚: '硯',
      砜: '碸',
      砺: '礪',
      砻: '礱',
      砾: '礫',
      础: '礎',
      硁: '硜',
      硕: '碩',
      硖: '硤',
      硗: '磽',
      硙: '磑',
      硚: '礄',
      确: '確',
      硷: '礆',
      碍: '礙',
      碛: '磧',
      碜: '磣',
      碱: '鹼',
      礴: '礡',
      礼: '禮',
      祃: '禡',
      祎: '禕',
      祢: '禰',
      祯: '禎',
      祷: '禱',
      祸: '禍',
      禀: '稟',
      禄: '祿',
      禅: '禪',
      离: '離',
      秃: '禿',
      秆: '稈',
      种: '種',
      积: '積',
      称: '稱',
      秽: '穢',
      秾: '穠',
      稆: '穭',
      税: '稅',
      稣: '穌',
      稳: '穩',
      穑: '穡',
      穷: '窮',
      窃: '竊',
      窍: '竅',
      窎: '窵',
      窑: '窯',
      窜: '竄',
      窝: '窩',
      窥: '窺',
      窦: '竇',
      窭: '窶',
      竖: '竪',
      竞: '競',
      笃: '篤',
      笋: '筍',
      笔: '筆',
      笕: '筧',
      笺: '箋',
      笼: '籠',
      笾: '籩',
      筑: '築',
      筚: '篳',
      筛: '篩',
      筜: '簹',
      筝: '箏',
      筹: '籌',
      筼: '篔',
      签: '簽',
      简: '簡',
      箓: '籙',
      箦: '簀',
      箧: '篋',
      箨: '籜',
      箩: '籮',
      箪: '簞',
      箫: '簫',
      篑: '簣',
      篓: '簍',
      篮: '籃',
      篯: '籛',
      篱: '籬',
      簖: '籪',
      籁: '籟',
      籴: '糴',
      类: '類',
      籼: '秈',
      粜: '糶',
      粝: '糲',
      粤: '粵',
      粪: '糞',
      粮: '糧',
      糁: '糝',
      糇: '餱',
      紧: '緊',
      絷: '縶',
      纟: '糹',
      纠: '糾',
      纡: '紆',
      红: '紅',
      纣: '紂',
      纤: '纖',
      纥: '紇',
      约: '約',
      级: '級',
      纨: '紈',
      纩: '纊',
      纪: '紀',
      纫: '紉',
      纬: '緯',
      纭: '紜',
      纮: '紘',
      纯: '純',
      纰: '紕',
      纱: '紗',
      纲: '綱',
      纳: '納',
      纴: '紝',
      纵: '縱',
      纶: '綸',
      纷: '紛',
      纸: '紙',
      纹: '紋',
      纺: '紡',
      纻: '紵',
      纼: '紖',
      纽: '紐',
      纾: '紓',
      线: '線',
      绀: '紺',
      绁: '紲',
      绂: '紱',
      练: '練',
      组: '組',
      绅: '紳',
      细: '細',
      织: '織',
      终: '終',
      绉: '縐',
      绊: '絆',
      绋: '紼',
      绌: '絀',
      绍: '紹',
      绎: '繹',
      经: '經',
      绐: '紿',
      绑: '綁',
      绒: '絨',
      结: '結',
      绔: '絝',
      绕: '繞',
      绖: '絰',
      绗: '絎',
      绘: '繪',
      给: '給',
      绚: '絢',
      绛: '絳',
      络: '絡',
      绝: '絕',
      绞: '絞',
      统: '統',
      绠: '綆',
      绡: '綃',
      绢: '絹',
      绣: '繡',
      绤: '綌',
      绥: '綏',
      绦: '縧',
      继: '繼',
      绨: '綈',
      绩: '績',
      绪: '緒',
      绫: '綾',
      绬: '緓',
      续: '續',
      绮: '綺',
      绯: '緋',
      绰: '綽',
      绱: '緔',
      绲: '緄',
      绳: '繩',
      维: '維',
      绵: '綿',
      绶: '綬',
      绷: '繃',
      绸: '綢',
      绹: '綯',
      绺: '綹',
      绻: '綣',
      综: '綜',
      绽: '綻',
      绾: '綰',
      绿: '綠',
      缀: '綴',
      缁: '緇',
      缂: '緙',
      缃: '緗',
      缄: '緘',
      缅: '緬',
      缆: '纜',
      缇: '緹',
      缈: '緲',
      缉: '緝',
      缊: '縕',
      缋: '繢',
      缌: '緦',
      缍: '綞',
      缎: '緞',
      缏: '緶',
      缐: '線',
      缑: '緱',
      缒: '縋',
      缓: '緩',
      缔: '締',
      缕: '縷',
      编: '編',
      缗: '緡',
      缘: '緣',
      缙: '縉',
      缚: '縛',
      缛: '縟',
      缜: '縝',
      缝: '縫',
      缞: '縗',
      缟: '縞',
      缠: '纏',
      缡: '縭',
      缢: '縊',
      缣: '縑',
      缤: '繽',
      缥: '縹',
      缦: '縵',
      缧: '縲',
      缨: '纓',
      缩: '縮',
      缪: '繆',
      缫: '繅',
      缬: '纈',
      缭: '繚',
      缮: '繕',
      缯: '繒',
      缰: '繮',
      缱: '繾',
      缲: '繰',
      缳: '繯',
      缴: '繳',
      缵: '纘',
      罂: '罌',
      网: '網',
      罗: '羅',
      罚: '罰',
      罢: '罷',
      罴: '羆',
      羁: '羈',
      羟: '羥',
      羡: '羨',
      翘: '翹',
      翙: '翽',
      翚: '翬',
      耢: '耮',
      耧: '耬',
      耸: '聳',
      耻: '恥',
      聂: '聶',
      聋: '聾',
      职: '職',
      聍: '聹',
      联: '聯',
      聩: '聵',
      聪: '聰',
      肃: '肅',
      肠: '腸',
      肤: '膚',
      肮: '骯',
      肾: '腎',
      肿: '腫',
      胀: '脹',
      胁: '脅',
      胆: '膽',
      胜: '勝',
      胧: '朧',
      胨: '腖',
      胪: '臚',
      胫: '脛',
      胶: '膠',
      脉: '脈',
      脍: '膾',
      脏: '髒',
      脐: '臍',
      脑: '腦',
      脓: '膿',
      脔: '臠',
      脚: '腳',
      脱: '脫',
      脶: '腡',
      脸: '臉',
      腊: '臘',
      腌: '醃',
      腘: '膕',
      腭: '齶',
      腻: '膩',
      腽: '膃',
      腾: '騰',
      膑: '臏',
      膻: '羶',
      臜: '臢',
      舆: '輿',
      舍: '捨',
      舣: '艤',
      舰: '艦',
      舱: '艙',
      舻: '艫',
      艰: '艱',
      艳: '艷',
      艺: '藝',
      节: '節',
      芈: '羋',
      芗: '薌',
      芜: '蕪',
      芦: '蘆',
      苁: '蓯',
      苇: '葦',
      苈: '藶',
      苋: '莧',
      苌: '萇',
      苍: '蒼',
      苎: '苧',
      苏: '蘇',
      苧: '薴',
      苹: '蘋',
      范: '範',
      茎: '莖',
      茏: '蘢',
      茑: '蔦',
      茔: '塋',
      茕: '煢',
      茧: '繭',
      荆: '荊',
      荐: '薦',
      荙: '薘',
      荚: '莢',
      荛: '蕘',
      荜: '蓽',
      荞: '蕎',
      荟: '薈',
      荠: '薺',
      荡: '蕩',
      荣: '榮',
      荤: '葷',
      荥: '滎',
      荦: '犖',
      荧: '熒',
      荨: '蕁',
      荩: '藎',
      荪: '蓀',
      荫: '蔭',
      荬: '蕒',
      荭: '葒',
      荮: '葤',
      药: '藥',
      莅: '蒞',
      莱: '萊',
      莲: '蓮',
      莳: '蒔',
      莴: '萵',
      莶: '薟',
      获: '獲',
      莸: '蕕',
      莹: '瑩',
      莺: '鶯',
      莼: '蒓',
      萚: '蘀',
      萝: '蘿',
      萤: '螢',
      营: '營',
      萦: '縈',
      萧: '蕭',
      萨: '薩',
      葱: '蔥',
      蒇: '蕆',
      蒉: '蕢',
      蒋: '蔣',
      蒌: '蔞',
      蓝: '藍',
      蓟: '薊',
      蓠: '蘺',
      蓣: '蕷',
      蓥: '鎣',
      蓦: '驀',
      蔂: '虆',
      蔷: '薔',
      蔹: '蘞',
      蔺: '藺',
      蔼: '藹',
      蕰: '薀',
      蕲: '蘄',
      蕴: '蘊',
      薮: '藪',
      藓: '蘚',
      蘖: '櫱',
      虏: '虜',
      虑: '慮',
      虚: '虛',
      虫: '蟲',
      虬: '虯',
      虮: '蟣',
      虱: '蝨',
      虽: '雖',
      虾: '蝦',
      虿: '蠆',
      蚀: '蝕',
      蚁: '蟻',
      蚂: '螞',
      蚕: '蠶',
      蚝: '蠔',
      蚬: '蜆',
      蛊: '蠱',
      蛎: '蠣',
      蛏: '蟶',
      蛮: '蠻',
      蛰: '蟄',
      蛱: '蛺',
      蛲: '蟯',
      蛳: '螄',
      蛴: '蠐',
      蜕: '蛻',
      蜗: '蝸',
      蜡: '蠟',
      蝇: '蠅',
      蝈: '蟈',
      蝉: '蟬',
      蝎: '蠍',
      蝼: '螻',
      蝾: '蠑',
      螀: '螿',
      螨: '蟎',
      蟏: '蠨',
      衅: '釁',
      衔: '銜',
      补: '補',
      衬: '襯',
      衮: '袞',
      袄: '襖',
      袅: '裊',
      袆: '褘',
      袜: '襪',
      袭: '襲',
      袯: '襏',
      装: '裝',
      裆: '襠',
      裈: '褌',
      裢: '褳',
      裣: '襝',
      裤: '褲',
      裥: '襇',
      褛: '褸',
      褴: '襤',
      襕: '襴',
      见: '見',
      观: '觀',
      觃: '覎',
      规: '規',
      觅: '覓',
      视: '視',
      觇: '覘',
      览: '覽',
      觉: '覺',
      觊: '覬',
      觋: '覡',
      觌: '覿',
      觍: '覥',
      觎: '覦',
      觏: '覯',
      觐: '覲',
      觑: '覷',
      觞: '觴',
      触: '觸',
      觯: '觶',
      訚: '誾',
      詟: '讋',
      誉: '譽',
      誊: '謄',
      讠: '訁',
      计: '計',
      订: '訂',
      讣: '訃',
      认: '認',
      讥: '譏',
      讦: '訐',
      讧: '訌',
      讨: '討',
      让: '讓',
      讪: '訕',
      讫: '訖',
      讬: '託',
      训: '訓',
      议: '議',
      讯: '訊',
      记: '記',
      讱: '訒',
      讲: '講',
      讳: '諱',
      讴: '謳',
      讵: '詎',
      讶: '訝',
      讷: '訥',
      许: '許',
      讹: '訛',
      论: '論',
      讻: '訩',
      讼: '訟',
      讽: '諷',
      设: '設',
      访: '訪',
      诀: '訣',
      证: '證',
      诂: '詁',
      诃: '訶',
      评: '評',
      诅: '詛',
      识: '識',
      诇: '詗',
      诈: '詐',
      诉: '訴',
      诊: '診',
      诋: '詆',
      诌: '謅',
      词: '詞',
      诎: '詘',
      诏: '詔',
      诐: '詖',
      译: '譯',
      诒: '詒',
      诓: '誆',
      诔: '誄',
      试: '試',
      诖: '詿',
      诗: '詩',
      诘: '詰',
      诙: '詼',
      诚: '誠',
      诛: '誅',
      诜: '詵',
      话: '話',
      诞: '誕',
      诟: '詬',
      诠: '詮',
      诡: '詭',
      询: '詢',
      诣: '詣',
      诤: '諍',
      该: '該',
      详: '詳',
      诧: '詫',
      诨: '諢',
      诩: '詡',
      诪: '譸',
      诫: '誡',
      诬: '誣',
      语: '語',
      诮: '誚',
      误: '誤',
      诰: '誥',
      诱: '誘',
      诲: '誨',
      诳: '誑',
      说: '說',
      诵: '誦',
      诶: '誒',
      请: '請',
      诸: '諸',
      诹: '諏',
      诺: '諾',
      读: '讀',
      诼: '諑',
      诽: '誹',
      课: '課',
      诿: '諉',
      谀: '諛',
      谁: '誰',
      谂: '諗',
      调: '調',
      谄: '諂',
      谅: '諒',
      谆: '諄',
      谇: '誶',
      谈: '談',
      谊: '誼',
      谋: '謀',
      谌: '諶',
      谍: '諜',
      谎: '謊',
      谏: '諫',
      谐: '諧',
      谑: '謔',
      谒: '謁',
      谓: '謂',
      谔: '諤',
      谕: '諭',
      谖: '諼',
      谗: '讒',
      谘: '諮',
      谙: '諳',
      谚: '諺',
      谛: '諦',
      谜: '謎',
      谝: '諞',
      谞: '諝',
      谟: '謨',
      谠: '讜',
      谡: '謖',
      谢: '謝',
      谣: '謠',
      谤: '謗',
      谥: '謚',
      谦: '謙',
      谧: '謐',
      谨: '謹',
      谩: '謾',
      谪: '謫',
      谫: '謭',
      谬: '謬',
      谭: '譚',
      谮: '譖',
      谯: '譙',
      谰: '讕',
      谱: '譜',
      谲: '譎',
      谳: '讞',
      谴: '譴',
      谵: '譫',
      谶: '讖',
      豮: '豶',
      贝: '貝',
      贞: '貞',
      负: '負',
      贠: '貟',
      贡: '貢',
      财: '財',
      责: '責',
      贤: '賢',
      败: '敗',
      账: '賬',
      货: '貨',
      质: '質',
      贩: '販',
      贪: '貪',
      贫: '貧',
      贬: '貶',
      购: '購',
      贮: '貯',
      贯: '貫',
      贰: '貳',
      贱: '賤',
      贲: '賁',
      贳: '貰',
      贴: '貼',
      贵: '貴',
      贶: '貺',
      贷: '貸',
      贸: '貿',
      费: '費',
      贺: '賀',
      贻: '貽',
      贼: '賊',
      贽: '贄',
      贾: '賈',
      贿: '賄',
      赀: '貲',
      赁: '賃',
      赂: '賂',
      赃: '贓',
      资: '資',
      赅: '賅',
      赆: '贐',
      赇: '賕',
      赈: '賑',
      赉: '賚',
      赊: '賒',
      赋: '賦',
      赌: '賭',
      赍: '賫',
      赎: '贖',
      赏: '賞',
      赐: '賜',
      赑: '贔',
      赒: '賙',
      赓: '賡',
      赔: '賠',
      赕: '賧',
      赖: '賴',
      赗: '賵',
      赘: '贅',
      赙: '賻',
      赚: '賺',
      赛: '賽',
      赜: '賾',
      赝: '贋',
      赞: '贊',
      赟: '贇',
      赠: '贈',
      赡: '贍',
      赢: '贏',
      赣: '贛',
      赪: '赬',
      赵: '趙',
      赶: '趕',
      趋: '趨',
      趱: '趲',
      趸: '躉',
      跃: '躍',
      跄: '蹌',
      跞: '躒',
      践: '踐',
      跶: '躂',
      跷: '蹺',
      跸: '蹕',
      跹: '躚',
      跻: '躋',
      踊: '踴',
      踌: '躊',
      踪: '蹤',
      踬: '躓',
      踯: '躑',
      蹑: '躡',
      蹒: '蹣',
      蹰: '躕',
      蹿: '躥',
      躏: '躪',
      躜: '躦',
      躯: '軀',
      车: '車',
      轧: '軋',
      轨: '軌',
      轩: '軒',
      轪: '軑',
      轫: '軔',
      转: '轉',
      轭: '軛',
      轮: '輪',
      软: '軟',
      轰: '轟',
      轱: '軲',
      轲: '軻',
      轳: '轤',
      轴: '軸',
      轵: '軹',
      轶: '軼',
      轷: '軤',
      轸: '軫',
      轹: '轢',
      轺: '軺',
      轻: '輕',
      轼: '軾',
      载: '載',
      轾: '輊',
      轿: '轎',
      辀: '輈',
      辁: '輇',
      辂: '輅',
      较: '較',
      辄: '輒',
      辅: '輔',
      辆: '輛',
      辇: '輦',
      辈: '輩',
      辉: '輝',
      辊: '輥',
      辋: '輞',
      辌: '輬',
      辍: '輟',
      辎: '輜',
      辏: '輳',
      辐: '輻',
      辑: '輯',
      辒: '轀',
      输: '輸',
      辔: '轡',
      辕: '轅',
      辖: '轄',
      辗: '輾',
      辘: '轆',
      辙: '轍',
      辚: '轔',
      辞: '辭',
      辩: '辯',
      辫: '辮',
      边: '邊',
      辽: '遼',
      达: '達',
      迁: '遷',
      过: '過',
      迈: '邁',
      运: '運',
      还: '還',
      这: '這',
      进: '進',
      远: '遠',
      违: '違',
      连: '連',
      迟: '遲',
      迩: '邇',
      迳: '逕',
      迹: '跡',
      适: '適',
      选: '選',
      逊: '遜',
      递: '遞',
      逦: '邐',
      逻: '邏',
      遗: '遺',
      遥: '遙',
      邓: '鄧',
      邝: '鄺',
      邬: '鄔',
      邮: '郵',
      邹: '鄒',
      邺: '鄴',
      邻: '鄰',
      郏: '郟',
      郐: '鄶',
      郑: '鄭',
      郓: '鄆',
      郦: '酈',
      郧: '鄖',
      郸: '鄲',
      酂: '酇',
      酝: '醖',
      酦: '醱',
      酱: '醬',
      酽: '釅',
      酾: '釃',
      酿: '釀',
      采: '採',
      释: '釋',
      鉴: '鑒',
      銮: '鑾',
      錾: '鏨',
      钅: '釒',
      钆: '釓',
      钇: '釔',
      针: '針',
      钉: '釘',
      钊: '釗',
      钋: '釙',
      钌: '釕',
      钍: '釷',
      钎: '釺',
      钏: '釧',
      钐: '釤',
      钑: '鈒',
      钒: '釩',
      钓: '釣',
      钔: '鍆',
      钕: '釹',
      钖: '鍚',
      钗: '釵',
      钘: '鈃',
      钙: '鈣',
      钚: '鈈',
      钛: '鈦',
      钜: '鉅',
      钝: '鈍',
      钞: '鈔',
      钟: '鐘',
      钠: '鈉',
      钡: '鋇',
      钢: '鋼',
      钣: '鈑',
      钤: '鈐',
      钥: '鑰',
      钦: '欽',
      钧: '鈞',
      钨: '鎢',
      钩: '鈎',
      钪: '鈧',
      钫: '鈁',
      钬: '鈥',
      钭: '鈄',
      钮: '鈕',
      钯: '鈀',
      钰: '鈺',
      钱: '錢',
      钲: '鉦',
      钳: '鉗',
      钴: '鈷',
      钵: '鉢',
      钶: '鈳',
      钷: '鉕',
      钸: '鈽',
      钹: '鈸',
      钺: '鉞',
      钻: '鑽',
      钼: '鉬',
      钽: '鉭',
      钾: '鉀',
      钿: '鈿',
      铀: '鈾',
      铁: '鐵',
      铂: '鉑',
      铃: '鈴',
      铄: '鑠',
      铅: '鉛',
      铆: '鉚',
      铇: '鉋',
      铈: '鈰',
      铉: '鉉',
      铊: '鉈',
      铋: '鉍',
      铌: '鈮',
      铍: '鈹',
      铎: '鐸',
      铏: '鉶',
      铐: '銬',
      铑: '銠',
      铒: '鉺',
      铓: '鋩',
      铔: '錏',
      铕: '銪',
      铖: '鋮',
      铗: '鋏',
      铘: '鋣',
      铙: '鐃',
      铚: '銍',
      铛: '鐺',
      铜: '銅',
      铝: '鋁',
      铞: '銱',
      铟: '銦',
      铠: '鎧',
      铡: '鍘',
      铢: '銖',
      铣: '銑',
      铤: '鋌',
      铥: '銩',
      铦: '銛',
      铧: '鏵',
      铨: '銓',
      铩: '鎩',
      铪: '鉿',
      铫: '銚',
      铬: '鉻',
      铭: '銘',
      铮: '錚',
      铯: '銫',
      铰: '鉸',
      铱: '銥',
      铲: '鏟',
      铳: '銃',
      铴: '鐋',
      铵: '銨',
      银: '銀',
      铷: '銣',
      铸: '鑄',
      铹: '鐒',
      铺: '鋪',
      铻: '鋙',
      铼: '錸',
      铽: '鋱',
      链: '鏈',
      铿: '鏗',
      销: '銷',
      锁: '鎖',
      锂: '鋰',
      锃: '鋥',
      锄: '鋤',
      锅: '鍋',
      锆: '鋯',
      锇: '鋨',
      锈: '鏽',
      锉: '銼',
      锊: '鋝',
      锋: '鋒',
      锌: '鋅',
      锍: '鋶',
      锎: '鐦',
      锏: '鐧',
      锐: '銳',
      锑: '銻',
      锒: '鋃',
      锓: '鋟',
      锔: '鋦',
      锕: '錒',
      锖: '錆',
      锗: '鍺',
      锘: '鍩',
      错: '錯',
      锚: '錨',
      锛: '錛',
      锜: '錡',
      锝: '鍀',
      锞: '錁',
      锟: '錕',
      锠: '錩',
      锡: '錫',
      锢: '錮',
      锣: '鑼',
      锤: '錘',
      锥: '錐',
      锦: '錦',
      锧: '鑕',
      锨: '鍁',
      锩: '錈',
      锪: '鍃',
      锫: '錇',
      锬: '錟',
      锭: '錠',
      键: '鍵',
      锯: '鋸',
      锰: '錳',
      锱: '錙',
      锲: '鍥',
      锳: '鍈',
      锴: '鍇',
      锵: '鏘',
      锶: '鍶',
      锷: '鍔',
      锸: '鍤',
      锹: '鍬',
      锺: '鍾',
      锻: '鍛',
      锼: '鎪',
      锽: '鍠',
      锾: '鍰',
      锿: '鎄',
      镀: '鍍',
      镁: '鎂',
      镂: '鏤',
      镃: '鎡',
      镄: '鐨',
      镅: '鎇',
      镆: '鏌',
      镇: '鎮',
      镈: '鎛',
      镉: '鎘',
      镊: '鑷',
      镋: '鎲',
      镌: '鐫',
      镍: '鎳',
      镎: '鎿',
      镏: '鎦',
      镐: '鎬',
      镑: '鎊',
      镒: '鎰',
      镓: '鎵',
      镔: '鑌',
      镕: '鎔',
      镖: '鏢',
      镗: '鏜',
      镘: '鏝',
      镙: '鏍',
      镚: '鏰',
      镛: '鏞',
      镜: '鏡',
      镝: '鏑',
      镞: '鏃',
      镟: '鏇',
      镠: '鏐',
      镡: '鐔',
      镢: '鐝',
      镣: '鐐',
      镤: '鏷',
      镥: '鑥',
      镦: '鐓',
      镧: '鑭',
      镨: '鐠',
      镩: '鑹',
      镪: '鏹',
      镫: '鐙',
      镬: '鑊',
      镭: '鐳',
      镮: '鐶',
      镯: '鐲',
      镰: '鐮',
      镱: '鐿',
      镲: '鑔',
      镳: '鑣',
      镴: '鑞',
      镵: '鑱',
      镶: '鑲',
      长: '長',
      门: '門',
      闩: '閂',
      闪: '閃',
      闫: '閆',
      闬: '閈',
      闭: '閉',
      问: '問',
      闯: '闖',
      闰: '閏',
      闱: '闈',
      闲: '閒',
      闳: '閎',
      间: '間',
      闵: '閔',
      闶: '閌',
      闷: '悶',
      闸: '閘',
      闹: '鬧',
      闺: '閨',
      闻: '聞',
      闼: '闥',
      闽: '閩',
      闾: '閭',
      闿: '闓',
      阀: '閥',
      阁: '閣',
      阂: '閡',
      阃: '閫',
      阄: '鬮',
      阅: '閱',
      阆: '閬',
      阇: '闍',
      阈: '閾',
      阉: '閹',
      阊: '閶',
      阋: '鬩',
      阌: '閿',
      阍: '閽',
      阎: '閻',
      阏: '閼',
      阐: '闡',
      阑: '闌',
      阒: '闃',
      阓: '闠',
      阔: '闊',
      阕: '闋',
      阖: '闔',
      阗: '闐',
      阘: '闒',
      阙: '闕',
      阚: '闞',
      阛: '闤',
      队: '隊',
      阳: '陽',
      阴: '陰',
      阵: '陣',
      阶: '階',
      际: '際',
      陆: '陸',
      陇: '隴',
      陈: '陳',
      陉: '陘',
      陕: '陝',
      陧: '隉',
      陨: '隕',
      险: '險',
      随: '隨',
      隐: '隱',
      隶: '隸',
      隽: '雋',
      难: '難',
      雏: '雛',
      雠: '讎',
      雳: '靂',
      雾: '霧',
      霁: '霽',
      霡: '霢',
      霭: '靄',
      靓: '靚',
      静: '靜',
      靥: '靨',
      鞑: '韃',
      鞒: '鞽',
      鞯: '韉',
      韦: '韋',
      韧: '韌',
      韨: '韍',
      韩: '韓',
      韪: '韙',
      韫: '韞',
      韬: '韜',
      韵: '韻',
      页: '頁',
      顶: '頂',
      顷: '頃',
      顸: '頇',
      项: '項',
      顺: '順',
      须: '須',
      顼: '頊',
      顽: '頑',
      顾: '顧',
      顿: '頓',
      颀: '頎',
      颁: '頒',
      颂: '頌',
      颃: '頏',
      预: '預',
      颅: '顱',
      领: '領',
      颇: '頗',
      颈: '頸',
      颉: '頡',
      颊: '頰',
      颋: '頲',
      颌: '頜',
      颍: '潁',
      颎: '熲',
      颏: '頦',
      颐: '頤',
      频: '頻',
      颒: '頮',
      颓: '頹',
      颔: '頷',
      颕: '頴',
      颖: '穎',
      颗: '顆',
      题: '題',
      颙: '顒',
      颚: '顎',
      颛: '顓',
      颜: '顏',
      额: '額',
      颞: '顳',
      颟: '顢',
      颠: '顛',
      颡: '顙',
      颢: '顥',
      颤: '顫',
      颥: '顬',
      颦: '顰',
      颧: '顴',
      风: '風',
      飏: '颺',
      飐: '颭',
      飑: '颮',
      飒: '颯',
      飓: '颶',
      飔: '颸',
      飕: '颼',
      飖: '颻',
      飗: '飀',
      飘: '飄',
      飙: '飆',
      飚: '飈',
      飞: '飛',
      飨: '饗',
      餍: '饜',
      饣: '飠',
      饤: '飣',
      饥: '飢',
      饦: '飥',
      饧: '餳',
      饨: '飩',
      饩: '餼',
      饪: '飪',
      饫: '飫',
      饬: '飭',
      饭: '飯',
      饮: '飲',
      饯: '餞',
      饰: '飾',
      饱: '飽',
      饲: '飼',
      饳: '飿',
      饴: '飴',
      饵: '餌',
      饶: '饒',
      饷: '餉',
      饸: '餄',
      饹: '餎',
      饺: '餃',
      饻: '餏',
      饼: '餅',
      饽: '餑',
      饾: '餖',
      饿: '餓',
      馀: '餘',
      馁: '餒',
      馂: '餕',
      馃: '餜',
      馄: '餛',
      馅: '餡',
      馆: '館',
      馇: '餷',
      馈: '饋',
      馉: '餶',
      馊: '餿',
      馋: '饞',
      馌: '饁',
      馍: '饃',
      馎: '餺',
      馏: '餾',
      馐: '饈',
      馑: '饉',
      馒: '饅',
      馓: '饊',
      馔: '饌',
      馕: '饢',
      马: '馬',
      驭: '馭',
      驮: '馱',
      驯: '馴',
      驰: '馳',
      驱: '驅',
      驲: '馹',
      驳: '駁',
      驴: '驢',
      驵: '駔',
      驶: '駛',
      驷: '駟',
      驸: '駙',
      驹: '駒',
      驺: '騶',
      驻: '駐',
      驼: '駝',
      驽: '駑',
      驾: '駕',
      驿: '驛',
      骀: '駘',
      骁: '驍',
      骂: '罵',
      骃: '駰',
      骄: '驕',
      骅: '驊',
      骆: '駱',
      骇: '駭',
      骈: '駢',
      骉: '驫',
      骊: '驪',
      骋: '騁',
      验: '驗',
      骍: '騂',
      骎: '駸',
      骏: '駿',
      骐: '騏',
      骑: '騎',
      骒: '騍',
      骓: '騅',
      骔: '騌',
      骕: '驌',
      骖: '驂',
      骗: '騙',
      骘: '騭',
      骙: '騤',
      骚: '騷',
      骛: '騖',
      骜: '驁',
      骝: '騮',
      骞: '騫',
      骟: '騸',
      骠: '驃',
      骡: '騾',
      骢: '驄',
      骣: '驏',
      骤: '驟',
      骥: '驥',
      骦: '驦',
      骧: '驤',
      髅: '髏',
      髋: '髖',
      髌: '髕',
      鬓: '鬢',
      鬶: '鬹',
      魇: '魘',
      魉: '魎',
      鱼: '魚',
      鱽: '魛',
      鱾: '魢',
      鱿: '魷',
      鲀: '魨',
      鲁: '魯',
      鲂: '魴',
      鲃: '䰾',
      鲄: '魺',
      鲅: '鮁',
      鲆: '鮃',
      鲇: '鮎',
      鲈: '鱸',
      鲉: '鮋',
      鲊: '鮓',
      鲋: '鮒',
      鲌: '鮊',
      鲍: '鮑',
      鲎: '鱟',
      鲏: '鮍',
      鲐: '鮐',
      鲑: '鮭',
      鲒: '鮚',
      鲓: '鮳',
      鲔: '鮪',
      鲕: '鮞',
      鲖: '鮦',
      鲗: '鰂',
      鲘: '鮜',
      鲙: '鱠',
      鲚: '鱭',
      鲛: '鮫',
      鲜: '鮮',
      鲝: '鮺',
      鲞: '鮝',
      鲟: '鱘',
      鲠: '鯁',
      鲡: '鱺',
      鲢: '鰱',
      鲣: '鰹',
      鲤: '鯉',
      鲥: '鰣',
      鲦: '鰷',
      鲧: '鯀',
      鲨: '鯊',
      鲩: '鯇',
      鲪: '鮶',
      鲫: '鯽',
      鲬: '鯒',
      鲭: '鯖',
      鲮: '鯪',
      鲯: '鯕',
      鲰: '鯫',
      鲱: '鯡',
      鲲: '鯤',
      鲳: '鯧',
      鲴: '鯝',
      鲵: '鯢',
      鲶: '鯰',
      鲷: '鯛',
      鲸: '鯨',
      鲹: '鰺',
      鲺: '鯴',
      鲻: '鯔',
      鲼: '鱝',
      鲽: '鰈',
      鲾: '鰏',
      鲿: '鱨',
      鳀: '鯷',
      鳁: '鰮',
      鳂: '鰃',
      鳃: '鰓',
      鳄: '鰐',
      鳅: '鰍',
      鳆: '鰒',
      鳇: '鰉',
      鳈: '鰁',
      鳉: '鱂',
      鳊: '鯿',
      鳋: '鰠',
      鳌: '鰲',
      鳍: '鰭',
      鳎: '鰨',
      鳏: '鰥',
      鳐: '鰩',
      鳑: '鰟',
      鳒: '鰜',
      鳓: '鰳',
      鳔: '鰾',
      鳕: '鱈',
      鳖: '鱉',
      鳗: '鰻',
      鳘: '鰵',
      鳙: '鱅',
      鳚: '䲁',
      鳛: '鰼',
      鳜: '鱖',
      鳝: '鱔',
      鳞: '鱗',
      鳟: '鱒',
      鳠: '鱯',
      鳡: '鱤',
      鳢: '鱧',
      鳣: '鱣',
      鳤: '䲘',
      鸟: '鳥',
      鸠: '鳩',
      鸡: '雞',
      鸢: '鳶',
      鸣: '鳴',
      鸤: '鳲',
      鸥: '鷗',
      鸦: '鴉',
      鸧: '鶬',
      鸨: '鴇',
      鸩: '鴆',
      鸪: '鴣',
      鸫: '鶇',
      鸬: '鸕',
      鸭: '鴨',
      鸮: '鴞',
      鸯: '鴦',
      鸰: '鴒',
      鸱: '鴟',
      鸲: '鴝',
      鸳: '鴛',
      鸴: '鷽',
      鸵: '鴕',
      鸶: '鷥',
      鸷: '鷙',
      鸸: '鴯',
      鸹: '鴰',
      鸺: '鵂',
      鸻: '鴴',
      鸼: '鵃',
      鸽: '鴿',
      鸾: '鸞',
      鸿: '鴻',
      鹀: '鵐',
      鹁: '鵓',
      鹂: '鸝',
      鹃: '鵑',
      鹄: '鵠',
      鹅: '鵝',
      鹆: '鵒',
      鹇: '鷳',
      鹈: '鵜',
      鹉: '鵡',
      鹊: '鵲',
      鹋: '鶓',
      鹌: '鵪',
      鹍: '鵾',
      鹎: '鵯',
      鹏: '鵬',
      鹐: '鵮',
      鹑: '鶉',
      鹒: '鶊',
      鹓: '鵷',
      鹔: '鷫',
      鹕: '鶘',
      鹖: '鶡',
      鹗: '鶚',
      鹘: '鶻',
      鹙: '鶖',
      鹚: '鷀',
      鹛: '鶥',
      鹜: '鶩',
      鹝: '鷊',
      鹞: '鷂',
      鹟: '鶲',
      鹠: '鶹',
      鹡: '鶺',
      鹢: '鷁',
      鹣: '鶼',
      鹤: '鶴',
      鹥: '鷖',
      鹦: '鸚',
      鹧: '鷓',
      鹨: '鷚',
      鹩: '鷯',
      鹪: '鷦',
      鹫: '鷲',
      鹬: '鷸',
      鹭: '鷺',
      鹮: '䴉',
      鹯: '鸇',
      鹰: '鷹',
      鹱: '鸌',
      鹲: '鸏',
      鹳: '鸛',
      鹴: '鸘',
      鹾: '鹺',
      麦: '麥',
      麸: '麩',
      麹: '麴',
      黄: '黃',
      黉: '黌',
      黡: '黶',
      黩: '黷',
      黪: '黲',
      黾: '黽',
      鼋: '黿',
      鼍: '鼉',
      鼗: '鞀',
      鼹: '鼴',
      齐: '齊',
      齑: '齏',
      齿: '齒',
      龀: '齔',
      龁: '齕',
      龂: '齗',
      龃: '齟',
      龄: '齡',
      龅: '齙',
      龆: '齠',
      龇: '齜',
      龈: '齦',
      龉: '齬',
      龊: '齪',
      龋: '齲',
      龌: '齷',
      龙: '龍',
      龚: '龔',
      龛: '龕',
      龟: '龜',
      鿎: '䃮',
      鿏: '䥑',
      鿔: '鎶',
      '鿭': '鉨',
    },
    simplifiedCharacters: {
      㑳: '㑇',
      㘚: '㘎',
      㠏: '㟆',
      㠣: '𫵷',
      㥮: '㤘',
      㩜: '㨫',
      㩳: '㧐',
      㼆: '𬎆',
      䃮: '鿎',
      䊷: '䌶',
      䋙: '䌺',
      䋻: '䌾',
      䓣: '𬜯',
      䝼: '䞍',
      䡵: '𫟦',
      䥑: '鿏',
      䥕: '𬭯',
      䬗: '扬',
      䮄: '𫠊',
      䯀: '䯅',
      䰾: '鲃',
      䱽: '䲝',
      䲁: '鳚',
      䲘: '鳤',
      䴉: '鹮',
      䶧: '咬',
      丟: '丢',
      並: '并',
      乾: '干',
      亂: '乱',
      亙: '亘',
      亞: '亚',
      佇: '伫',
      佈: '布',
      佔: '占',
      併: '并',
      來: '来',
      侖: '仑',
      侶: '侣',
      侷: '局',
      俁: '俣',
      係: '系',
      俔: '伣',
      俠: '侠',
      俬: '私',
      俱: '具',
      倀: '伥',
      倆: '俩',
      倈: '俫',
      倉: '仓',
      個: '个',
      們: '们',
      倖: '幸',
      倣: '仿',
      倫: '伦',
      偉: '伟',
      側: '侧',
      偵: '侦',
      偽: '伪',
      傑: '杰',
      傖: '伧',
      傘: '伞',
      備: '备',
      傢: '家',
      傭: '佣',
      傯: '偬',
      傳: '传',
      傴: '伛',
      債: '债',
      傷: '伤',
      傾: '倾',
      僂: '偻',
      僅: '仅',
      僇: '戮',
      僉: '佥',
      僑: '侨',
      僕: '仆',
      僞: '伪',
      僤: '𫢸',
      僥: '侥',
      僨: '偾',
      僱: '雇',
      價: '价',
      儀: '仪',
      儂: '侬',
      億: '亿',
      儈: '侩',
      儉: '俭',
      儐: '傧',
      儔: '俦',
      儕: '侪',
      儘: '尽',
      償: '偿',
      優: '优',
      儲: '储',
      儷: '俪',
      儸: '㑩',
      儺: '傩',
      儻: '傥',
      儼: '俨',
      兇: '凶',
      兌: '兑',
      兒: '儿',
      兗: '兖',
      內: '内',
      兩: '两',
      冊: '册',
      冪: '幂',
      凈: '净',
      凍: '冻',
      凜: '凛',
      凱: '凯',
      別: '别',
      刪: '删',
      剄: '刭',
      則: '则',
      剋: '克',
      剎: '刹',
      剗: '刬',
      剛: '刚',
      剝: '剥',
      剮: '剐',
      剴: '剀',
      創: '创',
      剷: '铲',
      劃: '划',
      劇: '剧',
      劉: '刘',
      劊: '刽',
      劌: '刿',
      劍: '剑',
      劏: '㓥',
      劑: '剂',
      劚: '㔉',
      勁: '劲',
      動: '动',
      勗: '勖',
      務: '务',
      勛: '勋',
      勝: '胜',
      勞: '劳',
      勢: '势',
      勣: '𪟝',
      勩: '勚',
      勱: '劢',
      勳: '勋',
      勵: '励',
      勸: '劝',
      勻: '匀',
      匭: '匦',
      匯: '汇',
      匱: '匮',
      區: '区',
      協: '协',
      卹: '恤',
      卻: '却',
      厙: '厍',
      厠: '厕',
      厭: '厌',
      厲: '厉',
      厴: '厣',
      參: '参',
      叄: '叁',
      叢: '丛',
      吒: '咤',
      吢: '吣',
      吳: '吴',
      吶: '呐',
      呂: '吕',
      咷: '啕',
      咼: '呙',
      員: '员',
      唄: '呗',
      唚: '吣',
      唸: '念',
      問: '问',
      啓: '启',
      啞: '哑',
      啟: '启',
      啢: '唡',
      喎: '㖞',
      喚: '唤',
      喨: '亮',
      喪: '丧',
      喫: '吃',
      喬: '乔',
      單: '单',
      喲: '哟',
      嗆: '呛',
      嗇: '啬',
      嗊: '唝',
      嗎: '吗',
      嗚: '呜',
      嗩: '唢',
      嗶: '哔',
      嘆: '叹',
      嘍: '喽',
      嘔: '呕',
      嘖: '啧',
      嘗: '尝',
      嘜: '唛',
      嘩: '哗',
      嘮: '唠',
      嘯: '啸',
      嘰: '叽',
      嘵: '哓',
      嘸: '呒',
      嘽: '啴',
      噁: '𫫇',
      噓: '嘘',
      噚: '㖊',
      噝: '咝',
      噠: '哒',
      噥: '哝',
      噦: '哕',
      噯: '嗳',
      噲: '哙',
      噴: '喷',
      噸: '吨',
      噹: '当',
      嚀: '咛',
      嚇: '吓',
      嚌: '哜',
      嚐: '尝',
      嚕: '噜',
      嚙: '啮',
      嚥: '咽',
      嚦: '呖',
      嚨: '咙',
      嚮: '向',
      嚲: '亸',
      嚳: '喾',
      嚴: '严',
      嚶: '嘤',
      囀: '啭',
      囁: '嗫',
      囂: '嚣',
      囅: '冁',
      囈: '呓',
      囉: '啰',
      囍: '禧',
      囑: '嘱',
      囓: '啮',
      囪: '囱',
      圇: '囵',
      國: '国',
      圍: '围',
      園: '园',
      圓: '圆',
      圖: '图',
      團: '团',
      垵: '埯',
      埡: '垭',
      埨: '𫭢',
      埰: '采',
      執: '执',
      堅: '坚',
      堊: '垩',
      堖: '垴',
      堝: '埚',
      堯: '尧',
      報: '报',
      場: '场',
      塊: '块',
      塋: '茔',
      塏: '垲',
      塒: '埘',
      塗: '涂',
      塚: '冢',
      塢: '坞',
      塤: '埙',
      塵: '尘',
      塸: '𫭟',
      塹: '堑',
      塿: '𪣻',
      墊: '垫',
      墜: '坠',
      墠: '𫮃',
      墮: '堕',
      墳: '坟',
      墶: '垯',
      墻: '墙',
      墾: '垦',
      壇: '坛',
      壋: '垱',
      壎: '埙',
      壓: '压',
      壘: '垒',
      壙: '圹',
      壚: '垆',
      壜: '坛',
      壞: '坏',
      壟: '垄',
      壠: '垅',
      壢: '坜',
      壩: '坝',
      壪: '塆',
      壯: '壮',
      壺: '壶',
      壼: '壸',
      壽: '寿',
      夠: '够',
      夢: '梦',
      夥: '伙',
      夾: '夹',
      奐: '奂',
      奧: '奥',
      奩: '奁',
      奪: '夺',
      奬: '奖',
      奮: '奋',
      奼: '姹',
      妝: '妆',
      姊: '姐',
      姍: '姗',
      姦: '奸',
      姪: '侄',
      娙: '𫰛',
      娛: '娱',
      婁: '娄',
      婦: '妇',
      婭: '娅',
      媧: '娲',
      媯: '妫',
      媼: '媪',
      媽: '妈',
      嫋: '袅',
      嫗: '妪',
      嫵: '妩',
      嫻: '娴',
      嫿: '婳',
      嬀: '妫',
      嬃: '媭',
      嬈: '娆',
      嬋: '婵',
      嬌: '娇',
      嬙: '嫱',
      嬝: '袅',
      嬡: '嫒',
      嬤: '嬷',
      嬪: '嫔',
      嬰: '婴',
      嬸: '婶',
      孃: '娘',
      孌: '娈',
      孫: '孙',
      學: '学',
      孿: '孪',
      宮: '宫',
      寢: '寝',
      實: '实',
      寧: '宁',
      審: '审',
      寫: '写',
      寬: '宽',
      寵: '宠',
      寶: '宝',
      尅: '克',
      將: '将',
      專: '专',
      尋: '寻',
      對: '对',
      導: '导',
      尷: '尴',
      屆: '届',
      屍: '尸',
      屓: '屃',
      屜: '屉',
      屢: '屡',
      層: '层',
      屨: '屦',
      屬: '属',
      岡: '冈',
      峴: '岘',
      島: '岛',
      峽: '峡',
      崍: '崃',
      崑: '昆',
      崗: '岗',
      崙: '仑',
      崢: '峥',
      崬: '岽',
      嵐: '岚',
      嵽: '𫶇',
      嶁: '嵝',
      嶄: '崭',
      嶇: '岖',
      嶔: '嵚',
      嶗: '崂',
      嶠: '峤',
      嶢: '峣',
      嶧: '峄',
      嶨: '峃',
      嶮: '崄',
      嶴: '岙',
      嶸: '嵘',
      嶺: '岭',
      嶼: '屿',
      巋: '岿',
      巒: '峦',
      巔: '巅',
      巖: '岩',
      巘: '𪩘',
      巰: '巯',
      帥: '帅',
      師: '师',
      帳: '帐',
      帶: '带',
      幀: '帧',
      幃: '帏',
      幗: '帼',
      幘: '帻',
      幟: '帜',
      幣: '币',
      幫: '帮',
      幬: '帱',
      幹: '干',
      幾: '几',
      庫: '库',
      廁: '厕',
      廂: '厢',
      廄: '厩',
      廈: '厦',
      廎: '庼',
      廚: '厨',
      廝: '厮',
      廞: '𫷷',
      廟: '庙',
      廠: '厂',
      廡: '庑',
      廢: '废',
      廣: '广',
      廩: '廪',
      廬: '庐',
      廳: '厅',
      廻: '回',
      弒: '弑',
      弔: '吊',
      弳: '弪',
      張: '张',
      強: '强',
      彄: '𫸩',
      彆: '别',
      彈: '弹',
      彌: '弥',
      彎: '弯',
      彙: '汇',
      彞: '彝',
      彠: '彟',
      彥: '彦',
      彿: '佛',
      後: '后',
      徑: '径',
      從: '从',
      徠: '徕',
      復: '复',
      徬: '彷',
      徵: '征',
      徹: '彻',
      恆: '恒',
      恥: '耻',
      悅: '悦',
      悞: '悮',
      悳: '德',
      悵: '怅',
      悶: '闷',
      悽: '凄',
      惡: '恶',
      惱: '恼',
      惲: '恽',
      惻: '恻',
      愛: '爱',
      愜: '惬',
      愨: '悫',
      愴: '怆',
      愷: '恺',
      愾: '忾',
      慄: '栗',
      慇: '殷',
      態: '态',
      慍: '愠',
      慘: '惨',
      慚: '惭',
      慟: '恸',
      慣: '惯',
      慤: '悫',
      慪: '怄',
      慫: '怂',
      慮: '虑',
      慳: '悭',
      慶: '庆',
      慼: '戚',
      慾: '欲',
      憂: '忧',
      憊: '惫',
      憐: '怜',
      憑: '凭',
      憒: '愦',
      憖: '慭',
      憚: '惮',
      憤: '愤',
      憫: '悯',
      憮: '怃',
      憲: '宪',
      憶: '忆',
      懃: '勤',
      懇: '恳',
      應: '应',
      懌: '怿',
      懍: '懔',
      懞: '蒙',
      懟: '怼',
      懣: '懑',
      懨: '恹',
      懮: '忧',
      懲: '惩',
      懶: '懒',
      懷: '怀',
      懸: '悬',
      懺: '忏',
      懼: '惧',
      懾: '慑',
      戀: '恋',
      戇: '戆',
      戔: '戋',
      戧: '戗',
      戩: '戬',
      戰: '战',
      戱: '戯',
      戲: '戏',
      戶: '户',
      拋: '抛',
      挩: '捝',
      挾: '挟',
      捨: '舍',
      捫: '扪',
      捲: '卷',
      掃: '扫',
      掄: '抡',
      掗: '挜',
      掙: '挣',
      掛: '挂',
      採: '采',
      揀: '拣',
      揚: '扬',
      換: '换',
      揮: '挥',
      搆: '构',
      損: '损',
      搖: '摇',
      搗: '捣',
      搥: '捶',
      搧: '扇',
      搨: '拓',
      搵: '揾',
      搶: '抢',
      搾: '榨',
      摀: '捂',
      摑: '掴',
      摜: '掼',
      摟: '搂',
      摯: '挚',
      摳: '抠',
      摶: '抟',
      摺: '折',
      摻: '掺',
      撈: '捞',
      撏: '挦',
      撐: '撑',
      撓: '挠',
      撚: '捻',
      撝: '㧑',
      撟: '挢',
      撢: '掸',
      撣: '掸',
      撥: '拨',
      撫: '抚',
      撲: '扑',
      撳: '揿',
      撻: '挞',
      撾: '挝',
      撿: '捡',
      擁: '拥',
      擄: '掳',
      擇: '择',
      擊: '击',
      擋: '挡',
      擓: '㧟',
      擔: '担',
      據: '据',
      擠: '挤',
      擣: '捣',
      擬: '拟',
      擯: '摈',
      擰: '拧',
      擱: '搁',
      擲: '掷',
      擴: '扩',
      擷: '撷',
      擺: '摆',
      擻: '擞',
      擼: '撸',
      擾: '扰',
      攄: '摅',
      攆: '撵',
      攏: '拢',
      攔: '拦',
      攖: '撄',
      攙: '搀',
      攛: '撺',
      攜: '携',
      攝: '摄',
      攢: '攒',
      攣: '挛',
      攤: '摊',
      攪: '搅',
      攬: '揽',
      敗: '败',
      敘: '叙',
      敵: '敌',
      數: '数',
      斂: '敛',
      斃: '毙',
      斆: '敩',
      斕: '斓',
      斬: '斩',
      斷: '断',
      於: '于',
      昇: '升',
      時: '时',
      晉: '晋',
      晛: '𬀪',
      晝: '昼',
      暈: '晕',
      暉: '晖',
      暐: '𬀩',
      暘: '旸',
      暢: '畅',
      暫: '暂',
      暱: '昵',
      曄: '晔',
      曆: '历',
      曇: '昙',
      曉: '晓',
      曏: '向',
      曖: '暧',
      曠: '旷',
      曨: '昽',
      曬: '晒',
      書: '书',
      會: '会',
      朧: '胧',
      東: '东',
      枒: '丫',
      柵: '栅',
      桿: '杆',
      梔: '栀',
      梘: '枧',
      梜: '𬂩',
      條: '条',
      梟: '枭',
      梲: '棁',
      棄: '弃',
      棖: '枨',
      棗: '枣',
      棟: '栋',
      棡: '㭎',
      棧: '栈',
      棲: '栖',
      棶: '梾',
      椏: '桠',
      楊: '杨',
      楓: '枫',
      楨: '桢',
      業: '业',
      極: '极',
      榖: '谷',
      榪: '杩',
      榮: '荣',
      榲: '榅',
      榿: '桤',
      構: '构',
      槍: '枪',
      槓: '杠',
      槖: '橐',
      槤: '梿',
      槧: '椠',
      槨: '椁',
      槳: '桨',
      樁: '桩',
      樂: '乐',
      樅: '枞',
      樑: '梁',
      樓: '楼',
      標: '标',
      樞: '枢',
      樣: '样',
      樸: '朴',
      樹: '树',
      樺: '桦',
      橈: '桡',
      橋: '桥',
      機: '机',
      橢: '椭',
      橫: '横',
      檁: '檩',
      檉: '柽',
      檔: '档',
      檜: '桧',
      檝: '楫',
      檟: '槚',
      檢: '检',
      檣: '樯',
      檮: '梼',
      檯: '台',
      檳: '槟',
      檸: '柠',
      檻: '槛',
      櫃: '柜',
      櫍: '𬃊',
      櫓: '橹',
      櫚: '榈',
      櫛: '栉',
      櫝: '椟',
      櫞: '橼',
      櫟: '栎',
      櫥: '橱',
      櫧: '槠',
      櫨: '栌',
      櫪: '枥',
      櫫: '橥',
      櫬: '榇',
      櫱: '蘖',
      櫳: '栊',
      櫸: '榉',
      櫺: '棂',
      櫻: '樱',
      欄: '栏',
      權: '权',
      欏: '椤',
      欒: '栾',
      欓: '𣗋',
      欖: '榄',
      欞: '棂',
      欵: '款',
      欽: '钦',
      歎: '叹',
      歐: '欧',
      歛: '敛',
      歟: '欤',
      歡: '欢',
      歲: '岁',
      歷: '历',
      歸: '归',
      歿: '殁',
      殘: '残',
      殞: '殒',
      殤: '殇',
      殨: '㱮',
      殫: '殚',
      殮: '殓',
      殯: '殡',
      殰: '㱩',
      殲: '歼',
      殺: '杀',
      殼: '壳',
      毀: '毁',
      毆: '殴',
      毬: '球',
      毿: '毵',
      氂: '牦',
      氈: '毡',
      氌: '氇',
      氣: '气',
      氫: '氢',
      氬: '氩',
      氳: '氲',
      氹: '凼',
      氾: '泛',
      汎: '泛',
      汙: '污',
      決: '决',
      沍: '冱',
      沒: '没',
      沖: '冲',
      況: '况',
      洩: '泄',
      洶: '汹',
      浹: '浃',
      浿: '𬇙',
      涇: '泾',
      涼: '凉',
      淒: '凄',
      淚: '泪',
      淥: '渌',
      淨: '净',
      淪: '沦',
      淵: '渊',
      淶: '涞',
      淺: '浅',
      渙: '涣',
      減: '减',
      渢: '沨',
      渦: '涡',
      測: '测',
      渾: '浑',
      湊: '凑',
      湋: '𣲗',
      湞: '浈',
      湧: '涌',
      湯: '汤',
      溈: '沩',
      準: '准',
      溝: '沟',
      溫: '温',
      溮: '浉',
      溳: '涢',
      溼: '湿',
      滄: '沧',
      滅: '灭',
      滌: '涤',
      滎: '荥',
      滬: '沪',
      滯: '滞',
      滲: '渗',
      滷: '卤',
      滸: '浒',
      滻: '浐',
      滾: '滚',
      滿: '满',
      漁: '渔',
      漊: '溇',
      漍: '𬇹',
      漚: '沤',
      漢: '汉',
      漣: '涟',
      漬: '渍',
      漲: '涨',
      漵: '溆',
      漸: '渐',
      漿: '浆',
      潁: '颍',
      潑: '泼',
      潔: '洁',
      潕: '𣲘',
      潙: '沩',
      潛: '潜',
      潤: '润',
      潯: '浔',
      潰: '溃',
      潷: '滗',
      潿: '涠',
      澀: '涩',
      澆: '浇',
      澇: '涝',
      澐: '沄',
      澗: '涧',
      澠: '渑',
      澤: '泽',
      澦: '滪',
      澩: '泶',
      澫: '𬇕',
      澮: '浍',
      澱: '淀',
      濁: '浊',
      濃: '浓',
      濆: '𣸣',
      濕: '湿',
      濘: '泞',
      濚: '溁',
      濜: '浕',
      濟: '济',
      濤: '涛',
      濫: '滥',
      濬: '浚',
      濰: '潍',
      濱: '滨',
      濺: '溅',
      濼: '泺',
      濾: '滤',
      瀂: '澛',
      瀅: '滢',
      瀆: '渎',
      瀇: '㲿',
      瀉: '泻',
      瀋: '沈',
      瀏: '浏',
      瀕: '濒',
      瀘: '泸',
      瀝: '沥',
      瀟: '潇',
      瀠: '潆',
      瀦: '潴',
      瀧: '泷',
      瀨: '濑',
      瀰: '弥',
      瀲: '潋',
      瀾: '澜',
      灃: '沣',
      灄: '滠',
      灑: '洒',
      灕: '漓',
      灘: '滩',
      灝: '灏',
      灠: '漤',
      灣: '湾',
      灤: '滦',
      灧: '滟',
      災: '灾',
      為: '为',
      烏: '乌',
      烴: '烃',
      無: '无',
      煉: '炼',
      煒: '炜',
      煙: '烟',
      煢: '茕',
      煥: '焕',
      煩: '烦',
      煬: '炀',
      煱: '㶽',
      熅: '煴',
      熒: '荧',
      熗: '炝',
      熰: '𬉼',
      熱: '热',
      熲: '颎',
      熾: '炽',
      燀: '𬊤',
      燁: '烨',
      燄: '焰',
      燈: '灯',
      燉: '炖',
      燐: '磷',
      燒: '烧',
      燖: '𬊈',
      燙: '烫',
      燜: '焖',
      營: '营',
      燦: '灿',
      燬: '毁',
      燭: '烛',
      燴: '烩',
      燶: '㶶',
      燻: '熏',
      燼: '烬',
      燾: '焘',
      燿: '耀',
      爍: '烁',
      爐: '炉',
      爛: '烂',
      爭: '争',
      爲: '为',
      爺: '爷',
      爾: '尔',
      牀: '床',
      牆: '墙',
      牋: '笺',
      牘: '牍',
      牽: '牵',
      犖: '荦',
      犢: '犊',
      犧: '牺',
      狀: '状',
      狹: '狭',
      狽: '狈',
      猙: '狰',
      猶: '犹',
      猻: '狲',
      獁: '犸',
      獃: '呆',
      獄: '狱',
      獅: '狮',
      獎: '奖',
      獨: '独',
      獪: '狯',
      獫: '猃',
      獮: '狝',
      獰: '狞',
      獱: '㺍',
      獲: '获',
      獵: '猎',
      獷: '犷',
      獸: '兽',
      獺: '獭',
      獻: '献',
      獼: '猕',
      玀: '猡',
      現: '现',
      琺: '珐',
      琿: '珲',
      瑋: '玮',
      瑒: '玚',
      瑣: '琐',
      瑤: '瑶',
      瑩: '莹',
      瑪: '玛',
      瑯: '琅',
      瑲: '玱',
      璉: '琏',
      璊: '𫞩',
      璕: '𬍤',
      璗: '𬍡',
      璡: '琎',
      璣: '玑',
      璦: '瑷',
      璫: '珰',
      環: '环',
      璵: '玙',
      璽: '玺',
      瓅: '𬍛',
      瓊: '琼',
      瓏: '珑',
      瓔: '璎',
      瓚: '瓒',
      瓛: '𤩽',
      甌: '瓯',
      甕: '瓮',
      產: '产',
      産: '产',
      畝: '亩',
      畢: '毕',
      畫: '画',
      異: '异',
      當: '当',
      疇: '畴',
      疊: '叠',
      痀: '佝',
      痙: '痉',
      痠: '酸',
      痾: '疴',
      瘂: '痖',
      瘋: '疯',
      瘍: '疡',
      瘓: '痪',
      瘞: '瘗',
      瘡: '疮',
      瘧: '疟',
      瘮: '瘆',
      瘲: '疭',
      瘺: '瘘',
      瘻: '瘘',
      療: '疗',
      癆: '痨',
      癇: '痫',
      癉: '瘅',
      癒: '愈',
      癘: '疠',
      癟: '瘪',
      癡: '痴',
      癢: '痒',
      癤: '疖',
      癥: '症',
      癧: '疬',
      癩: '癞',
      癬: '癣',
      癭: '瘿',
      癮: '瘾',
      癰: '痈',
      癱: '瘫',
      癲: '癫',
      發: '发',
      皁: '皂',
      皚: '皑',
      皰: '疱',
      皸: '皲',
      皺: '皱',
      盃: '杯',
      盜: '盗',
      盞: '盏',
      盡: '尽',
      監: '监',
      盤: '盘',
      盧: '卢',
      盪: '荡',
      眞: '真',
      眥: '眦',
      眾: '众',
      睍: '𪾢',
      睏: '困',
      睜: '睁',
      睞: '睐',
      睪: '睾',
      瞇: '眯',
      瞘: '眍',
      瞜: '䁖',
      瞞: '瞒',
      瞭: '了',
      瞶: '瞆',
      瞼: '睑',
      矓: '眬',
      矚: '瞩',
      矯: '矫',
      砲: '炮',
      硏: '研',
      硜: '硁',
      硤: '硖',
      硨: '砗',
      硯: '砚',
      碩: '硕',
      碭: '砀',
      碸: '砜',
      確: '确',
      碼: '码',
      磑: '硙',
      磚: '砖',
      磣: '碜',
      磧: '碛',
      磯: '矶',
      磽: '硗',
      磾: '䃅',
      礄: '硚',
      礆: '硷',
      礎: '础',
      礐: '𬒈',
      礙: '碍',
      礡: '礴',
      礦: '矿',
      礪: '砺',
      礫: '砾',
      礬: '矾',
      礮: '炮',
      礱: '砻',
      祕: '秘',
      祿: '禄',
      禍: '祸',
      禎: '祯',
      禕: '祎',
      禡: '祃',
      禦: '御',
      禪: '禅',
      禮: '礼',
      禰: '祢',
      禱: '祷',
      禿: '秃',
      秈: '籼',
      稅: '税',
      稈: '秆',
      稏: '䅉',
      稜: '棱',
      稟: '禀',
      種: '种',
      稱: '称',
      穀: '谷',
      穇: '䅟',
      穌: '稣',
      積: '积',
      穎: '颖',
      穠: '秾',
      穡: '穑',
      穢: '秽',
      穩: '稳',
      穫: '获',
      穭: '稆',
      窩: '窝',
      窪: '洼',
      窮: '穷',
      窯: '窑',
      窵: '窎',
      窶: '窭',
      窺: '窥',
      竄: '窜',
      竅: '窍',
      竇: '窦',
      竈: '灶',
      竊: '窃',
      竪: '竖',
      競: '竞',
      筆: '笔',
      筍: '笋',
      筧: '笕',
      筴: '䇲',
      箇: '个',
      箋: '笺',
      箎: '篪',
      箏: '筝',
      箝: '钳',
      節: '节',
      範: '范',
      築: '筑',
      篋: '箧',
      篔: '筼',
      篢: '𬕂',
      篤: '笃',
      篩: '筛',
      篳: '筚',
      簀: '箦',
      簆: '筘',
      簍: '篓',
      簞: '箪',
      簡: '简',
      簣: '篑',
      簫: '箫',
      簷: '檐',
      簹: '筜',
      簽: '签',
      簾: '帘',
      籃: '篮',
      籌: '筹',
      籐: '藤',
      籙: '箓',
      籛: '篯',
      籜: '箨',
      籟: '籁',
      籠: '笼',
      籤: '签',
      籩: '笾',
      籪: '簖',
      籬: '篱',
      籮: '箩',
      籲: '吁',
      粧: '妆',
      粵: '粤',
      糝: '糁',
      糞: '粪',
      糧: '粮',
      糰: '团',
      糲: '粝',
      糴: '籴',
      糶: '粜',
      糹: '纟',
      糾: '纠',
      紀: '纪',
      紂: '纣',
      紃: '𬘓',
      約: '约',
      紅: '红',
      紆: '纡',
      紇: '纥',
      紈: '纨',
      紉: '纫',
      紋: '纹',
      納: '纳',
      紐: '纽',
      紓: '纾',
      純: '纯',
      紕: '纰',
      紖: '纼',
      紗: '纱',
      紘: '纮',
      紙: '纸',
      級: '级',
      紛: '纷',
      紜: '纭',
      紝: '纴',
      紞: '𬘘',
      紡: '纺',
      紬: '䌷',
      紮: '扎',
      細: '细',
      紱: '绂',
      紲: '绁',
      紳: '绅',
      紵: '纻',
      紹: '绍',
      紺: '绀',
      紼: '绋',
      紿: '绐',
      絀: '绌',
      終: '终',
      絃: '弦',
      組: '组',
      絅: '䌹',
      絆: '绊',
      絎: '绗',
      結: '结',
      絕: '绝',
      絛: '绦',
      絝: '绔',
      絞: '绞',
      絡: '络',
      絢: '绚',
      給: '给',
      絨: '绒',
      絪: '𬘡',
      絰: '绖',
      統: '统',
      絲: '丝',
      絳: '绛',
      絶: '绝',
      絹: '绢',
      絺: '𫄨',
      綁: '绑',
      綃: '绡',
      綄: '𬘫',
      綆: '绠',
      綈: '绨',
      綉: '绣',
      綌: '绤',
      綎: '𬘩',
      綏: '绥',
      綐: '䌼',
      綑: '捆',
      經: '经',
      綖: '𫄧',
      綜: '综',
      綝: '𬘭',
      綞: '缍',
      綠: '绿',
      綡: '𫟅',
      綢: '绸',
      綣: '绻',
      綧: '𬘯',
      綪: '𬘬',
      綫: '线',
      綬: '绶',
      維: '维',
      綯: '绹',
      綰: '绾',
      綱: '纲',
      網: '网',
      綳: '绷',
      綴: '缀',
      綵: '彩',
      綸: '纶',
      綹: '绺',
      綺: '绮',
      綻: '绽',
      綽: '绰',
      綾: '绫',
      綿: '绵',
      緄: '绲',
      緇: '缁',
      緊: '紧',
      緋: '绯',
      緑: '绿',
      緒: '绪',
      緓: '绬',
      緔: '绱',
      緗: '缃',
      緘: '缄',
      緙: '缂',
      線: '线',
      緝: '缉',
      緞: '缎',
      締: '缔',
      緡: '缗',
      緣: '缘',
      緦: '缌',
      編: '编',
      緩: '缓',
      緬: '缅',
      緯: '纬',
      緱: '缑',
      緲: '缈',
      練: '练',
      緶: '缏',
      緹: '缇',
      緻: '致',
      縈: '萦',
      縉: '缙',
      縊: '缢',
      縋: '缒',
      縐: '绉',
      縑: '缣',
      縕: '缊',
      縗: '缞',
      縛: '缚',
      縝: '缜',
      縞: '缟',
      縟: '缛',
      縣: '县',
      縧: '绦',
      縫: '缝',
      縭: '缡',
      縮: '缩',
      縯: '𬙂',
      縱: '纵',
      縲: '缧',
      縳: '䌸',
      縴: '纤',
      縵: '缦',
      縶: '絷',
      縷: '缕',
      縹: '缥',
      總: '总',
      績: '绩',
      繃: '绷',
      繅: '缫',
      繆: '缪',
      繒: '缯',
      織: '织',
      繕: '缮',
      繚: '缭',
      繞: '绕',
      繡: '绣',
      繢: '缋',
      繩: '绳',
      繪: '绘',
      繫: '系',
      繭: '茧',
      繮: '缰',
      繯: '缳',
      繰: '缲',
      繳: '缴',
      繶: '𫄷',
      繸: '䍁',
      繹: '绎',
      繻: '𦈡',
      繼: '继',
      繽: '缤',
      繾: '缱',
      繿: '䍀',
      纁: '𫄸',
      纆: '𬙊',
      纈: '缬',
      纊: '纩',
      續: '续',
      纍: '累',
      纏: '缠',
      纓: '缨',
      纔: '才',
      纕: '𬙋',
      纖: '纤',
      纘: '缵',
      纜: '缆',
      缽: '钵',
      罃: '䓨',
      罈: '坛',
      罌: '罂',
      罎: '坛',
      罣: '挂',
      罰: '罚',
      罵: '骂',
      罷: '罢',
      羅: '罗',
      羆: '罴',
      羈: '羁',
      羋: '芈',
      羣: '群',
      羥: '羟',
      羨: '羡',
      義: '义',
      羶: '膻',
      習: '习',
      翫: '玩',
      翬: '翚',
      翹: '翘',
      翺: '翱',
      翽: '翙',
      耬: '耧',
      耮: '耢',
      聖: '圣',
      聞: '闻',
      聯: '联',
      聰: '聪',
      聲: '声',
      聳: '耸',
      聵: '聩',
      聶: '聂',
      職: '职',
      聹: '聍',
      聽: '听',
      聾: '聋',
      肅: '肃',
      脅: '胁',
      脈: '脉',
      脛: '胫',
      脣: '唇',
      脫: '脱',
      脹: '胀',
      腎: '肾',
      腖: '胨',
      腡: '脶',
      腦: '脑',
      腫: '肿',
      腳: '脚',
      腸: '肠',
      膃: '腽',
      膕: '腘',
      膚: '肤',
      膞: '䏝',
      膠: '胶',
      膢: '𦝼',
      膩: '腻',
      膽: '胆',
      膾: '脍',
      膿: '脓',
      臉: '脸',
      臍: '脐',
      臏: '膑',
      臘: '腊',
      臚: '胪',
      臟: '脏',
      臠: '脔',
      臢: '臜',
      臥: '卧',
      臨: '临',
      臺: '台',
      與: '与',
      興: '兴',
      舉: '举',
      舊: '旧',
      舖: '铺',
      艙: '舱',
      艤: '舣',
      艦: '舰',
      艫: '舻',
      艱: '艰',
      艷: '艳',
      芻: '刍',
      苎: '苧',
      苧: '苎',
      茲: '兹',
      荊: '荆',
      荳: '豆',
      莊: '庄',
      莖: '茎',
      莢: '荚',
      莧: '苋',
      菓: '果',
      華: '华',
      菸: '烟',
      萇: '苌',
      萊: '莱',
      萬: '万',
      萵: '莴',
      葉: '叶',
      葒: '荭',
      著: '着',
      葤: '荮',
      葦: '苇',
      葯: '药',
      葷: '荤',
      蒍: '𫇭',
      蒐: '搜',
      蒓: '莼',
      蒔: '莳',
      蒞: '莅',
      蒼: '苍',
      蓀: '荪',
      蓆: '席',
      蓋: '盖',
      蓮: '莲',
      蓯: '苁',
      蓽: '荜',
      蔄: '𬜬',
      蔔: '卜',
      蔞: '蒌',
      蔣: '蒋',
      蔥: '葱',
      蔦: '茑',
      蔭: '荫',
      蔴: '麻',
      蔿: '𫇭',
      蕁: '荨',
      蕆: '蒇',
      蕎: '荞',
      蕒: '荬',
      蕓: '芸',
      蕕: '莸',
      蕘: '荛',
      蕢: '蒉',
      蕩: '荡',
      蕪: '芜',
      蕭: '萧',
      蕷: '蓣',
      薀: '蕰',
      薈: '荟',
      薊: '蓟',
      薌: '芗',
      薑: '姜',
      薔: '蔷',
      薘: '荙',
      薟: '莶',
      薦: '荐',
      薩: '萨',
      薳: '䓕',
      薴: '苧',
      薺: '荠',
      藉: '借',
      藍: '蓝',
      藎: '荩',
      藝: '艺',
      藥: '药',
      藪: '薮',
      藭: '䓖',
      藴: '蕴',
      藶: '苈',
      藷: '薯',
      藹: '蔼',
      藺: '蔺',
      蘀: '萚',
      蘄: '蕲',
      蘆: '芦',
      蘇: '苏',
      蘊: '蕴',
      蘋: '苹',
      蘚: '藓',
      蘞: '蔹',
      蘢: '茏',
      蘭: '兰',
      蘺: '蓠',
      蘿: '萝',
      虆: '蔂',
      虉: '𬟁',
      處: '处',
      虛: '虚',
      虜: '虏',
      號: '号',
      虧: '亏',
      虯: '虬',
      蛺: '蛱',
      蛻: '蜕',
      蜆: '蚬',
      蝀: '𬟽',
      蝕: '蚀',
      蝟: '猬',
      蝦: '虾',
      蝨: '虱',
      蝸: '蜗',
      螄: '蛳',
      螞: '蚂',
      螢: '萤',
      螮: '䗖',
      螻: '蝼',
      螿: '螀',
      蟄: '蛰',
      蟈: '蝈',
      蟎: '螨',
      蟣: '虮',
      蟬: '蝉',
      蟯: '蛲',
      蟲: '虫',
      蟶: '蛏',
      蟻: '蚁',
      蠅: '蝇',
      蠆: '虿',
      蠍: '蝎',
      蠐: '蛴',
      蠑: '蝾',
      蠔: '蚝',
      蠟: '蜡',
      蠣: '蛎',
      蠧: '蠹',
      蠨: '蟏',
      蠱: '蛊',
      蠶: '蚕',
      蠻: '蛮',
      衆: '众',
      衊: '蔑',
      術: '术',
      衚: '胡',
      衛: '卫',
      衝: '冲',
      袞: '衮',
      袴: '绔',
      裊: '袅',
      裏: '里',
      補: '补',
      裝: '装',
      裡: '里',
      製: '制',
      複: '复',
      褌: '裈',
      褘: '袆',
      褲: '裤',
      褳: '裢',
      褸: '褛',
      褻: '亵',
      襀: '𫌀',
      襇: '裥',
      襏: '袯',
      襖: '袄',
      襝: '裣',
      襠: '裆',
      襤: '褴',
      襪: '袜',
      襬: '䙓',
      襯: '衬',
      襲: '袭',
      襴: '襕',
      覈: '核',
      見: '见',
      覎: '觃',
      規: '规',
      覓: '觅',
      視: '视',
      覘: '觇',
      覡: '觋',
      覥: '觍',
      覦: '觎',
      親: '亲',
      覬: '觊',
      覯: '觏',
      覲: '觐',
      覷: '觑',
      覺: '觉',
      覽: '览',
      覿: '觌',
      觀: '观',
      觴: '觞',
      觶: '觯',
      觸: '触',
      訁: '讠',
      訂: '订',
      訃: '讣',
      計: '计',
      訊: '讯',
      訌: '讧',
      討: '讨',
      訏: '𬣙',
      訐: '讦',
      訒: '讱',
      訓: '训',
      訕: '讪',
      訖: '讫',
      託: '托',
      記: '记',
      訛: '讹',
      訝: '讶',
      訟: '讼',
      訢: '䜣',
      訣: '诀',
      訥: '讷',
      訩: '讻',
      訪: '访',
      設: '设',
      許: '许',
      訴: '诉',
      訶: '诃',
      診: '诊',
      註: '注',
      証: '证',
      詁: '诂',
      詆: '诋',
      詎: '讵',
      詐: '诈',
      詒: '诒',
      詔: '诏',
      評: '评',
      詖: '诐',
      詗: '诇',
      詘: '诎',
      詛: '诅',
      詝: '𬣞',
      詞: '词',
      詠: '咏',
      詡: '诩',
      詢: '询',
      詣: '诣',
      試: '试',
      詩: '诗',
      詪: '𬣳',
      詫: '诧',
      詬: '诟',
      詭: '诡',
      詮: '诠',
      詰: '诘',
      話: '话',
      該: '该',
      詳: '详',
      詵: '诜',
      詷: '𫍣',
      詼: '诙',
      詿: '诖',
      誄: '诔',
      誅: '诛',
      誆: '诓',
      誇: '夸',
      誌: '志',
      認: '认',
      誑: '诳',
      誒: '诶',
      誕: '诞',
      誘: '诱',
      誚: '诮',
      語: '语',
      誠: '诚',
      誡: '诫',
      誣: '诬',
      誤: '误',
      誥: '诰',
      誦: '诵',
      誨: '诲',
      說: '说',
      説: '说',
      誰: '谁',
      課: '课',
      誶: '谇',
      誹: '诽',
      誼: '谊',
      誾: '訚',
      調: '调',
      諂: '谄',
      諄: '谆',
      談: '谈',
      諉: '诿',
      請: '请',
      諍: '诤',
      諏: '诹',
      諑: '诼',
      諒: '谅',
      諓: '𬣡',
      論: '论',
      諗: '谂',
      諛: '谀',
      諜: '谍',
      諝: '谞',
      諞: '谝',
      諟: '𬤊',
      諡: '谥',
      諢: '诨',
      諤: '谔',
      諦: '谛',
      諧: '谐',
      諫: '谏',
      諭: '谕',
      諮: '谘',
      諱: '讳',
      諲: '𬤇',
      諳: '谙',
      諴: '𫍯',
      諶: '谌',
      諷: '讽',
      諸: '诸',
      諺: '谚',
      諼: '谖',
      諾: '诺',
      謀: '谋',
      謁: '谒',
      謂: '谓',
      謄: '誊',
      謅: '诌',
      謊: '谎',
      謎: '谜',
      謏: '𫍲',
      謐: '谧',
      謔: '谑',
      謖: '谡',
      謗: '谤',
      謙: '谦',
      謚: '谥',
      講: '讲',
      謝: '谢',
      謠: '谣',
      謡: '谣',
      謨: '谟',
      謫: '谪',
      謬: '谬',
      謭: '谫',
      謳: '讴',
      謹: '谨',
      謾: '谩',
      譁: '哗',
      譅: '䜧',
      證: '证',
      譎: '谲',
      譏: '讥',
      譓: '𬤝',
      譖: '谮',
      識: '识',
      譙: '谯',
      譚: '谭',
      譜: '谱',
      譞: '𫍽',
      譟: '噪',
      譫: '谵',
      譯: '译',
      議: '议',
      譴: '谴',
      護: '护',
      譸: '诪',
      譽: '誉',
      譾: '谫',
      讀: '读',
      變: '变',
      讋: '詟',
      讌: '䜩',
      讎: '雠',
      讒: '谗',
      讓: '让',
      讕: '谰',
      讖: '谶',
      讚: '赞',
      讜: '谠',
      讞: '谳',
      豈: '岂',
      豎: '竖',
      豐: '丰',
      豔: '艳',
      豬: '猪',
      豶: '豮',
      貍: '狸',
      貓: '猫',
      貙: '䝙',
      貝: '贝',
      貞: '贞',
      貟: '贠',
      負: '负',
      財: '财',
      貢: '贡',
      貧: '贫',
      貨: '货',
      販: '贩',
      貪: '贪',
      貫: '贯',
      責: '责',
      貯: '贮',
      貰: '贳',
      貲: '赀',
      貳: '贰',
      貴: '贵',
      貶: '贬',
      買: '买',
      貸: '贷',
      貺: '贶',
      費: '费',
      貼: '贴',
      貽: '贻',
      貿: '贸',
      賀: '贺',
      賁: '贲',
      賂: '赂',
      賃: '赁',
      賄: '贿',
      賅: '赅',
      資: '资',
      賈: '贾',
      賊: '贼',
      賑: '赈',
      賒: '赊',
      賓: '宾',
      賕: '赇',
      賙: '赒',
      賚: '赉',
      賜: '赐',
      賞: '赏',
      賠: '赔',
      賡: '赓',
      賢: '贤',
      賣: '卖',
      賤: '贱',
      賦: '赋',
      賧: '赕',
      質: '质',
      賫: '赍',
      賬: '账',
      賭: '赌',
      賰: '䞐',
      賴: '赖',
      賵: '赗',
      賸: '剩',
      賺: '赚',
      賻: '赙',
      購: '购',
      賽: '赛',
      賾: '赜',
      贄: '贽',
      贅: '赘',
      贇: '赟',
      贈: '赠',
      贊: '赞',
      贋: '赝',
      贍: '赡',
      贏: '赢',
      贐: '赆',
      贓: '赃',
      贔: '赑',
      贖: '赎',
      贗: '赝',
      贛: '赣',
      贜: '赃',
      赬: '赪',
      趕: '赶',
      趙: '赵',
      趨: '趋',
      趲: '趱',
      跡: '迹',
      跤: '交',
      跼: '局',
      踐: '践',
      踡: '蜷',
      踰: '逾',
      踴: '踊',
      蹌: '跄',
      蹕: '跸',
      蹟: '迹',
      蹣: '蹒',
      蹤: '踪',
      蹧: '糟',
      蹺: '跷',
      躂: '跶',
      躉: '趸',
      躊: '踌',
      躋: '跻',
      躍: '跃',
      躑: '踯',
      躒: '跞',
      躓: '踬',
      躕: '蹰',
      躚: '跹',
      躡: '蹑',
      躥: '蹿',
      躦: '躜',
      躪: '躏',
      軀: '躯',
      車: '车',
      軋: '轧',
      軌: '轨',
      軍: '军',
      軏: '𫐄',
      軑: '轪',
      軒: '轩',
      軔: '轫',
      軛: '轭',
      軝: '𬨂',
      軟: '软',
      軤: '轷',
      軫: '轸',
      軲: '轱',
      軸: '轴',
      軹: '轵',
      軺: '轺',
      軻: '轲',
      軼: '轶',
      軾: '轼',
      較: '较',
      輄: '𨐈',
      輅: '辂',
      輇: '辁',
      輈: '辀',
      載: '载',
      輊: '轾',
      輋: '𪨶',
      輒: '辄',
      輓: '挽',
      輔: '辅',
      輕: '轻',
      輗: '𫐐',
      輛: '辆',
      輜: '辎',
      輝: '辉',
      輞: '辋',
      輟: '辍',
      輥: '辊',
      輦: '辇',
      輩: '辈',
      輪: '轮',
      輬: '辌',
      輮: '𫐓',
      輯: '辑',
      輳: '辏',
      輶: '𬨎',
      輸: '输',
      輻: '辐',
      輾: '辗',
      輿: '舆',
      轀: '辒',
      轂: '毂',
      轄: '辖',
      轅: '辕',
      轆: '辘',
      轉: '转',
      轍: '辙',
      轎: '轿',
      轔: '辚',
      轝: '舆',
      轟: '轰',
      轡: '辔',
      轢: '轹',
      轤: '轳',
      辦: '办',
      辭: '辞',
      辮: '辫',
      辯: '辩',
      農: '农',
      迴: '回',
      逕: '迳',
      這: '这',
      連: '连',
      週: '周',
      進: '进',
      遊: '游',
      運: '运',
      過: '过',
      達: '达',
      違: '违',
      遙: '遥',
      遜: '逊',
      遞: '递',
      遠: '远',
      適: '适',
      遯: '遁',
      遲: '迟',
      遷: '迁',
      選: '选',
      遺: '遗',
      遼: '辽',
      邁: '迈',
      還: '还',
      邇: '迩',
      邊: '边',
      邏: '逻',
      邐: '逦',
      郟: '郏',
      郵: '邮',
      鄆: '郓',
      鄉: '乡',
      鄒: '邹',
      鄔: '邬',
      鄖: '郧',
      鄧: '邓',
      鄩: '𬩽',
      鄭: '郑',
      鄰: '邻',
      鄲: '郸',
      鄳: '𫑡',
      鄴: '邺',
      鄶: '郐',
      鄺: '邝',
      酇: '酂',
      酈: '郦',
      醃: '腌',
      醖: '酝',
      醜: '丑',
      醞: '酝',
      醫: '医',
      醬: '酱',
      醱: '酦',
      醲: '𬪩',
      醼: '宴',
      釀: '酿',
      釁: '衅',
      釃: '酾',
      釅: '酽',
      釋: '释',
      釐: '厘',
      釒: '钅',
      釓: '钆',
      釔: '钇',
      釕: '钌',
      釗: '钊',
      釘: '钉',
      釙: '钋',
      針: '针',
      釣: '钓',
      釤: '钐',
      釦: '扣',
      釧: '钏',
      釩: '钒',
      釴: '𬬩',
      釵: '钗',
      釷: '钍',
      釹: '钕',
      釺: '钎',
      釿: '𬬱',
      鈀: '钯',
      鈁: '钫',
      鈃: '钘',
      鈄: '钭',
      鈇: '𫓧',
      鈈: '钚',
      鈉: '钠',
      鈍: '钝',
      鈎: '钩',
      鈐: '钤',
      鈑: '钣',
      鈒: '钑',
      鈔: '钞',
      鈕: '钮',
      鈞: '钧',
      鈣: '钙',
      鈥: '钬',
      鈦: '钛',
      鈧: '钪',
      鈮: '铌',
      鈰: '铈',
      鈳: '钶',
      鈴: '铃',
      鈷: '钴',
      鈸: '钹',
      鈹: '铍',
      鈺: '钰',
      鈽: '钸',
      鈾: '铀',
      鈿: '钿',
      鉀: '钾',
      鉅: '钜',
      鉈: '铊',
      鉉: '铉',
      鉊: '𬬿',
      鉋: '铇',
      鉍: '铋',
      鉑: '铂',
      鉕: '钷',
      鉗: '钳',
      鉚: '铆',
      鉛: '铅',
      鉝: '𫟷',
      鉞: '钺',
      鉢: '钵',
      鉤: '钩',
      鉥: '𬬸',
      鉦: '钲',
      鉧: '𬭁',
      鉨: '鿭',
      鉬: '钼',
      鉭: '钽',
      鉮: '𬬹',
      鉶: '铏',
      鉷: '𫟹',
      鉸: '铰',
      鉺: '铒',
      鉻: '铬',
      鉿: '铪',
      銀: '银',
      銃: '铳',
      銅: '铜',
      銈: '𫓯',
      銍: '铚',
      銑: '铣',
      銓: '铨',
      銖: '铢',
      銘: '铭',
      銚: '铫',
      銛: '铦',
      銜: '衔',
      銠: '铑',
      銣: '铷',
      銥: '铱',
      銦: '铟',
      銨: '铵',
      銩: '铥',
      銪: '铕',
      銫: '铯',
      銬: '铐',
      銱: '铞',
      銲: '焊',
      銳: '锐',
      銶: '𨱇',
      銷: '销',
      銹: '锈',
      銻: '锑',
      銼: '锉',
      鋁: '铝',
      鋃: '锒',
      鋅: '锌',
      鋇: '钡',
      鋌: '铤',
      鋏: '铗',
      鋐: '𬭎',
      鋒: '锋',
      鋗: '𫓶',
      鋙: '铻',
      鋝: '锊',
      鋟: '锓',
      鋣: '铘',
      鋤: '锄',
      鋥: '锃',
      鋦: '锔',
      鋨: '锇',
      鋩: '铓',
      鋪: '铺',
      鋭: '锐',
      鋮: '铖',
      鋯: '锆',
      鋰: '锂',
      鋱: '铽',
      鋶: '锍',
      鋸: '锯',
      鋹: '𬬮',
      鋼: '钢',
      錀: '𬬭',
      錁: '锞',
      錄: '录',
      錆: '锖',
      錇: '锫',
      錈: '锩',
      錏: '铔',
      錐: '锥',
      錒: '锕',
      錕: '锟',
      錘: '锤',
      錙: '锱',
      錚: '铮',
      錛: '锛',
      錞: '𬭚',
      錟: '锬',
      錠: '锭',
      錡: '锜',
      錢: '钱',
      錤: '𫓹',
      錦: '锦',
      錨: '锚',
      錩: '锠',
      錫: '锡',
      錮: '锢',
      錯: '错',
      録: '录',
      錳: '锰',
      錶: '表',
      錸: '铼',
      鍀: '锝',
      鍁: '锨',
      鍃: '锪',
      鍆: '钔',
      鍇: '锴',
      鍈: '锳',
      鍊: '炼',
      鍋: '锅',
      鍍: '镀',
      鍔: '锷',
      鍘: '铡',
      鍚: '钖',
      鍛: '锻',
      鍠: '锽',
      鍤: '锸',
      鍥: '锲',
      鍩: '锘',
      鍬: '锹',
      鍭: '𬭤',
      鍰: '锾',
      鍵: '键',
      鍶: '锶',
      鍺: '锗',
      鍾: '钟',
      鎂: '镁',
      鎄: '锿',
      鎇: '镅',
      鎊: '镑',
      鎓: '𬭩',
      鎔: '镕',
      鎖: '锁',
      鎗: '枪',
      鎘: '镉',
      鎚: '锤',
      鎛: '镈',
      鎝: '𨱏',
      鎡: '镃',
      鎢: '钨',
      鎣: '蓥',
      鎦: '镏',
      鎧: '铠',
      鎩: '铩',
      鎪: '锼',
      鎬: '镐',
      鎮: '镇',
      鎰: '镒',
      鎲: '镋',
      鎳: '镍',
      鎵: '镓',
      鎶: '鿔',
      鎸: '镌',
      鎿: '镎',
      鏃: '镞',
      鏇: '镟',
      鏈: '链',
      鏌: '镆',
      鏍: '镙',
      鏏: '𬭬',
      鏐: '镠',
      鏑: '镝',
      鏗: '铿',
      鏘: '锵',
      鏜: '镗',
      鏝: '镘',
      鏞: '镛',
      鏟: '铲',
      鏡: '镜',
      鏢: '镖',
      鏤: '镂',
      鏨: '錾',
      鏰: '镚',
      鏵: '铧',
      鏷: '镤',
      鏹: '镪',
      鏺: '䥽',
      鏻: '𬭸',
      鏽: '锈',
      鐃: '铙',
      鐄: '𨱑',
      鐇: '𫔍',
      鐋: '铴',
      鐍: '𫔎',
      鐏: '𨱔',
      鐐: '镣',
      鐒: '铹',
      鐓: '镦',
      鐔: '镡',
      鐘: '钟',
      鐙: '镫',
      鐝: '镢',
      鐠: '镨',
      鐦: '锎',
      鐧: '锏',
      鐨: '镄',
      鐩: '𬭼',
      鐫: '镌',
      鐮: '镰',
      鐯: '䦃',
      鐲: '镯',
      鐳: '镭',
      鐵: '铁',
      鐶: '镮',
      鐸: '铎',
      鐺: '铛',
      鐽: '𫟼',
      鐿: '镱',
      鑄: '铸',
      鑈: '鿭',
      鑊: '镬',
      鑌: '镔',
      鑑: '鉴',
      鑒: '鉴',
      鑔: '镲',
      鑕: '锧',
      鑞: '镴',
      鑠: '铄',
      鑣: '镳',
      鑥: '镥',
      鑪: '𬬻',
      鑭: '镧',
      鑰: '钥',
      鑱: '镵',
      鑲: '镶',
      鑷: '镊',
      鑹: '镩',
      鑼: '锣',
      鑽: '钻',
      鑾: '銮',
      鑿: '凿',
      钁: '䦆',
      長: '长',
      門: '门',
      閂: '闩',
      閃: '闪',
      閆: '闫',
      閈: '闬',
      閉: '闭',
      開: '开',
      閌: '闶',
      閎: '闳',
      閏: '闰',
      閑: '闲',
      閒: '闲',
      間: '间',
      閔: '闵',
      閘: '闸',
      閡: '阂',
      関: '关',
      閣: '阁',
      閥: '阀',
      閧: '哄',
      閨: '闺',
      閩: '闽',
      閫: '阃',
      閬: '阆',
      閭: '闾',
      閱: '阅',
      閲: '阅',
      閶: '阊',
      閹: '阉',
      閻: '阎',
      閼: '阏',
      閽: '阍',
      閾: '阈',
      閿: '阌',
      闃: '阒',
      闆: '板',
      闇: '暗',
      闈: '闱',
      闉: '𬮱',
      闊: '阔',
      闋: '阕',
      闌: '阑',
      闍: '阇',
      闐: '阗',
      闑: '𫔶',
      闒: '阘',
      闓: '闿',
      闔: '阖',
      闕: '阙',
      闖: '闯',
      闘: '斗',
      關: '关',
      闞: '阚',
      闠: '阓',
      闡: '阐',
      闢: '辟',
      闤: '阛',
      闥: '闼',
      阨: '厄',
      阪: '坂',
      陘: '陉',
      陝: '陕',
      陞: '升',
      陣: '阵',
      陰: '阴',
      陳: '陈',
      陸: '陆',
      陽: '阳',
      隄: '堤',
      隉: '陧',
      隊: '队',
      階: '阶',
      隑: '𬮿',
      隕: '陨',
      際: '际',
      隤: '𬯎',
      隨: '随',
      險: '险',
      隮: '𬯀',
      隱: '隐',
      隴: '陇',
      隸: '隶',
      隻: '只',
      雋: '隽',
      雖: '虽',
      雙: '双',
      雛: '雏',
      雜: '杂',
      雞: '鸡',
      離: '离',
      難: '难',
      雲: '云',
      電: '电',
      霑: '沾',
      霢: '霡',
      霧: '雾',
      霽: '霁',
      靂: '雳',
      靄: '霭',
      靆: '叇',
      靈: '灵',
      靉: '叆',
      靚: '靓',
      靜: '静',
      靦: '腼',
      靨: '靥',
      靷: '纼',
      鞀: '鼗',
      鞏: '巩',
      鞝: '绱',
      鞽: '鞒',
      韁: '缰',
      韃: '鞑',
      韉: '鞯',
      韋: '韦',
      韌: '韧',
      韍: '韨',
      韓: '韩',
      韙: '韪',
      韜: '韬',
      韞: '韫',
      韡: '𮧵',
      韮: '韭',
      韻: '韵',
      響: '响',
      頁: '页',
      頂: '顶',
      頃: '顷',
      項: '项',
      順: '顺',
      頇: '顸',
      須: '须',
      頊: '顼',
      頌: '颂',
      頍: '𫠆',
      頎: '颀',
      頏: '颃',
      預: '预',
      頑: '顽',
      頒: '颁',
      頓: '顿',
      頔: '𬱖',
      頗: '颇',
      領: '领',
      頜: '颌',
      頠: '𬱟',
      頡: '颉',
      頤: '颐',
      頦: '颏',
      頫: '𫖯',
      頭: '头',
      頮: '颒',
      頰: '颊',
      頲: '颋',
      頴: '颕',
      頵: '𫖳',
      頷: '颔',
      頸: '颈',
      頹: '颓',
      頻: '频',
      頽: '颓',
      顆: '颗',
      題: '题',
      額: '额',
      顎: '颚',
      顏: '颜',
      顒: '颙',
      顓: '颛',
      顔: '颜',
      顗: '𫖮',
      願: '愿',
      顙: '颡',
      顛: '颠',
      類: '类',
      顢: '颟',
      顥: '颢',
      顧: '顾',
      顫: '颤',
      顬: '颥',
      顯: '显',
      顰: '颦',
      顱: '颅',
      顳: '颞',
      顴: '颧',
      風: '风',
      颭: '飐',
      颮: '飑',
      颯: '飒',
      颱: '台',
      颳: '刮',
      颶: '飓',
      颸: '飔',
      颺: '飏',
      颻: '飖',
      颼: '飕',
      飀: '飗',
      飄: '飘',
      飆: '飙',
      飈: '飚',
      飛: '飞',
      飠: '饣',
      飢: '饥',
      飣: '饤',
      飥: '饦',
      飩: '饨',
      飪: '饪',
      飫: '饫',
      飭: '饬',
      飯: '饭',
      飲: '饮',
      飴: '饴',
      飼: '饲',
      飽: '饱',
      飾: '饰',
      飿: '饳',
      餃: '饺',
      餄: '饸',
      餅: '饼',
      餉: '饷',
      養: '养',
      餌: '饵',
      餎: '饹',
      餏: '饻',
      餑: '饽',
      餒: '馁',
      餓: '饿',
      餕: '馂',
      餖: '饾',
      餗: '𫗧',
      餘: '余',
      餚: '肴',
      餛: '馄',
      餜: '馃',
      餞: '饯',
      餡: '馅',
      館: '馆',
      餬: '糊',
      餱: '糇',
      餳: '饧',
      餵: '喂',
      餶: '馉',
      餷: '馇',
      餺: '馎',
      餼: '饩',
      餽: '馈',
      餾: '馏',
      餿: '馊',
      饁: '馌',
      饃: '馍',
      饅: '馒',
      饈: '馐',
      饉: '馑',
      饊: '馓',
      饋: '馈',
      饌: '馔',
      饑: '饥',
      饒: '饶',
      饗: '飨',
      饘: '𫗴',
      饜: '餍',
      饞: '馋',
      饢: '馕',
      馬: '马',
      馭: '驭',
      馮: '冯',
      馱: '驮',
      馳: '驰',
      馴: '驯',
      馹: '驲',
      馼: '𫘜',
      駁: '驳',
      駃: '𫘝',
      駉: '𬳶',
      駐: '驻',
      駑: '驽',
      駒: '驹',
      駓: '𬳵',
      駔: '驵',
      駕: '驾',
      駘: '骀',
      駙: '驸',
      駛: '驶',
      駝: '驼',
      駟: '驷',
      駡: '骂',
      駢: '骈',
      駪: '𬳽',
      駭: '骇',
      駰: '骃',
      駱: '骆',
      駸: '骎',
      駼: '𬳿',
      駿: '骏',
      騁: '骋',
      騂: '骍',
      騄: '𫘧',
      騅: '骓',
      騊: '𫘦',
      騌: '骔',
      騍: '骒',
      騎: '骑',
      騏: '骐',
      騑: '𬴂',
      騖: '骛',
      騙: '骗',
      騞: '𬴃',
      騠: '𫘨',
      騤: '骙',
      騧: '䯄',
      騫: '骞',
      騭: '骘',
      騮: '骝',
      騰: '腾',
      騱: '𫘬',
      騵: '𫘪',
      騶: '驺',
      騷: '骚',
      騸: '骟',
      騾: '骡',
      驀: '蓦',
      驁: '骜',
      驂: '骖',
      驃: '骠',
      驄: '骢',
      驅: '驱',
      驊: '骅',
      驌: '骕',
      驍: '骁',
      驎: '𬴊',
      驏: '骣',
      驕: '骄',
      驗: '验',
      驚: '惊',
      驛: '驿',
      驟: '骤',
      驢: '驴',
      驤: '骧',
      驥: '骥',
      驦: '骦',
      驪: '骊',
      驫: '骉',
      骯: '肮',
      髏: '髅',
      髒: '脏',
      體: '体',
      髕: '髌',
      髖: '髋',
      髮: '发',
      鬀: '剃',
      鬆: '松',
      鬍: '胡',
      鬚: '须',
      鬢: '鬓',
      鬥: '斗',
      鬧: '闹',
      鬨: '哄',
      鬩: '阋',
      鬭: '斗',
      鬮: '阄',
      鬱: '郁',
      鬹: '鬶',
      魎: '魉',
      魘: '魇',
      魚: '鱼',
      魛: '鱽',
      魢: '鱾',
      魨: '鲀',
      魯: '鲁',
      魴: '鲂',
      魷: '鱿',
      魺: '鲄',
      鮀: '𬶍',
      鮁: '鲅',
      鮃: '鲆',
      鮆: '𫚖',
      鮈: '𬶋',
      鮊: '鲌',
      鮋: '鲉',
      鮍: '鲏',
      鮎: '鲇',
      鮐: '鲐',
      鮑: '鲍',
      鮒: '鲋',
      鮓: '鲊',
      鮚: '鲒',
      鮜: '鲘',
      鮝: '鲞',
      鮞: '鲕',
      鮟: '𩽾',
      鮠: '𬶏',
      鮡: '𬶐',
      鮣: '䲟',
      鮦: '鲖',
      鮪: '鲔',
      鮫: '鲛',
      鮭: '鲑',
      鮮: '鲜',
      鮳: '鲓',
      鮶: '鲪',
      鮸: '𩾃',
      鮺: '鲝',
      鯀: '鲧',
      鯁: '鲠',
      鯇: '鲩',
      鯉: '鲤',
      鯊: '鲨',
      鯒: '鲬',
      鯔: '鲻',
      鯕: '鲯',
      鯖: '鲭',
      鯛: '鲷',
      鯝: '鲴',
      鯡: '鲱',
      鯢: '鲵',
      鯤: '鲲',
      鯧: '鲳',
      鯨: '鲸',
      鯪: '鲮',
      鯫: '鲰',
      鯰: '鲶',
      鯴: '鲺',
      鯷: '鳀',
      鯻: '𬶟',
      鯽: '鲫',
      鯿: '鳊',
      鰁: '鳈',
      鰂: '鲗',
      鰃: '鳂',
      鰆: '䲠',
      鰈: '鲽',
      鰉: '鳇',
      鰊: '𬶠',
      鰍: '鳅',
      鰏: '鲾',
      鰐: '鳄',
      鰒: '鳆',
      鰓: '鳃',
      鰜: '鳒',
      鰟: '鳑',
      鰠: '鳋',
      鰣: '鲥',
      鰤: '𫚕',
      鰥: '鳏',
      鰧: '䲢',
      鰨: '鳎',
      鰩: '鳐',
      鰭: '鳍',
      鰮: '鳁',
      鰱: '鲢',
      鰲: '鳌',
      鰳: '鳓',
      鰵: '鳘',
      鰶: '𬶭',
      鰷: '鲦',
      鰹: '鲣',
      鰺: '鲹',
      鰻: '鳗',
      鰼: '鳛',
      鰾: '鳔',
      鱀: '𬶨',
      鱂: '鳉',
      鱅: '鳙',
      鱇: '𩾌',
      鱈: '鳕',
      鱉: '鳖',
      鱒: '鳟',
      鱔: '鳝',
      鱖: '鳜',
      鱗: '鳞',
      鱘: '鲟',
      鱚: '𬶮',
      鱝: '鲼',
      鱟: '鲎',
      鱠: '鲙',
      鱣: '鳣',
      鱤: '鳡',
      鱧: '鳢',
      鱨: '鲿',
      鱭: '鲚',
      鱯: '鳠',
      鱲: '𫚭',
      鱷: '鳄',
      鱸: '鲈',
      鱺: '鲡',
      鳥: '鸟',
      鳧: '凫',
      鳩: '鸠',
      鳬: '凫',
      鳲: '鸤',
      鳳: '凤',
      鳴: '鸣',
      鳶: '鸢',
      鳾: '䴓',
      鴆: '鸩',
      鴇: '鸨',
      鴉: '鸦',
      鴒: '鸰',
      鴕: '鸵',
      鴛: '鸳',
      鴝: '鸲',
      鴞: '鸮',
      鴟: '鸱',
      鴣: '鸪',
      鴦: '鸯',
      鴨: '鸭',
      鴯: '鸸',
      鴰: '鸹',
      鴴: '鸻',
      鴷: '䴕',
      鴻: '鸿',
      鴿: '鸽',
      鵁: '䴔',
      鵂: '鸺',
      鵃: '鸼',
      鵏: '𬷕',
      鵐: '鹀',
      鵑: '鹃',
      鵒: '鹆',
      鵓: '鹁',
      鵜: '鹈',
      鵝: '鹅',
      鵟: '𫛭',
      鵠: '鹄',
      鵡: '鹉',
      鵪: '鹌',
      鵬: '鹏',
      鵮: '鹐',
      鵯: '鹎',
      鵲: '鹊',
      鵷: '鹓',
      鵾: '鹍',
      鶄: '䴖',
      鶇: '鸫',
      鶉: '鹑',
      鶊: '鹒',
      鶓: '鹋',
      鶖: '鹙',
      鶘: '鹕',
      鶚: '鹗',
      鶠: '𬸘',
      鶡: '鹖',
      鶥: '鹛',
      鶩: '鹜',
      鶪: '䴗',
      鶬: '鸧',
      鶯: '莺',
      鶱: '𬸣',
      鶲: '鹟',
      鶴: '鹤',
      鶹: '鹠',
      鶺: '鹡',
      鶻: '鹘',
      鶼: '鹣',
      鷀: '鹚',
      鷁: '鹢',
      鷂: '鹞',
      鷄: '鸡',
      鷈: '䴘',
      鷊: '鹝',
      鷓: '鹧',
      鷖: '鹥',
      鷗: '鸥',
      鷙: '鸷',
      鷚: '鹨',
      鷟: '𬸦',
      鷥: '鸶',
      鷦: '鹪',
      鷫: '鹔',
      鷭: '𬸪',
      鷯: '鹩',
      鷲: '鹫',
      鷳: '鹇',
      鷸: '鹬',
      鷹: '鹰',
      鷺: '鹭',
      鷽: '鸴',
      鷿: '䴙',
      鸂: '㶉',
      鸇: '鹯',
      鸌: '鹱',
      鸏: '鹲',
      鸑: '𬸚',
      鸕: '鸬',
      鸘: '鹴',
      鸚: '鹦',
      鸛: '鹳',
      鸝: '鹂',
      鸞: '鸾',
      鹵: '卤',
      鹹: '咸',
      鹺: '鹾',
      鹼: '碱',
      鹽: '盐',
      麗: '丽',
      麤: '粗',
      麥: '麦',
      麩: '麸',
      麯: '曲',
      麴: '麹',
      麵: '面',
      麼: '么',
      麽: '么',
      黃: '黄',
      黌: '黉',
      點: '点',
      黨: '党',
      黲: '黪',
      黴: '霉',
      黶: '黡',
      黷: '黩',
      黽: '黾',
      黿: '鼋',
      鼇: '鳌',
      鼈: '鳖',
      鼉: '鼍',
      鼕: '冬',
      鼴: '鼹',
      齊: '齐',
      齋: '斋',
      齎: '赍',
      齏: '齑',
      齒: '齿',
      齔: '龀',
      齕: '龁',
      齗: '龂',
      齘: '𬹼',
      齙: '龅',
      齜: '龇',
      齟: '龃',
      齠: '龆',
      齡: '龄',
      齣: '出',
      齦: '龈',
      齧: '啮',
      齩: '咬',
      齪: '龊',
      齬: '龉',
      齮: '𬺈',
      齯: '𫠜',
      齲: '龋',
      齶: '腭',
      齷: '龌',
      齼: '𬺓',
      龍: '龙',
      龎: '厐',
      龐: '庞',
      龑: '䶮',
      龔: '龚',
      龕: '龛',
      龜: '龟',
    },
  };
  function converter(exact, phrases, characters) {
    const keys = Object.keys(phrases).sort((a, b) => b.length - a.length);
    return function convert(value) {
      const text = String(value ?? '');
      if (Object.prototype.hasOwnProperty.call(exact, text)) return exact[text];
      let result = '';
      for (let i = 0; i < text.length;) {
        const phrase = keys.find((key) => text.startsWith(key, i));
        if (phrase) {
          result += phrases[phrase];
          i += phrase.length;
        } else {
          const point = String.fromCodePoint(text.codePointAt(i));
          result += characters[point] || point;
          i += point.length;
        }
      }
      return result;
    };
  }
  window.motsTraditional = converter(
    conversion.traditionalExact,
    conversion.traditionalPhrases,
    conversion.traditionalCharacters,
  );
  window.motsSimplified = converter(
    conversion.simplifiedExact,
    conversion.simplifiedPhrases,
    conversion.simplifiedCharacters,
  );
})();
