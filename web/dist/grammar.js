(() => {
  'use strict';
  // Original starter material for Web grammar practice, not a complete grammar course.
  // Stable dictionary and entry IDs keep grammar progress separate from vocabulary.
  const examples = (...pairs) =>
    pairs.map(([text, translation]) => ({ text, translations: { 'zh-Hant': translation } }));
  const entry = (id, subcategory, term, meaning, pattern, explanation, sentences) => ({
    id,
    category: subcategory.split('.')[0],
    subcategory,
    term,
    meanings: { 'zh-Hant': meaning },
    pattern,
    explanation,
    example: sentences[0].text,
    examples: sentences,
  });
  const categories = [
    {
      id: 'g1',
      name: '基本句型',
      subcategories: [{ id: 'g1.01', name: '陳述與表達' }],
    },
    {
      id: 'g2',
      name: '句子變化',
      subcategories: [{ id: 'g2.01', name: '否定、請求與語氣' }],
    },
    {
      id: 'g3',
      name: '時間與狀態',
      subcategories: [{ id: 'g3.01', name: '動作與經驗' }],
    },
  ];
  const catalog = [
    {
      id: 'grammar-fr',
      kind: 'grammar',
      title: '法語語法入門示例',
      language: 'fr',
      categories,
      words: [
        entry(
          'grammar-fr-etre',
          'g1.01',
          'être + adjectif',
          '用 être 表達主詞的性質或狀態',
          '主詞 + être 的現在式 + 形容詞',
          'être 隨主詞變化：je suis、tu es、il/elle est、nous sommes、vous êtes、ils/elles sont。形容詞通常須配合主詞的陰陽性與單複數；例如 fatigué、fatiguée、fatigués、fatiguées。',
          examples(
            ['Je suis content.', '我很高興。（說話者為男性）'],
            ['Elle est fatiguée.', '她累了。'],
            ['Les enfants sont calmes.', '孩子們很安靜。'],
          ),
        ),
        entry(
          'grammar-fr-il-y-a',
          'g1.01',
          'il y a',
          '表示某處有某人或某物',
          'Il y a + 名詞（+ 地點）',
          'il y a 表示「有／存在」，後接單數或複數名詞時，現在式仍使用 il y a。它介紹某處存在的事物；若要表達某人擁有某物，則使用 avoir。',
          examples(
            ['Il y a un livre sur la table.', '桌上有一本書。'],
            ['Il y a deux cafés dans cette rue.', '這條街上有兩間咖啡館。'],
            ['Dans le jardin, il y a des fleurs.', '花園裡有花。'],
          ),
        ),
        entry(
          'grammar-fr-negation',
          'g2.01',
          'ne … pas',
          '將句子改為否定，表示「不」',
          '主詞 + ne/n’ + 變位動詞 + pas',
          '在簡單時態中，ne 和 pas 放在變位動詞兩側；動詞前接母音或啞音 h 時，ne 縮寫為 n’。口語常省略 ne，但完整書面句仍保留。',
          examples(
            ['Je ne parle pas allemand.', '我不說德語。'],
            ['Elle n’habite pas ici.', '她不住在這裡。'],
            ['Nous ne sommes pas prêts.', '我們還沒準備好。'],
          ),
        ),
        entry(
          'grammar-fr-est-ce-que',
          'g2.01',
          'est-ce que',
          '提出可用「是／否」回答的問題',
          'Est-ce que + 主詞 + 動詞 + … ?',
          'est-ce que 放在陳述句前形成一般疑問句，後方保留主詞在動詞前的順序。接母音或啞音 h 開頭的詞時，que 縮寫為 qu’。',
          examples(
            ['Est-ce que tu travailles demain ?', '你明天工作嗎？'],
            ['Est-ce qu’elle aime le café ?', '她喜歡咖啡嗎？'],
            ['Est-ce que vous êtes prêts ?', '你們準備好了嗎？'],
          ),
        ),
        entry(
          'grammar-fr-futur-proche',
          'g3.01',
          'aller + infinitif',
          '表示即將發生或已打算做的事',
          '主詞 + aller 的現在式 + 動詞原形',
          '這是近未來式。aller 隨主詞變化，後面的動詞保留原形。常用來表達與現在有關的計畫或即將發生的動作，不需要再加介系詞。',
          examples(
            ['Je vais préparer le dîner.', '我要準備晚餐。'],
            ['Nous allons visiter Lyon ce week-end.', '我們這個週末打算去里昂遊玩。'],
            ['Il va pleuvoir.', '快要下雨了。'],
          ),
        ),
        entry(
          'grammar-fr-passe-recent',
          'g3.01',
          'venir de + infinitif',
          '表示剛剛完成的動作',
          '主詞 + venir 的現在式 + de/d’ + 動詞原形',
          'venir de + 動詞原形表示「剛剛做了……」。venir 隨主詞變化；de 在母音或啞音 h 前縮寫為 d’。這個結構中的 venir 不表示移動方向。',
          examples(
            ['Je viens de finir mon travail.', '我剛剛完成工作。'],
            ['Elle vient d’arriver.', '她剛到。'],
            ['Nous venons de prendre le petit déjeuner.', '我們剛吃完早餐。'],
          ),
        ),
      ],
    },
    {
      id: 'grammar-de',
      kind: 'grammar',
      title: '德語語法入門示例',
      language: 'de',
      categories,
      words: [
        entry(
          'grammar-de-verb-second',
          'g1.01',
          'Verb an Position 2',
          '陳述主句的變位動詞位於第二個句子成分',
          '第一個成分 + 變位動詞 + 其餘成分',
          '「第二位」是第二個句子成分，不一定是第二個單字。主詞或時間、地點等成分都可以放在第一位；若第一位不是主詞，主詞通常接在變位動詞後。',
          examples(
            ['Ich lerne heute Deutsch.', '我今天學德語。'],
            ['Heute lerne ich Deutsch.', '今天我學德語。'],
            ['Am Wochenende besucht sie ihre Eltern.', '週末她去探望父母。'],
          ),
        ),
        entry(
          'grammar-de-gern',
          'g1.01',
          'Verb + gern',
          '表示喜歡做某件事',
          '主詞 + 變位動詞 + gern（+ 其他成分）',
          'gern 是副詞，用來表達樂於或喜歡做某個動作；它本身不變位。gerne 與 gern 意義相同。否定時可用 nicht gern，表示不喜歡做某事。',
          examples(
            ['Ich lese gern.', '我喜歡閱讀。'],
            ['Wir kochen gern zusammen.', '我們喜歡一起做飯。'],
            ['Sie fährt nicht gern Auto.', '她不喜歡開車。'],
          ),
        ),
        entry(
          'grammar-de-koennen',
          'g2.01',
          'können + Infinitiv',
          '表示能力或可能性',
          '主詞 + können 的變位 + … + 動詞原形',
          '在一般陳述主句中，情態動詞 können 變位並放在第二個句子成分的位置；另一個動詞以原形放在句尾。例如 ich kann、du kannst、wir können。',
          examples(
            ['Ich kann schwimmen.', '我會游泳。'],
            ['Du kannst hier warten.', '你可以在這裡等。'],
            ['Wir können morgen kommen.', '我們明天可以來。'],
          ),
        ),
        entry(
          'grammar-de-kein',
          'g2.01',
          'kein / keine',
          '否定帶不定冠詞或無冠詞的名詞',
          'kein 的相應形式 + 名詞',
          'kein 常用於否定原本帶 ein/eine 或沒有冠詞的名詞。詞尾隨名詞的性、數、格變化：例如主格 ein Hund → kein Hund，受格 einen Hund → keinen Hund。否定形容詞或整個動作時通常使用 nicht。',
          examples(
            ['Das ist kein Problem.', '那不是問題。'],
            ['Ich habe keine Zeit.', '我沒有時間。'],
            ['Er hat keinen Hund.', '他沒有狗。'],
          ),
        ),
        entry(
          'grammar-de-perfekt-haben',
          'g3.01',
          'haben + Partizip II',
          '用完成式描述已發生的動作',
          '主詞 + haben 的變位 + … + 第二分詞',
          '許多動詞的完成式使用 haben 作助動詞，第二分詞放在一般陳述主句句尾。第二分詞須依動詞記憶，如 machen → gemacht、lesen → gelesen。並非所有動詞都用 haben；例如 gehen 的完成式使用 sein。',
          examples(
            ['Ich habe meine Hausaufgaben gemacht.', '我做完了作業。'],
            ['Sie hat ein Buch gelesen.', '她讀了一本書。'],
            ['Wir haben gestern zusammen gekocht.', '我們昨天一起做了飯。'],
          ),
        ),
        entry(
          'grammar-de-seit',
          'g3.01',
          'seit + Dativ',
          '表示從過去持續到現在的時間',
          'seit + 第三格時間詞組',
          'seit 可表示起點或持續多久。描述延續至今的狀態時，德語通常使用現在式，例如 seit einem Jahr（已經一年）或 seit Montag（從星期一開始）。',
          examples(
            ['Ich lerne seit einem Jahr Deutsch.', '我學德語已經一年了。'],
            ['Sie wohnt seit 2020 in Berlin.', '她從 2020 年起一直住在柏林。'],
            ['Wir warten seit zehn Minuten.', '我們已經等了十分鐘。'],
          ),
        ),
      ],
    },
    {
      id: 'grammar-ja',
      kind: 'grammar',
      title: '日語語法入門示例',
      language: 'ja',
      categories,
      words: [
        entry(
          'grammar-ja-desu',
          'g1.01',
          '名詞は名詞です',
          '用禮貌語氣說明主題的身分或性質',
          '名詞 1 + は + 名詞 2 + です',
          'は 標示談論的主題，在這裡讀作 wa。です 是禮貌的句尾表達。主題已清楚時常可省略；名詞本身不因單複數而改變形式。',
          examples(
            ['私は学生です。', '我是學生。'],
            ['ここは図書館です。', '這裡是圖書館。'],
            ['今日は休みです。', '今天休息。'],
          ),
        ),
        entry(
          'grammar-ja-masu',
          'g1.01',
          '動詞ます形',
          '用禮貌語氣表達習慣或未來的動作',
          '動詞ます形；否定：〜ません',
          'ます形是動詞的禮貌形式。非過去式可表達習慣或未來安排，須依時間詞與上下文理解；正在進行的動作通常另用 〜ています。不同類型的動詞有不同的變化方式。',
          examples(
            ['毎朝コーヒーを飲みます。', '我每天早上喝咖啡。'],
            ['明日、友達に会います。', '我明天要見朋友。'],
            ['日曜日は働きません。', '我星期日不工作。'],
          ),
        ),
        entry(
          'grammar-ja-te-kudasai',
          'g2.01',
          '〜てください',
          '請對方做某件事',
          '動詞て形 + ください',
          '將動詞改為て形後接 ください，表示請求或指示。語氣有禮貌，但仍是直接請對方採取行動；例如 読む → 読んでください、待つ → 待ってください。',
          examples(
            ['ここに名前を書いてください。', '請在這裡寫上姓名。'],
            ['少し待ってください。', '請稍等一下。'],
            ['もう一度言ってください。', '請再說一次。'],
          ),
        ),
        entry(
          'grammar-ja-te-mo-ii',
          'g2.01',
          '〜てもいいです',
          '表示許可；加 か 可詢問可不可以',
          '動詞て形 + もいいです（か）',
          '表示「可以做……」。句尾加 か 可向對方徵求許可。這個句型表示允許，不表示具備某種能力；表達禁止時通常另用 〜てはいけません。',
          examples(
            ['ここに座ってもいいですか。', '我可以坐在這裡嗎？'],
            ['写真を撮ってもいいです。', '可以拍照。'],
            ['窓を開けてもいいですか。', '我可以開窗嗎？'],
          ),
        ),
        entry(
          'grammar-ja-te-iru',
          'g3.01',
          '〜ています',
          '表示正在進行的動作或持續的狀態',
          '動詞て形 + います',
          '與動作動詞搭配可表示正在做某事，例如 読んでいます。與某些動詞搭配則表示動作結果或持續狀態，例如 住んでいます 表示「住在……」。須依動詞與上下文判斷。',
          examples(
            ['今、本を読んでいます。', '我現在正在看書。'],
            ['妹は台所で料理をしています。', '妹妹正在廚房做飯。'],
            ['私は東京に住んでいます。', '我住在東京。'],
          ),
        ),
        entry(
          'grammar-ja-ta-koto-ga-aru',
          'g3.01',
          '〜たことがあります',
          '表示曾經有過某種經驗',
          '動詞た形 + ことがあります',
          '用來描述到目前為止曾有過的經驗。た形與普通過去式同形；沒有某種經驗可用 〜たことがありません。若只敘述昨天等特定時間發生的事件，通常直接使用過去式。',
          examples(
            ['京都に行ったことがあります。', '我曾經去過京都。'],
            ['この映画を見たことがあります。', '我曾經看過這部電影。'],
            ['納豆を食べたことがありません。', '我沒有吃過納豆。'],
          ),
        ),
      ],
    },
  ];

  // Return fresh records, matching the dictionary metadata factory's ownership model.
  // Thematic books have independent sources and identities. They deliberately
  // start empty until thematic material is supplied; ordinary entries are not copied.
  const thematicCatalog = [
    { id: 'grammar-theme-fr', title: '法語主題語法', language: 'fr' },
    { id: 'grammar-theme-de', title: '德語主題語法', language: 'de' },
    { id: 'grammar-theme-ja', title: '日語主題語法', language: 'ja' },
  ].map((book) => ({
    ...book,
    kind: 'grammar',
    grammarMode: 'thematic',
    categories: [],
    words: [],
  }));

  function builtins() {
    return [...catalog, ...thematicCatalog].map((dictionary) => ({
      ...dictionary,
      grammarMode: dictionary.grammarMode || 'standard',
      categories: dictionary.categories.map((category) => ({
        ...category,
        subcategories: category.subcategories.map((subcategory) => ({ ...subcategory })),
      })),
      words: dictionary.words.map((word) => ({
        ...word,
        meanings: { ...word.meanings },
        examples: word.examples.map((example) => ({
          ...example,
          translations: { ...example.translations },
        })),
      })),
    }));
  }

  window.MotsGrammar = Object.freeze({ builtins });
})();
