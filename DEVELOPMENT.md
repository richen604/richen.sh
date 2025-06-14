# development

```bash
# install dependencies
pnpm install

# start development server
pnpm dev

# build for production
pnpm build
```

## key directories

```bash
src/app/
├── commands/          # command implementations
├── components/        # shared react components
├── hooks/            # custom hooks and utilities
├── store/            # jotai atoms and state
├── utils/            # helper functions
├── contact/          # static contact page
└── projects/         # static projects page
```

### command flow

1. user types command in terminal
2. `useCommands` hook parses input
3. command registered in `componentMap`
4. component renders with parsed args
5. output added to display state
6. state persisted to localStorage

## persistence

the terminal uses jotai with localStorage for persistence:

- **command history** - previous commands saved across sessions
- **display state** - terminal output persists on refresh
- **filesystem** - files and directories saved locally

## static pages

commands can be accessed as static pages at `/[command]`:

- `/projects` - projects command output
- `/contact` - contact information
- `/help` - available commands

static pages use the same command components but without the cli interface

## filesystem structure

the virtual filesystem starts with:

```bash
/
└── home/
    └── user/
        └── welcome.txt
```

files support:

- text content (string)
- binary content (uint8array)
- mime type detection
- file operations (create, read, update, delete)

## adding commands

commands are react components that receive parsed arguments and render output

### 1. create command component

```typescript
// src/app/commands/mycommand/index.tsx
import React from "react";
import { type CommandParams } from "..";

const MyCommand: React.FC<CommandParams> = ({ args, flags, filesystem }) => {
  return (
    <div>
      <p>hello from mycommand</p>
      <p>args: {args.join(', ')}</p>
    </div>
  );
};

export default MyCommand;
```

commands receive these props:

```typescript
type CommandParams = {
  args: string[];           // positional arguments
  flags: Record<string, string[]>; // --flag values
  all: string[];           // all arguments including flags
  timestamp: string;       // execution timestamp
  filesystem: FileSystem;  // virtual filesystem state
};
```

### 2. register in command map

the command map is used in persistence to map command names to components on rerender

```typescript
// src/app/commands/index.tsx
import MyCommand from "./mycommand";

export const componentMap = {
  // ... existing commands
  mycommand: MyCommand,
};
```

### 3. add to help text

```typescript
// src/app/commands/help/index.tsx
<li>mycommand [args] - description of what it does</li>
```

## browser support

tested on:

- chrome/chromium
- firefox

requires javascript enabled for full functionality, shader command requires webgl enabled