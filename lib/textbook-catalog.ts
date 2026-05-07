import { type ParsedWord, parseWordsFromText } from "@/lib/word-import";

export type TextbookWordSeed = ParsedWord;

export type TextbookSectionSeed = {
  title: string;
  words: TextbookWordSeed[];
};

export type TextbookUnitSeed = {
  title: string;
  sections: TextbookSectionSeed[];
};

export type TextbookSeed = {
  name: string;
  description: string;
  sourceFileName: string;
  units: TextbookUnitSeed[];
};

const unit7PreparingWords = parseWordsFromText(`learner|learner|/ˈlɜːnə(r),ˈlɜːrnər/|n.:学习者;attend|attend|/əˈtend/|v.:参加,出席,经常去,定期去(某处);experiment|experiment|/ɪkˈsperɪmənt/|n.:实验;note|note|/nəʊt,noʊt/|n.:笔记,记录;internet|internet|/ˈɪntənet,ˈɪntərnet/|n.:互联网;relative|relative|/ˈrelətɪv/|n.:亲戚,亲属;adj.:比较的;pizza|pizza|/ˈpiːtsə/|n.:比萨饼,意大利肉饼;chemistry|chemistry|/ˈkemɪstri/|n.:化学;shocked|shocked|/ʃɒkt,ʃɑːkt/|adj.:震惊的,惊愕的;purple|purple|/ˈpɜːpl,ˈpɜːrpl/|n.:紫色;adj.:紫色的;silver|silver|/ˈsɪlvə(r)/|n.:银色,银白色;adj.:银色的,银白色的;cooking|cooking|/ˈkʊkɪŋ/|n.:烹饪,饭菜;pronunciation|pronunciation|/prəˌnʌnsiˈeɪʃn/|n.:发音,读音;programme|program|/ˈprəʊɡræm/|n.:节目;hardly|hardly|/ˈhɑːdli,ˈhɑːrdli/|adv.:几乎不,几乎没有;whenever|whenever|/wenˈevə(r)/|conj.:每当,无论何时;repeat|repeat|/rɪˈpiːt/|v.:复述,跟读,重复,重写;oral|oral|/ˈɔːrəl/|adj.:口头的`);

const unit7ExploringWords = parseWordsFromText(`abroad|abroad|/əˈbrɔːd/|adv.:在国外;pen|pen|/pen/|n.:笔,钢笔;die|die|/daɪ/|v.:死,死亡;background|background|/ˈbækɡraʊnd/|n.:背景;remind|remind|/rɪˈmaɪnd/|v.:使想起,提醒;disappoint|disappoint|/ˌdɪsəˈpɔɪnt/|v.:使失望;imagine|imagine|/ɪˈmædʒɪn/|v.:想象;educator|educator|/ˈedʒukeɪtə(r)/|n.:教育学家,教育家,教育工作者;state|state|/steɪt/|n.:国家,州,状态;master|master|/ˈmɑːstə(r),ˈmæstər/|n.:大师;private|private|/ˈpraɪvət/|adj.:私立的,私营的;thought|thought|/θɔːt/|n.:思想,想法,看法;poem|poem|/ˈpəʊɪm,ˈpoʊəm/|n.:诗;etc.|etc.|/etˈsetərə/|abbr.:以及诸如此类,以及其他,等等;wise|wise|/waɪz/|adj.:充满智慧的,明智的;truth|truth|/truːθ/|n.:真相,实情,事实,真理;increase|increase|/ɪnˈkriːs,ˈɪŋkriːs/|v.:(使)增长,增多,增加;n.:增长,增多,增加;digital|digital|/ˈdɪdʒɪtl/|adj.:数字的,数码的;ability|ability|/əˈbɪləti/|n.:能力;husband|husband|/ˈhʌzbənd/|n.:丈夫;education|education|/ˌedʒuˈkeɪʃn/|n.:(尤指学校)教育;suppose|suppose|/səˈpəʊz/|v.:假定,假设,推断;foreign|foreign|/ˈfɒrən,ˈfɔːrən/|adj.:外国的,涉外的;educational|educational|/ˌedʒuˈkeɪʃənl/|adj.:教育的,有关教育的;satisfy|satisfy|/ˈsætɪsfaɪ/|v.:使满足,使满意;personal|personal|/ˈpɜːsənl,ˈpɜːrsənl/|adj.:个人的,私人的;able|able|/ˈeɪbl/|adj.:能,能够;except|except|/ɪkˈsept/|prep.:除......之外;else|else|/els/|adv.:其他的,另外的;meaning|meaning|/ˈmiːnɪŋ/|n.:意思,意义;socialism|socialism|/ˈsəʊʃəlɪzəm/|n.:社会主义;dictionary|dictionary|/ˈdɪkʃənri,ˈdɪkʃəneri/|n.:词典,字典`);

