# Admin — Nuxt 3 (پنل مدیریت ویلاتور)

## استک و اجرا
- Nuxt ^3.13 + TypeScript، SSR (routeRules: `"/**": ssr: true`؛ `/auth/**` بدون prerender)
- پکیج‌منیجر: npm
- اجرای لوکال: `npm run dev -- --port 3002` (localhost:3002 — ⚠️ پورت 3001 برای preview تولیدی سایت رزرو است؛ از 8/20/2026)
- start (production): `node .output/server/index.mjs`

## پنل دست‌ساز (بدون فریمورک ادمین)
- پنل کاملاً سفارشی با Nuxt ساخته شده — Filament یا کیت ادمین استفاده نشده.
- CKEditor 5 (فول‌سوئیت 41.x، build-classic + ckbox + cloud-services + theme-lark + `@ckeditor/ckeditor5-vue`) — ویرایش محتوای غنی
- dropzone (آپلود فایل)، vuedraggable (درگ‌انددراپ)، vue-debounce، vite-svg-loader
- اشتراک با site: Tailwind، Pinia، color-mode، jalali-moment + vue3-persian-datetime-picker، persian-tools، vue-select، vue-currency-input، vue-toastification، vee-validate، Leaflet
- تمام متن‌های UI فارسی هستند

## Auth
- `.env`: `API_BASE_URL=http://localhost:8000` + `API_TOKEN` (Bearer — به backend؛ ⚠️ لوکال خالی است ولی اشکالی ندارد — لاگین JWT است و API_TOKEN جایی استفاده نمی‌شود)
- **کاربر ادمین لوکال:** `admin@gmail.com` / `123456` (مقادیر `DatabaseSeeder::createAdmin`). ⚠️ اگر دیتابیس import شده باشد (مثل بکاپ production) این کاربر **وجود ندارد** (8/20/2026 ثابت شد — settings/permissions بودند ولی کاربر نبود) → ساخت دستی با tinker:
  `php artisan tinker --execute="Web\User\Model\User::create(['name'=>'admin','email'=>'admin@gmail.com','email_verified_at'=>now(),'mobile'=>'09914403585','mobile_verified_at'=>now(),'password'=>'123456','is_admin'=>true,'is_staff'=>true]);"`
  (اجرای کامل `db:seed` هم جواب می‌دهد ولی factory و کالکشن‌ها را دوباره می‌سازد — ترجیحاً کاربر فقط)

## ترتیب عکس‌های ملک (منبع حقیقت)
- ترتیب نمایش عکس‌ها از **چینش کاربر در پنل** ساخته می‌شود — نه از نام فایل:
  - `changeSort` در `pages/property/edit/[id].vue` (~خط 837) یک ایندکس 0-based روی لیست فعلی می‌گذارد. هر بار ذخیره، کل آرایه از ۰ بازنویسی می‌شود (داده ساختاراً بدون null/تکرار/حفره می‌ماند).
  - ذخیره نهایی در backend: `setMediaFroProperty` در `PropertyController.php` (~خط 557) که `images_ids[].sort_order` را در PropertyMedia می‌نویسد. تنها نقطه ساخت PropertyMedia.
- ⚠️ اگر در پنل sort_order با منطق دیگری بازنویسی شود، ترتیب صفحه ملک خراب می‌شود (relation `images()` با `orderBy('sort_order', 'asc')` خوانده می‌شود).

## فرم لوکیشن ملک (آبشار ۱۷ سطحی)

منبع دانش کامل ساختار درخت لوکیشن: `backend/.claude/CLAUDE.md` → بخش «ساختار لوکیشن (درخت ۱۷ سطحی)». این‌جا فقط سمت پنل.

### ۱۷ سلکت آبشاری
- منبع ترتیب و کلیدها: آبجکت `addressSlugs` در `pages/property/edit/[id].vue` (~خط ۹۱) — همان ۱۷ کلید backend به همان ترتیب:
  `country, direction, province, township, district, city, rural_district, downtown, suburbs, municipal_zoning, highway, village, neighbourhood, avenue, alley, suburb, complex`
