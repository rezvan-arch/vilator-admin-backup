const runtimeConfig = {
  authRoutes: [{ regex: [/\/auth/.source] }],
};

const compare = (arr: any[], path: string): boolean => {
  return arr.some((item: any) => {
    if (item.regex) {
      const re = new RegExp(item.regex.join("|"), "g");
      return re.test(path);
    } else {
      return item === path;
    }
  });
};

export const isAuthRoute = (path: any) =>
  compare(runtimeConfig.authRoutes, path);

// , { regex: [/\/profile/.source] }
