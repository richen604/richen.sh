{
  description = "Development environment for richen.sh";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            pnpm
            nodePackages.typescript
            nodePackages.typescript-language-server
          ];

          shellHook = ''
            echo "🚀 Development environment loaded"
            echo "Node version: $(node --version)"
            echo "pnpm version: $(pnpm --version)"

            # Set up pnpm store directory
            export PNPM_HOME="$PWD/.pnpm-store"
            export PATH="$PNPM_HOME:$PATH"
          '';
        };
      }
    );
}
