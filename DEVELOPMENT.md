# development

## setup

install nix and direnv, then load the repository development shell:

```bash
direnv allow
pnpm install --frozen-lockfile
```

the flake supports linux and macos on x86_64 and aarch64 and provides node.js 22 and pnpm. run `nix develop` instead when direnv is unavailable.

## commands

```bash
pnpm dev        # start the vite development server
pnpm build      # create the production build in dist/
pnpm preview    # preview the production build locally
pnpm lint       # run eslint
pnpm typecheck  # run typescript checks
```

to make the production preview available on the local network:

```bash
pnpm preview --host 0.0.0.0
```

run `pnpm build` before `pnpm preview`.

## routes

vite builds three html entry points that share `src/main.tsx`:

- `/` - terminal
- `/projects/` - project portfolio
- `/contact/` - contact information

the source html files are `index.html`, `projects/index.html`, and `contact/index.html`. the production build preserves this structure as `dist/index.html`, `dist/projects/index.html`, and `dist/contact/index.html`, with bundled assets under `dist/assets/` and public files copied into `dist/`.

## deployment

github pages serves the static `dist/` artifact at the custom domain `richen.sh`. deployment builds the site from `main`, uploads `dist/`, and publishes it through github pages; the pages custom-domain setting, dns records, tls, and https enforcement remain provider configuration rather than application routing.

the build uses root-relative urls and `base: "/"`, which matches the custom domain. hosting under a repository subpath requires changing the vite base and rebuilding.

`dist/` is host-independent static output. any static host can deploy that directory if it serves directory index files for `/projects/` and `/contact/`, preserves root-relative assets, and maps the custom domain to the deployment.
