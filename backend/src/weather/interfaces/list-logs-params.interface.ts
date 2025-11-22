export interface ListLogsParams {
    page?: number; // página (começa em 1)
    limit?: number; // quantos por página
    from?: Date; // data inicial opcional
    to?: Date; // data final opcional
}