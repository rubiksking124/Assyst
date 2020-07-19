export default Object.freeze({
  fapi: Object.freeze({
    screenshot: 'https://fapi.wrmsr.io/screenshot',
    evalmagik: 'https://fapi.wrmsr.io/evalmagik',
    steamplaying: 'https://fapi.wrmsr.io/steamplaying',
    imagescript: 'https://fapi.wrmsr.io/parse_tag',
    lego: 'https://fapi.wrmsr.io/lego',
    ddg: 'https://fapi.wrmsr.io/duckduckgo',
    ddgimg: 'https://fapi.wrmsr.io/duckduckgoimages'
  }),
  github: Object.freeze({
    commits: 'https://api.github.com/repos/:owner/:repo/commits',
    forks: 'https://api.github.com/repos/:owner/:repo/forks',
    searchRepository: 'https://api.github.com/search/repositories',
    searchUser: 'https://api.github.com/search/users',
    user: 'https://api.github.com/users/:username'
  }),
  topgg: 'https://top.gg/api/bots',
  discordbotlist: 'https://discordbotlist.com/api/bots',
  discordboats: 'https://discord.boats/api/bot',
  gocodeit: 'https://api.gocode.it/exec',
  zx8: 'https://zx8.jacher.io/api/v1',
  ocr: 'https://api.tsu.sh/google/ocr',
  identify: 'https://captionbot.azurewebsites.net/api/messages?language=en-US',
  translate: 'https://translate.yandex.net/api/v1.5/tr.json/translate',
  cast: 'https://jacher.io/cast',
  tsu: 'https://tsu.sh'
});
