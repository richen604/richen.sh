export const parseArgsAndFlags = (args: string[]) => {
  const flags: Record<string, string[]> = {};
  const filteredArgs: string[] = [];
  const all: string[] = [];

  args.forEach((arg, index) => {
    if (arg.startsWith("-")) {
      const nextArg = args[index + 1];
      if (nextArg && !nextArg.startsWith("-")) {
        flags[arg] ??= [];
        flags[arg].push(nextArg);
      } else {
        flags[arg] = [];
      }
    } else if (!args[index - 1]?.startsWith("-")) {
      filteredArgs.push(arg);
    }
    all.push(arg);
  });

  return { args: filteredArgs, flags, all };
};

export const parseCommandArgs = (
  input: string,
  delimiters: string[] = ["`"],
) => {
  const delimiterPattern = delimiters
    .map((delimiter) => `\\${delimiter}([^\\${delimiter}]*)\\${delimiter}`)
    .join("|");
  const regex = new RegExp(`${delimiterPattern}|[^\\s]+`, "g");
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    matches.push(match[1] || match[0]);
  }

  return matches;
};