const unit7DevelopingWords = parseWordsFromText(`aloud|aloud|/əˈlaʊd/|adv.:大声地,出声地;discussion|discussion|/dɪˈskʌʃn/|n.:讨论,商讨`);

const unit7WrappingWords = parseWordsFromText(`solution|solution|/səˈluːʃn/|n.:解决方法,处理手段;topic|topic|/ˈtɒpɪk,ˈtɑːpɪk/|n.:主题,话题,题目,标题;explain|explain|/ɪkˈspleɪn/|v.:解释,说明;memorize|memorize|/ˈmeməraɪz/|v.:记忆,记住;serious|serious|/ˈsɪəriəs,ˈsɪriəs/|adj.:严重的,严肃的;deaf|deaf|/def/|adj.:聋的;actually|actually|/ˈæktʃuəli/|adv.:事实上,实际上;poor|poor|/pɔː(r),pɔːr/|adj.:贫穷的,差的,可怜的;afford|afford|/əˈfɔːd,əˈfɔːrd/|v.:承担得起(后果),买得起;borrow|borrow|/ˈbɒrəʊ,ˈbɔːroʊ/|v.:借,借用;progress|progress|/ˈprəʊɡres,ˈprɑːɡres/|n.:进步;effort|effort|/ˈefət,ˈefərt/|n.:努力,试图;enter|enter|/ˈentə(r)/|v.:进入,进来,进去;college|college|/ˈkɒlɪdʒ,ˈkɑːlɪdʒ/|n.:(美国)大学,(英国)学院;graduate|graduate|/ˈɡrædʒueɪt,ˈɡrædʒuət/|v.:毕业;n.:毕业生;realise|realize|/ˈriːəlaɪz/|v.:实现,意识到;stick|stick|/stɪk/|v.:粘贴,卡住;n.:枝条,枯枝`);

const unit8PreparingWords = parseWordsFromText(`coin|coin|/kɔɪn/|n.:硬币;euro|euro|/ˈjʊərəʊ,ˈjʊroʊ/|n.:欧元;pound|pound|/paʊnd/|n.:英镑,磅;convenient|convenient|/kənˈviːniənt/|adj.:便利的,方便的;cash|cash|/kæʃ/|n.:现金;credit|credit|/ˈkredɪt/|n.:信用,信誉;personal|personal|/ˈpɜːsənl,ˈpɜːrsənl/|adj.:个人的,私人的;mobile|mobile|/ˈməʊbaɪl,ˈmoʊbl/|adj.:可移动的,非固定的;yogurt|yogurt|/ˈjɒɡət,ˈjoʊɡərt/|n.:酸奶;menu|menu|/ˈmenjuː/|n.:菜单;beef|beef|/biːf/|n.:牛肉;butter|butter|/ˈbʌtə(r)/|n.:黄油,奶油;bill|bill|/bɪl/|n.:账单;mutton|mutton|/ˈmʌtn/|n.:羊肉;salad|salad|/ˈsæləd/|n.:(生吃的)蔬菜色拉,蔬菜沙拉;lemon|lemon|/ˈlemən/|n.:柠檬;pancake|pancake|/ˈpænkeɪk/|n.:薄饼;cheese|cheese|/tʃiːz/|n.:干酪,奶酪;porridge|porridge|/ˈpɒrɪdʒ,ˈpɔːrɪdʒ/|n.:粥;ready|ready|/ˈredi/|adj.:准备好;fork|fork|/fɔːk,fɔːrk/|n.:餐叉;wallet|wallet|/ˈwɒlɪt,ˈwɑːlɪt/|n.:钱包`);

