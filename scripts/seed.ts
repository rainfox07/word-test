import "dotenv/config";

import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { db } from "../db";
import { accounts, invitationCodes, users, wordLists, words } from "../db/schema";
import { DEFAULT_ACCOUNT_EMAIL } from "../lib/default-account";
import { fetchPronunciationAudioUrl } from "../lib/dictionary";
import { toStoredWordData } from "../lib/word-entry";
import { parseWordsFromText } from "../lib/word-import";

const linux666Source = `Operating System|OS|/ˈɑːpəreɪtɪŋ ˈsɪstəm/|n.:操作系统;Software||/ˈsɔːftwer/|n.:软件;Hardware||/ˈhɑːrdwer/|n.:硬件;Resource||/ˈriːsɔːrs/|n.:资源;Service||/ˈsɜːrvɪs/|n.:服务;User Interface|UI|/ˈjuːzər ˈɪntərfeɪs/|n.:用户接口,用户界面;Graphical User Interface|GUI||n.:图形用户界面;Command Line Interface|CLI||n.:命令行界面;Memory Manager||/ˈmeməri ˈmænɪdʒər/|n.:内存管理器;Processor Manager||/ˈprɑːsesər ˈmænɪdʒər/|n.:处理器管理器;Device Manager||/dɪˈvaɪs ˈmænɪdʒər/|n.:设备管理器;File Manager||/faɪl ˈmænɪdʒər/|n.:文件管理器;Network Manager||/ˈnetwɜːrk ˈmænɪdʒər/|n.:网络管理器;Main Memory|RAM|/meɪn ˈmeməri/|n.:主存,内存;Random Access Memory|RAM||n.:随机存取存储器;Central Processing Unit|CPU||n.:中央处理器;Input Output Device|I/O device||n.:输入输出设备;Batch System||/bætʃ ˈsɪstəm/|n.:批处理系统;Interactive System||/ˌɪntərˈæktɪv ˈsɪstəm/|n.:交互式系统;Real-Time System||/ˈriːəl taɪm ˈsɪstəm/|n.:实时系统;Hard Real-Time||/hɑːrd ˈriːəl taɪm/|n.:硬实时;Soft Real-Time||/sɔːft ˈriːəl taɪm/|n.:软实时;Hybrid System||/ˈhaɪbrɪd ˈsɪstəm/|n.:混合系统;Embedded System||/ɪmˈbedɪd ˈsɪstəm/|n.:嵌入式系统;Memory Management||/ˈmeməri ˈmænɪdʒmənt/|n.:内存管理;Multiprogramming||/ˌmʌltiˈproʊɡræmɪŋ/|n.:多道程序设计;Internal Fragmentation||/ɪnˈtɜːrnl ˌfræɡmenˈteɪʃn/|n.:内部碎片;External Fragmentation||/ɪkˈstɜːrnl ˌfræɡmenˈteɪʃn/|n.:外部碎片;Deallocation||/ˌdiːæləˈkeɪʃn/|n.:内存回收,释放;Compaction||/kəmˈpækʃn/|n.:紧缩,压缩整理;Virtual Memory||/ˈvɜːrtʃuəl ˈmeməri/|n.:虚拟内存;Paged Memory Allocation||/peɪdʒd ˈmeməri ˌæləˈkeɪʃn/|n.:分页存储管理;Paging||/ˈpeɪdʒɪŋ/|n.:分页;Page||/peɪdʒ/|n.:页;Page Frame||/peɪdʒ freɪm/|n.:页框;Job Table|JT||n.:作业表;Page Map Table|PMT||n.:页映射表;Memory Map Table|MMT||n.:内存映射表;Logical Address||/ˈlɑːdʒɪkl əˈdres/|n.:逻辑地址;Physical Address||/ˈfɪzɪkl əˈdres/|n.:物理地址;Address Translation||/əˈdres trænsˈleɪʃn/|n.:地址转换;Page Number||/peɪdʒ ˈnʌmbər/|n.:页号;Offset||/ˈɔːfset/|n.:位移量,偏移量;Demand Paging||/dɪˈmænd ˈpeɪdʒɪŋ/|n.:请求分页;Secondary Storage||/ˈsekənderi ˈstɔːrɪdʒ/|n.:二级存储,辅助存储;Swapping||/ˈswɑːpɪŋ/|n.:页面交换,换入换出;Page Fault||/peɪdʒ fɔːlt/|n.:缺页中断;Page Fault Handler||/peɪdʒ fɔːlt ˈhændlər/|n.:缺页处理程序;Page Replacement Policy||/peɪdʒ rɪˈpleɪsmənt ˈpɑːləsi/|n.:页替换策略;First-In First-Out|FIFO||n.:先进先出;Least Recently Used|LRU||n.:最近最少使用;Locality of Reference||/loʊˈkæləti əv ˈrefərəns/|n.:局部性原理;Status Bit||/ˈsteɪtəs bɪt/|n.:状态位;Modified Bit||/ˈmɑːdɪfaɪd bɪt/|n.:修改位;Referenced Bit||/ˈrefərənst bɪt/|n.:引用位;Thrashing||/ˈθræʃɪŋ/|n.:抖动;Working Set||/ˈwɜːrkɪŋ set/|n.:工作集;File Management||/faɪl ˈmænɪdʒmənt/|n.:文件管理;File Management System||/faɪl ˈmænɪdʒmənt ˈsɪstəm/|n.:文件管理系统;Field||/fiːld/|n.:字段;Record||/ˈrekərd/|n.:记录;File||/faɪl/|n.:文件;Database||/ˈdeɪtəbeɪs/|n.:数据库;Directory|Folder|/dəˈrektəri/|n.:目录,文件夹;Open||/ˈoʊpən/|n.:打开命令;Delete||/dɪˈliːt/|n.:删除命令;Rename||/ˌriːˈneɪm/|n.:重命名命令;Copy||/ˈkɑːpi/|n.:复制命令;Volume||/ˈvɑːljuːm/|n.:卷,存储卷;Volume Descriptor||/ˈvɑːljuːm dɪˈskrɪptər/|n.:卷描述符;Master File Directory|MFD||n.:主文件目录;Subdirectory||/ˌsʌbdəˈrektəri/|n.:子目录;Tree Structure||/triː ˈstrʌktʃər/|n.:树状结构;Root Directory||/ruːt dəˈrektəri/|n.:根目录;Directory Entry||/dəˈrektəri ˈentri/|n.:目录项;Relative Filename||/ˈrelətɪv ˈfaɪlneɪm/|n.:相对文件名;Complete Filename||/kəmˈpliːt ˈfaɪlneɪm/|n.:完整文件名;Absolute Filename||/ˈæbsəluːt ˈfaɪlneɪm/|n.:绝对文件名;Extension||/ɪkˈstenʃn/|n.:扩展名;Path||/pæθ/|n.:路径;Filename||/ˈfaɪlneɪm/|n.:文件名;Record Format||/ˈrekərd ˈfɔːrmæt/|n.:记录格式;Direct Access||/dəˈrekt ˈækses/|n.:直接访问;Sequential Access||/sɪˈkwenʃl ˈækses/|n.:顺序访问;File Organization||/faɪl ˌɔːrɡənəˈzeɪʃn/|n.:文件组织;Hashing Algorithm||/ˈhæʃɪŋ ˈælɡərɪðəm/|n.:散列算法,哈希算法;Collision||/kəˈlɪʒn/|n.:冲突;Indexed Sequential Access Method|ISAM||n.:索引顺序访问方法;Index File||/ˈɪndeks faɪl/|n.:索引文件;Index Entry||/ˈɪndeks ˈentri/|n.:索引项;Physical Storage Allocation||/ˈfɪzɪkl ˈstɔːrɪdʒ ˌæləˈkeɪʃn/|n.:物理存储分配;Storage Space Utilization||/ˈstɔːrɪdʒ speɪs ˌjuːtələˈzeɪʃn/|n.:存储空间利用率;Search Speed||/sɜːrtʃ spiːd/|n.:查找速度;Insertion||/ɪnˈsɜːrʃn/|n.:插入;Deletion||/dɪˈliːʃn/|n.:删除;Response Time||/rɪˈspɑːns taɪm/|n.:响应时间;Visit Frequency||/ˈvɪzɪt ˈfriːkwənsi/|n.:访问频率;Maintenance||/ˈmeɪntənəns/|n.:维护;Efficiency||/ɪˈfɪʃnsi/|n.:效率;Maintainability||/meɪnˌteɪnəˈbɪləti/|n.:可维护性;Security||/sɪˈkjʊrəti/|n.:安全性;Protection||/prəˈtekʃn/|n.:保护;Access Control||/ˈækses kənˈtroʊl/|n.:访问控制;`;

