# One-off helper that (re)builds content/strings.json. Edit here or edit the JSON directly.
import json, pathlib
S = {}
def he(i, text, say=None): S[i] = {"lang": "he", "text": text, **({"say": say} if say else {})}
def en(i, text): S[i] = {"lang": "en", "text": text}

he("who_plays", "מי משחק היום?")
he("name_hodaya", "הודיה"); he("name_matan", "מתן")
he("hello_hodaya", "שלום הודיה!"); he("hello_matan", "שלום מתן!")
he("t_math", "חשבון בבועות"); he("t_word", "המילה החסרה"); he("t_zoo", "אנגלית בגן החיות")
he("t_clock", "מה השעה?"); he("t_letter", "מצא את האות"); he("t_count", "בוא נספור")
he("t_album", "האלבום שלי")
he("inst_math", "כמה זה? בחרי את הבועה הנכונה")
he("inst_word", "איזו אות חסרה במילה?")
he("inst_zoo", "איזו חיה זו?")
he("inst_clock", "מה השעה בשעון?")
he("try_m", "כמעט! נסה שוב"); he("try_f", "כמעט! נסי שוב")
he("praise_0", "כל הכבוד!"); he("praise_1", "מצוין!"); he("praise_2", "יופי!")
he("champ_m", "אלוף!"); he("champ_f", "אלופה!")
he("new_sticker", "קיבלת מדבקה חדשה!", "קִיבַּלְתָּ מַדְבֵּקָה חֲדָשָׁה!")
he("new_sticker_f", "קיבלת מדבקה חדשה!", "קִיבַּלְתְּ מַדְבֵּקָה חֲדָשָׁה!")
he("rest", "זמן לנוח! נתראה מחר")
he("parents", "אזור הורים")

WORDS = [("dog","כלב"),("cat","חתול"),("fish","דג"),("house","בית"),("tree","עץ"),("sun","שמש"),
 ("moon","ירח"),("ball","כדור"),("apple","תפוח"),("banana","בננה"),("flower","פרח"),("book","ספר","סֵפֶר"),
 ("cup","כוס"),("shoe","נעל","נַעַל"),("hat","כובע"),("car","מכונית"),("bus","אוטובוס"),("horse","סוס"),
 ("cow","פרה","פָּרָה"),("bird","ציפור"),("cloud","ענן"),("chair","כיסא"),("clock","שעון"),("cake","עוגה")]
for w in WORDS: he("word_"+w[0], w[1], w[2] if len(w) > 2 else None)

for a in ["lion","cat","dog","fish","bird","cow","horse","duck","monkey","elephant","frog","rabbit"]:
    en("en_"+a, a)

NUMS = ["אחת","שתיים","שלוש","ארבע","חמש","שש","שבע","שמונה","תשע","עשר"]
NSAY = ["אַחַת","שְׁתַּיִם","שָׁלוֹשׁ","אַרְבַּע","חָמֵשׁ","שֵׁשׁ","שֶׁבַע","שְׁמוֹנֶה","תֵּשַׁע","עֶשֶׂר"]
for i,(n,s) in enumerate(zip(NUMS,NSAY),1): he(f"num_{i}", n, s)

LET = [("alef","א","אָלֶף"),("bet","ב","בֵּית"),("gimel","ג","גִּימֶל"),("dalet","ד","דָּלֶת"),("he","ה","הֵא"),
 ("vav","ו","וָו"),("zayin","ז","זַיִן"),("het","ח","חֵית"),("tet","ט","טֵית"),("yod","י","יוּד"),("kaf","כ","כַּף"),
 ("lamed","ל","לָמֶד"),("mem","מ","מֵם"),("nun","נ","נוּן"),("samekh","ס","סָמֶךְ"),("ayin","ע","עַיִן"),
 ("pe","פ","פֵּא"),("tsadi","צ","צָדִי"),("qof","ק","קוּף"),("resh","ר","רֵישׁ"),("shin","ש","שִׁין"),("tav","ת","תָּו")]
for k,l,name in LET:
    he("letter_"+k, name, name)
    he("q_letter_"+k, f"איפה האות {name}?", f"אֵיפֹה הָאוֹת {name}?")

for k,t,s in [("apple","כמה תפוחים יש?","כַּמָּה תַּפּוּחִים יֵשׁ?"),("balloon","כמה בלונים יש?","כַּמָּה בָּלוֹנִים יֵשׁ?"),
              ("fish","כמה דגים יש?","כַּמָּה דָּגִים יֵשׁ?"),("car","כמה מכוניות יש?","כַּמָּה מְכוֹנִיּוֹת יֵשׁ?"),
              ("star","כמה כוכבים יש?","כַּמָּה כּוֹכָבִים יֵשׁ?")]:
    he("q_count_"+k, t, s)

p = pathlib.Path(__file__).resolve().parent.parent / "content" / "strings.json"
p.write_text(json.dumps(S, ensure_ascii=False, indent=1), encoding="utf-8")
print(len(S), "strings ->", p)
