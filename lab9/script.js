const asuultuud = [
    {
        asuult: "Монгол улсын нийслэл хотын нэр?",
        hariult: "УЛААНБААТАР"
    },
    {
        asuult: "Монголын хамгийн урт голын нэр?",
        hariult: "ОРХОН"
    },
    {
        asuult: "Монголын хамгийн том нуурын нэр?",
        hariult: "Увс"
    },
    {
        asuult: "Монгол улсын төрийн сүлдэнд байдаг шувуу?",
        hariult: "Хангарьд"
    },
    {
        asuult: "Монгол улсын мөнгөн тэмдэгтийн нэр?",
        hariult: "ТӨГРӨГ"
    }
    {
        asuult: "Дэлхийн хамгийн жижиг хот улс?",
        hariult: "Ватикан"
    },
];

const hangman_zurag = [
    'zurag2.png',
    'zurag3.png',
    'zurag4.png',
    'zurag5.png',
    'zurag6.png',
    'zurag7.png'
];

const MAX_ALDAA = hangman_zurag.length - 1;

let onoo = 0;
let aldaa = 0;               // restart хүртэл reset болохгүй
let odoogiin_ug = '';
let darsan_usguud = [];
let togloom_idewhtei = false;

let asuult_order = [];       // random дараалал
let order_index = 0;

const asuult_text = document.getElementById('questionText');
const hariult_hairtsag = document.getElementById('answerBoxes');
const keyboard_container = document.getElementById('keyboardContainer');
const togloomiin_message = document.getElementById('gameMessage');
const daraagiin_towch = document.getElementById('nextButton');
const dahin_ehle_towch = document.getElementById('restartButton');
const start_towch = document.getElementById('startButton');

const odoogiin_asuult_span = document.getElementById('odoogiinAsuult');
const niit_asuult_span = document.getElementById('niitAsuult');
const aldaa_span = document.getElementById('asuultTooloh');
const max_aldaa_span = document.getElementById('maxAldaa');
const onoo_span = document.getElementById('OnooniiUtga');
const niit_onoo_span = document.getElementById('niitOnoo');
const hangman_zurag_elem = document.getElementById('hangmanImage');

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function updateHUD() {
    const totalScore = asuultuud.length * 10;

    niit_asuult_span.textContent = asuultuud.length;
    niit_onoo_span.textContent = totalScore;
    max_aldaa_span.textContent = MAX_ALDAA;

    odoogiin_asuult_span.textContent = togloom_idewhtei ? (order_index + 1) : 0;

    aldaa_span.textContent = aldaa;
    onoo_span.textContent = onoo;
    hangman_zurag_elem.src = hangman_zurag[Math.min(aldaa, MAX_ALDAA)];
}

function gar_disable_all() {
    document.querySelectorAll('.gar-towch').forEach(btn => btn.disabled = true);
}

function togloom_duusgah({ win, revealAnswer = null }) {
    togloom_idewhtei = false;
    gar_disable_all();
    daraagiin_towch.classList.add('nuugdmal');
    dahin_ehle_towch.classList.remove('nuugdmal');

    const total = asuultuud.length * 10;
    asuult_text.textContent = `Тоглоом дууслаа! Таны эцсийн оноо: ${onoo}/${total}`;

    if (win) {
        togloomiin_message.textContent = '🏆 Маш сайн! Бүгдийг дуусгалаа!';
        togloomiin_message.className = 'togloom-messij win';
    } else {
        togloomiin_message.textContent =
            revealAnswer ? `💀 Та алдааны дээд хэмжээнд хүрлээ. Сүүлчийн хариулт: ${revealAnswer}` :
                           '💀 Та алдааны дээд хэмжээнд хүрлээ. Дахин оролдоорой!';
        togloomiin_message.className = 'togloom-messij lose';
    }
}

