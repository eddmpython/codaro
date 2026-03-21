import adapter from "@sveltejs/adapter-static";

const config = {
  kit: {
    adapter: adapter({
      pages: "../src/codaro/webBuild",
      assets: "../src/codaro/webBuild",
      fallback: "index.html",
      precompress: false
    })
  }
};

export default config;
