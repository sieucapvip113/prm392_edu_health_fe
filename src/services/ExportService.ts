const EXPORT_API = 'http://localhost:3333/api/v1/export-excel';


export async function exportExcel(eventId: number, type: 'vaccine' | 'health'): Promise<Blob> {
    const url = `${EXPORT_API}?eventId=${eventId}&type=${type}`;

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
    });

    if (!res.ok) throw new Error('Lỗi khi export file Excel');

    const blob = await res.blob();
    return blob;
}
