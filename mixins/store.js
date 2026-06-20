import { globalStore as index } from "~/store/index";
import { authStore as auth } from "~/store/auth/index";
import { meStore as me } from "~/store/me/index";
import { adminStore as admin } from "~/store/admin/index";
import { mediaStore as media } from "~/store/admin/media/index";
import { propertyStore as property } from "~/store/admin/property/index";
import { projectStore as project } from "~/store/admin/project/index";
import { categoryStore as category } from "~/store/admin/category/index";
import { useUserStore } from "~/store/admin/user/index";
import { locationStore as location } from "~/store/admin/location/index";
import { typesStore as type } from "~/store/admin/types/index";
import { attrGroupsStore as attrGroups } from "~/store/admin/attributes/groups/index";
import { attributeStore as attribute } from "~/store/admin/attributes/attribute/index";
import { detailStore as details } from "~~/store/admin/attributes/details/index";
import { AdminSettingsStore } from "~/store/admin/settings/index";
import { linksStore as link } from "~/store/admin/temporaryLink/index";
import { tagGroupStore as tagGroups } from "~/store/admin/image-tags/group/index";
import { tagStore as tags } from "~/store/admin/image-tags/tag/index";
import { filterGroupsStore as filterGroups } from "~~/store/admin/filters/index";
import { landingPage as searchResult } from "~~/store/admin/landing-page/index";
import { useQuickAccessStore } from "~/store/admin/quick-access";
import { useSitemapStore } from "~/store/admin/sitemap";

export default function useStore() {
  const indexStore = index();
  const adminStore = admin();
  const authStore = auth();
  const meStore = me();
  const mediaStore = media();
  const propertyStore = property();
  const projectStore = project();
  const categoryStore = category();
  const userStore = useUserStore();
  const locationStore = location();
  const typesStore = type();
  const attrGroupsStore = attrGroups();
  const attributeStore = attribute();
  const settingStore = AdminSettingsStore();
  const linkStore = link();
  const tagGroupStore = tagGroups();
  const tagStore = tags();
  const filterGroupsStore = filterGroups();
  const detailStore = details();
  const landingPage = searchResult();
  const quickAccessStore = useQuickAccessStore();
  const sitemapStore = useSitemapStore();

  return {
    indexStore,
    adminStore,
    errorsStore: adminStore.errors,
    authStore,
    meStore,
    mediaStore,
    propertyStore,
    projectStore,
    categoryStore,
    userStore,
    locationStore,
    typesStore,
    attrGroupsStore,
    attributeStore,
    settingStore,
    linkStore,
    tagGroupStore,
    tagStore,
    filterGroupsStore,
    detailStore,
    landingPage,
    quickAccessStore,
    sitemapStore,
  };
}
