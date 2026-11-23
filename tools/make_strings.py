#!/usr/bin/env python3
"""Builds content/strings.json (every spoken line) and js/content.js (math word problems + sentences).
Then run tools/gen_audio.py to create the missing MP3s. Words come from js/words.js."""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
S = {}
def he(i, text, say=None): S[i] = {"lang": "he", "text": text, **({"say": say} if say else {})}
def en(i, text): S[i] = {"lang": "en", "text": text}

# ---------- general ----------
he("who_plays", "מי משחק היום?")
he("name_hodaya", "הודיה"); he("name_matan", "מתן")
he("hello_hodaya", "שלום הודיה!"); he("hello_matan", "שלום מתן!")
he("try_m", "כמעט! נסה שוב"); he("try_f", "כמעט! נסי שוב")
he("praise_0", "כל הכבוד!"); he("praise_1", "מצוין!"); he("praise_2", "יופי!")
he("champ_m", "אלוף!"); he("champ_f", "אלופה!")
he("new_sticker", "קיבלת מדבקה חדשה!", "קִיבַּלְתָּ מַדְבֵּקָה חֲדָשָׁה!")
he("new_sticker_f", "קיבלת מדבקה חדשה!", "קִיבַּלְתְּ מַדְבֵּקָה חֲדָשָׁה!")
he("gold_sticker", "קיבלת מדבקת זהב!", "קִיבַּלְתָּ מַדְבֶּקֶת זָהָב!")
he("gold_sticker_f", "קיבלת מדבקת זהב!", "קִיבַּלְתְּ מַדְבֶּקֶת זָהָב!")
he("champ_level", "שלב אלוף! בהצלחה!")
he("rest", "זמן לנוח! נתראה מחר")
he("parents", "אזור הורים")
he("t_album", "האלבום שלי")
he("t_daily", "אתגר יומי! חמש שאלות מכל המשחקים")
he("daily_done", "כבר עשית את האתגר היום. נתראה מחר!", "כְּבָר עָשִׂיתָ אֶת הָאֶתְגָּר הַיּוֹם. נִתְרָאֶה מָחָר!")
he("t_wardrobe", "הארון של פופו")
he("bought", "איזה יופי! פופו מודה לך")
he("need_stars", "צריך עוד כוכבים. ממשיכים לשחק!")

# ---------- game titles ----------
TITLES = {"math": "חשבון בבועות", "word": "המילה החסרה", "zoo": "אנגלית בגן החיות", "clock": "מה השעה?",
          "letter": "מצא את האות", "count": "בוא נספור", "memory": "זיכרון", "search": "חיפוש מילים",
          "sentence": "סדר את המשפט", "shop": "חנות ושקלים", "pattern": "המשך את הסדרה", "colors": "צבעים",
          "shapes": "צורות", "shadow": "צל של מי?", "bigsmall": "גדול וקטן", "mmemory": "זיכרון קטן",
          "draw": "הציור שלי", "gallery": "הגלריה שלי"}
for k, t in TITLES.items(): he("t_" + k, t)

# ---------- instructions (Hodaya: feminine, Matan: masculine) ----------
he("inst_math", "כמה זה? בחרי את הבועה הנכונה")
he("inst_missing", "איזה מספר חסר?")
he("inst_cmp", "איזה סימן מתאים? גדול, קטן או שווה?")
he("inst_word", "איזו אות חסרה במילה?")
he("inst_spell", "בני את המילה. לחצי על האותיות לפי הסדר", "בְּנִי אֶת הַמִּלָּה. לַחֲצִי עַל הָאוֹתִיּוֹת לְפִי הַסֵּדֶר")
he("inst_zoo", "מה זה באנגלית? בחרי את התמונה")
he("inst_en_word", "איך אומרים באנגלית?")
he("inst_clock", "מה השעה בשעון?")
he("inst_setclock", "כווני את המחוגים לשעה שכתובה, ואז לחצי בדיקה", "כַּוְּנִי אֶת הַמְּחוֹגִים לַשָּׁעָה שֶׁכְּתוּבָה, וְאָז לַחֲצִי בְּדִיקָה")
he("inst_mem_f", "מצאי את הזוגות")
he("inst_mem_m", "מצא שתי תמונות זהות", "מְצָא שְׁתֵּי תְּמוּנוֹת זֵהוֹת")
he("inst_search", "מצאי את המילים בלוח. גררי את האצבע על המילה")
he("inst_sentence", "סדרי את המילים למשפט")
he("inst_pay", "שלמי בדיוק את המחיר. לחצי על המטבעות")
he("inst_change", "כמה עודף מקבלים?")
he("inst_pattern", "מה ממשיך את הסדרה?")
he("q_shadow", "של מי הצל הזה?")
he("q_big", "איפה הגדול?"); he("q_small", "איפה הקטן?")
he("q_more", "איפה יש יותר?"); he("q_less", "איפה יש פחות?")

