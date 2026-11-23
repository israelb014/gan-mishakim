/* Shared vocabulary. Every Hebrew word has a drawing ART.D[key] and a voice clip audio/word_<key>.mp3.
   English words have a voice clip audio/en_<key>.mp3 and a drawing (art name + optional argument). */
'use strict';

/* [key, Hebrew, category] — category is used to group words for games and to pick distractors. */
const HE_WORDS = [
  ['dog', 'כלב', 'animal'], ['cat', 'חתול', 'animal'], ['fish', 'דג', 'animal'], ['horse', 'סוס', 'animal'], ['cow', 'פרה', 'animal'],
  ['bird', 'ציפור', 'animal'], ['duck', 'ברווז', 'animal'], ['monkey', 'קוף', 'animal'], ['elephant', 'פיל', 'animal'], ['frog', 'צפרדע', 'animal'],
  ['rabbit', 'ארנב', 'animal'], ['lion', 'אריה', 'animal'], ['bear', 'דוב', 'animal'], ['snake', 'נחש', 'animal'], ['sheep', 'כבשה', 'animal'],
  ['chicken', 'תרנגולת', 'animal'], ['zebra', 'זברה', 'animal'], ['turtle', 'צב', 'animal'], ['butterfly', 'פרפר', 'animal'], ['bee', 'דבורה', 'animal'],
  ['mouse', 'עכבר', 'animal'], ['pig', 'חזיר', 'animal'], ['owl', 'ינשוף', 'animal'], ['snail', 'חילזון', 'animal'], ['crab', 'סרטן', 'animal'],
  ['apple', 'תפוח', 'food'], ['banana', 'בננה', 'food'], ['cake', 'עוגה', 'food'], ['strawberry', 'תות', 'food'], ['grapes', 'ענבים', 'food'],
  ['orange', 'תפוז', 'food'], ['pear', 'אגס', 'food'], ['watermelon', 'אבטיח', 'food'], ['bread', 'לחם', 'food'], ['egg', 'ביצה', 'food'],
  ['milk', 'חלב', 'food'], ['cheese', 'גבינה', 'food'], ['carrot', 'גזר', 'food'], ['tomato', 'עגבנייה', 'food'], ['cucumber', 'מלפפון', 'food'],
  ['corn', 'תירס', 'food'], ['icecream', 'גלידה', 'food'], ['pizza', 'פיצה', 'food'], ['lemon', 'לימון', 'food'], ['candy', 'סוכרייה', 'food'],
  ['house', 'בית', 'thing'], ['ball', 'כדור', 'thing'], ['book', 'ספר', 'thing'], ['cup', 'כוס', 'thing'], ['shoe', 'נעל', 'thing'],
  ['hat', 'כובע', 'thing'], ['chair', 'כיסא', 'thing'], ['clock', 'שעון', 'thing'], ['balloon', 'בלון', 'thing'], ['key', 'מפתח', 'thing'],
  ['door', 'דלת', 'thing'], ['bed', 'מיטה', 'thing'], ['table', 'שולחן', 'thing'], ['lamp', 'מנורה', 'thing'], ['spoon', 'כף', 'thing'],
  ['fork', 'מזלג', 'thing'], ['umbrella', 'מטרייה', 'thing'], ['pencil', 'עיפרון', 'thing'], ['bag', 'תיק', 'thing'], ['glasses', 'משקפיים', 'thing'],
  ['shirt', 'חולצה', 'thing'], ['sock', 'גרב', 'thing'], ['phone', 'טלפון', 'thing'], ['gift', 'מתנה', 'thing'], ['drum', 'תוף', 'thing'],
  ['kite', 'עפיפון', 'thing'],
  ['tree', 'עץ', 'nature'], ['sun', 'שמש', 'nature'], ['moon', 'ירח', 'nature'], ['flower', 'פרח', 'nature'], ['cloud', 'ענן', 'nature'],
  ['star', 'כוכב', 'nature'], ['leaf', 'עלה', 'nature'], ['mountain', 'הר', 'nature'], ['sea', 'ים', 'nature'], ['rainbow', 'קשת', 'nature'],
  ['fire', 'אש', 'nature'],
  ['hand', 'יד', 'body'], ['foot', 'רגל', 'body'], ['eye', 'עין', 'body'], ['ear', 'אוזן', 'body'], ['nose', 'אף', 'body'],
  ['mouth', 'פה', 'body'], ['tooth', 'שן', 'body'], ['hair', 'שיער', 'body'],
  ['mom', 'אמא', 'family'], ['dad', 'אבא', 'family'], ['baby', 'תינוק', 'family'], ['grandma', 'סבתא', 'family'], ['grandpa', 'סבא', 'family'],
  ['brother', 'אח', 'family'], ['sister', 'אחות', 'family'],
  ['car', 'מכונית', 'vehicle'], ['bus', 'אוטובוס', 'vehicle'], ['train', 'רכבת', 'vehicle'], ['airplane', 'מטוס', 'vehicle'], ['boat', 'סירה', 'vehicle'],
  ['bicycle', 'אופניים', 'vehicle'], ['rocket', 'טיל', 'vehicle'], ['truck', 'משאית', 'vehicle'], ['helicopter', 'מסוק', 'vehicle'], ['ship', 'אונייה', 'vehicle'],
  ['tractor', 'טרקטור', 'vehicle'], ['firetruck', 'כבאית', 'vehicle'],
];
const HE = Object.fromEntries(HE_WORDS.map(([k, w, c]) => [k, { key: k, he: w, cat: c }]));

