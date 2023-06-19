import React from "react";
import { useTable, useFilters, useSortBy, usePagination } from "react-table";
import {
    ChevronDoubleLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDoubleRightIcon
} from "@heroicons/react/20/solid";
import { FunnelIcon } from "@heroicons/react/24/outline";
import cx from "classnames";
import Image from "next/image";
import { Button, PageButton } from "./button";
import { SortIcon, SortUpIcon, SortDownIcon } from "./icons";

// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id, render }
}) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = React.useMemo(() => {
        const options = new Set();
        preFilteredRows.forEach(row => {
            options.add(row.values[id]);
        });
        return [...options.values()];
    }, [id, preFilteredRows]);

    // Render a multi-select box
    return (
        <label className="flex items-baseline gap-x-2">
            <select
                className="mt-1 inline-flex items-center rounded-md border border-gray-300 bg-white py-[6px] px-[9px] text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                name={id}
                id={id}
                value={filterValue}
                onChange={e => {
                    setFilter(e.target.value || undefined);
                }}
            >
                <option value="">{render("Header")}</option>
                {options.map((option, i) => (
                    <option key={i} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </label>
    );
}

export function StatusPill({ value }) {
    const status = value ? value.toLowerCase() : "unknown";

    return (
        <span
            className={cx(
                "leading-wide rounded-full px-3 py-1 text-xs font-bold uppercase shadow-sm",
                status.startsWith("active") ? "bg-green-100 text-green-800" : null,
                status.startsWith("inactive") ? "bg-yellow-100 text-yellow-800" : null,
                status.startsWith("offline") ? "bg-red-100 text-red-800" : null
            )}
        >
            {status}
        </span>
    );
}

export function AvatarCell({ value, column, row }) {
    return (
        <div className="flex items-center">
            <div className="h-10 w-10 flex-shrink-0">
                <Image src={row.original[column.imgAccessor]} alt="" />
            </div>
            <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">{value}</div>
                <div className="text-sm text-gray-500">{row.original[column.emailAccessor]}</div>
            </div>
        </div>
    );
}

// Create an editable cell renderer
const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    updateTableData // This is a custom function that we supplied to our table instance
}) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue);

    const onChange = e => {
        setValue(e.target.value);
    };

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
        updateTableData(index, id, value);
    };

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    return (
        <input
            className="block h-10 appearance-none rounded-md bg-white px-2 text-sm text-slate-800  placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
        />
    );
};

// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
    Cell: EditableCell
};

