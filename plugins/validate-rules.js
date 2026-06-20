import { defineRule } from "vee-validate";
import {
  email,
  required,
  // eslint-disable-next-line camelcase
  alpha_num,
  numeric,
  max,
  min,
  alpha,
  // eslint-disable-next-line camelcase
  alpha_spaces,
  confirmed,
} from "@vee-validate/rules";

export default defineNuxtPlugin((nuxtApp) => {
  defineRule("email", email);
  defineRule("required", (value) => {
    if (!value || !value.length) {
      return "این فیلد الزامی است";
    }

    if (value.length < 1) {
      return "این فیلد الزامی است";
    }

    return true;
  });
  defineRule("alpha_num", alpha_num);
  defineRule("numeric", (value, field, ctx) => {
    if (isNaN(value)) {
      return `${ctx.name} باید عدد باشد`;
    }

    return true;
  });
  defineRule("integer", numeric);
  defineRule("max", (value, [max]) => {
    if (!value || !value.length) {
      return true;
    }

    if (value.length > max) {
      return `تعداد کاراکتر باید حداکثر از ${max} باشد`;
    }

    return true;
  });
  defineRule("min", (value, [min]) => {
    if (!value || !value.length) {
      return true;
    }

    if (value.length < min) {
      return `تعداد کاراکتر باید حداقل از ${min} باشد`;
    }

    return true;
  });
  defineRule("alpha", alpha);
  defineRule("alpha_spaces", alpha_spaces);
  // only english and persian charcter
  defineRule("en_fa_string", (value) => {
    return /[\u0600-\u06FF]|\s?[a-z]\s?/gi.test(value);
  });
  defineRule("en_fa_string_number", (value) => {
    return /[\u0600-\u06FF]|\s?[a-z]\s?[0-9]\s?/.test(value);
  });

  defineRule("confirmed", confirmed);
});
