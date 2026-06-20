<script setup>
import { onMounted } from "vue";
const navItem = [
  {
    type: "link",
    link: "/",
    text: "داشبورد",
    icon: "fa-regular fa-house-blank",
  },
  {
    type: "nav",
    text: "کاربران",
    icon: "fa-regular fa-user",
    subItem: [
      {
        text: "لیست کاربران",
        link: "/user",
      },
      {
        text: "لیست ثبت نام ناقص",
        link: "/user/un-active",
      },
      {
        text: "ساخت کاربر جدید",
        link: "/user/new",
      },
    ],
  },
  {
    type: "nav",
    text: "نقش های کاربری",
    icon: "fa-regular fa-user-tie",
    subItem: [
      {
        text: "لیست نقش های کاربری",
        link: "/role",
      },
      {
        text: "ساخت نقش کاربری جدید",
        link: "/role/new",
      },
    ],
  },
  {
    type: "nav",
    text: "ملک",
    icon: "fa-regular fa-house",
    subItem: [
      {
        text: "لیست ملک ها",
        link: "/property",
      },
      {
        text: "ایجاد ملک جدید",
        link: "/property/new",
      },
    ],
  },
  {
    type: "nav",
    text: "لینک موقت",
    icon: "fa-regular fa-link",
    subItem: [
      {
        text: "لیست لینک ها",
        link: "/temporary-link",
      },
      {
        text: "ایجاد لینک جدید",
        link: "/temporary-link/new",
      },
    ],
  },
  {
    type: "nav",
    text: "پروژه",
    icon: "fa-regular fa-files",
    subItem: [
      {
        text: "لیست پروژه ها",
        link: "/project",
      },
      {
        text: "ایجاد پروژه جدید",
        link: "/project/new",
      },
    ],
  },
  {
    type: "nav",
    text: "تاریخچه ها",
    icon: "fa-regular fa-clock-rotate-left",
    subItem: [
      {
        text: "تاریخچه قیمت",
        link: "/price-history",
      },
    ],
  },
  {
    type: "nav",
    text: "تایپ ها",
    icon: "fa-regular fa-font-awesome",
    subItem: [
      {
        text: "لیست تایپ ها",
        link: "/types",
      },
      {
        text: "ساخت تایپ جدید",
        link: "/types/new",
      },
    ],
  },
  {
    type: "nav",
    text: "مشخصه ی ملک",
    icon: "fa-regular fa-wand-magic-sparkles",
    subItem: [
      {
        text: "لیست مشخصه ها",
        link: "/attributes/attribute",
      },
      {
        text: "ایجاد مشخصه جدید",
        link: "/attributes/attribute/new",
      },
      {
        text: "گروه بندی مشخصه ها",
        link: "/attributes/group",
      },
    ],
  },
  {
    type: "nav",
    text: "دسترسی سریع",
    icon: "fa-regular fa-wand-magic-sparkles",
    subItem: [
      {
        text: "لیست دسترسی سریع",
        link: "/quick-access",
      },
      {
        text: "ایجاد دسترسی سریع جدید",
        link: "/quick-access/new",
      },
    ],
  },
  {
    type: "nav",
    text: "فیلتر ها",
    icon: "fa-regular fa-clipboard",
    subItem: [
      {
        text: "گروه فیلتر",
        link: "/filters",
      },
    ],
  },
  {
    type: "nav",
    text: "صفحه فرود",
    icon: "fa-regular fa-laptop-arrow-down",
    subItem: [
      {
        text: "صفحه فرود",
        link: "/landing-page",
      },
      {
        text: "ساخت صفحه فرود",
        link: "/landing-page/new",
      },
    ],
  },

  {
    type: "nav",
    text: "ریدایرکت ها",
    icon: "fa-regular fa-diamond-turn-right",
    subItem: [
      {
        text: "لیست ریدایرکت ها",
        link: "/redirect",
      },
      {
        text: "ساخت ریدایرکت جدید",
        link: "/redirect/new",
      },
    ],
  },
  {
    type: "nav",
    text: "سایت مپ ها",
    icon: "fa-regular fa-map",
    subItem: [
      {
        text: "لیست سایت مپ ها",
        link: "/sitemap",
      },
      {
        text: "ساخت سایت مپ جدید",
        link: "/sitemap/new",
      },
    ],
  },
  {
    type: "nav",
    text: "آمار",
    icon: "fa-regular fa-clipboard",
    subItem: [
      {
        text: "لیست آمار",
        link: "/statistics",
      },
    ],
  },
  // {
  //   type: "nav",
  //   text: "صفت ها",
  //   icon: "fa-regular fa-layer-group",
  //   subItem: [
  //     {
  //       text: "لیست صفت ها",
  //       link: "/category",
  //     },
  //     {
  //       text: "ساخت صفت جدید",
  //       link: "/category/new",
  //     },
  //   ],
  // },
  {
    type: "nav",
    text: "مدیا",
    icon: "fa-regular fa-photo-film-music",
    subItem: [
      {
        text: "لیست مدیا",
        link: "/media",
      },
      {
        text: "گروه تگ ها",
        link: "/image-tags/group",
      },
      {
        text: "تگ ها",
        link: "/image-tags/tag",
      },
    ],
  },
  {
    type: "nav",
    text: "لوکیشن",
    icon: "fa-regular fa-location-dot",
    subItem: [
      {
        text: "لیست لوکیشن ها",
        link: "/locations",
      },
      {
        text: "ایجاد لوکیشن جدید",
        link: "/locations/new",
      },
      {
        text: "لیست لوکیشن جاده/بزرگراه/اتوبان/آزادراه",
        link: "/locations/highway",
      },
    ],
  },
  {
    type: "nav",
    text: "درخواست ها",
    icon: "fa-regular fa-messages",
    subItem: [
      {
        text: "لیست درخواست بازدید",
        link: "/requests/visit",
      },
      {
        text: "لیست اطلاعات بیشتر",
        link: "/requests/information",
      },
      {
        text: "لیست فروش ملک",
        link: "/requests/property-sell",
      },
    ],
  },
  {
    type: "nav",
    text: "ارتباط باما",
    icon: "fa-regular fa-phone",
    subItem: [
      {
        text: "لیست آیتم های ارتباط باما",
        link: "/contact-us",
      },
    ],
  },
  {
    type: "link",
    link: "/price-range",
    text: "بازه قیمتی",
    icon: "fa-regular fa-dollar-sign",
  },
  {
    type: "page",
    text: "تنظیمات",
  },
  // {
  //   type: "nav",
  //   text: "پروفایل کاربری",
  //   icon: "fa-regular fa-circle-info",
  //   subItem: [
  //     {
  //       text: "اطلاعات کاربر",
  //       link: "/profile/info",
  //     },
  //     {
  //       text: "تغییر رمز عبور",
  //       link: "/profile/change-password",
  //     },
  //     {
  //       text: "تاییدیه ایمیل",
  //       link: "/profile/verify-mail",
  //     },
  //     {
  //       text: "تاییدیه شماره موبایل",
  //       link: "/profile/verify-number",
  //     },
  //   ],
  // },
  {
    type: "link",
    link: "/settings",
    text: "تنظیمات سراسری",
    icon: "fa-regular fa-gear",
  },
];

