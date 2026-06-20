import { isAuthRoute } from "~~/helpers/authRouteHelpers";
import { meStore } from "~/store/me/index";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const me = meStore();
  me.setToken(useCookie("JWT").value);

  abortNavigation();
  if (!isAuthRoute(to.path)) {
    if (!me.isAuth) {
      try {
        let res = await me.getDetails();
        if (res == undefined || res.status != "success")
          return navigateTo("/auth");
        if (!res.data.is_admin && !res.data.is_staff)
          return navigateTo("/auth");
      } catch (error) {}
    }
  }
  if (isAuthRoute(to.path)) {
    if (!me.isAuth) {
      try {
        let res = await me.getDetails();
        if (res == undefined || res.status != "success") {
          return;
        } else if (!res.data.is_admin && !res.data.is_staff) {
          return;
        } else return navigateTo("/auth");
      } catch (error) {}
    }
  }
});