const defaultWordLists = [
  {
    name: "list1",
    description: "基础高频词示例词库",
    words: [
      { word: "apple", meanings: ["苹果"], phonetic: "/ˈæpəl/", partOfSpeech: "n." },
      { word: "banana", meanings: ["香蕉"], phonetic: "/bəˈnænə/", partOfSpeech: "n." },
      { word: "country", meanings: ["国家", "乡村"], phonetic: "/ˈkʌntri/", partOfSpeech: "n." },
      { word: "future", meanings: ["未来", "将来"], phonetic: "/ˈfjuːtʃər/", partOfSpeech: "n." },
      { word: "practice", meanings: ["练习", "实践"], phonetic: "/ˈpræktɪs/", partOfSpeech: "n./v." },
    ],
  },
  {
    name: "list2",
    description: "进阶学习词示例词库",
    words: [
      { word: "acquire", meanings: ["获得", "习得"], phonetic: "/əˈkwaɪər/", partOfSpeech: "v." },
      { word: "accurate", meanings: ["准确的"], phonetic: "/ˈækjərət/", partOfSpeech: "adj." },
      { word: "benefit", meanings: ["益处", "好处"], phonetic: "/ˈbenɪfɪt/", partOfSpeech: "n./v." },
      { word: "challenge", meanings: ["挑战"], phonetic: "/ˈtʃælɪndʒ/", partOfSpeech: "n./v." },
      { word: "estimate", meanings: ["估计", "估价"], phonetic: "/ˈestɪmət/", partOfSpeech: "v./n." },
    ],
  },
  {
    name: "Travel Essentials",
    description: "旅行与出行场景常用词",
    words: [
      { word: "travel", meanings: ["旅行"], phonetic: "/ˈtrævəl/", partOfSpeech: "v./n." },
      { word: "airport", meanings: ["机场"], phonetic: "/ˈerpɔːrt/", partOfSpeech: "n." },
      { word: "ticket", meanings: ["票", "车票"], phonetic: "/ˈtɪkɪt/", partOfSpeech: "n." },
      { word: "hotel", meanings: ["酒店"], phonetic: "/hoʊˈtel/", partOfSpeech: "n." },
      { word: "taxi", meanings: ["出租车"], phonetic: "/ˈtæksi/", partOfSpeech: "n." },
    ],
  },
  {
    name: "Campus Starter",
    description: "校园与课堂入门词汇",
    words: [
      { word: "school", meanings: ["学校"], phonetic: "/skuːl/", partOfSpeech: "n." },
      { word: "teacher", meanings: ["老师"], phonetic: "/ˈtiːtʃər/", partOfSpeech: "n." },
      { word: "student", meanings: ["学生"], phonetic: "/ˈstuːdnt/", partOfSpeech: "n." },
      { word: "lesson", meanings: ["课程", "课"], phonetic: "/ˈlesn/", partOfSpeech: "n." },
      { word: "pencil", meanings: ["铅笔"], phonetic: "/ˈpensl/", partOfSpeech: "n." },
      { word: "color", meanings: ["颜色"], acceptedAnswers: ["colour"], phonetic: "/ˈkʌlər/", partOfSpeech: "n." },
    ],
  },
  {
    name: "reading-demo",
    description: "基于阅读课本的单词库，包含了第三单元sectionA的单词",
    words: [
      { word: "grant", meanings: ["认为", "授予"], phonetic: "/ɡrɑːnt/", partOfSpeech: "vt." },
      { word: "conduct", meanings: ["实施", "引导"], phonetic: "/kənˈdʌkt/", partOfSpeech: "vt." },
      { word: "accustomed", meanings: ["习惯的", "适应的"], phonetic: "/əˈkʌstəmd/", partOfSpeech: "adj." },
      { word: "utility", meanings: ["公用事业", "效用"], phonetic: "/juːˈtɪləti/", partOfSpeech: "n." },
      { word: "exaggeration", meanings: ["夸张", "夸大"], phonetic: "/ɪɡˌzædʒəˈreɪʃn/", partOfSpeech: "n." },
      { word: "shrug", meanings: ["耸肩", "漠视"], phonetic: "/ʃrʌɡ/", partOfSpeech: "v." },
      { word: "sector", meanings: ["部门", "领域"], phonetic: "/ˈsektə(r)/", partOfSpeech: "n." },
      { word: "recruit", meanings: ["招聘", "招募"], phonetic: "/rɪˈkruːt/", partOfSpeech: "v." },
      { word: "employee", meanings: ["员工", "雇员"], phonetic: "/ɪmˈplɔɪiː/", partOfSpeech: "n." },
      { word: "entrepreneur", meanings: ["企业家", "创业者"], phonetic: "/ˌɒntrəprəˈnɜː(r)/", partOfSpeech: "n." },
      { word: "entrepreneurship", meanings: ["企业家精神", "创业"], phonetic: "/ˌɒntrəprəˈnɜːʃɪp/", partOfSpeech: "n." },
      { word: "persevere", meanings: ["坚持", "锲而不舍"], phonetic: "/ˌpɜːsɪˈvɪə(r)/", partOfSpeech: "v." },
      { word: "persevering", meanings: ["坚毅的", "刻苦的"], phonetic: "/ˌpɜːsɪˈvɪərɪŋ/", partOfSpeech: "adj." },
      { word: "endure", meanings: ["忍受", "持续"], phonetic: "/ɪnˈdjʊə(r)/", partOfSpeech: "v." },
      { word: "internal", meanings: ["内部的", "内心的"], phonetic: "/ɪnˈtɜːnl/", partOfSpeech: "adj." },
      { word: "innovation", meanings: ["创新", "革新"], phonetic: "/ˌɪnəˈveɪʃn/", partOfSpeech: "n." },
      { word: "assign", meanings: ["分配", "指派"], phonetic: "/əˈsaɪn/", partOfSpeech: "v." },
      { word: "feature", meanings: ["特征", "特色"], phonetic: "/ˈfiːtʃə(r)/", partOfSpeech: "n." },
      { word: "invaluable", meanings: ["无价的", "极珍贵的"], phonetic: "/ɪnˈvæljuəbl/", partOfSpeech: "adj." },
      { word: "furthermore", meanings: ["此外", "而且"], phonetic: "/ˈfɜːðəmɔː(r)/", partOfSpeech: "adv." },
      { word: "conventional", meanings: ["传统的", "常规的"], phonetic: "/kənˈvenʃənl/", partOfSpeech: "adj." },
      { word: "sufficient", meanings: ["足够的", "充分的"], phonetic: "/səˈfɪʃnt/", partOfSpeech: "adj." },
      { word: "shift", meanings: ["轮班", "转移"], phonetic: "/ʃɪft/", partOfSpeech: "n." },
      { word: "schedule", meanings: ["日程", "计划表"], phonetic: "/ˈʃedjuːl/", partOfSpeech: "n." },
      { word: "flexible", meanings: ["灵活的", "柔韧的"], phonetic: "/ˈfleksəbl/", partOfSpeech: "adj." },
      { word: "vigorous", meanings: ["强劲的", "精力充沛的"], phonetic: "/ˈvɪɡərəs/", partOfSpeech: "adj." },
      { word: "ethic", meanings: ["道德", "伦理"], phonetic: "/ˈeθɪk/", partOfSpeech: "n." },
      { word: "parallel", meanings: ["相似的", "平行的"], phonetic: "/ˈpærəlel/", partOfSpeech: "adj." },
      { word: "exhibit", meanings: ["展示", "展览"], phonetic: "/ɪɡˈzɪbɪt/", partOfSpeech: "v." },
      { word: "collective", meanings: ["集体的", "共同的"], phonetic: "/kəˈlektɪv/", partOfSpeech: "adj." },
      { word: "persistence", meanings: ["坚持", "毅力"], phonetic: "/pəˈsɪstəns/", partOfSpeech: "n." },
      { word: "stunning", meanings: ["惊人的", "绝妙的"], phonetic: "/ˈstʌnɪŋ/", partOfSpeech: "adj." },
      { word: "enhance", meanings: ["提升", "增强"], phonetic: "/ɪnˈhɑːns/", partOfSpeech: "v." },
      { word: "strive", meanings: ["奋斗", "努力"], phonetic: "/straɪv/", partOfSpeech: "v." },
      { word: "stir", meanings: ["激发", "搅动"], phonetic: "/stɜː(r)/", partOfSpeech: "v." },
      { word: "functionality", meanings: ["功能", "实用性"], phonetic: "/ˌfʌŋkʃəˈnæləti/", partOfSpeech: "n." },
      { word: "seamlessly", meanings: ["无缝地", "流畅地"], phonetic: "/ˈsiːmləsli/", partOfSpeech: "adv." },
      { word: "weave", meanings: ["编织", "编造"], phonetic: "/wiːv/", partOfSpeech: "v." },
      { word: "fabric", meanings: ["布料", "质地"], phonetic: "/ˈfæbrɪk/", partOfSpeech: "n." },
      { word: "motivate", meanings: ["激励", "促使"], phonetic: "/ˈməʊtɪveɪt/", partOfSpeech: "v." },
      { word: "retain", meanings: ["保留", "留住"], phonetic: "/rɪˈteɪn/", partOfSpeech: "v." },
      { word: "resourceful", meanings: ["足智多谋的", "机敏的"], phonetic: "/rɪˈsɔːsfl/", partOfSpeech: "adj." },
      { word: "perceive", meanings: ["看待", "察觉"], phonetic: "/pəˈsiːv/", partOfSpeech: "v." },
    ],
  },
  {
    name: "linux666",
    description: "linux专有名词记忆，基于PPT创建。",
    words: parseWordsFromText(linux666Source),
  },
];

