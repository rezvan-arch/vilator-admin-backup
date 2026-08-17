# Admin — Nuxt 3 (پنل مدیریت ویلاتور)

## استک و اجرا
- Nuxt ^3.13 + TypeScript، SSR (routeRules: `"/**": ssr: true`؛ `/auth/**` بدون prerender)
- پکیج‌منیجر: npm
- اجرای لوکال: `npm run dev -- --port 3001` (localhost:3001 — پورت جدا از سایت)
- start (production): `node .output/server/index.mjs`

## پنل دست‌ساز (بدون فریمورک ادمین)
- پنل کاملاً سفارشی با Nuxt ساخته شده — Filament یا کیت ادمین استفاده نشده.
- CKEditor 5 (فول‌سوئیت 41.x، build-classic + ckbox + cloud-services + theme-lark + `@ckeditor/ckeditor5-vue`) — ویرایش محتوای غنی
- dropzone (آپلود فایل)، vuedraggable (درگ‌انددراپ)، vue-debounce، vite-svg-loader
- اشتراک با site: Tailwind، Pinia، color-mode، jalali-moment + vue3-persian-datetime-picker، persian-tools، vue-select، vue-currency-input، vue-toastification، vee-validate، Leaflet
- تمام متن‌های UI فارسی هستند

## Auth
- `.env`: `API_BASE_URL=http://localhost:8000` + `API_TOKEN` (Bearer — به backend)

## ترتیب عکس‌های ملک (منبع حقیقت)
- ترتیب نمایش عکس‌ها از **چینش کاربر در پنل** ساخته می‌شود — نه از نام فایل:
  - `changeSort` در `pages/property/edit/[id].vue` (~خط 837) یک ایندکس 0-based روی لیست فعلی می‌گذارد. هر بار ذخیره، کل آرایه از ۰ بازنویسی می‌شود (داده ساختاراً بدون null/تکرار/حفره می‌ماند).
  - ذخیره نهایی در backend: `setMediaFroProperty` در `PropertyController.php` (~خط 557) که `images_ids[].sort_order` را در PropertyMedia می‌نویسد. تنها نقطه ساخت PropertyMedia.
- ⚠️ اگر در پنل sort_order با منطق دیگری بازنویسی شود، ترتیب صفحه ملک خراب می‌شود (relation `images()` با `orderBy('sort_order', 'asc')` خوانده می‌شود).

## Deploy (رانفلر)
- ریپو: `rezvan-arch/vilator-admin-backup` (branch: main)
- ⚠️ اسکریپت start در package.json باید `"node .output/server/index.mjs"` باشد **نه** `nuxt start`
- سرویس رانفلر: admin (node 20، پورت 3000)
- Dockerfile مخصوص خودش دارد