const unit8ExploringWords = parseWordsFromText(`persuade|persuade|/pəˈsweɪd,pərˈsweɪd/|v.:使信服,使相信;inform|inform|/ɪnˈfɔːm,ɪnˈfɔːrm/|v.:了解,熟悉;entertain|entertain|/ˌentəˈteɪn,ˌentərˈteɪn/|v.:使快乐,娱乐;unit|unit|/ˈjuːnɪt/|n.:单位,单元;resource|resource|/rɪˈsɔːs,rɪˈsɔːrs/|n.:资源,财力;frog|frog|/frɒɡ,frɑːɡ/|n.:蛙,青蛙;borrow|borrow|/ˈbɒrəʊ,ˈbɔːroʊ/|v.:借,借用;hunt|hunt|/hʌnt/|v.:打猎;n.:打猎;toolmaker|toolmaker|/ˈtuːlmeɪkə(r)/|n.:工具匠;agree|agree|/əˈɡriː/|v.:同意,赞成;truck|truck|/trʌk/|n.:卡车;hen|hen|/hen/|n.:母鸡;sheep|sheep|/ʃiːp/|n.:羊,绵羊;continue|continue|/kənˈtɪnjuː/|v.:继续说,持续,继续做;number|number|/ˈnʌmbə(r)/|v.:标号,给......编号;n.:数字,数,数量;case|case|/keɪs/|n.:情况,事例;invent|invent|/ɪnˈvent/|v.:发明,创造;shell|shell|/ʃel/|n.:贝壳;unify|unify|/ˈjuːnɪfaɪ/|v.:统一,使成一体;rope|rope|/rəʊp/|n.:粗绳,绳索;easily|easily|/ˈiːzɪli/|adv.:容易地,轻易地;metal|metal|/ˈmetl/|n.:金属;invention|invention|/ɪnˈvenʃn/|n.:发明,创造;technology|technology|/tekˈnɒlədʒi,tekˈnɑːlədʒi/|n.:技术,工艺;cashless|cashless|/ˈkæʃləs/|adj.:不用现金的;society|society|/səˈsaɪəti/|n.:社会;else|else|/els/|adv.:其他的,另外的;worth|worth|/wɜːθ,wɜːrθ/|n.:价值;reader|reader|/ˈriːdə(r)/|n.:读者;action|action|/ˈækʃn/|n.:行动;connect|connect|/kəˈnekt/|v.:连接,沟通;prediction|prediction|/prɪˈdɪkʃn/|n.:预测;rapid|rapid|/ˈræpɪd/|adj.:快速的,瞬间的;development|development|/dɪˈveləpmənt/|n.:发展,开发;economy|economy|/ɪˈkɒnəmi,ɪˈkɑːnəmi/|n.:经济,经济情况;likely|likely|/ˈlaɪkli/|adj.:很可能的;piggy|piggy|/ˈpɪɡi/|adj.:像猪一样的;n.:小猪;blouse|blouse|/blaʊz,blaʊs/|n.:(女士)短上衣,衬衫;achieve|achieve|/əˈtʃiːv/|v.:达到,完成,成功;twice|twice|/twaɪs/|adv.:两次,两遍;earn|earn|/ɜːn,ɜːrn/|v.:挣得,赚得,挣钱`);

const unit8DevelopingWords = parseWordsFromText(`monthly|monthly|/ˈmʌnθli/|adj.:每月的;budget|budget|/ˈbʌdʒɪt/|n.:预算;total|total|/ˈtəʊtl/|adj.:总的;n.:总计;balance|balance|/ˈbæləns/|n.:平衡;amount|amount|/əˈmaʊnt/|n.:数量,数额,金额;magazine|magazine|/ˌmæɡəˈziːn,ˈmæɡəziːn/|n.:杂志;university|university|/ˌjuːnɪˈvɜːsəti,ˌjuːnɪˈvɜːrsəti/|n.:大学`);

const unit8WrappingWords = parseWordsFromText(`shall|shall|/ʃæl/|modal v.:将要,应该;silly|silly|/ˈsɪli/|adj.:愚蠢的,傻的;upon|upon|/əˈpɒn,əˈpɑːn/|adv.:此后,在上面地;goose|goose|/ɡuːs/|n.:鹅;lay|lay|/leɪ/|v.:下蛋,产卵;golden|golden|/ˈɡəʊldən/|adj.:金质的,金色的;basket|basket|/ˈbɑːskɪt,ˈbæskɪt/|n.:篮子;relative|relative|/ˈrelətɪv/|n.:亲戚,亲属;adj.:比较的;perhaps|perhaps|/pəˈhæps,pərˈhæps/|adv.:可能,也许;kill|kill|/kɪl/|v.:杀死`);

