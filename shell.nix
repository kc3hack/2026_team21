{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Atlas CLI
    atlas
    # Go Task
    go-task
    # pnpm
    pnpm
    # Node.js v24.13.1
    nodejs_24
  ];

  shellHook = ''
    echo "Development environment loaded"
    echo "Node version: $(node --version)"
    echo "pnpm version: $(pnpm --version)"
    echo "Task version: $(task --version)"
    echo "Atlas version: $(atlas version)"
  '';
}