function togloom_ehluuleh() {
    if (aldaa >= MAX_ALDAA) {
        togloom_duusgah({ win: false });
        return;
    }

    if (order_index >= asuultuud.length) {
        togloom_duusgah({ win: true });
        return;
    }

    const actualIndex = asuult_order[order_index];
    const odoogiin = asuultuud[actualIndex];

    odoogiin_ug = odoogiin.hariult.toUpperCase();
    darsan_usguud = [];
    togloom_idewhtei = true;

    asuult_text.textContent = odoogiin.asuult;
    togloomiin_message.textContent = '';
    togloomiin_message.className = 'togloom-messij';
    daraagiin_towch.classList.add('nuugdmal');
    dahin_ehle_towch.classList.add('nuugdmal');
    updateHUD();

    hariult_hairtsag.innerHTML = '';
    for (let i = 0; i < odoogiin_ug.length; i++) {
        const haiurtsag = document.createElement('div');
        haiurtsag.className = 'useg-hairtsag';
        haiurtsag.dataset.index = i;
        if (odoogiin_ug[i] === ' ') {
            haiurtsag.style.border = 'none';
            haiurtsag.style.background = 'transparent';
        }
        hariult_hairtsag.appendChild(haiurtsag);
    }

    gar_uusgeh();
}

function gar_uusgeh() {
    keyboard_container.innerHTML = '';
    const usguud = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШҮӨЭЮЯ';

    for (let useg of usguud) {
        const towch = document.createElement('button');
        towch.className = 'gar-towch';
        towch.textContent = useg;
        towch.addEventListener('click', () => useg_shalgah(useg, towch));
        keyboard_container.appendChild(towch);
    }
}

function useg_shalgah(useg, towch) {
    if (!togloom_idewhtei) return;

    if (odoogiin_ug.includes(useg)) {
        const haiurtsguud = document.querySelectorAll('.useg-hairtsag');
        let ilruulsen = false;

        for (let i = 0; i < odoogiin_ug.length; i++) {
            if (odoogiin_ug[i] === useg && !haiurtsguud[i].classList.contains('filled')) {
                haiurtsguud[i].textContent = useg;
                haiurtsguud[i].classList.add('filled');
                ilruulsen = true;
                break;
            }
        }

        if (!ilruulsen) {
            towch.disabled = true;
            if (!darsan_usguud.includes(useg)) darsan_usguud.push(useg);
        }

        if (hojson_uu()) {
            togloom_idewhtei = false;
            onoo += 10;
            updateHUD();
            gar_disable_all();

            togloomiin_message.textContent = 'Та яллаа!';
            togloomiin_message.className = 'togloom-messij win';
            daraagiin_towch.classList.remove('nuugdmal');
        }
    } else {
        if (!darsan_usguud.includes(useg)) {
            darsan_usguud.push(useg);
            towch.disabled = true;

            aldaa++;
            updateHUD();

            if (aldaa >= MAX_ALDAA) {
                hariult_haruulah();
                togloom_duusgah({ win: false, revealAnswer: odoogiin_ug });
            }
        }
    }
}

function hojson_uu() {
    for (let i = 0; i < odoogiin_ug.length; i++) {
        if (odoogiin_ug[i] !== ' ') {
            const haiurtsag = document.querySelector(`.useg-hairtsag[data-index="${i}"]`);
            if (!haiurtsag.classList.contains('filled')) return false;
        }
    }
    return true;
}

function hariult_haruulah() {
    const haiurtsguud = document.querySelectorAll('.useg-hairtsag');
    for (let i = 0; i < odoogiin_ug.length; i++) {
        if (odoogiin_ug[i] !== ' ') {
            haiurtsguud[i].textContent = odoogiin_ug[i];
            haiurtsguud[i].classList.add('filled');
            haiurtsguud[i].style.background = '#ef4444';
        }
    }
}

daraagiin_towch.addEventListener('click', () => {
    order_index++;
    togloom_ehluuleh();
});

dahin_ehle_towch.addEventListener('click', () => {
    order_index = 0;
    onoo = 0;
    aldaa = 0;

    togloomiin_message.className = 'togloom-messij';
    togloomiin_message.textContent = '';
    daraagiin_towch.classList.add('nuugdmal');
    dahin_ehle_towch.classList.add('nuugdmal');

    asuult_text.textContent = 'Эхлэх товч дарна уу...';
    keyboard_container.innerHTML = '';
    hariult_hairtsag.innerHTML = '';

    start_towch.classList.remove('nuugdmal');
    togloom_idewhtei = false;
    updateHUD();
});

start_towch.addEventListener('click', () => {
    asuult_order = shuffle([...Array(asuultuud.length).keys()]);
    order_index = 0;
    onoo = 0;
    aldaa = 0;

    start_towch.classList.add('nuugdmal');
    updateHUD();
    togloom_ehluuleh();
});

updateHUD();