- `locSlugList = Object.keys(addressSlugs)` → منبع همه‌ی حلقه‌های فرم
- `locationTypeOptions` (~خط ۱۱۱) برای هر نوع یک آرایه‌ی `validParent` دارد — **این آرایه باید با `PARENT_TYPES` بک‌اند sync بماند**؛ کد «عمیق‌ترین والدِ مجاز موجود» را از آن برمی‌دارد (`assignSelectOptions`).
- همین الگوی ۱۷ سلکت در `pages/landing-page/edit/[id].vue` هم تکرار شده (اگر نوع جدیدی اضافه شود، **هر دو** فایل + `store/admin/property/index.ts` باید تغییر کنند).

### ثبت (multi/store)
- `saveNewAddress()` (~خط 1017) → `locationStore.multiStore({ location: [...] })` → `POST /api/location/multi/store`
- برای هر سطحِ **پرشده** یک آیتم `{type, title, manual_slug, id?}` می‌فرستد؛ `highway` عمداً **حذف** می‌شود (مسیر جدای خودش را دارد)
- ولیدیشن سمت پنل: `country`, `direction`, `province` الزامی‌اند
- `manual_slug` همان `addressSlugs[key]` است — بک‌اند از آن زنجیره‌ی slug را می‌سازد (`iran-north-mazandaran-...`). ⚠️ عوض کردن `manual_slug` یک سطح، slug همه‌ی فرزندانش را قدیمی می‌کند و بک‌اند cascade ندارد.
- ⚠️ **همیشه از multi/store استفاده کن، نه ثبت تکی** (`POST /api/location`) — مسیر تکی `related_locations` و ۱۷ ستون `*_id` را پر نمی‌کند و آن لوکیشن در فیلترهای سرچ سایت دیده نمی‌شود.

### ذخیره‌ی ملک
- `store/admin/property/index.ts` (~خط 388) برای هر ۱۷ نوع `idsList["{type}_id"]` می‌سازد
- `location_id` = **عمیق‌ترین سطح انتخاب‌شده، با استثنای `highway`/`downtown`/`suburbs`** (`locSlugList.reverse().forEach`) — این سه سطحِ درخت نیستند، توصیف‌گر جانبی‌اند
- بک‌اند فقط `location_id` و `city_id` را الزامی می‌داند؛ بقیه nullable

### بازسازی فرم در ادیت
- زنجیره از `properties.location` + `location.related_location` بازسازی می‌شود (نه ۱۷ کوئری) — به همین دلیل درست بودن `related_locations` در بک‌اند حیاتی است
- `deselectedLocation()` (~خط 1103) پاک‌کردن یک سطح را به سطوح پایین‌تر آبشار می‌کند

### استور لوکیشن — `store/admin/location/index.ts`
- `getLocationsTree(parentIds)` / `getHighwaysTree(relatedIds)` = تجمیعی (جلسه ۱۷، بخش زیر) — برای پر کردن آبشار همیشه این‌ها را به‌کار ببر، نه رکوئست به‌ازای سطح
- `getLocationsSelect` / `getHighwaySelect` با `per_page: 2000` (رفع truncation)
- CRUD جدای بزرگراه: `highway/store`, `highway/list`, `highway/{id}` — چون `related_location` بزرگراه **دستی** انتخاب می‌شود
- صفحات مدیریت: `pages/locations/index.vue`, `new/index.vue`, `edit/[id].vue`, `highway/*`, `trash/index.vue`

