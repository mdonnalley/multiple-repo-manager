import {printTable as printOclifTable, printTables as printOclifTables, type TableOptions} from '@oclif/table'

export function printTable<T extends Record<string, unknown>>(opts: TableOptions<T>): void {
  printOclifTable<T>({
    ...opts,
    borderStyle: 'vertical',
    headerOptions: {
      color: 'white',
      formatter: 'capitalCase',
      inverse: true,
    },
    titleOptions: {
      bold: true,
      color: 'green',
    },
  })
}

export function printTables<T extends Record<string, unknown>[]>(tables: {[P in keyof T]: TableOptions<T[P]>}): void {
  printOclifTables(
    tables.map((table) => ({
      ...table,
      borderStyle: 'vertical',
      headerOptions: {
        color: 'white',
        formatter: 'capitalCase',
        inverse: true,
      },
      titleOptions: {
        bold: true,
        color: 'green',
      },
    })),
    {
      rowGap: 1,
    },
  )
}