/* Colours: id, Hebrew, English, hex. */
const COLORS = [['red', 'אדום', 'red', '#e5534b'], ['blue', 'כחול', 'blue', '#3d8be0'], ['green', 'ירוק', 'green', '#4fb05a'],
  ['yellow', 'צהוב', 'yellow', '#ffd23c'], ['orange', 'כתום', 'orange', '#ff8a3d'], ['purple', 'סגול', 'purple', '#8E6CEF'],
  ['pink', 'ורוד', 'pink', '#f58fb5'], ['brown', 'חום', 'brown', '#9c6a41'], ['black', 'שחור', 'black', '#2f2f3a'], ['white', 'לבן', 'white', '#ffffff']];

/* English: [key, word, category, art, artArg]. Audio en_<key>. Unlocks by category with difficulty. */
const EN_CATS = ['animal', 'color', 'number', 'food', 'body', 'family'];
const EN_WORDS = [
  ...['lion', 'cat', 'dog', 'fish', 'bird', 'cow', 'horse', 'duck', 'monkey', 'elephant', 'frog', 'rabbit', 'bear', 'sheep', 'pig',
    'chicken', 'mouse', 'snake', 'turtle', 'zebra', 'owl', 'bee', 'butterfly'].map((k) => [k, k, 'animal', k]),
  ...COLORS.map(([id, , en, hex]) => ['c_' + id, en, 'color', 'splat', hex]),
  ...['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'].map((w, i) => ['n_' + (i + 1), w, 'number', 'count', i + 1]),
  ...['apple', 'banana', 'bread', 'egg', 'milk', 'cheese', 'carrot', 'pizza', 'cake', 'icecream'].map((k) => [k, k === 'icecream' ? 'ice cream' : k, 'food', k]),
  ...['hand', 'foot', 'eye', 'ear', 'nose', 'mouth', 'hair', 'tooth'].map((k) => [k, k, 'body', k]),
  ...['mom', 'dad', 'baby', 'grandma', 'grandpa', 'brother', 'sister'].map((k) => [k, k, 'family', k]),
];
const EN = Object.fromEntries(EN_WORDS.map(([k, w, c, art, arg]) => [k, { key: k, en: w, cat: c, art, arg }]));
/** Hebrew meaning of an English entry (for English↔Hebrew memory). */
function enHebrew(k) {
  const e = EN[k];
  if (e.cat === 'color') return COLORS.find((c) => 'c_' + c[0] === k)[1];
  if (e.cat === 'number') return ['אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר'][e.arg - 1];
  return HE[k] ? HE[k].he : e.en;
}
const enArt = (k) => ART.draw(EN[k].art, EN[k].arg);