## جلسه ۱۷ — فیکس کندی صفحهی ویرایش ملک (کامیت `35734f1` — پوش شده ✅؛ ⚠️ هنوز deploy نشده)
- **علت کندی (~۲ دقیقه روی production با CPU کند):** صفحهی ادیت یک **آبشار رکوئستی** میزد — بهازای هر سطح از زنجیرهی لوکیشن ملک، یک رکوئست جدا `/api/location?search[parent_id]` + یک رکوئست `/api/location/highway/list` (ملک ۷ سطح → ~۷۵ رکوئت لوکیشن + ۸ بزرگراه + بقیه = ۸۸ کل) + double-fetch لود سخت (SSR+کلاینت) + باگ `per_page=15` (گزینههای بیش از ۱۵ بریده میشدند) + ۱۸ رکوئست بیمعنای fallback کشور (دادههای level 1 هر نوع).
- **فیکس (۲ فایل):**
  - `store/admin/location/index.ts`: اکشنهای جدید `getLocationsTree(parentIds)` و `getHighwaysTree(relatedIds)` — همهی فرزندانِ همهی والدها در **یک** رکوئست (`search[parent_id][]` آرایه → whereIn). `per_page: 2000` به `getLocationsSelect`/`getHighwaySelect` هم اضافه شد (رفع truncation — روی همهی صفحات dropdown بیخطر است).
  - `pages/property/edit/[id].vue`: همهی fetchهای لود اولیه در گارد `if (import.meta.client)` (حذف double-fetch؛ در SPA مثل قبل اجرا میشود). آبشار `locSlugList.forEach(changeLocation)` ← `Promise.all([getLocationsTree(locationIds), getHighwaysTree(locationIds)])` + `assignSelectOptions(rows)` که بر اساس `parent_id` گروهبندی میکند و برای هر type عمیقترین والدِ مجاز (`locationTypeOptions[type].validParent`) را برمیدارد. حذف fallback کشور.
  - `changeLocation` (تغییر دستی لوکیشن توسط کاربر) هم از همان Promise.all تجمیعی با `[data.id]` استفاده میکند.
- **بنچ (ملک `66992186fe884f28da089502`، ۷ سطح، لوکال):** کل API ۸۸ → ۸، لوکیشن ۷۵ → ۲، لود ۱۸.۵ → ۱۰.۶ ثانیه. correctness: هر ۷ سطح در گزینههای والدِ خودش (تست اسکریپت `site/scripts/check-admin-location-fill.mjs`).
- **درسهای بنچ:** `relations[]` را در Playwright با URL دستی بساز — آبجکت params آرایه را با کاما join میکند (`location,location` → خطای رابطه). login بنچ: از `page.request.post` به `/api/auth/login` + `addCookies` JWT (فرم UI در headless هیدریت نمیشود).
- ⚠️ فیکس روی production **ندارد** — redeploy پنل admin لازم است (با تأیید کاربر).

## جلسه ۲۱ — چک سلامت لوکال ادمین (8/21/2026)
- شکایت کاربر «وارد پنل نمیشه» — بررسی کامل: داکر ✅، بکاند ✅ (لاگین هر دو اکانت `admin@gmail.com/123456` و `realvilator@gmail.com` لوکال 200 میده — دیتابیس از بکاپ production است)، صفحه لاگین + لاگین + داشبورد در **Edge و Chrome هر دو سالم** (Playwright، ۰ خطای کنسول، ۰ درخواست 4xx/5xx) → مشکل کاربر از کش مرورگر/زمان سرد-start بود، نه سرویسها. راهحل: hard refresh (Ctrl+Shift+R) یا پنجره incognito.
- اسکریپت چک: `site/scripts/check-admin-login.mjs` (از پوشهی site اجرا شود — playwright فقط آنجا نصب است؛ مرورگر: Edge channel یا executablePath کروم).
- ⚠️ فیکس: `charset: "utf-16"` در `nuxt.config.ts` → `"utf-8"` (همان باگ site جلسه ۱۳؛ مرورگرها تحملش میکنند ولی اعلام غلط است) — نیاز به ریاستارت dev؛ ⚠️ هنوز commit نشده.

