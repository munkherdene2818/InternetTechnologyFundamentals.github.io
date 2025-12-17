const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const themeToggle = $("#themeToggle");
const savedTheme = localStorage.getItem("crunchy_theme");
if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  const next = cur === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("crunchy_theme", next);
  toast(`Theme: ${next === "light" ? "Light" : "Dark"}`);
});

const nav = $("#nav");
const hamburger = $("#hamburger");

hamburger.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(open));
});

$$(".nav__link").forEach(a => {
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  });
});

const sections = $$("section[id]");
const navLinks = $$(".nav__link");

function setActiveLink(){
  const y = window.scrollY + 110;
  let current = "home";

  for (const sec of sections) {
    const top = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    if (y >= top && y < bottom) current = sec.id;
  }

  navLinks.forEach(a => {
    a.classList.toggle("is-active", a.getAttribute("href") === `#${current}`);
  });
}
window.addEventListener("scroll", setActiveLink);
window.addEventListener("load", setActiveLink);


const toTop = $("#toTop");
window.addEventListener("scroll", () => {
  toTop.classList.toggle("show", window.scrollY > 650);
});
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

$("#year").textContent = new Date().getFullYear();


const productsData = [
  { id:"p1",  name:"Classic Chips",   desc:"Давстай, шаржигнуур.", cat:"chips", price:4500, rating:4.8, tags:["new"], img:"chips-1.png" },
  { id:"p2",  name:"Spicy Chips",     desc:"Халуун ногоотой амт.", cat:"chips", price:4900, rating:4.7, tags:["hot"], img:"chips-2.png" },
  { id:"p3",  name:"Choco Cookie",    desc:"Зөөлөн, шоколадтай.", cat:"sweet", price:3900, rating:4.9, tags:["new"], img:"cookie-1.png" },
  { id:"p4",  name:"Dark Chocolate",  desc:"Гашуун амттай, premium.", cat:"sweet", price:5500, rating:4.6, tags:[], img:"choco-1.png" },
  { id:"p5",  name:"Sparkling Drink", desc:"Сэрүүцүүлэх ундаа.", cat:"drink", price:2800, rating:4.5, tags:["hot"], img:"drink-1.png" },
  { id:"p6",  name:"Iced Tea",        desc:"Жимстэй цай.", cat:"drink", price:3200, rating:4.7, tags:[], img:"drink-2.png" },
  { id:"p7",  name:"Nacho Bites",     desc:"Бага зэрэг бяслагтай.", cat:"chips", price:6100, rating:4.6, tags:[], img:"chips-3.png" },
  { id:"p8",  name:"Gummy Mix",       desc:"Олон төрлийн gummy.", cat:"sweet", price:4200, rating:4.8, tags:["hot"], img:"sweet-1.png" },
  { id:"p9",  name:"Energy Drink",    desc:"Хурдан сэргээх.", cat:"drink", price:5200, rating:4.4, tags:["hot"], img:"drink-3.png" }
];

const productsEl = $("#products");
const sortSelect = $("#sortSelect");
const filterBtns = $$(".seg__btn");

let currentFilter = localStorage.getItem("crunchy_filter") || "all";
let currentSort   = localStorage.getItem("crunchy_sort") || "popular";

function formatMNT(n){
  return "₮" + n.toLocaleString("mn-MN");
}
function catLabel(cat){
  if (cat === "chips") return "Чипс";
  if (cat === "sweet") return "Амттан";
  if (cat === "drink") return "Ундаа";
  return "Бусад";
}
function badgeHtml(tags){
  const out = [];
  if (tags.includes("hot")) out.push(`<span class="badge badge--hot">HOT</span>`);
  if (tags.includes("new")) out.push(`<span class="badge badge--new">NEW</span>`);
  return out.join("");
}
function productCard(p){
  const imgPath = `img/${p.img}`;
  return `
  <article class="product lift" data-cat="${p.cat}">
    <div class="product__img">
      <img src="${imgPath}" alt="${p.name}" onerror="this.style.display='none'; this.parentElement.querySelector('.fallbackMark')?.classList.add('show')" />
      <div class="fallbackMark" style="display:none; padding:10px 12px; border-radius:14px; border:1px dashed rgba(255,255,255,.20); color:rgba(255,255,255,.40); font-weight:900;">
        ${imgPath}
      </div>
    </div>

    <div class="product__body">
      <div class="product__top">
        <div>
          <div class="product__name">${p.name}</div>
          <div class="product__desc">${p.desc}</div>
        </div>
        <div class="badges" aria-hidden="true">
          <span class="badge">${catLabel(p.cat)}</span>
          ${badgeHtml(p.tags)}
        </div>
      </div>

      <div class="product__bottom">
        <div>
          <div class="price">${formatMNT(p.price)}</div>
          <div class="rating">★ ${p.rating.toFixed(1)}</div>
        </div>
        <button class="btn btn--small" data-add="${p.id}">Сагсанд</button>
      </div>
    </div>
  </article>
  `;
}

function applySort(list){
  const arr = [...list];
  if (currentSort === "price_asc")  arr.sort((a,b)=>a.price-b.price);
  if (currentSort === "price_desc") arr.sort((a,b)=>b.price-a.price);
  if (currentSort === "rating_desc")arr.sort((a,b)=>b.rating-a.rating);
  if (currentSort === "popular")    arr.sort((a,b)=> (b.rating*100 - b.price/100) - (a.rating*100 - a.price/100));
  return arr;
}

function render(){
  
  let list = productsData.filter(p => currentFilter === "all" ? true : p.cat === currentFilter);
 
  list = applySort(list);

  productsEl.innerHTML = list.map(productCard).join("");


  filterBtns.forEach(b => b.classList.toggle("is-active", b.dataset.filter === currentFilter));

  $$("[data-add]", productsEl).forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.add;
      const item = productsData.find(x => x.id === id);
      toast(`✅ "${item?.name ?? "Item"}" сагсанд нэмэгдлээ (demo)`);
    });
  });
}

filterBtns.forEach(b => {
  b.addEventListener("click", () => {
    currentFilter = b.dataset.filter;
    localStorage.setItem("crunchy_filter", currentFilter);
    render();
  });
});

sortSelect.value = currentSort;
sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value;
  localStorage.setItem("crunchy_sort", currentSort);
  render();
});

render();

$("#quickOrderBtn").addEventListener("click", () => {
  toast("⚡ Quick order: Онцлох combo-оо захиалах гэж байна (demo)");
});

$$(".faq__q").forEach(q => {
  q.addEventListener("click", () => {
    const expanded = q.getAttribute("aria-expanded") === "true";
    $$(".faq__q").forEach(x => x.setAttribute("aria-expanded", "false"));
    q.setAttribute("aria-expanded", String(!expanded));
  });
});

const form = $("#contactForm");
form.addEventListener("submit", (e) => {
  e.preventDefault();

  let ok = true;
  const fields = $$(".field", form);

  fields.forEach(f => {
    const input = $(".field__input", f);
    const valid = input.value.trim().length > 0;
    f.classList.toggle("is-error", !valid);
    if (!valid) ok = false;
  });

  if (!ok) {
    toast("⚠️ Талбаруудыг бүрэн бөглөнө үү.");
    return;
  }

  toast("✅ Зурвас амжилттай илгээгдлээ (demo)!");
  form.reset();
  fields.forEach(f => f.classList.remove("is-error"));
});

const toastEl = $("#toast");
let toastTimer = null;

function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2600);
}