const unit9PreparingWords = parseWordsFromText(`force|force|/fɔːs,fɔːrs/|n.:力,力量,风力;v.:强迫,迫使;earthquake|earthquake|/ˈɜːθkweɪk,ˈɜːrθkweɪk/|n.:地震;wildfire|wildfire|/ˈwaɪldfaɪə(r)/|n.:野火,丛林大火;typhoon|typhoon|/taɪˈfuːn/|n.:台风;flood|flood|/flʌd/|n.:洪水,水灾;snowstorm|snowstorm|/ˈsnəʊstɔːm,ˈsnoʊstɔːrm/|n.:暴风雪,雪暴;heatwave|heatwave|/ˈhiːtweɪv/|n.:酷热期,热浪;sudden|sudden|/ˈsʌdn/|adj.:突然的;blow|blow|/bləʊ/|v.:吹,刮;unless|unless|/ənˈles/|conj.:除非;glove|glove|/ɡlʌv/|n.:(分手指的)手套;burn|burn|/bɜːn,bɜːrn/|v.:燃烧,烧;firefighting|firefighting|/ˈfaɪəfaɪtɪŋ,ˈfaɪərfaɪtɪŋ/|n.:灭火,消防;spread|spread|/spred/|v.:蔓延,扩散;n.:蔓延,扩散;disaster|disaster|/dɪˈzɑːstə(r),dɪˈzæstər/|n.:灾难,不幸;passenger|passenger|/ˈpæsɪndʒə(r)/|n.:乘客,旅客;those|those|/ðəʊz/|det.:那,那些;hurricane|hurricane|/ˈhʌrɪkən,ˈhɜːrəkeɪn/|n.:飓风;hit|hit|/hɪt/|v.:袭击;southern|southern|/ˈsʌðən,ˈsʌðərn/|adj.:南部的,南方的,向南的;god|god|/ɡɒd,ɡɑːd/|n.:上帝,神;coastal|coastal|/ˈkəʊstl/|adj.:沿海的,靠近海岸的;western|western|/ˈwestən,ˈwestərn/|adj.:西部的,西方的;coast|coast|/kəʊst/|n.:海岸,海滨;nearly|nearly|/ˈnɪəli,ˈnɪrli/|adv.:差不多,将近;bleed|bleed|/bliːd/|v.:流血,失血;badly|badly|/ˈbædli/|adv.:严重地;fear|fear|/fɪə(r),fɪr/|v.:担心,害怕;terrible|terrible|/ˈterəbl/|adj.:可怕的,非常讨厌的`);

const unit9ExploringWords = parseWordsFromText(`homeless|homeless|/ˈhəʊmləs/|adj.:无家可归的;reasonable|reasonable|/ˈriːznəbl/|adj.:明智的,合理的;harmful|harmful|/ˈhɑːmfl,ˈhɑːrmfl/|adj.:有害的;insect|insect|/ˈɪnsekt/|n.:昆虫;waterway|waterway|/ˈwɔːtəweɪ,ˈwɔːtərweɪ/|n.:水路,航道;preparation|preparation|/ˌprepəˈreɪʃn/|n.:准备,准备工作;glue|glue|/ɡluː/|n.:胶,胶水;v.:(用胶水)黏合,粘牢;tape|tape|/teɪp/|n.:胶带,胶条,磁带;flashlight|flashlight|/ˈflæʃlaɪt/|n.:手电筒;hide|hide|/haɪd/|v.:躲藏,掩蔽;danger|danger|/ˈdeɪndʒə(r)/|n.:危险,风险;kit|kit|/kɪt/|n.:成套工具,成套设备;aftershock|aftershock|/ˈɑːftəʃɒk,ˈæftərʃɑːk/|n.:(地震后的)余震;storm|storm|/stɔːm,stɔːrm/|n.:暴风雨;thunder|thunder|/ˈθʌndə(r)/|n.:雷,雷声;lightning|lightning|/ˈlaɪtnɪŋ/|n.:闪电;quake|quake|/kweɪk/|n.:地震,震动;against|against|/əˈɡenst/|prep.:反对,与......相反;prevention|prevention|/prɪˈvenʃn/|n.:预防,防止;usual|usual|/ˈjuːʒuəl,ˈjuːʒəl/|adj.:通常的,寻常的;November|November|/nəʊˈvembə(r)/|n.:十一月;level|level|/ˈlevl/|n.:高度;towards|toward|/təˈwɔːdz,tɔːrdz,təˈwɔːd,tɔːrd/|prep.:向,朝着,对,对于;roof|roof|/ruːf/|n.:屋顶,顶部`);

const unit9DevelopingWords = parseWordsFromText(`limit|limit|/ˈlɪmɪt/|v.:限制,限定;outdoor|outdoor|/ˈaʊtdɔː(r)/|adj.:户外的,室外的;fog|fog|/fɒɡ,fɑːɡ/|n.:雾;rainstorm|rainstorm|/ˈreɪnstɔːm,ˈreɪnstɔːrm/|n.:暴风雨;gather|gather|/ˈɡæðə(r)/|v.:聚集,集合;direct|direct|/dəˈrekt,daɪˈrekt/|adj.:直接的;v.:导演,指挥;passage|passage|/ˈpæsɪdʒ/|n.:通道,走廊,章节,段落;pour|pour|/pɔː(r)/|v.:倾盆而下,倒出;pale|pale|/peɪl/|v.:变苍白;adj.:苍白的`);

