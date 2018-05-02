declare module "sourceserverquery" {
  const _default: {
    info: (address: string, port: number, timeout: number) => { [key: string]: string | number };
    players: (address: string, port: number, timeout: number) => [{ index: number; name: string; score: number; duration: number }];
    rules: (address: string, port: number, timeout: number) => [{ name: string; value: string | number }];
  };
  export = _default;
}
