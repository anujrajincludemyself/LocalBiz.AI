const Table = ({ columns, data, loading = false, emptyMessage = 'No data available' }) => {
    if (loading) {
        return (
            <div className="glass-card p-8 text-center">
                <div className="spinner w-8 h-8 mx-auto mb-2"></div>
                <p className="text-gray-400">Loading...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="glass-card p-8 text-center">
                <p className="text-gray-400">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300"
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="border-b border-white/5 hover:bg-white/5 transition"
                            >
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-6 py-4 text-sm"
                                    >
                                        {column.render
                                            ? column.render(row, rowIndex)
                                            : row[column.accessor]
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;
