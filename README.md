# richen.sh

![vite](https://img.shields.io/badge/vite-000000?style=flat&logo=vite&logoColor=ffffff&logoSize=auto)
![typescript](https://img.shields.io/badge/typescript-000000?style=flat&logo=typescript&logoColor=ffffff&logoSize=auto)
![tailwind](https://img.shields.io/badge/tailwind-000000?style=flat&logo=tailwindcss&logoColor=ffffff&logoSize=auto)
![glsl](https://img.shields.io/badge/glsl-000000?style=flat&logo=opengl&logoColor=ffffff&logoSize=auto)

a terminal emulator in the browser with persistent filesystem and command system

## features

- **interactive terminal** - full command line interface with history
- **virtual filesystem** - persistent file operations with localStorage
- **command system** - persistent command history
- **static pages** - direct url access to command outputs

## commands

### filesystem

- `ls [path]` - list directory contents
- `cd [path]` - change directory
- `cat [file]` - display file contents
- `mkdir [dir]` - create directory
- `touch [file]` - create file
- `rm [path]` - remove file or directory
- `mv [src] [dest]` - move/rename files
- `cp [src] [dest]` - copy files
- `cwd` - show current directory

### utilities

- `help` - show available commands
- `clear` - clear terminal screen
- `echo [text]` - display text
- `neofetch` - system information display

### interactive

- `shader [mode] [example]` - run shader examples

### others

- `projects` - display project portfolio
- `contact` - show contact information

## development

the project is a vite multi-page app with routes at `/`, `/projects/`, and `/contact/`.

```bash
direnv allow
pnpm install --frozen-lockfile
pnpm dev
```

`direnv allow` loads the nix flake, which provides node.js and pnpm. see [DEVELOPMENT.md](./DEVELOPMENT.md) for build, preview, validation, and deployment details.

for project notes see [docs/richensh.md](./docs/richensh.md)