const unit9WrappingWords = parseWordsFromText(`seafood|seafood|/ˈsiːfuːd/|n.:海鲜,海味(尤指甲壳类);coal|coal|/kəʊl/|n.:煤,煤炭工业;global|global|/ˈɡləʊbl/|adj.:全球的,全世界的;prevent|prevent|/prɪˈvent/|v.:阻止,阻碍;nose|nose|/nəʊz/|n.:鼻,鼻子;mouth|mouth|/maʊθ/|n.:嘴;suffer|suffer|/ˈsʌfə(r)/|v.:遭受,蒙受,变糟,变差;perform|perform|/pəˈfɔːm,pərˈfɔːrm/|v.:演出,表演;talent|talent|/ˈtælənt/|n.:有才能的人,人才,天赋;physically|physically|/ˈfɪzɪkli/|adv.:身体上的,肉体上;scared|scared|/skeəd,skerd/|adj.:害怕,恐惧;helpless|helpless|/ˈhelpləs/|adj.:无自理能力的,不能自力的,无助的;normal|normal|/ˈnɔːml,ˈnɔːrml/|adj.:正常的;physical|physical|/ˈfɪzɪkl/|adj.:身体的;none|none|/nʌn/|pron.:没有一个`);

const unit10PreparingWords = parseWordsFromText(`download|download|/ˌdaʊnˈləʊd/|v.:下载;account|account|/əˈkaʊnt/|n.:账户;medium|medium|/ˈmiːdiəm/|n.:(传播信息等的)媒介,手段,方法;hate|hate|/heɪt/|v.:厌恶;chess|chess|/tʃes/|n.:国际象棋;steal|steal|/stiːl/|v.:窃取,偷;though|though|/ðəʊ/|conj.:虽然,尽管,即使`);

const unit10ExploringWords = parseWordsFromText(`disadvantage|disadvantage|/ˌdɪsədˈvɑːntɪdʒ,ˌdɪsədˈvæntɪdʒ/|n.:缺点,不利因素;cheat|cheat|/tʃiːt/|v.:欺骗;virus|virus|/ˈvaɪrəs/|n.:病毒,滤过性病毒;laptop|laptop|/ˈlæptɒp,ˈlæptɑːp/|n.:笔记本电脑;weigh|weigh|/weɪ/|v.:有......重,称重量;ton|ton|/tʌn/|n.:吨;pioneer|pioneer|/ˌpaɪəˈnɪə(r),ˌpaɪəˈnɪr/|n.:先驱,先锋,带头人;risk|risk|/rɪsk/|n.:风险,危险;suggest|suggest|/səˈdʒest,səɡˈdʒest/|v.:建议,提议;aim|aim|/eɪm/|n.:目的,目标;v.:力求达到,目的是;password|password|/ˈpɑːswɜːd,ˈpæswɜːrd/|n.:密码;address|address|/əˈdres,ˈædres/|n.:地址,网址;link|link|/lɪŋk/|n.:链接;click|click|/klɪk/|v.:点击,单击;schoolmate|schoolmate|/ˈskuːlmeɪt/|n.:学友,同窗,校友;app|app|/æp/|n.:应用软件;reply|reply|/rɪˈplaɪ/|v.:答复,回答;mail|mail|/meɪl/|n.:邮政,邮递系统,邮件,信件,邮包;v.:邮寄,用电子邮件传送,发电邮给;include|include|/ɪnˈkluːd/|v.:包括,包含;partner|partner|/ˈpɑːtnə(r),ˈpɑːrtnər/|n.:搭档,同伴,配偶`);

const unit10DevelopingWords = parseWordsFromText(`manage|manage|/ˈmænɪdʒ/|v.:完成(困难的事),成功获得,管理;proper|proper|/ˈprɒpə(r),ˈprɑːpər/|adj.:正确的,恰当的;amazed|amazed|/əˈmeɪzd/|adj.:大为惊奇的`);

const unit10WrappingWords = parseWordsFromText(`expert|expert|/ˈekspɜːt,ˈekspɜːrt/|n.:专家;product|product|/ˈprɒdʌkt,ˈprɑːdʌkt/|n.:产品;possibility|possibility|/ˌpɒsəˈbɪləti,ˌpɑːsəˈbɪləti/|n.:可能性;powerful|powerful|/ˈpaʊəfl,ˈpaʊərfl/|adj.:强有力的,力量大的;disappear|disappear|/ˌdɪsəˈpɪə(r),ˌdɪsəˈpɪr/|v.:消失;citizen|citizen|/ˈsɪtɪzn/|n.:公民,居民;judge|judge|/dʒʌdʒ/|v.:判断,认为;safely|safely|/ˈseɪfli/|adv.:安全地,无危害地,安稳地,安定地;airport|airport|/ˈeəpɔːt,ˈerpɔːrt/|n.:机场;whether|whether|/ˈweðə(r)/|conj.:是否;carelessly|carelessly|/ˈkeələsli,ˈkerləsli/|adv.:不小心地,不仔细地,粗心地;cancel|cancel|/ˈkænsl/|v.:撤销,取消,终止;mention|mention|/ˈmenʃn/|v.:报到,写到,说到;shoulder|shoulder|/ˈʃəʊldə(r)/|n.:肩,肩膀`);

