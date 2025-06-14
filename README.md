# richen.sh

![next.js](https://img.shields.io/badge/next.js-000000?style=flat&logo=nextdotjs&logoColor=ffffff&logoSize=auto)
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

for more development info see [DEVELOPMENT.md](./DEVELOPMENT.md)

for planned features see [TODO.md](./TODO.md)
