import { frontSettingsStore } from "~~/store/settings";
import moment from "jalali-moment";
import "jalali-moment";
export default {
  data() {
    return {
      settings: null,
    };
  },
  created() {
    this.settings = frontSettingsStore();
  },
  methods: {
    convertDate(date, time = false, slash = true, locale = "fa") {
      const data = moment
        .from(date, "en", "YYYY/MM/DD HH:mm")
        .locale(locale == "en" ? "en" : "fa");
      let day = data.format(locale == "en" ? "DD" : "jDD");
      let month = data.format(locale == "en" ? "MM" : "jMM");
      let year = data.format(locale == "en" ? "YYYY" : "jYYYY");
      let hour = data.format("HH");
      let min = data.format("mm");

      if (time) {
        if (slash) {
          return `${year}/${month}/${day} ${hour}:${min}`;
        } else {
          return `${year}-${month}-${day} ${hour}:${min}`;
        }
      } else {
        if (slash) {
          return `${year}/${month}/${day}`;
        } else {
          return `${year}-${month}-${day}`;
        }
      }
    },
    separateNumber(value) {
      return value.toLocaleString();
    },
    checkNumber(num, limit) {
      const p2e = (s) => s.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
      let number = p2e(String(num)).replace(/\D/g, "");
      return number.length > limit ? number.slice(0, limit) : number;
    },
    getSetting(key) {
      if (this.settings.data.length) {
        if (this.settings.data.findIndex((s) => s.key == String(key)) > -1) {
          return this.settings.data.find((s) => s.key == String(key)).value;
        }
      }
    },
  },
};