const unit11PreparingWords = parseWordsFromText(`fantastic|fantastic|/fænˈtæstɪk/|adj.:极好的,了不起的;kung fu|kung fu|/ˌkʌŋˈfuː/|n.:功夫;ceremony|ceremony|/ˈserəməni,ˈserəmoʊni/|n.:仪式,典礼;pot|pot|/pɒt,pɑːt/|n.:锅,罐,壶;silk|silk|/sɪlk/|n.:丝,丝绸;herbal|herbal|/ˈhɜːbl,ˈhɜːrbl/|adj.:药草的;ill|ill|/ɪl/|adj.:有病的,不健康的;believe|believe|/bɪˈliːv/|v.:认为,相信;talented|talented|/ˈtæləntɪd/|adj.:有才能的,天才的`);

const unit11ExploringWords = parseWordsFromText(`lion|lion|/ˈlaɪən/|n.:狮子;president|president|/ˈprezɪdənt/|n.:(机构、俱乐部、学院等)主席,院长,总统,国家主席;bravely|bravely|/ˈbreɪvli/|adv.:勇敢地;monitor|monitor|/ˈmɒnɪtə(r),ˈmɑːnɪtər/|v.:监控,监视,监听,监测;n.:显示屏,屏幕,显示器,监控器;embroidery|embroidery|/ɪmˈbrɔɪdəri/|n.:绣花,刺绣图案;ahead|ahead|/əˈhed/|adv.:(时间、空间)向前,在前面,提前,预先;clue|clue|/kluː/|n.:线索,迹象,提示;Manchu|Manchu|/mænˈtʃuː,ˈmæntʃuː/|adj.:满族的,满语的;n.:满语,满族人;fashion|fashion|/ˈfæʃn/|n.:流行,时尚;wedding|wedding|/ˈwedɪŋ/|n.:婚礼,结婚庆典;marry|marry|/ˈmæri/|v.:(和某人)结婚,嫁,娶;husband|husband|/ˈhʌzbənd/|n.:丈夫;trader|trader|/ˈtreɪdə(r)/|n.:商人;warmly|warmly|/ˈwɔːmli,ˈwɔːrmli/|adv.:热情地,温暖地,亲切地;route|route|/ruːt,raʊt/|n.:路线,路途;rely|rely|/rɪˈlaɪ/|v.:依赖,依靠;camel|camel|/ˈkæml/|n.:骆驼;transport|transport|/trænsˈpɔːt,trænsˈpɔːrt,ˈtrænspɔːt/|v.:运输,运送;n.:交通运输系统;northwestern|northwestern|/ˈnɔːθˈwestən,ˈnɔːrθˈwestərn/|adj.:西北的,西北方向的;tradition|tradition|/trəˈdɪʃn/|n.:传统;known|known|/nəʊn/|adj.:知名的,出名的;waterwheel|waterwheel|/ˈwɔːtəwiːl,ˈwɔːtərwiːl/|n.:(尤指旧时的)水轮,水车;grand|grand|/ɡrænd/|adj.:宏大的,壮丽的,堂皇的;canal|canal|/kəˈnæl/|n.:运河,灌溉渠;Ms|Ms.|/mɪz,məz/|abbr.:女士;leaf|leaf|/liːf/|n.:叶,叶片,叶子;tense|tense|/tens/|n.:时态;situation|situation|/ˌsɪtʃuˈeɪʃn/|n.:情况,状况,形势;roll|roll|/rəʊl/|v.:(使)翻滚,滚动;swing|swing|/swɪŋ/|v.:摇荡,摇摆;n.:秋千;Korean|Korean|/kəˈriən/|adj.:朝鲜族的,朝鲜人的`);

const unit11DevelopingWords = parseWordsFromText(`knee|knee|/niː/|n.:膝,膝盖;pack|pack|/pæk/|v.:收拾,装(箱);boil|boil|/bɔɪl/|v.:用沸水煮;press|press|/pres/|v.:推,压,挤;roast|roast|/rəʊst/|adj.:烤的,焙的;oven|oven|/ˈʌvn/|n.:烤炉,烤箱;skin|skin|/skɪn/|n.:皮,皮肤;mix|mix|/mɪks/|n.:混合,结合;v.:(使)混合;invite|invite|/ɪnˈvaɪt/|v.:邀请`);