## جلسه ۲۱ — فیکس CKEditor (توضیحات در ویرایش ملک نمایش داده نمیشد) (8/21/2026)
- **علائم:** در ویرایش ملک، توضیحات در CKEditor نمایش داده نمیشد (فرانت سالم). ریشهیابی: API توضیحات را کامل برمیگرداند؛ `<ckeditor>` اصلاً رندر نمیشد.
- **ریشه ۱ (درخت npm دوماژوره):** package.json عمداً `@ckeditor/ckeditor5-ui` = 43.3.0 و `@ckeditor/ckeditor5-vue` = 7.2.0 داشت در حالی که بقیهی استک 41.1.0 است. vue v7 به `ckeditor5 >= 42` نیاز دارد → npm meta-package 43.3.0 را کشید → درخت با دو ماژور 41/43 مخلوط شد → `CKEditorError: plugincollection-plugin-name-conflict {"pluginName":"Enter"}` → کرش ویرایشگر.
  - **فیکس:** package.json → `ui: 41.1.0` + `vue: 5.1.0` (v5.1.0 بدون وابستگی است — جفت 41.x) + حذف `node_modules/@ckeditor`، `node_modules/ckeditor5`، `node_modules/.cache`، `package-lock.json` + `npm install` → درخت یکدست 41.1.0 (هیچ کپی تودرتو نماند).
- **ریشه ۲ (import اشتباه):** `plugins/ckeditor.client.ts` → `import {CkeditorPlugin} from "@ckeditor/ckeditor5-vue"` — در v5.1.0 فقط **default** export هست (`CkeditorPlugin` undefined) → `vueApp.use(undefined)` → کامپوننت `Ckeditor` ثبت نمیشد → `Failed to resolve component: ckeditor`. فیکس: `import CkeditorPlugin from "@ckeditor/ckeditor5-vue"` (default).
- **درس:** برای ckeditor5-vue، نسخههای 6+ فقط با ckeditor5 >= 42 کار میکنند — اگر استک 41.x دارید حتماً vue باید 5.1.0 باشد. ابزار تشخیص نسخههای تودرتو: `Get-ChildItem node_modules -Recurse -Filter package.json | Where FullName -match "ckeditor5-enter"` + مقایسهی version.
- **تأیید:** Playwright (`site/scripts/check-admin-description.mjs`): editor ساخته شد، توضیحات 4618 کاراکتر داخلش، ۰ خطای کنسول. اسکریپت `check-admin-description.mjs` از پوشهی site اجرا میشود (playwright فقط آنجا نصب است).
- ⚠️ این فیکس روی **production admin هم لازم است** (درخت همان ریپو بود — احتمالاً ویرایشگر description روی production هم خراب بود) — نیاز به commit/push + deploy با تأیید کاربر. package-lock.json هم بازتولید شد.

## قابلیت کلید نخورده — تغییر دسته‌جمعی سال ساخت ملک‌ها (8/24/2026)
- **درخواست کاربر:** در فرم ملک، کنار «سال ساخت» چک‌باکس «کلید نخورده» باشد؛ و امکان تغییر دسته‌جمعی سال ساخت ملک‌های کلید نخورده در پنل (مثلاً با آمدن سال جدید، سال این ملک‌ها جلو برود تا «جدید» به نظر برسند).
- **وضعیت قبل (نیمه‌کاره):** چک‌باکس `is_not_used` در فرم ویرایش ملک/پروژه بود ولی پایین فرم کنار «ویژه/لوکس» — نه کنار سال ساخت. بک‌اند endpoint کامل بود (`POST /api/property/change/not-used` + پرمیشن `property.change-date-of-not-use`) ولی **هیچ UI ادمین به آن متصل نبود** — عملاً غیرقابل استفاده.
- **انجام شد (این جلسه):**
  - `pages/property/edit/[id].vue`: چک‌باکس «کلید نخورده» به ستون «تاریخ ساخت» منتقل شد (زیر فیلد سال) و از گروه پایین چک‌باکس‌ها حذف شد. فرم پروژه دست‌نخورده (تصمیم کاربر: دامنه فقط ملک).
  - `pages/property/index.vue`: ردیف همیشه‌نمایان «سال ساخت ملک‌های کلید نخورده» (date-picker سال + دکمه «به‌روزرسانی») بالای جدول — مستقل از چک‌باکس‌های انتخاب. جریان: انتخاب سال → `ConfirmModal` تأیید → اکشن استور → توست با تعداد رکوردها (`res.data`).
  - `store/admin/property/index.ts`: اکشن `updateNotUsedPropertyYear(built_year)` → `POST /api/property/change/not-used` با `{built_year, property_type: "property"}`.