COLORS = [("red", "אדום", "אָדֹם"), ("blue", "כחול", "כָּחֹל"), ("green", "ירוק", "יָרֹק"), ("yellow", "צהוב", "צָהֹב"),
          ("orange", "כתום", "כָּתֹם"), ("purple", "סגול", "סָגֹל"), ("pink", "ורוד", "וָרֹד"), ("brown", "חום", "חוּם"),
          ("black", "שחור", "שָׁחֹר"), ("white", "לבן", "לָבָן")]
for k, t, s in COLORS:
    he("color_" + k, t, s); he("q_color_" + k, f"איפה הצבע {t}?", f"אֵיפֹה הַצֶּבַע {s}?")
for k, t, s in [("lightblue", "תכלת", "תְּכֵלֶת"), ("lightgreen", "ירוק בהיר", "יָרֹק בָּהִיר"), ("gray", "אפור", "אָפֹר"),
                ("turquoise", "טורקיז", None), ("darkblue", "כחול כהה", "כָּחֹל כֵּהֶה"), ("skin", "בז׳", "בֶּז'")]:
    he("color_" + k, t, s)
SHAPES = [("circle", "עיגול", "עִגּוּל"), ("square", "ריבוע", "רִבּוּעַ"), ("triangle", "משולש", "מְשֻׁלָּשׁ"), ("star", "כוכב", "כּוֹכָב"),
          ("heart", "לב", "לֵב"), ("rectangle", "מלבן", "מַלְבֵּן"), ("oval", "אליפסה", "אֶלִיפְּסָה"), ("diamond", "מעוין", "מְעֻיָּן")]
for k, t, s in SHAPES:
    he("shape_" + k, t, s); he("q_shape_" + k, f"איפה ה{t}?", f"אֵיפֹה הַ{s}?")

# ---------- drawing ----------
for k, t in [("d_marker", "טוש"), ("d_crayon", "צבע שעווה"), ("d_spray", "ספריי"), ("d_eraser", "מחק"), ("d_fill", "דלי צבע"),
             ("d_stamp", "מדבקות"), ("d_undo", "ביטול"), ("d_new", "דף חדש"), ("d_small", "קטן"), ("d_medium", "בינוני"),
             ("d_big", "גדול"), ("d_pages", "דפי צביעה"), ("d_free", "ציור חופשי"), ("d_saved", "הציור נשמר בגלריה")]:
    he(k, t)

# ---------- words (from js/words.js) ----------
words_js = (ROOT / "js" / "words.js").read_text(encoding="utf-8")
HE_WORDS = re.findall(r"\['(\w+)', '([^']+)', '(\w+)'\]", words_js.split("const HE =")[0])
SAY = {"book": "סֵפֶר", "shoe": "נַעַל", "cow": "פָּרָה", "milk": "חָלָב", "spoon": "כַּף", "brother": "אָח", "eye": "עַיִן",
       "tooth": "שֵׁן", "mouth": "פֶּה", "nose": "אַף", "mountain": "הַר", "sea": "יָם", "fire": "אֵשׁ", "hand": "יָד",
       "sock": "גֶּרֶב", "drum": "תֹּף", "turtle": "צָב", "leaf": "עָלֶה", "rainbow": "קֶשֶׁת", "strawberry": "תּוּת",
       "bag": "תִּיק", "foot": "רֶגֶל", "hair": "שֵׂעָר", "bread": "לֶחֶם", "lamp": "מְנוֹרָה", "key": "מַפְתֵּחַ",
       "ear": "אֹזֶן", "door": "דֶּלֶת", "bed": "מִטָּה", "fork": "מַזְלֵג", "pencil": "עִפָּרוֹן", "candy": "סֻכָּרִיָּה",
       "rocket": "טִיל", "ship": "אֳנִיָּה", "carrot": "גֶּזֶר", "bear": "דֹּב", "sheep": "כִּבְשָׂה", "sister": "אָחוֹת",
       "grandma": "סַבְתָּא", "grandpa": "סַבָּא", "snail": "חִלָּזוֹן", "crab": "סַרְטָן", "pig": "חֲזִיר", "mouse": "עַכְבָּר"}
for k, w, _ in HE_WORDS: he("word_" + k, w, SAY.get(k))

EN = ["lion", "cat", "dog", "fish", "bird", "cow", "horse", "duck", "monkey", "elephant", "frog", "rabbit", "bear", "sheep", "pig",
      "chicken", "mouse", "snake", "turtle", "zebra", "owl", "bee", "butterfly",
      "apple", "banana", "bread", "egg", "milk", "cheese", "carrot", "pizza", "cake",
      "hand", "foot", "eye", "ear", "nose", "mouth", "hair", "tooth", "mom", "dad", "baby", "grandma", "grandpa", "brother", "sister"]
