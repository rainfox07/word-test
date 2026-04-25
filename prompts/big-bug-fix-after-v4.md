排查并修复单词音频播放逻辑。

当前问题：
1. 像 persevere 这种常见单词被显示为“该单词暂无音频”。
2. 页面上方显示暂无音频，但答题结果区仍然显示“播放该单词音频”按钮，前后逻辑不一致。
3. 可能原因是代码只读取了 dictionary API 返回结果中的 phonetics[0].audio，没有遍历所有 phonetics，导致后面的有效 audio 被忽略。

修改要求：
1. 新增或修改 extractAudioUrl 函数，从 API 返回的所有 meanings/phonetics 中查找第一个非空 audio 字段。
2. 如果 audio URL 以 // 开头，自动补全为 https://。
3. 所有播放按钮统一调用同一个 playWordAudio 函数。
4. playWordAudio 优先播放 API 返回的 audioUrl；如果没有 audioUrl，则使用浏览器 SpeechSynthesisUtterance 朗读英文单词。
5. 前端文案不要直接显示“该单词暂无音频”，改成“未找到词典音频，将使用系统语音朗读”。
6. 答题结果区的“播放该单词音频”按钮也必须支持 TTS 兜底，不要因为 audioUrl 为空而失效。
7. 短语、带空格的表达也要支持朗读，查询 API 时使用 encodeURIComponent(word)。
8. 不要破坏现有答题逻辑、导入词库逻辑和 UI 布局。