- **درس‌ها:**
  - ⚠️ endpoint با پرمیشن `property.change-date-of-not-use` گارد شده — اگر 403 دیدید، پرمیشن را در بخش رول‌ها به رول کاربر تخصیص دهید.
  - عملیات bulk است و **همه‌ی** ملک‌های کلید نخورده را یک‌جا عوض می‌کند — مودال تأیید عمدی است. بک‌اند بعد از اجرا خودش `ContentVersion::bump` + `purgeAll` می‌زند (کش API و HTML سایت به‌روز می‌شود).
- **قرارداد `built_year`:** در DB رشته/عدد **میلادی** ذخیره می‌شود (`'2023'`، `'2016'`...) و date-picker با `format="YYYY"` مدل را میلادی می‌سازد؛ `displayFormat="jYYYY"` فقط نمایش است. سایت هم `convertPerYear` (سال ساخت) را **میلادی به میلادی** برمی‌گرداند (`moment.from(date, "en", "YYYY").locale("fa").format("YYYY")`). پس endpoint همیشه سال میلادی می‌گیرد — درست است.
- ⚠️ **تبدیل سال میلادی→جلالی با لنگر وسط سال:** `moment("2022", "YYYY")` اول ژانویه است که هنوز در سال جلالیِ قبلی است (۱۴۰۰). برای نمایش معادل جلالی یک سال میلادی، لنگر وسط سال بگذار: `moment.from(`${year}-06-01`, "en", "YYYY-MM-DD").locale("fa").format("jYYYY")` — وگرنه مودال تأیید «۱۴۰۰» نشان می‌دهد در حالی که کاربر «۱۴۰۱» انتخاب کرده (باگ واقعی که تست E2E کشف کرد، کامیت `7a25ad9`).
- **درس تست E2E با vue3-persian-datetime-picker (Playwright):** پنل سال با کلیک روی آیکون (`span.vpd-input-group`) باز می‌شود نه خود input (input readonly است — تایپ جواب نمی‌دهد)؛ آیتم‌های سال داخل `div.vpd-column-content` با اسکرول داخلیاند و خارج از دید (y منفی) رندر می‌شوند — `scrollIntoViewIfNeeded` لازم است؛ `click()` پلی‌رایت روی آیتم کار نمی‌کند، `el.click()` بومی جواب می‌دهد؛ برای `simple` + `type="year"` بدون autoSubmit پنل با دکمه «تایید» (`.vpd-actions button`) بسته می‌شود. اسکریپت‌های تست: `site/scripts/check-notused-ui.mjs` و `check-notused-confirm.mjs` (از پوشه‌ی site اجرا شوند).
- **تست E2E کامل (8/24/2026):** از UI — انتخاب ۱۴۰۱ → مودال «به 1401» → «بله» → توست «سال ساخت 1 ملک کلید نخورده به‌روزرسانی شد» → DB: `built_year: 2022` و `property_type` سالم. API — با `property_type:"property"` فقط ملک عوض شد و پروژه دست‌نخورده ماند؛ بدون پارامتر هر دو (سازگاری قبلی)؛ مقدار نامعتبر → 422. همه با رکوردهای تستی موقت (بعد پاک شدند).

