// ---------- Portfolio content (placeholders) ----------
const SCROLLS = [
  { id: 'projects', label: 'Projects', kanji: '作', ribbon: 0xe2462c },
  { id: 'about',    label: 'About me', kanji: '我', ribbon: 0x2f6fd8 },
  { id: 'skills',   label: 'Skills',   kanji: '技', ribbon: 0x5cb030 },
  { id: 'contact',  label: 'Contact',  kanji: '文', ribbon: 0xf2b42c },
];
const PLACEHOLDER = '<p class="note">Placeholder text. Your real content goes here.</p>';
const CONTENT = {
  projects: { eyebrow: 'Scroll one', title: 'Projects', side: '作品', html: PLACEHOLDER + `
    <div class="proj"><h3>Kasukabe</h3><p>This site. A walk-in 3D portfolio built with Three.js, where every section lives on a scroll.</p><div class="chips"><span>Three.js</span><span>WebGL</span><span>Design</span></div></div>
    <div class="proj"><h3>Project name</h3><p>One or two lines on what it does, who it is for, and the part you built.</p><div class="chips"><span>React</span><span>Node</span></div></div>
    <div class="proj"><h3>Project name</h3><p>A short note on the problem, your approach, and the result.</p><div class="chips"><span>Python</span><span>ML</span></div></div>` },
  about: { eyebrow: 'Scroll two', title: 'About me', side: '自己紹介', html: PLACEHOLDER + `
    <p>Hi, I'm Shivansh. A sentence about what you do and what you care about building.</p>
    <p>A second short paragraph: where you are, what you are studying or working on, and what you are curious about outside code.</p>
    <p>One line about what kind of work or collaboration you are looking for right now.</p>` },
  skills: { eyebrow: 'Scroll three', title: 'Skills', side: '技術', html: PLACEHOLDER + `
    <div class="skills">
      <div><h3>Languages</h3><ul><li>JavaScript / TypeScript</li><li>Python</li><li>Another one</li></ul></div>
      <div><h3>Frameworks</h3><ul><li>React</li><li>Three.js</li><li>Node.js</li></ul></div>
      <div><h3>Tools</h3><ul><li>Git</li><li>Figma</li><li>Blender</li></ul></div>
    </div>` },
  contact: { eyebrow: 'Scroll four', title: 'Contact', side: '連絡', html: PLACEHOLDER + `
    <div class="contact-row"><div><small>Email</small><code>hello@yourname.dev</code></div><button class="roll-up copy" type="button" data-copy="hello@yourname.dev">Copy</button></div>
    <div class="contact-row"><div><small>GitHub</small><code>github.com/yourhandle</code></div></div>
    <div class="contact-row"><div><small>LinkedIn</small><code>linkedin.com/in/yourname</code></div></div>` },
};