async function upsertSystemWordList(name: string, description: string) {
  const existing = await db.query.wordLists.findFirst({
    where: and(eq(wordLists.name, name), eq(wordLists.isSystem, true)),
  });

  if (existing) {
    return existing.id;
  }

  const [inserted] = await db
    .insert(wordLists)
    .values({
      name,
      description,
      sourceType: "system",
      isSystem: true,
      ownerId: null,
    })
    .returning({ id: wordLists.id });

  return inserted.id;
}

async function upsertWord(input: {
  wordListId: string;
  word: string;
  meanings: string[];
  acceptedAnswers?: string[];
  phonetic?: string | null;
  partOfSpeech?: string | null;
  pronunciationAudioUrl: string | null;
}) {
  const existingWord = await db.query.words.findFirst({
    where: and(eq(words.wordListId, input.wordListId), eq(words.word, input.word)),
  });
  const storedWordData = toStoredWordData({
    displayWord: input.word,
    meanings: input.meanings,
    acceptedAnswers: input.acceptedAnswers,
    phonetic: input.phonetic,
    partOfSpeech: input.partOfSpeech,
    pronunciationAudioUrl: input.pronunciationAudioUrl,
  });

  if (existingWord) {
    await db
      .update(words)
      .set({
        ...storedWordData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(words.id, existingWord.id));

    return;
  }

  await db.insert(words).values({
    wordListId: input.wordListId,
    ...storedWordData,
    createdByUserId: null,
  });
}

async function removeObsoleteSystemWords(wordListId: string, validWords: string[]) {
  const existingWords = await db.query.words.findMany({
    where: eq(words.wordListId, wordListId),
  });

  for (const existingWord of existingWords) {
    if (!validWords.includes(existingWord.word)) {
      await db.delete(words).where(eq(words.id, existingWord.id));
    }
  }
}

async function ensureDefaultAdminAccount() {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, "admin"),
  });
  const timestamp = new Date().toISOString();

  if (!existingUser) {
    await db.insert(users).values({
      id: "admin",
      name: "admin",
      email: DEFAULT_ACCOUNT_EMAIL,
      phone: null,
      emailVerified: true,
      image: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  const existingAccount = await db.query.accounts.findFirst({
    where: and(eq(accounts.providerId, "credential"), eq(accounts.accountId, "admin")),
  });

  if (!existingAccount) {
    const passwordHash = await hashPassword("admin");

    await db.insert(accounts).values({
      id: crypto.randomUUID(),
      accountId: "admin",
      providerId: "credential",
      userId: "admin",
      password: passwordHash,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
}

async function ensureInvitationCodes() {
  for (let code = 2510560001; code <= 2510560300; code += 1) {
    const stringCode = String(code);
    const existing = await db.query.invitationCodes.findFirst({
      where: eq(invitationCodes.code, stringCode),
    });

    if (existing) {
      continue;
    }

    await db.insert(invitationCodes).values({
      code: stringCode,
    });
  }
}

async function main() {
  await ensureDefaultAdminAccount();
  await ensureInvitationCodes();

  for (const list of defaultWordLists) {
    const listId = await upsertSystemWordList(list.name, list.description);
    const validWords = list.words.map((item) => item.word);

    await removeObsoleteSystemWords(listId, validWords);

    for (const item of list.words) {
      const audioUrl = await fetchPronunciationAudioUrl(item.word);

      await upsertWord({
        wordListId: listId,
        word: item.word,
        meanings: item.meanings,
        acceptedAnswers: item.acceptedAnswers,
        phonetic: item.phonetic ?? null,
        partOfSpeech: item.partOfSpeech ?? null,
        pronunciationAudioUrl: audioUrl,
      });
    }
  }

  console.log("Seed completed.");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
