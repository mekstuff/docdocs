import VitePressSidebar from 'vitepress-sidebar';

const vitepressSidebarOptions = {
  /* Options... */
};

export default {
  themeConfig: {
    sidebar: VitePressSidebar.generateSidebar(vitepressSidebarOptions)
  }
};