function Table({ columns, data, updateTableData, skipPageReset, setIsModalOpen }) {
    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page, // Instead of using 'rows', we'll use page,
        // which has only the rows for the active page

        // The rest of these things are super handy, too ;)
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        footerGroups,
        state
    } = useTable(
        {
            columns,
            data,
            defaultColumn,
            // use the skipPageReset option to disable page resetting temporarily
            autoResetPage: !skipPageReset,
            // updateTableData isn't part of the API, but
            // anything we put into these options will
            // automatically be available on the instance.
            // That way we can call this function from our
            // cell renderer!
            updateTableData
        },
        useFilters,
        useSortBy,
        usePagination
    );

    const { key: tableKey, ...restTableProps } = getTableProps();
    const { key: tableBodyKey, ...restTableBodyProps } = getTableBodyProps();

    // Render the UI for your table
    return (
        <>
            <div className="mb-12 flex h-[48px] sm:h-[34px] w-full sm:mb-4 sm:flex-row sm:items-center justify-between">
                <div className="flex gap-x-2">
                    <span className="flex items-center font-medium text-slate-800 max-sm:hidden">
                        <FunnelIcon className="mr-[1px]" width={20} height={20} /> Filter:
                    </span>
                    {headerGroups.map(headerGroup =>
                        headerGroup.headers.map(column =>
                            column.Filter ? (
                                <div className="mt-2 sm:mt-0" key={column.id}>
                                    {column.render("Filter")}
                                </div>
                            ) : null
                        )
                    )}
                </div>
                {/* // FIXME: mobile responsive */}
                <div className="flex justify-end">
                    <button
                        className="bg-black rounded-xl text-white font-medium px-4 py-3 hover:bg-black/80"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add car
                    </button>
                </div>
            </div>
            <div className="block w-full overflow-x-auto">
                <table
                    key={tableKey}
                    {...restTableProps}
                    className="table sticky w-full table-auto border-collapse border border-slate-300"
                >
                    <thead className="">
                        {headerGroups.map(headerGroup => {
                            const { key: headerGroupIndex, ...restHeaderGroupProps } =
                                headerGroup.getHeaderGroupProps();
                            return (
                                <tr role="row" key={headerGroupIndex} {...restHeaderGroupProps}>
                                    {headerGroup.headers.map(column => {
                                        const { key: headerIndex, ...restHeaderIndex } =
                                            column.getHeaderProps(column.getSortByToggleProps());
                                        return (
                                            <th
                                                key={headerIndex}
                                                scope="col"
                                                className="border border-slate-300 group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                                {...restHeaderIndex}
                                            >
                                                <div
                                                    className={cx(
                                                        "flex items-center",
                                                        headerGroupIndex === "headerGroup_0"
                                                            ? "justify-center"
                                                            : "justify-start"
                                                    )}
                                                >
                                                    <span className="text-gray-700 font-bold">
                                                        {column.render("Header")}
                                                    </span>
                                                    {/* Add a sort direction indicator */}
                                                    {!column.disableSortBy && (
                                                        <span>
                                                            {column.isSorted ? (
                                                                column.isSortedDesc ? (
                                                                    <SortDownIcon className="h-4 w-4 text-gray-400" />
                                                                ) : (
                                                                    <SortUpIcon className="h-4 w-4 text-gray-400" />
                                                                )
                                                            ) : (
                                                                <SortIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </thead>
                    <tbody
                        key={tableBodyKey}
                        {...restTableBodyProps}
                        className="divide-y divide-gray-200 bg-white"
                    >
                        {page.map((row, i) => {
                            // new
                            prepareRow(row);
                            const { key: rowIndex, ...restRowProps } = row.getRowProps();
                            return (
                                <tr key={rowIndex} {...restRowProps}>
                                    {row.cells.map(cell => {
                                        const { key: cellIndex, ...restCellProps } =
                                            cell.getCellProps();
                                        return (
                                            <td
                                                key={cellIndex}
                                                {...restCellProps}
                                                className="whitespace-nowrap px-6 py-4 border border-slate-300"
                                                role="cell"
                                            >
                                                <div className="text-left text-sm text-slate-700">
                                                    {cell.render("Cell")}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between py-3">
                <div className="flex flex-1 justify-between sm:hidden">
                    <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
                        Previous
                    </Button>
                    <Button onClick={() => nextPage()} disabled={!canNextPage}>
                        Next
                    </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div className="flex items-baseline gap-x-2">
                        <span className="text-sm text-gray-700">
                            Page <span className="font-medium">{state.pageIndex + 1}</span> of{" "}
                            <span className="font-medium">{pageOptions.length}</span>
                        </span>
                        <label>
                            <span className="sr-only">Items Per Page</span>
                            <select
                                className="mt-1 inline-flex w-[112px] items-center rounded-md border border-gray-300 bg-white py-[6px] px-[9px] text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 xs:w-[120px]"
                                value={state.pageSize}
                                onChange={e => {
                                    setPageSize(Number(e.target.value));
                                }}
                            >
                                {[5, 10, 20].map(pageSize => (
                                    <option key={pageSize} value={pageSize}>
                                        Show {pageSize}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div>
                        <nav
                            className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                            aria-label="Pagination"
                        >
                            <PageButton
                                className="rounded-l-md"
                                onClick={() => gotoPage(0)}
                                disabled={!canPreviousPage}
                            >
                                <span className="sr-only">First</span>
                                <ChevronDoubleLeftIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </PageButton>
                            <PageButton onClick={() => previousPage()} disabled={!canPreviousPage}>
                                <span className="sr-only">Previous</span>
                                <ChevronLeftIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </PageButton>
                            <PageButton onClick={() => nextPage()} disabled={!canNextPage}>
                                <span className="sr-only">Next</span>
                                <ChevronRightIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </PageButton>
                            <PageButton
                                className="rounded-r-md"
                                onClick={() => gotoPage(pageCount - 1)}
                                disabled={!canNextPage}
                            >
                                <span className="sr-only">Last</span>
                                <ChevronDoubleRightIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </PageButton>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Table;
