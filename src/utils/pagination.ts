export const getSkipAndLimitRange = async (pageNumber: number, rowsPerPage: number): Promise<number[]> => {
    if(pageNumber < 1 || rowsPerPage < 1) throw({message: "Page number and rows per page should be greater than 1."})
    const page = pageNumber ? pageNumber : 1;
    const rowsLimitPerPage =  rowsPerPage ? rowsPerPage : 10;
    const skipLimit = page * rowsLimitPerPage - rowsLimitPerPage;
    return [Number(skipLimit), Number(rowsLimitPerPage)];
};