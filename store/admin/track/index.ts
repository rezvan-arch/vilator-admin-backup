import { defineStore } from "pinia";

// تحلیل داخلی CRO — گزارش رویدادهای تبدیل (کالکشن track_events بک‌اند)
export const trackStore = defineStore({
  id: "track",
  state: () => {
    return {
      loading: true,
      summary: null as any,
      days: 30,
    };
  },
  actions: {
    async getSummary(days: number = 30) {
      this.loading = true;
      this.days = days;
      await this.$axios
        .get(`/api/track/summary`, { params: { days } })
        .then((res: any) => {
          this.summary = res.data?.data ?? null;
        })
        .catch(() => {
          this.summary = null;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
});
