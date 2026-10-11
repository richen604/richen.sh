# Development

## Setup and commands

Install Nix and direnv, then run `direnv allow` (or `nix develop`) to load
Node.js, pnpm and the artwork CLI.

```sh
pnpm install --frozen-lockfile
pnpm dev           # local development server
pnpm lint
pnpm typecheck
pnpm build         # validate saved artwork and build static dist/
pnpm preview       # serve dist/ after building
```

## Posts and artwork

Copy `content/templates/post/` to `content/blog/<lowercase-hyphenated-slug>/`
and edit `index.mdx`. Templates remain unpublished. Posts, the blog index and
sitemap are discovered automatically; no manual registry needed.

```mdx
export const metadata = { title: "Post title", description: "Short summary.", date: "2026-10-10" }

Your Markdown here. The shared layout supplies the title.

<AsciiArt src="assets/scene.art.json" description="Describe the meaningful image." caption="Optional caption." />

<AsideArt src="assets/scene.art.json" description="Describe the meaningful image." width="38%" side="right">

Prose beside artwork; stacks on mobile. `side` also accepts `left`.

</AsideArt>
```

Keep metadata in a standalone export block. MDX is trusted executable repository
content. Place local files under the post's `assets/`; use
`![Description](assets/image.png)` for images. Explicit heading IDs support
section links: `<h2 id="details">Details</h2>` and `[Details](#details)`.

Create standalone artwork manually, then reference the saved `.art.json`
directly. No per-post recipe, source image or preset file is needed to publish.
The default preset is `src/blog/art/default-preset.json`; an optional complete
preset overrides it. Run from the repository:

```sh
pnpm art source.png content/blog/my-post/assets/scene.art.json
pnpm art source.png preset.json scene.art.json
pnpm art source.png preset.json scene.art.json --watch
pnpm art source.png preset.json scene.art.json --check
```

With the repository shell active, `terminal-art` accepts the same arguments
from any directory. Conversion works offline after dependencies are installed.
Output directories must already exist. `--watch` updates the artifact atomically;
`--check` compares it against the supplied source without writing. Neither runs
during publishing.

For reuse across posts, save artwork under `content/assets/art/`:

```sh
mkdir -p content/assets/art
terminal-art source.png content/assets/art/scene.art.json
```

```mdx
<AsciiArt src="shared/scene.art.json" description="Describe the meaningful image." />
```

`AsideArt` accepts the same `shared/` path. Post-local `assets/` paths stay local;
shared paths resolve only inside `content/assets/art/`. Traversal and escaping
symlinks are rejected. Development reloads shared artwork and imported MDX
dependencies when edited.

Publishing validates referenced artifacts and prepares static coloured markup,
usable without JavaScript. Browser code does not convert images or fetch raw
artwork JSON. A raw local asset is copied only when explicitly linked or embedded
in MDX, not because artwork references it. Saved artifacts retain their preset
and provenance metadata; source images can be kept elsewhere for later editing.
Keep visible credits and applicable licenses with each post; required upstream
and font notices remain in `docs/licenses/` and `docs/fonts/` and ship with the build.

## Terminal and deployment

GitHub Pages publishes static `dist/` at `richen.sh`, including `/`,
`/projects/`, `/contact/`, `/blog/` and `/blog/<slug>/`. Article content works
without JavaScript. Root-relative URLs require domain-root hosting.
