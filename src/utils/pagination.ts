export const getSkipAndLimitRange = async (pageNumber: number, rowsPerPage: number): Promise<number[]> => {
    const page = pageNumber || 1;
    const rowsLimitPerPage =  rowsPerPage || 10;
    const skipLimit = page * rowsLimitPerPage - rowsLimitPerPage;
    return [skipLimit, rowsLimitPerPage];
};