const unit11WrappingWords = parseWordsFromText(`feature|feature|/ˈfiːtʃə(r)/|n.:特征,特点,特色;clothing|clothing|/ˈkləʊðɪŋ/|n.:衣服,(尤指某种)服装;jacket|jacket|/ˈdʒækɪt/|n.:夹克衫;characteristic|characteristic|/ˌkærəktəˈrɪstɪk/|n.:特征,特点,品质;adj.:独特的;suit|suit|/suːt/|n.:套装,西装;v.:适合,适宜;overseas|overseas|/ˌəʊvəˈsiːz,ˌoʊvərˈsiːz/|adj.:海外的,外国的;local|local|/ˈləʊkl/|adj.:地方的,当地的,本地的;n.:本地人,当地居民;require|require|/rɪˈkwaɪə(r)/|v.:需要;ink|ink|/ɪŋk/|n.:墨水;expressive|expressive|/ɪkˈspresɪv/|adj.:富于表情的,有表现力的,意味深长的;painful|painful|/ˈpeɪnfl/|adj.:令人疼痛的;normally|normally|/ˈnɔːməli,ˈnɔːrməli/|adv.:通常,正常情况下;beauty|beauty|/ˈbjuːti/|n.:美,美丽;smooth|smooth|/smuːð/|adj.:平整的,光滑的`);

const unit12PreparingWords = parseWordsFromText(`fairy|fairy|/ˈfeəri,ˈferi/|n.:仙子,小精灵;tale|tale|/teɪl/|n.:故事;fable|fable|/ˈfeɪbl/|n.:寓言;biography|biography|/baɪˈɒɡrəfi,baɪˈɑːɡrəfi/|n.:传记,传记作品;topic|topic|/ˈtɒpɪk,ˈtɑːpɪk/|n.:话题,题目,标题;rather|rather|/ˈrɑːðə(r),ˈræðər/|adv.:相当;consider|consider|/kənˈsɪdə(r)/|v.:认为,仔细考虑,把......看作;comedy|comedy|/ˈkɒmədi,ˈkɑːmədi/|n.:喜剧,喜剧片,喜剧表演,滑稽,幽默,诙谐;mouse|mouse|/maʊs/|n.:老鼠;kindness|kindness|/ˈkaɪndnəs/|n.:友好(或仁慈、体贴)的举动,仁慈,善良;sort|sort|/sɔːt,sɔːrt/|n.:种类;v.:整理,把......分类;ugly|ugly|/ˈʌɡli/|adj.:丑陋的,难看的;translate|translate|/ˈtrænzˈleɪt/|v.:翻译;select|select|/sɪˈlekt/|v.:选择,挑选,选拔;translation|translation|/trænsˈleɪʃn/|n.:译文,译本,翻译,译;translator|translator|/trænsˈleɪtə(r)/|n.:(尤指专职)翻译,译员,译者,翻译家;mansion|mansion|/ˈmænʃn/|n.:公馆,宅第;wealth|wealth|/welθ/|n.:财富,丰富,大量;attractive|attractive|/əˈtræktɪv/|adj.:吸引人的;handsome|handsome|/ˈhænsəm/|adj.:英俊的,有魅力的;bully|bully|/ˈbʊli/|v.:恐吓,伤害,胁迫;energetic|energetic|/ˌenəˈdʒetɪk,ˌenərˈdʒetɪk/|adj.:精力充沛的,充满活力的;friendship|friendship|/ˈfrendʃɪp/|n.:友情,友谊`);

