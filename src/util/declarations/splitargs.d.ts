declare module 'splitargs' {
  function splitargs (str: string, separator?: string | RegExp | null, keepQuotes?: boolean): string[]
  export = splitargs
}