## تاریخچه قیمت ملک — ماژول PropertyPrice
- **پنل ادمین:** صفحات `/price-history` (لیست همه‌ی تاریخچه‌ها) و `/price-history/[id]` (جزئیات یک ملک — افزودن/ویرایش/حذف ردیف قیمت با تاریخ)
- **استور:** `store/admin/price-history/index.ts` — اکشن‌ها: getAll, getSingle, deleteSingle, getSingleByProperty, insertSingleDatePrice, updateSingleDatePrice, deleteSingleDate
- **ذخیره خودکار:** هنگام ایجاد ملک و آپدیت قیمت، PropertyObserver خودکار تاریخچه را ذخیره می‌کند

## افزایش/کاهش درصدی دسته‌جمعی قیمت (8/25/2026)
- **مکان UI:** صفحه لیست ملک‌ها (`pages/property/index.vue`) — فرم درصدی فقط وقتی نمایش داده می‌شود که ملک‌هایی انتخاب شده باشند (زیر فرم آپدیت موجود)
- **اجزای فرم:**
  - SelectBox انتخاب جهت: افزایش (`increase`) / کاهش (`decrease`) — مقدار پیش‌فرض: افزایش
  - فیلد عددی درصد (type=number, min=0.01, max=100, step=0.01)
  - دکمه «اعمال تغییر درصدی» با آیکون percent
- **جریان:** انتخاب ملک‌ها → فرم درصدی ظاهر می‌شود → ورود درصد + جهت → کلیک دکمه → مودال تأیید («آیا از افزایش/کاهش X% قیمت N ملک اطمینان دارید؟») → تأیید → درخواست API → toast موفقیت + رفرش لیست
- **استور:** `store/admin/property/index.ts` → اکشن `changePropertyPriceByPercentage(data)` → `POST /api/property/change/percentage`
- **ساختار request:** `{ property_ids: string[], percentage: number, direction: 'increase' | 'decrease' }`
- **اعتبارسنجی سمت سرور:** `ChangePricePercentageRequest` — percentage باید بین 0.01 تا 100 باشد
- **نکات:**
  - ⚠️ از همان permission `property.change-multi` استفاده می‌شود — permission جدیدی لازم نیست
  - ملک‌های بدون قیمت (`price = null`) رد می‌شوند (خطا نیست — فقط skip)
  - بعد از ذخیره، PropertyObserver خودکار تاریخچه قیمت را هم ذخیره می‌کند
  - پاسخ Axios از طریق interceptor بازگشایی می‌شود (`response.data`) — بنابراین `res.status` == "success" و `res.message` درست است (نه `res.data.status`)

## بخش دانش و ساخت — فاز ۲ پنل ادمین (8/28/2026)
مدیریت مقالات مجله + خدمات/پروژه‌های ساخت + لیدهای ماشین‌حساب. بک‌اند: `backend/.claude/CLAUDE.md` ← «ماژول‌های Article و Construction».

### فایل‌های جدید
- **استورها:** `store/admin/article/index.ts` (getAll با فیلتر search/type/hub/status، getSingle، createArticle، updateArticle، deleteArticle) و `store/admin/construction/index.ts` (سه بخش: services/projects/leads — getAll*, getSingle*, create*, update*, delete*)
- **کامپوننت‌های فرم مشترک (new و edit از آنها استفاده می‌کنند):**
  - `components/admin/article/ArticleForm.vue` — title/h1/summary، انتخاب type و hub، انتخاب والد پیلار (وقتی type=cluster؛ از index با فیلتر `type=pillar&per_page=200`)، location_slug (وقتی type=location_hub)، featured image از مدیا (AdminMediaMediaImportModal + preview)، RichEditor (CKEditor) برای content، تب سئو (seo_title/description/canonical/is_indexable)، بخش متای منطقه فقط برای location_hub (میانگین قیمت متر، فاصله/زمان تا تهران، آب‌وهوا، امتیاز سرمایه‌گذاری، مزایا/معایب داینامیک). فیلدهای نامربوط به هر type قبل از ارسال حذف می‌شوند (cleanBody).
  - `components/admin/construction/ServiceForm.vue` — پکیج‌ها داینامیک (title/description/price + featuresText به‌صورت چندخطی که در cleanBody به آرایه features تبدیل می‌شود)، FAQها داینامیک، سئو.
  - `components/admin/construction/ProjectForm.vue` — مشخصات فنی (متراژ/طبقات/مدت/سبک/وضعیت)، video_url، سئو.