for a in EN: en("en_" + a, a)
en("en_icecream", "ice cream")
for k, *_ in COLORS: en("en_c_" + k, k)
for i, w in enumerate(["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"], 1): en(f"en_n_{i}", w)

NUMS = ["אחת", "שתיים", "שלוש", "ארבע", "חמש", "שש", "שבע", "שמונה", "תשע", "עשר"]
NSAY = ["אַחַת", "שְׁתַּיִם", "שָׁלוֹשׁ", "אַרְבַּע", "חָמֵשׁ", "שֵׁשׁ", "שֶׁבַע", "שְׁמוֹנֶה", "תֵּשַׁע", "עֶשֶׂר"]
for i, (n, s) in enumerate(zip(NUMS, NSAY), 1): he(f"num_{i}", n, s)

LET = [("alef","א","אָלֶף"),("bet","ב","בֵּית"),("gimel","ג","גִּימֶל"),("dalet","ד","דָּלֶת"),("he","ה","הֵא"),
 ("vav","ו","וָו"),("zayin","ז","זַיִן"),("het","ח","חֵית"),("tet","ט","טֵית"),("yod","י","יוּד"),("kaf","כ","כַּף"),
 ("lamed","ל","לָמֶד"),("mem","מ","מֵם"),("nun","נ","נוּן"),("samekh","ס","סָמֶךְ"),("ayin","ע","עַיִן"),
 ("pe","פ","פֵּא"),("tsadi","צ","צָדִי"),("qof","ק","קוּף"),("resh","ר","רֵישׁ"),("shin","ש","שִׁין"),("tav","ת","תָּו")]
for k, l, name in LET:
    he("letter_" + k, name, name)
    he("q_letter_" + k, f"איפה האות {name}?", f"אֵיפֹה הָאוֹת {name}?")

for k, t, s in [("apple","כמה תפוחים יש?","כַּמָּה תַּפּוּחִים יֵשׁ?"),("balloon","כמה בלונים יש?","כַּמָּה בָּלוֹנִים יֵשׁ?"),
                ("fish","כמה דגים יש?","כַּמָּה דָּגִים יֵשׁ?"),("car","כמה מכוניות יש?","כַּמָּה מְכוֹנִיּוֹת יֵשׁ?"),
                ("star","כמה כוכבים יש?","כַּמָּה כּוֹכָבִים יֵשׁ?")]:
    he("q_count_" + k, t, s)

# ---------- math word problems (numbers agree with the noun's gender) ----------
M = {2: "שני", 3: "שלושה", 4: "ארבעה", 5: "חמישה", 6: "שישה", 7: "שבעה", 8: "שמונה", 9: "תשעה", 10: "עשרה"}
F = {2: "שתי", 3: "שלוש", 4: "ארבע", 5: "חמש", 6: "שש", 7: "שבע", 8: "שמונה", 9: "תשע", 10: "עשר"}
M1 = {1: "אחד", 2: "שניים", **{k: v for k, v in M.items() if k > 2}}
F1 = {1: "אחת", 2: "שתיים", **{k: v for k, v in F.items() if k > 2}}
OBJ = {  # key: (plural, gender, who, add phrase, take-away phrase)
    "apples": ("תפוחים", "m", "לנועה", "היא קטפה עוד", "היא אכלה"),
    "balloons": ("בלונים", "m", "לנועה", "היא קיבלה עוד", "עפו לשמיים"),
    "fish": ("דגים", "m", "לנועה", "היא קנתה עוד", "שחו משם"),
    "stars": ("כוכבים", "m", "לנועה", "היא ציירה עוד", "היא מחקה"),
    "flowers": ("פרחים", "m", "לנועה", "היא קטפה עוד", "היא נתנה לאמא"),
    "cars": ("מכוניות", "f", "לדני", "הוא קיבל עוד", "הוא נתן לחבר"),
    "birds": ("ציפורים", "f", "על העץ", "הגיעו עוד", "עפו משם"),
    "bananas": ("בננות", "f", "לדני", "הוא קנה עוד", "הוא אכל"),
}
STORIES = []
pairs_add = [(2, 1), (3, 2), (4, 1), (2, 3), (5, 2), (3, 3), (4, 4), (6, 3), (5, 5), (7, 2), (2, 4), (6, 1), (3, 4), (8, 2), (4, 2), (2, 2)]
pairs_sub = [(3, 1), (5, 2), (4, 3), (6, 2), (7, 3), (8, 5), (5, 4), (9, 4), (10, 3), (6, 4), (7, 5), (4, 2)]
objs = list(OBJ.keys())
for n, (a, b) in enumerate(pairs_add):
    o = objs[n % len(objs)]; pl, g, who, add, _ = OBJ[o]
    cnt = (M if g == "m" else F)[a]; more = (M1 if g == "m" else F1)[b]
    has = "יש" if who != "על העץ" else "יושבות"
    text = f"{who} {has} {cnt} {pl}. {add} {more}. כמה {pl} {'יש' if who != 'על העץ' else 'על העץ'} עכשיו?"
    STORIES.append({"id": f"a{n}", "a": a, "b": b, "op": "+", "obj": o, "text": text})