onMounted(() => {
  const hasSubList = document.querySelectorAll(".has__sub");
  hasSubList.forEach((item) => {
    item.querySelector(".nav__link").addEventListener("click", () => {
      const el = item.querySelector(".menu__content");
      if (!item.classList.contains("open")) {
        hasSubList.forEach((item) => {
          const content = item.querySelector(".menu__content");
          content.style.maxHeight = null;
          item.classList.remove("open");
        });

        el.style.maxHeight = el.scrollHeight + "px";
        item.classList.add("open");
      } else {
        el.style.maxHeight = null;
        item.classList.remove("open");
      }
    });
  });

  setTimeout(() => {
    const navItems = document.querySelectorAll(".nav__item");
    const activeRoute = document.querySelector(".router-link-active");
    if (activeRoute) {
      navItems.forEach((item) => {
        if (
          item.getAttribute("data-title") ==
          activeRoute.getAttribute("data-parent")
        ) {
          item.classList.add("open");
          const el = item.querySelector(".menu__content");
          el.style.maxHeight = el.scrollHeight + 10 + "px";
        }
      });
    }
  }, 700);
});
</script>
<template>
  <div class="aside">
    <div class="logo">
      <nuxt-link to="https://new.vilator.com" class="logo">
        <img  src="/images/100.1.png" alt="" loading="lazy" format="webp" class="h-8" />
        <h1>ویلاطور</h1>
      </nuxt-link>
    </div>
    <nav>
      <ul class="navigation">
        <li
          v-for="(item, index) in navItem"
          :key="index"
          class="nav__item"
          :class="{
            has__sub: item.type == 'nav',
          }"
          :data-title="item.text"
        >
          <template v-if="item.type == 'link'">
            <nuxt-link :to="item.link" class="nav__link">
              <div class="item__icon"><i :class="item.icon"></i></div>
              <span class="item__title">{{ item.text }}</span>
            </nuxt-link>
          </template>
          <template v-else-if="item.type == 'nav'">
            <div class="nav__link">
              <div class="item__icon"><i :class="item.icon"></i></div>
              <span class="item__title">{{ item.text }}</span>
            </div>
            <ul v-if="item.subItem.length > 0" class="menu__content">
              <li
                v-for="(subItem, index) in item.subItem"
                :key="index"
                class="menu__item"
              >
                <nuxt-link :to="subItem.link" :data-parent="item.text">
                  <span class=" line-clamp-1">{{ subItem.text }}</span>
                </nuxt-link>
              </li>
            </ul>
          </template>
          <template v-else-if="item.type == 'page'">
            <p class="page">{{ item.text }}</p>
          </template>
        </li>
      </ul>
    </nav>
  </div>