- **صفحات:**
  - `pages/article/index.vue` (لیست با فیلتر نوع/وضعیت + جستجو + صفحه‌بندی + حذف)، `pages/article/new/index.vue`، `pages/article/edit/[id].vue`
  - `pages/construction/services/{index,new/index,edit/[id].vue}`، `pages/construction/projects/{index,new/index,edit/[id].vue}`، `pages/construction/leads/index.vue` (لیست لیدها با فیلتر وضعیت + تغییر وضعیت inline با v-select + قیمت برآورد با toLocaleString فارسی)
- **منو:** `components/layout/admin/Menu.vue` — دو آیتم جدید: «مجله» (لیست/ایجاد مقاله) و «ساخت و ساز» (خدمات/پروژه‌ها/لیدها) بعد از «پروژه».

### درس‌های مهم
- ⚠️ **`useStore` auto-import نمی‌شود** — در کامپوننت‌ها (برخلاف صفحات) باید `import useStore from "~~/mixins/store";` صریح باشد. نبودش → `ReferenceError: useStore is not defined` در setup → کل subtree خالی بدون هیچ نشانه در DOM (main فقط هدر را نشان می‌دهد) و خطا فقط در unhandledrejection. تشخیص: نصب هندلر `window.addEventListener("unhandledrejection")` از کنسول و ناوبری SPA با `$router.push` (نه reload، چون هندلر با reload پاک می‌شود).
- استورها در `mixins/store.js` ثبت شدند: `articleStore` و `constructionStore` (نام در return با کلید camelCase).
- پاسخ بک‌اند create با status 201 برمی‌گردد ولی interceptor مقدار `res.status == "success"` را از body می‌دهد (نه HTTP status).
- فیلد `features` پکیج‌ها به‌صورت آرایه از بک‌اند می‌آید؛ در فرم به `featuresText` (چندخطی) تبدیل و در cleanBody برعکس. پکیج‌های بدون title در ارسال فیلتر می‌شوند (ولیدیشن required_with).
- `h1` مقاله/خدمت/پروژه در Seeder ممکن است null باشد — فرم‌ها در cleanBody آن را با title جایگزین می‌کنند (بک‌اند h1 مقاله را required می‌خواهد).
- CKEditor با `editor.setData()` برنامه‌ای v-model را آپدیت نمی‌کند (instance روی DOM element هم attach نیست — `el.ckeditor` undefined)؛ برای تست E2E باید تایپ واقعی شبیه‌سازی شود. این محدودیت تست است نه باگ اپ — زنجیره v-model در update E2E تأیید شد (محتوای prefill سالم رفت و برگشت).

### تست‌های انجام‌شده (لوکال، مرورگر واقعی)
- لیست مقالات: ۲۵ مقاله + صفحه‌بندی + فیلترها ✅
- ویرایش مقاله: prefill کامل (شامل published_at برش ۱۰ کاراکتر برای input date) + ذخیره → ریدایرکت به لیست ✅
- ویرایش خدمت «طراحی ویلای مدرن»: ۲ پکیج + FAQ prefill و ذخیره موفق ✅
- لیست پروژه‌ها/لیدها: دیتای Seeder نمایش درست (قیمت با toLocaleString فارسی، لیبل فارسی وضعیت‌ها) ✅
- تغییر وضعیت لید inline: «جدید» → «تبدیل شد» → توست + تأیید در DB ✅
- رندر: article/new، construction/services/new، construction/projects/new و edit همگی سالم (mainLen ~۲۶-۳۰KB، CKEditor ساخته می‌شود) ✅