for n, (a, b) in enumerate(pairs_sub):
    o = objs[(n + 3) % len(objs)]; pl, g, who, _, take = OBJ[o]
    cnt = (M if g == "m" else F)[a]; minus = (M1 if g == "m" else F1)[b]
    was = "היו" if who != "על העץ" else "ישבו"
    if take.startswith(("היא", "הוא")):
        text = f"{who} {was} {cnt} {pl}. {take} {minus}. כמה {pl} נשארו?"
    else:
        text = f"{who} {was} {cnt} {pl}. {minus} {take}. כמה {pl} נשארו?"
    STORIES.append({"id": f"s{n}", "a": a, "b": b, "op": "-", "obj": o, "text": text})
for s in STORIES: he("story_" + s["id"], s["text"])

# ---------- sentences (word order game) ----------
SENT = [
    ("הכלב רץ מהר", "dog"), ("החתול שותה חלב", "cat"), ("הדג שוחה בים", "fish"), ("הציפור עפה גבוה", "bird"),
    ("השמש זורחת בבוקר", "sun"), ("אני אוכלת תפוח", "apple"), ("הפרה נותנת חלב", "cow"), ("הירח מאיר בלילה", "moon"),
    ("אבא קורא ספר", "book"), ("הרכבת נוסעת מהר", "train"), ("התינוק ישן במיטה", "baby"), ("הקוף אוכל בננה", "monkey"),
    ("הילד בועט בכדור הגדול", "ball"), ("אמא אופה עוגה טעימה", "cake"), ("הצב הולך לאט מאוד", "turtle"),
    ("הפרפר עף אל הפרח", "butterfly"), ("המטוס טס מעל העננים", "airplane"), ("אני לובשת חולצה אדומה", "shirt"),
    ("הארנב אוהב לאכול גזר", "rabbit"), ("הדבורה מכינה דבש מתוק", "bee"), ("סבתא שותה כוס תה", "grandma"),
    ("הכבאית נוסעת אל האש", "firetruck"), ("יש קשת בשמיים היום", "rainbow"), ("התיק שלי כבד מאוד", "bag"),
    ("הכלב הקטן נובח על החתול", "dog"), ("אני אוהבת לאכול גלידת תות", "icecream"), ("הילדים משחקים בכדור בגינה", "ball"),
    ("אבא נוהג במכונית הכחולה שלו", "car"), ("בחורף אני פותחת מטרייה גדולה", "umbrella"), ("הינשוף יושב על ענף בלילה", "owl"),
    ("הסירה שטה לאט על המים", "boat"), ("אחי משחק עם העפיפון בחוף", "kite"), ("סבא מספר לי סיפור יפה", "grandpa"),
    ("הפיל שותה מים עם החדק", "elephant"), ("הטרקטור עובד בשדה כל היום", "tractor"), ("התרנגולת הטילה ביצה גדולה מאוד", "chicken"),
    ("בבוקר אני מצחצחת שיניים עם מברשת", "tooth"), ("בקיץ אנחנו נוסעים לים עם אמא", "sea"), ("החתול הלבן ישן על הכיסא הגדול", "cat"),
    ("האוטובוס לוקח את הילדים לבית הספר", "bus"), ("הטיל טס אל הירח ואל הכוכבים", "rocket"), ("אני אוהבת לצייר פרחים בצבעים יפים", "flower"),
    ("הזברה והאריה גרים בגן החיות", "zebra"), ("ביום ההולדת שלי קיבלתי מתנה גדולה", "gift"), ("הדוב הגדול אוהב לאכול דבש מתוק", "bear"),
    ("המסוק הירוק עף מעל הבתים בעיר", "helicopter"),
]
SENTENCES = []
for n, (t, pic) in enumerate(SENT):
    SENTENCES.append({"id": n, "words": t.split(), "pic": pic})
    he(f"sent_{n}", t)

(ROOT / "content" / "strings.json").write_text(json.dumps(S, ensure_ascii=False, indent=1), encoding="utf-8")
js = ("/* Generated by tools/make_strings.py — do not edit by hand. */\n'use strict';\n"
      f"const STORIES = {json.dumps(STORIES, ensure_ascii=False)};\nconst SENTENCES = {json.dumps(SENTENCES, ensure_ascii=False)};\n")
(ROOT / "js" / "content.js").write_text(js, encoding="utf-8")
print(len(S), "strings,", len(STORIES), "stories,", len(SENTENCES), "sentences")
