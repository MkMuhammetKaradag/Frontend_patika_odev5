import * as React from "react";

import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import { visuallyHidden } from "@mui/utils";
import axios from "axios";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface Data {
  market_cap_rank: number;
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  name: string;
  market_cap: number;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  id:
    | "market_cap_rank"
    | "name"
    | "current_price"
    | "price_change_percentage_24h"
    | "high_24h"
    | "market_cap";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;

  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "market_cap_rank",
    label: "rank",
    numeric: true,
  },
  { id: "name", label: "Name", numeric: false },
  {
    id: "current_price",
    label: "Price",
    format: (value: number) => value.toString(),
    numeric: false,
  },
  {
    id: "price_change_percentage_24h",
    label: "24h%",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toFixed(2).toString() + "%",
    numeric: false,
  },
  {
    id: "high_24h",
    label: "high price 24h",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toFixed(2).toString() + "%",
    numeric: false,
  },
  {
    id: "market_cap",
    label: "MarketCap",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toString(),
    numeric: false,
  },
];

interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;

  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    order,
    orderBy,

    onRequestSort,
  } = props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={false ? "right" : "left"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface CoinType {
  id: string;
  market_cap_rank: number;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  market_cap: number;
}
export default function EnhancedTable({
  searchText = "",
}: {
  searchText: string;
}) {
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof Data>("market_cap_rank");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [rows, setRows] = React.useState<CoinType[]>([]);
  const navigate = useNavigate();
  const handleRequestSort = (_: any, property: keyof Data) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleClick = (id: string) => {
    navigate(`/coin/${id}`);
  };

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows = React.useMemo(
    () =>
      stableSort(rows, getComparator(order, orderBy))
        .slice(0 * rowsPerPage, 0 * rowsPerPage + rowsPerPage)
        .filter((item) =>
          searchText ? item.name.toLowerCase().includes(searchText) : true
        ),
    [order, orderBy, page, rowsPerPage, rows, searchText]
  );
  React.useEffect(() => {
    axios
      .get<CoinType[]>(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=50&page=${
          page + 1
        }`,
        {
          headers: {
            accept: "application/json",
            "x-cg-demo-api-key": import.meta.env.VITE_APP_API_KEY as string,
          },
        }
      )
      .then((response) => {
        if (response.data) {
          console.log(response.data);
          setRows(response.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [page]);

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {visibleRows.map((row) => {
                return (
                  <TableRow
                    hover
                    onClick={() => handleClick(row.id)}
                    tabIndex={-1}
                    key={row.id}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell align="left">{row.market_cap_rank}</TableCell>

                    <TableCell align="left">
                      <Box
                        sx={{
                          display: "flex",
                        }}
                      >
                        <Avatar
                          sx={{ width: 24, height: 24 }}
                          alt="Remy Sharp"
                          src={row.image}
                        />
                        {row.name}
                      </Box>
                    </TableCell>
                    <TableCell align="left">{row.current_price}</TableCell>
                    <TableCell align="left">
                      {row.price_change_percentage_24h}
                    </TableCell>
                    <TableCell align="left">{row.high_24h}</TableCell>
                    <TableCell align="left">{row.market_cap}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[50]}
          component="div"
          count={searchText ? visibleRows.length : rows.length * 3}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