const unit12ExploringWords = parseWordsFromText(`snowy|snowy|/ˈsnəʊi/|adj.:下雪多的,雪白的,被雪覆盖的;hungry|hungry|/ˈhʌŋɡri/|adj.:饥饿的;dead|dead|/ded/|adj.:死的,失去生命的;preview|preview|/ˈpriːvjuː/|v.:预习,预览;predict|predict|/prɪˈdɪkt/|v.:预测,预言;stork|stork|/stɔːk,stɔːrk/|n.:鹳;clarify|clarify|/ˈklærəfaɪ/|v.:阐明,使更清晰易懂,澄清;strategy|strategy|/ˈstrætədʒi/|n.:策略,计策,规划;fox|fox|/fɒks,fɑːks/|n.:狐,狐狸;soup|soup|/suːp/|n.:汤,羹;beak|beak|/biːk/|n.:鸟喙;jar|jar|/dʒɑː(r)/|n.:罐子,广口瓶;neck|neck|/nek/|n.:脖子,颈;scene|scene|/siːn/|n.:场景,景象,景色,地点,现场;regular|regular|/ˈreɡjələr/|adj.:规则的,有规律的,间隙均匀的,定时的,经常的,频繁的;owner|owner|/ˈəʊnə(r)/|n.:主人;weak|weak|/wiːk/|adj.:虚弱的,无力的;mirror|mirror|/ˈmɪrə(r)/|v.:反映;n.:镜子;tire|tire|/ˈtaɪə(r)/|v.:(使)疲劳,疲倦,困倦;bored|bored|/bɔːd,bɔːrd/|adj.:厌倦的,烦闷的;scare|scare|/skeə(r),sker/|v.:使害怕,恐惧;fisherman|fisherman|/ˈfɪʃəmən,ˈfɪʃərmən/|n.:渔民,钓鱼爱好者;leading|leading|/ˈliːdɪŋ/|adj.:最重要的;depend|depend|/dɪˈpend/|v.:决定于;funny|funny|/ˈfʌni/|adj.:有趣的,滑稽的,好笑的`);

const unit12DevelopingWords = parseWordsFromText(`poet|poet|/ˈpəʊɪt,ˈpoʊət/|n.:诗人;playwright|playwright|/ˈpleɪraɪt/|n.:剧作家;classical|classical|/ˈklæsɪkl/|adj.:经典的,古典音乐的,古典的;punish|punish|/ˈpʌnɪʃ/|v.:处罚,惩罚`);

const unit12WrappingWords = parseWordsFromText(`single|single|/ˈsɪŋɡl/|adj.:单个的;imagination|imagination|/ɪˌmædʒɪˈneɪʃn/|n.:想象力,想象;romance|romance|/rəʊˈmæns,ˈrəʊmæns/|n.:(通常指短暂的)浪漫史,爱情关系,风流韵事,爱情,恋爱;romantic|romantic|/rəʊˈmæntɪk/|adj.:浪漫主义的,浪漫的,爱情的;certain|certain|/ˈsɜːtn,ˈsɜːrtn/|adj.:特定的,无疑的,确实的;silent|silent|/ˈsaɪlənt/|adj.:安静的,无声的`);

export const textbookCatalog: TextbookSeed[] = [
  {
    name: "科普仁爱版八下英语单词表.pdf",
    description: "基于 PDF 导入的课本词汇，已按 Unit 和小节建立入口。",
    sourceFileName: "科普仁爱版八下英语单词表.pdf",
    units: [
      {
        title: "Unit 7",
        sections: [
          { title: "Preparing for the Topic", words: unit7PreparingWords },
          { title: "Exploring the Topic", words: unit7ExploringWords },
          { title: "Developing the Topic", words: unit7DevelopingWords },
          { title: "Wrapping Up the Topic", words: unit7WrappingWords },
        ],
      },
      {
        title: "Unit 8",
        sections: [
          { title: "Preparing for the Topic", words: unit8PreparingWords },
          { title: "Exploring the Topic", words: unit8ExploringWords },
          { title: "Developing the Topic", words: unit8DevelopingWords },
          { title: "Wrapping Up the Topic", words: unit8WrappingWords },
        ],
      },
      {
        title: "Unit 9",
        sections: [
          { title: "Preparing for the Topic", words: unit9PreparingWords },
          { title: "Exploring the Topic", words: unit9ExploringWords },
          { title: "Developing the Topic", words: unit9DevelopingWords },
          { title: "Wrapping Up the Topic", words: unit9WrappingWords },
        ],
      },
      {
        title: "Unit 10",
        sections: [
          { title: "Preparing for the Topic", words: unit10PreparingWords },
          { title: "Exploring the Topic", words: unit10ExploringWords },
          { title: "Developing the Topic", words: unit10DevelopingWords },
          { title: "Wrapping Up the Topic", words: unit10WrappingWords },
        ],
      },
      {
        title: "Unit 11",
        sections: [
          { title: "Preparing for the Topic", words: unit11PreparingWords },
          { title: "Exploring the Topic", words: unit11ExploringWords },
          { title: "Developing the Topic", words: unit11DevelopingWords },
          { title: "Wrapping Up the Topic", words: unit11WrappingWords },
        ],
      },
      {
        title: "Unit 12",
        sections: [
          { title: "Preparing for the Topic", words: unit12PreparingWords },
          { title: "Exploring the Topic", words: unit12ExploringWords },
          { title: "Developing the Topic", words: unit12DevelopingWords },
          { title: "Wrapping Up the Topic", words: unit12WrappingWords },
        ],
      },
    ],
  },
];
