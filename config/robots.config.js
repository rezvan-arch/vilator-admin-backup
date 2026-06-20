export default [
  {
    UserAgent: "Googlebot",
    Allow: "",
  },
  {
    UserAgent: "googlebot-image",
    Allow: "",
  },
  {
    UserAgent: "googlebot-mobile",
    Allow: "",
  },
  {
    UserAgent: "MSNBot",
    Allow: "",
  },
  {
    UserAgent: "Slurp",
    Allow: "",
  },
  {
    UserAgent: "Teoma",
    Allow: "",
  },
  {
    UserAgent: "twiceler",
    Allow: "",
  },
  {
    UserAgent: "Gigabot",
    Allow: "",
  },
  {
    UserAgent: "Scrubby",
    Allow: "",
  },
  {
    UserAgent: "Robozilla",
    Allow: "",
  },
  {
    UserAgent: "Nutch",
    Allow: "",
  },
  {
    UserAgent: "ia_archiver",
    Allow: "",
  },
  {
    UserAgent: "baiduspider",
    Allow: "",
  },
  {
    UserAgent: "naverbot",
    Allow: "",
  },
  {
    UserAgent: "yeti",
    Allow: "",
  },
  {
    UserAgent: "yahoo-mmcrawler",
    Allow: "",
  },
  {
    UserAgent: "asterias",
    Allow: "",
  },
  {
    UserAgent: "yahoo-blogs/v3.9",
    Allow: "",
  },
  {
    UserAgent: "*",
    Allow: "",
  },

  // Be aware that this will NOT work on target: 'static' mode
  { Sitemap: (req) => `https://${req.headers.host}/sitemap_index.xml` },
];
