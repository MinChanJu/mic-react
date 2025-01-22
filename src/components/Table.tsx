import styles from '../assets/css/Table.module.css'

interface tableProps<T> {
  columnName: string[];
  columnClass: string[];
  data: T[];
  dataName: (keyof T)[];
  dataFunc?: { [K in keyof T]?: (value: T[K], idx: number) => React.ReactNode };
  onClick?: (item: T) => void;
  rowClass?: (item: T) => string;
}

const Table = <T,>({ columnName, columnClass, data, dataName, dataFunc, onClick, rowClass }: tableProps<T>) => {
  return (
    <table className={styles.tableContainer}>
      <thead>
        <tr>
          {columnName.map((col, idx) => (
            <th key={idx} className={styles.tableHead + " " + styles[columnClass[idx]]}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} className={rowClass?.(row) ? styles[rowClass(row)] : ""} onClick={() => onClick?.(row)}>
            {dataName.map((key, idx) => (
              <td key={idx} className={styles.tableCell + " " + styles[columnClass[idx]]}>
                {dataFunc?.[key] ? dataFunc[key](row[key], rowIndex) : (row[key] as React.ReactNode)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;