</template>
<style lang="scss" scoped>
.aside {
  @apply w-[260px] bg-[#2C343B] fixed h-full right-0 top-0;

  .logo a {
    @apply h-[72px] flex items-center gap-4 px-[17px];

    h1 {
      @apply font-medium text-white text-2xl;
    }
  }

  nav {
    @apply overflow-auto h-[calc(100%-72px)];

    &::-webkit-scrollbar {
      display: none;
    }
    .navigation {
      .nav__item {
        .nav__link {
          @apply flex items-center py-3 px-4 h-[52px] transition-all duration-300 hover:pr-5 cursor-pointer;

          .item__icon {
            @apply w-6  ml-3 flex items-center justify-center;

            i {
              @apply text-[#dcdcdc] text-[1.3rem];
            }
          }

          .item__title {
            @apply text-[#dcdcdc] text-base;
          }
        }

        &.has__sub {
          .nav__link {
            @apply mx-0 px-[18px] transition-all duration-300 hover:pr-6 relative;

            &::before {
              content: "\f104";
              font-family: "Font Awesome 6 Pro";
              font-weight: 400;
              @apply align-middle text-sm text-[#dcdcdc] absolute left-5 transition-all duration-300;
            }
          }

          &.open {
            @apply bg-[#202930] pb-[10px] transition-colors duration-300;

            .nav__link::before {
              @apply -rotate-90;
            }
          }

          .menu__content {
            @apply transition-all duration-300 overflow-hidden max-h-0;
            .menu__item a {
              @apply text-[#dcdcdc] text-sm flex items-center pr-[48px] pl-[18px] py-3 transition-all duration-300 hover:pr-[54px];
            }
          }
        }

        .page {
          @apply py-3 px-[18px] text-[#dcdcdc];
        }
      }
    }
  }
}

.router-link-exact-active:not(.logo),
.router-link-active:not(.logo) {
  @apply bg-[#424E58] mx-[14px] rounded-md;

  i,
  span,
  .item__title {
    @apply text-white;
  }

  .item__title {
    @apply font-bold;
  }
}
</style>
